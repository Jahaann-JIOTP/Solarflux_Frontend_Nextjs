// File: components/ChartComponent.js
"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import config from "@/config";

am4core.useTheme(am4themes_animated);

const ChartComponent = () => {
    const [selectedOptionplant, setSelectedOptionplant] = useState("Coca Cola Faisalabad");
    const [selectedOptioninverter, setSelectedOptioninverter] = useState("");
    const [selectedOptionmppt, setSelectedOptionmppt] = useState("");
    const [selectedOptionstring, setSelectedOptionstring] = useState("");
    const [dropdown1Optionsinverter, setDropdown1Optionsinverter] = useState([]);
    const [dropdown1Optionsmppt, setDropdown1Optionsmppt] = useState([]);
    const [dropdown1Optionsstring, setDropdown1Optionsstring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customFromDate, setCustomFromDate] = useState(new Date(moment().subtract(40, "days")));
    const [customToDate, setCustomToDate] = useState(new Date(moment().subtract(50, "days")));
    const [selectedParameter, setSelectedParameter] = useState("power");

    const snCode = "NE=53278269";
    const baseUrl = config.BASE_URL;
    const chartdiv3Ref = useRef(null);
    const chartdivSNRef = useRef(null);
    const sankeyChartRef = useRef(null);
    const snChartRef = useRef(null);
    // Fetch MPPTs when the inverter is selected
    useEffect(() => {
        if (selectedOptioninverter) {
            fetchMpptIds();
        }
    }, [selectedOptioninverter]);

    // Fetch Strings when MPPT is selected
    useEffect(() => {
        if (selectedOptionmppt) {
            fetchStringIds();
        }
    }, [selectedOptionmppt]);

    useEffect(() => {
        fetchAllChartData(moment(customFromDate).format("YYYY-MM-DD"), moment(customToDate).format("YYYY-MM-DD"));
    }, []);


    const fetchDeviceIds = async () => {
        try {
            const response = await axios.post(`${baseUrl}production/get-devices`, {
                station: selectedOptionplant,
            });
            setDropdown1Optionsinverter(response.data);
        } catch (error) {
            console.error("Error fetching inverters", error);
        }
    };

    const fetchMpptIds = async () => {
        try {
            const response = await axios.post(`${baseUrl}production/get-mppt`, {
                station: selectedOptionplant,
                devId: selectedOptioninverter,
            });
            setDropdown1Optionsmppt(response.data);
        } catch (error) {
            console.error("Error fetching mppt", error);
        }
    };

    const fetchStringIds = async () => {
        try {
            const response = await axios.post(`${baseUrl}solaranalytics/get-strings`, {
                Plant: selectedOptionplant,
                devId: selectedOptioninverter,
                mppt: selectedOptionmppt,
            });
            setDropdown1Optionsstring(response.data);
        } catch (error) {
            console.error("Error fetching strings", error);
        }
    };
    const getYAxisTitle = (param) => {
        switch (param) {
          case "power":
            return "Power (kW)";
          case "voltage":
            return "Voltage (V)";
          case "current":
            return "Current (A)";
          default:
            return "Value";
        }
      };
      
    const fetchAllChartData = async (fromDate, toDate) => {
        setLoading(true);
        if (sankeyChartRef.current) sankeyChartRef.current.dispose();
        if (snChartRef.current) snChartRef.current.dispose();
        try {
            const [chart1Res, chart2Res] = await Promise.all([
                axios.post(`${baseUrl}health/get_hourly_values `, {
                    resolution_option: 1,
                    start_date: fromDate,
                    end_date: toDate,
                    plant: selectedOptionplant,
                    mppt: selectedOptionmppt,
                    inverter: selectedOptioninverter,
                    string: selectedOptionstring,
                    "option": selectedParameter
                }),
                axios.post(`${baseUrl}health/radiation_intensity`, {
                    start_date: fromDate,
                    end_date: toDate,
                    stationCode: snCode,
                })
            ]);

            const chart1Data = chart1Res.data;
            const chart2Data = chart2Res.data;
            const hours = Array.from({ length: 24 }, (_, i) => i);

            const formatChartData = (data) =>
                hours.map((hour) => {
                    const hourEntry = { hour };
                    data.forEach((entry) => {
                        const value = entry.hourly_values.find((hv) => hv.hour === hour)?.value || 0;
                        hourEntry[`value_${entry.date}`] = value;
                    });
                    return hourEntry;
                });

                createChart(
                    chartdiv3Ref.current,
                    formatChartData(chart1Data),
                    chart1Data.map(d => d.date),
                    getYAxisTitle(selectedParameter),
                    sankeyChartRef
                  );
                  
            createChart(chartdivSNRef.current, formatChartData(chart2Data), chart2Data.map(d => d.date), "Solar Irradiance", snChartRef);
            addControls();
        } catch (error) {
            console.error("Chart Data Error", error);
        } finally {
            setLoading(false);
        }
    };

    const createChart = (div, data, dates, yTitle, chartRef) => {
        // Create chart instance
        const chart = am4core.create(div, am4charts.XYChart);
        chart.logo.disabled = true;
        chart.data = data;

        // Cursor behavior
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panX";

        // X-Axis (Hour Axis)
        const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = "hour";
        xAxis.title.fill = am4core.color("#ffffff");
        xAxis.title.fontSize = 14;
        xAxis.title.fontWeight = "bold";
        xAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        xAxis.renderer.labels.template.fontSize = 12;
        xAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
        xAxis.renderer.grid.template.strokeOpacity = 0.3;

        // Y-Axis (Value Axis)
        const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        yAxis.renderer.labels.template.fontSize = 12;
        yAxis.title.text = yTitle;
        yAxis.title.rotation = -90;
        yAxis.title.fill = am4core.color("#ffffff");
        yAxis.title.fontSize = 12;
        yAxis.title.marginRight = 5;
        yAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
        yAxis.renderer.grid.template.strokeOpacity = 0.3;

        // Color palette
        const colors = ["#FFBF00", "#0096FF", "#568203", "#8b0000", "#1F51FF"];

        // Line series
        dates.forEach((date, index) => {
            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = `value_${date}`;
            series.dataFields.categoryX = "hour";
            series.name = date;
            series.strokeWidth = 2;
            series.stroke = am4core.color(colors[index % colors.length]);

            // Tooltip
            series.tooltipText = "{name}: [bold]{valueY}[/]";
            series.tooltip.getFillFromObject = false;
            series.tooltip.background.fill = series.stroke;
            series.tooltip.background.stroke = series.stroke;
            series.tooltip.label.fill = am4core.color("#ffffff");

            // Bullet
            const bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.strokeWidth = 2;
            bullet.circle.radius = 4;
            bullet.circle.fill = series.stroke;
            bullet.circle.stroke = am4core.color("#ffffff");
        });

        // Legend
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.labels.template.fill = am4core.color("#ffffff");

        // Appear animation
        chart.series.each((series) => series.appear());
        chart.appear();

        // Store chart reference
        chartRef.current = chart;
    };
    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionwaterfall");
        if (!controlsWrapper) return;
        controlsWrapper.innerHTML = "";

        const createButton = (svgPath, callback, tooltip) => {
            const button = document.createElement("button");
            button.style.backgroundColor = "transparent";
            button.style.border = "none";
            button.style.padding = "5px";
            button.style.cursor = "pointer";
            button.style.display = "inline-flex";
            button.style.justifyContent = "center";
            button.style.alignItems = "center";
            button.style.width = "30px";
            button.style.height = "30px";
            button.style.margin = "2px";
            button.title = tooltip;

            button.innerHTML = `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" 
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    xmlns="http://www.w3.org/2000/svg">
                    ${svgPath}
                </svg>
            `;

            button.addEventListener("click", callback);
            controlsWrapper.appendChild(button);
        };

        // Export both as PNG
        createButton(
            `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" />
             <rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
            () => {
                if (sankeyChartRef.current) sankeyChartRef.current.exporting.export("png");
                if (snChartRef.current) snChartRef.current.exporting.export("png");
            },
            "Export Both Charts as PNG"
        );

        // Export both as XLSX
        createButton(
            `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
             <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
            () => {
                if (sankeyChartRef.current) sankeyChartRef.current.exporting.export("xlsx");
                if (snChartRef.current) snChartRef.current.exporting.export("xlsx");
            },
            "Export Both Charts as XLSX"
        );

        // Fullscreen mode for both
        createButton(
            `<path stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" 
                d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4" />`,
            () => {
                const chartElement = document.getElementById("chartFullscreenContainer");
                if (!document.fullscreenElement) {
                    chartElement.requestFullscreen().catch(err => {
                        console.error("Error attempting to enable fullscreen mode:", err.message);
                    });
                } else {
                    document.exitFullscreen();
                }
            },
            "Toggle Fullscreen"
        );
    };


    useEffect(() => {
        fetchDeviceIds();
    }, [selectedOptionplant]);

    return (
        <div className="p-2">
            <div className="flex justify-end space-x-4 mb-4 items-center">
                <div className="flex items-center space-x-2">
                    <label className="text-white">Plant:</label>
                    <select value={selectedOptionplant} onChange={(e) => setSelectedOptionplant(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                        <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
                    </select>
                    <div className="flex items-center space-x-2">
                        <label className="text-white">Inverter:</label>
                        <select value={selectedOptioninverter} onChange={(e) => { setSelectedOptioninverter(e.target.value); }} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                            <option value="">Select</option>
                            {dropdown1Optionsinverter.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-white">MPPT:</label>
                        <select value={selectedOptionmppt} onChange={(e) => { setSelectedOptionmppt(e.target.value); }} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                            <option value="">Select</option>
                            {dropdown1Optionsmppt.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-white">String:</label>
                        <select value={selectedOptionstring} onChange={(e) => { setSelectedOptionstring(e.target.value); }} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                            <option value="">Select</option>
                            {dropdown1Optionsstring.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-white">Parameter:</label>
                        <select
                            value={selectedParameter}
                            onChange={(e) => setSelectedParameter(e.target.value)}
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
                        >
                            <option value="power">Power</option>
                            <option value="voltage">Voltage</option>
                            <option value="current">Current</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-4 mb-4 items-center">
                <div className="flex items-center space-x-2">
                    <label className="text-white">Start Date:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={customFromDate}
                            onChange={(date) => {
                                setCustomFromDate(date);
                            }}
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                            dateFormat="dd-MM-yyyy"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-white">End Date:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={customToDate}
                            onChange={(date) => {
                                setCustomToDate(date);
                            }}
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                            dateFormat="dd-MM-yyyy"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>
                <button
                    onClick={() => {
                        fetchAllChartData(moment(customFromDate).format("YYYY-MM-DD"), moment(customToDate).format("YYYY-MM-DD"))
                    }}
                    className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
                    }`}
                >
                    {loading ? "Loading..." : "Generate"}
                </button>
            </div>

            <div
                id="main-section"
                className="w-full h-[40vh] pt-[10px] mt-[20px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
            >
                <h2 className='text-left m-3'><b>INTRA SYSTEM COMPARISON</b></h2>
                <div id="exportoptionwaterfall" className="flex justify-end mb-2" style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "-20px", zIndex: 999 }}></div>
                {loading && <div className="flex flex-col justify-center items-center h-[35vh] w-full"><div className="loader"></div></div>}

                {/* ✅ Wrap just the charts */}
                <div id="chartFullscreenContainer" className="flex">
                    <div style={{ flex: 1 }} ref={chartdiv3Ref} className={`w-full h-[30vh] mt-[20px] ${loading ? "hidden" : ""}`}></div>
                    <div style={{ flex: 1 }} ref={chartdivSNRef} className={`w-full h-[30vh] mt-[20px] ${loading ? "hidden" : ""}`}></div>
                </div>
            </div>


        </div>
    );
};

export default ChartComponent;
