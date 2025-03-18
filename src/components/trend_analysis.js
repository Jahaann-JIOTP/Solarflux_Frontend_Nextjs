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
    const [startDate, setStartDate] = useState(moment().subtract(1, "days").toDate());
    const [endDate, setEndDate] = useState(moment().toDate());
    const [customFromDate, setCustomFromDate] = useState(moment().subtract(1, "days").format("YYYY-MM-DD"));
    const [customToDate, setCustomToDate] = useState(moment().subtract(0, "days").format("YYYY-MM-DD"));
    const [loading, setLoading] = useState(true);
    const [plantOptions, setPlantOptions] = useState([
        { value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" },
    ]);
    const [inverterOptions, setInverterOptions] = useState([]);
    const [mpptOptions, setMpptOptions] = useState([]);
    const [selectedVariable, setSelectedVariable] = useState("power");
    const chartRef = useRef(null);

    useEffect(() => {
        fetchDeviceIds();
        createChart();
    }, []);

    useEffect(() => {
        if (customFromDate && customToDate) {
            createChart();
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
        } finally {
            setLoading(false);
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
        setLoading(true);

        try {
            if (chartRef.current) {
                chartRef.current.dispose();
            }

            const response = await axios.post(config.BASE_URL + "aggregate-data1", {
                plant: selectedPlant,
                inverter: selectedInverter || null,
                mppt: selectedMppt || null,
                start_date: customFromDate,
                end_date: customToDate,
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

            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 60;
            dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");

            Object.keys(processedData)
                .sort((a, b) => parseInt(a.match(/\d+/) || 0, 10) - parseInt(b.match(/\d+/) || 0, 10))
                .forEach((sn, index) => {
                    const series = chart.series.push(new am4charts.LineSeries());
                    series.data = processedData[sn];
                    series.dataFields.valueY = "value1";
                    series.dataFields.dateX = "date";
                    series.name = sn;
                    series.stroke = am4core.color(getColor(index));
                });

            chart.legend = new am4charts.Legend();
            chart.legend.position = "bottom";

            chart.cursor = new am4charts.XYCursor();
        } catch (error) {
            console.error("Error creating chart:", error);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (index) => {
        const colors = ["#00CCFF", "#6CB4EE", "#A3C1AD", "#4682B4"];
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
                        <option value="power">Power</option>
                        <option value="current">Current</option>
                        <option value="voltage">Voltage</option>
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
                <div id="chartdivirradiance" className="w-full h-auto mt-[30px]"></div>

            </div>
        </div>
    );
}
