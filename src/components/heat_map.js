'use client';

import { useEffect, useState, useRef } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import axios from 'axios';
import config from '@/config';


am4core.useTheme(am4themes_animated);

const ProductionLayeredColumn = ({
    selectedOptionplant1,
    selectedOptioninverter1,
    selectedOptionmppt1,
    selectedOptionstring1,
    customFromDate,
    customToDate,
}) => {
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const baseUrl = config.BASE_URL;

    useEffect(() => {
        createChart();
        return () => {
            if (chartRef.current) {
                chartRef.current.dispose();
            }
        };
    }, [selectedOptionplant1, selectedOptioninverter1, selectedOptionmppt1, selectedOptionstring1, customFromDate, customToDate]);

    const fetchChartData = async () => {
        setLoading(true);
        try {
            const formattedStartDate = customFromDate ? customFromDate.toISOString().split("T")[0] : "";
            const formattedEndDate = customToDate ? customToDate.toISOString().split("T")[0] : "";
            const response = await axios.post(`${baseUrl}solaranalytics/grouped_data`, {
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                plant: selectedOptionplant1,
                inverter: selectedOptioninverter1,
                mppt: selectedOptionmppt1,
                string: selectedOptionstring1
            });
    
            const apiData = response.data;
    
            const uniqueDates = [...new Set(apiData.map(item => item.Day_Hour))];
            const hours = Array.from({ length: 24 }, (_, i) => `${i}`);
    
            const groupedData = apiData.reduce((acc, item) => {
                const key = `${item.Day_Hour}-${item.Hour}`;
                acc[key] = {
                    date: item.Day_Hour,
                    hour: `${item.Hour}`,
                    value: item.P_abd_sum || 0
                };
                return acc;
            }, {});
    
            const chartData = [];
            uniqueDates.forEach(date => {
                hours.forEach(hour => {
                    chartData.push(groupedData[`${date}-${hour}`] || {
                        date,
                        hour,
                        value: 0
                    });
                });
            });
    
            if (chartRef.current) {
                chartRef.current.data = chartData;
            }
    
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chart data:", error);
            setLoading(false);
        }
    };
    const createChart = () => {
        setLoading(true);
        const chart = am4core.create("chartdiv", am4charts.XYChart);
        chartRef.current = chart;
        chart.logo.disabled = true;
        chart.maskBullets = false;
    
        const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = "date";
        xAxis.renderer.labels.template.rotation = 90; // Keep labels vertical
        xAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        xAxis.renderer.labels.template.fontSize = 12;
        xAxis.renderer.minGridDistance = 20; // Adjust spacing
        xAxis.renderer.labels.template.horizontalCenter = "middle"; // Center labels
        xAxis.renderer.labels.template.location = 0.5; // Align label with the center of the column
    
        const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        yAxis.dataFields.category = "hour";
        yAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        yAxis.renderer.labels.template.fontSize = 12;
    
        const series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "date";
        series.dataFields.categoryY = "hour";
        series.dataFields.value = "value";
        series.columns.template.tooltipText = "Date: {date}\nHour: {hour}\nValue: {value.formatNumber('#.##')}";
    
        series.defaultState.transitionDuration = 3000;
        series.columns.template.fillOpacity = 1;
        series.columns.template.strokeWidth = 1;
        series.columns.template.stroke = am4core.color("#E5E4E2");
        series.columns.template.width = am4core.percent(100);
        series.columns.template.height = am4core.percent(100);
        series.heatRules.push({
            target: series.columns.template,
            property: "fill",
            min: am4core.color("#89CFF0"),
            max: am4core.color("#AE0000"),
        });
    
        // Add Heat Legend
        let heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend);
        heatLegend.width = am4core.percent(100);
        heatLegend.series = series;
        heatLegend.valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        heatLegend.valueAxis.renderer.labels.template.fontSize = 12;
        heatLegend.valueAxis.renderer.minGridDistance = 30;
    
        addControls();
        fetchChartData();
    };
    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoption4");
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
            () => { if (chartRef.current) chartRef.current.exporting.export("png"); }, 
            "Export as PNG"
        );
    
        // Export as XLSX
        createButton(
            `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
             <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`, 
            () => { if (chartRef.current) chartRef.current.exporting.export("xlsx"); }, 
            "Export as XLSX"
        );
    
        // Fullscreen Mode
        createButton(
            `<path stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" 
                d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4" />`,
            () => {
                const chartElement = document.getElementById("chartdiv");
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
    
    return (
        <div id="main-section" className="w-[97%] h-[40vh] pt-[10px] mt-[10px] ml-2 bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
            <h2 className='text-left m-3'><b>PRODUCTION INTENSITY</b></h2>
            {loading && <div className="flex flex-col justify-center items-center h-[30vh] w-full"><div className="loader"></div></div>}
            <div id="exportoption4" className={`${loading ? "hidden" : ""}`} style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "-20px", zIndex: 999 }}></div>
            <div id="chartdiv" className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
        </div>
    );
};

export default ProductionLayeredColumn;