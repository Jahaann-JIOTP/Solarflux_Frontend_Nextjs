"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import config from "@/config";

const PowerRatioChart = () => {
    const chartRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlant, setSelectedPlant] = useState("NE=53278269");
    const [fromDate, setFromDate] = useState(moment().subtract(90, "days").format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().subtract(1, "days").format("YYYY-MM-DD"));

    const plantOptions = [
        { value: "NE=53278269", label: "Coca Cola Faisalabad" },
    ];

    const [dateRange, setDateRange] = useState([
        moment().subtract(60, "days").toDate(),
        moment().subtract(30, "days").toDate(),
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const [chartData, setChartData] = useState(null);

    // Call API
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`https://solarfluxapi.nexalyze.com/power_ratio`, {
                start_date: fromDate,
                end_date: toDate,
                plant: selectedPlant,
            });
            if (response.data.status === "success") {
                setChartData(response.data.data);
            }
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Draw chart only when loading ends and chartData is available
    useEffect(() => {
        if (!loading && chartData) {
            drawChart(chartData);
        }
    }, [loading, chartData]);

    const drawChart = (data) => {
        if (chartRef.current) chartRef.current.dispose();

        let chart = am4core.create("powerRatioChart", am4charts.XYChart);
        chart.logo.disabled = true;
        chart.data = data.dates.map((date, index) => ({
            date: new Date(date),
            power_ratio: data.power_ratios[index],
        }));

        const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        dateAxis.renderer.labels.template.fontSize = 12;
        dateAxis.renderer.grid.template.stroke = am4core.color("#E5E5E5");
        dateAxis.renderer.minGridDistance = 50;

        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Power Ratio (%)";
        valueAxis.title.fill = am4core.color("#FFFFFF");
        valueAxis.title.fontSize = 12;
        valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        valueAxis.renderer.labels.template.fontSize = 12;
        valueAxis.renderer.grid.template.stroke = am4core.color("#E5E5E5");
        valueAxis.min = 0;
        valueAxis.max = 130;

        const series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "power_ratio";
        series.tooltipText = "{valueY}";

        let gradient = new am4core.LinearGradient();
        gradient.addColor(am4core.color("#0066b2"), 1);
        gradient.addColor(am4core.color("#B2FFFF"), 0);
        gradient.rotation = 90;
        series.columns.template.fill = gradient;
        series.columns.template.stroke = am4core.color("#004085");
        series.columns.template.strokeOpacity = 1;
        series.columns.template.strokeWidth = 1;
        series.tooltip.getFillFromObject = false; // Disable default fill color
        series.tooltip.background.fill = series.stroke; // Tooltip background color
        series.tooltip.background.stroke = series.stroke; // Tooltip border color
        series.tooltip.label.fill = am4core.color("#FFFFFF");
        const range = valueAxis.axisRanges.create();
        range.value = 90;
        range.endValue = 110;
        range.axisFill.fill = am4core.color("rgba(0, 255, 0, 0.2)");
        range.axisFill.fillOpacity = 0.9;
        range.grid.strokeOpacity = 0;

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        chart.legend = new am4charts.Legend();
        chart.legend.visible = false;
        chartRef.current = chart;
        addControls();
    };
    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionpoweratio");
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
          button.title = tooltip; // Add tooltip
    
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
    
        // Export as PNG
        createButton(
          `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" />
                 <rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
          () => {
            if (chartRef.current) chartRef.current.exporting.export("png");
          },
          "Export as PNG"
        );
    
        // Export as XLSX
        createButton(
          `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                 <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
          () => {
            if (chartRef.current) chartRef.current.exporting.export("xlsx");
          },
          "Export as XLSX"
        );
    
        // Fullscreen Mode
        createButton(
          `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
          () => {
            const chartElement = document.getElementById("powerRatioChart");
            if (!document.fullscreenElement) {
              chartElement.requestFullscreen().catch((err) => {
                console.error(
                  "Error attempting to enable fullscreen mode:",
                  err.message
                );
              });
            } else {
              document.exitFullscreen();
            }
          },
          "Toggle Fullscreen"
        );
      };
    useEffect(() => {
        return () => {
            if (chartRef.current) chartRef.current.dispose();
        };
    }, []);

    return (
        <div className="p-2">
                <div className="flex justify-end space-x-4 mb-5 items-center">
                    <div className="flex items-center space-x-2">
                        <label className="text-white">Plant:</label>
                        <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                            {plantOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-white">Interval:</label>
                        <div className="text-[14px] relative inline-flex min-w-[180px]">
                            <DatePicker
                                selected={dateRange[0]}
                                onChange={(dates) => dates && setDateRange(dates)}
                                startDate={dateRange[0]}
                                endDate={dateRange[1]}
                                selectsRange
                                className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                                dateFormat="dd-MM-yyyy"
                            />
                            <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                        </div>
                    </div>
                    <button
          onClick={() => {
            
            fetchData();
          }}
          className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
          }`}
        >
           {loading ? "Loading..." : "Generate"}
        </button>
                </div>
            <div
                id="main-section"
                className="w-full h-[40vh] pt-[10px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
            >
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-left m-3 text-white font-bold text-[1vw]">
                    PRODUCTION EFFICIENCY
                    </h2>
                </div>
                {loading && (
                    <div className="flex flex-col justify-center items-center h-[30vh] w-full">
                    <div className="loader"></div>
                  </div>
                )}
                <div id="exportoptionpoweratio" className={`${loading ? "hidden" : "text-right -mb-2.5 -mt-1 mr-2.5 z-[999]"}`}
                ></div>
                <div id="powerRatioChart" className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
            </div>
        </div>
    );
};

export default PowerRatioChart;
