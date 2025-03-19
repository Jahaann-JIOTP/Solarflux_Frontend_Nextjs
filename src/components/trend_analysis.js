"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import config from "@/config";

export default function ProductionComparison() {
    const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
    const [selectedInverter, setSelectedInverter] = useState("");
    const [selectedMppt, setSelectedMppt] = useState("");
    const [startDate, setStartDate] = useState(moment().subtract(30, "days").toDate());
    const [endDate, setEndDate] = useState(moment().subtract(29, "days").toDate());
    const [customFromDate, setCustomFromDate] = useState(moment().subtract(30, "days").format("YYYY-MM-DD"));
    const [customToDate, setCustomToDate] = useState(moment().subtract(29, "days").format("YYYY-MM-DD"));
    const [loading, setLoading] = useState(true);
    const [plantOptions, setPlantOptions] = useState([
        { value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" },
    ]);
    const [inverterOptions, setInverterOptions] = useState([]);
    const [mpptOptions, setMpptOptions] = useState([]);
    const [selectedVariable, setSelectedVariable] = useState("Power");
    const chartRef = useRef(null);

    const isChartCreated = useRef(false);
const apiCallTimeout = useRef(null);

useEffect(() => {
    if (!isChartCreated.current) {
        fetchDeviceIds();
        createChart(); 
        isChartCreated.current = true;
    }
}, []);

useEffect(() => {
    if (isChartCreated.current) {
        if (apiCallTimeout.current) clearTimeout(apiCallTimeout.current);

        apiCallTimeout.current = setTimeout(() => {
            createChart();
        }, 500); // Adds slight delay to prevent multiple rapid calls
    }
}, [customFromDate, customToDate, selectedPlant, selectedInverter, selectedMppt, selectedVariable]);


    const fetchDeviceIds = async () => {
        setLoading(true);
        try {
            const response = await axios.post(config.BASE_URL + "production/get-devices", {
                station: selectedPlant,
            });
            setInverterOptions(response.data);
        } catch (error) {
            console.error("Error fetching device IDs:", error);
        } 
    };

    const fetchMpptIds = async () => {
        setLoading(true);
        if (!selectedInverter) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(config.BASE_URL + "production/get-mppt", {
                devId: selectedInverter,
            });
            setMpptOptions(response.data);
        } catch (error) {
            console.error("Error fetching MPPT IDs:", error);
        } finally {
            setLoading(false);
        }
    };

    const createChart = async () => {
        setLoading(true); // Ensure loader is shown at the start

        try {
            if (chartRef.current) {
                chartRef.current.dispose(); // Dispose previous chart before creating a new one
            }

            const response = await axios.post(config.BASE_URL + "analysis/aggregate-data1", {
                plant: selectedPlant,
                inverter: selectedInverter || null,
                mppt: selectedMppt || null,
                start_date: customFromDate,
                end_date: customToDate,
                attribute: selectedVariable
            });

            const rawData = response.data;
            const processedData = {};

            rawData.forEach((item) => {
                const utcDate = new Date(item.timestamp);
                const pakistanTime = new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Karachi",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }).format(utcDate);
                const pakistanDate = new Date(pakistanTime);

                item.values.forEach((value) => {
                    if (!processedData[value.sn]) {
                        processedData[value.sn] = [];
                    }
                    processedData[value.sn].push({
                        date: pakistanDate,
                        value1: value.value1,
                    });
                });
            });

            am4core.useTheme(am4themes_animated);
            const chart = am4core.create("chartdivirradiance", am4charts.XYChart);
            chartRef.current = chart;
            chart.padding(0, 0, 0, 0);
            chart.logo.disabled = true;

            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 60;
            dateAxis.baseInterval = { timeUnit: "minute", count: 1 };
            dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");
            dateAxis.renderer.labels.template.fontSize = 12;
            dateAxis.renderer.grid.template.stroke = am4core.color("#ffffff");

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");
            valueAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
            valueAxis.renderer.labels.template.fontSize = 12;
            valueAxis.extraMax = 0.1;
            valueAxis.strictMinMax = true;
            valueAxis.maxPrecision = 2;

            Object.keys(processedData)
                .sort((a, b) => parseInt(a.match(/\d+/) || 0, 10) - parseInt(b.match(/\d+/) || 0, 10))
                .forEach((sn, index) => {
                    const series = chart.series.push(new am4charts.LineSeries());
                    series.data = processedData[sn];
                    series.dataFields.valueY = "value1";
                    series.dataFields.dateX = "date";
                    series.name = sn;
                    series.tooltipText = `${sn}: {valueY}`;
                    series.strokeWidth = 2;
                    series.stroke = am4core.color(getColor(index));
                    series.fillOpacity = 0.5;

                    let gradient = new am4core.LinearGradient();
                    gradient.addColor(am4core.color(getColor(index)), 1);
                    gradient.addColor(am4core.color("#ffffff"), 0);
                    gradient.rotation = 90;
                    series.fill = gradient;
                });

            chart.legend = new am4charts.Legend();
            chart.legend.position = "bottom";
            chart.legend.labels.template.fill = am4core.color("#ffffff");
            chart.legend.markers.template.strokeWidth = 2;
            chart.legend.markers.template.stroke = am4core.color("#ffffff");
            chart.legend.valueLabels.template.fill = am4core.color("#ffffff");

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineY.opacity = 0;

            chart.events.on("datavalidated", () => {
                if (chart.series.length > 0 && chart.series.every(s => s.data.length > 0)) {
                    setLoading(false);
                }
            });
            

        } catch (error) {
            console.error("Error creating chart:", error);
            setLoading(false); // Hide loader even if error occurs
        }finally {
            setLoading(false);
        }
    };


    const getColor = (index) => {
        const colors = ["#00CCFF", "#6CB4EE", "#A3C1AD", "#4682B4", "#A3C1AD", "#72A0C1", "#7CB9E8", "#00CCFF"];
        return colors[index % colors.length];
    };




    return (
        <div className="p-2">
            <div className="flex justify-end space-x-4 mb-4 items-center">
                <div className="flex items-center space-x-2">
                    <label className="mr-2">Plant:</label>
                    <select
                        value={selectedPlant}
                        onChange={(e) => setSelectedPlant(e.target.value)}
                        onBlur={fetchDeviceIds}
                        className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[250px] text-[14px]"
                    >
                        {plantOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="mr-2">Inverter:</label>
                    <select value={selectedInverter} onChange={(e) => setSelectedInverter(e.target.value)} onBlur={fetchMpptIds} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[250px] text-[14px]">
                        <option value="">Select</option>
                        {inverterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="mr-2">MPPT:</label>
                    <select value={selectedMppt} onChange={(e) => setSelectedMppt(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[250px] text-[14px]">
                        <option value="">Select</option>
                        {mpptOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-white">Parameter:</label>
                    <select
                        className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[250px] text-[14px]"
                        value={selectedVariable}
                        onChange={(e) => setSelectedVariable(e.target.value)}
                    >
                        <option value="Power">Power</option>
                        <option value="Current">Current</option>
                        <option value="Voltage">Voltage</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-4 mb-4 items-center">
                <div className="flex items-center space-x-2">
                    <label className="text-white">Start Date:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                setCustomFromDate(moment(date).format("YYYY-MM-DD"));
                            }}
                            dateFormat="MMMM d, yyyy"
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[250px] text-white pr-8"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-white">End Date:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => {
                                setEndDate(date);
                                setCustomToDate(moment(date).format("YYYY-MM-DD")); // ✅ Now correctly updates end date in API payload
                            }}
                            dateFormat="MMMM d, yyyy"
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[250px] text-white"
                        />

                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>

            </div>
            <div
                id="main-section"
                className="w-full h-[70vh] pt-[10px] mt-[20px] !overflow-auto bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
            >
                {loading && (
                    <div className="flex flex-col justify-center items-center h-[60vh] w-full">
                        <div className="loader"></div>
                        <p className="text-white mt-2 text-lg font-semibold">
                            This action may take some time, please hold on...
                        </p>
                    </div>
                )}
                <div id="chartdivirradiance" className={`w-full h-[60vh] ${loading ? "hidden" : ""}`}></div>

            </div>
        </div>
    );
}
