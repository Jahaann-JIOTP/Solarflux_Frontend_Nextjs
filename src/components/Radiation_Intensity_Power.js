'use client';

import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import axios from 'axios';

const ComparisonCharts = () => {
    const [topN, setTopN] = useState(3);
    const [selectedDate, setSelectedDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    const [selectedPlant, setSelectedPlant] = useState('NE=53278269');
    const [loading, setLoading] = useState(true);
    const chartRefs = useRef({});
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const plantOptions = [
        { value: 'NE=53278269', label: 'Coca Cola Faisalabad' },
    ];
    const [formValues, setFormValues] = useState({
        date: moment().subtract(40, "days").toDate(),
    });

    const fetchChartData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(`https://solarfluxapi.nexalyze.com/chart_data`, {
                date: moment(formValues.date).format('YYYY-MM-DD'),
                top_n: parseInt(topN) || 0,
            });

            if (data.status === 'success') {
                renderCharts(data.chart_data);
            } else {
                console.error('API error:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCharts = (chartData) => {
        renderChart('generated-power-chart', chartData.generated_power, 'Generated Power (KW)');
        renderChart('predicted-power-chart', chartData.predicted_power, 'Predicted Power (KW)');
        renderChart('radiation-intensity-chart', chartData.radiation_intensity, 'Radiation Intensity (W/m²)');
    };
    useEffect(() => {
        fetchChartData();
    }, []);
    const renderChart = (containerId, data, title) => {
        if (chartRefs.current[containerId]) {
            chartRefs.current[containerId].dispose();
        }
    
        const chart = am4core.create(containerId, am4charts.XYChart);
        chartRefs.current[containerId] = chart;
        chart.logo.disabled = true;
    
        chart.data = data.flatMap((entry) =>
            entry.hours.map((hour, index) => ({
                hour,
                value: entry.values[index],
                date: entry.date,
            }))
        );
    
        const uniqueDates = [...new Set(chart.data.map((d) => d.date))];
        const colorPalette = ['#5072A7', '#ffdf00', '#59bdb1', '#1877F2', '#b2babb', '#7dcea0', '#a9cce3'];
        const colorMapping = {};
        uniqueDates.forEach((date, index) => {
            colorMapping[date] = am4core.color(colorPalette[index % colorPalette.length]);
        });
    
        const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = 'hour';
        xAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
        xAxis.renderer.labels.template.fontSize = 12;
        xAxis.title.text = "Hour";
        xAxis.title.fill = am4core.color('#FFFFFF');
        xAxis.title.fontSize = 12;
    
        const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = title;
        yAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
        yAxis.renderer.labels.template.fontSize = 12;
        yAxis.title.fill = am4core.color('#FFFFFF');
        yAxis.title.fontSize = 12;
    
        uniqueDates.forEach((date) => {
            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.categoryX = 'hour';
            series.dataFields.valueY = 'value';
            series.name = date;
            series.tooltipText = `Date: {date} - Hour: {hour} - Value: {value}`;
            series.data = chart.data.filter((d) => d.date === date);
            series.stroke = colorMapping[date];
            series.strokeWidth = 2;
        });
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fill = am4core.color('#FFFFFF');
        chart.legend.labels.template.fontSize = 12;
    
        chart.cursor = new am4charts.XYCursor();
        addControls();
    };
    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoption");
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
      
        // Export as PNG for all charts
        createButton(
          `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" />
           <rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
          () => {
            Object.values(chartRefs.current).forEach((chart) => {
              if (chart) chart.exporting.export("png");
            });
          },
          "Export All as PNG"
        );
      
        // Export as Excel (XLSX) for all charts
        createButton(
          `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
           <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
          () => {
            Object.values(chartRefs.current).forEach((chart) => {
              if (chart) chart.exporting.export("xlsx");
            });
          },
          "Export All as Excel"
        );
      
        // Fullscreen toggle
        createButton(
          `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
          () => {
            const chartElement = document.getElementById("controls42");
            if (!document.fullscreenElement) {
              chartElement?.requestFullscreen().catch((err) =>
                console.error("Error attempting to enable fullscreen mode:", err.message)
              );
            } else {
              document.exitFullscreen();
            }
          },
          "Toggle Fullscreen"
        );
      };
      

    return (
        <div className='p-2'>
            <div className="flex justify-end space-x-4 mb-5 items-center">
                <div className="flex items-center space-x-2">
                    <label style={{ marginRight: 5 }}>Plant:</label>
                    <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                        {plantOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label>Compare Similar Days:</label>
                    <input
  type="number"
  value={topN}
  onChange={(e) => {
    const value = e.target.value;
    setTopN(value === '' ? '' : parseInt(value)); // allows empty temporarily
  }}
  className="w-[60px] h-[30px] text-black bg-white rounded px-[10px]"
/>


                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-white">Date:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={formValues.date}
                            onChange={(date) => setFormValues({ ...formValues, date })}
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                            dateFormat="dd-MM-yyyy"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => {
                            fetchChartData();
                        }}
                        className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
                            }`}
                    >
                        {loading ? "Loading..." : "Let AI Help You"}
                    </button>
                </div>
            </div>
            <div
                id="main-section"
                className="w-full h-[40vh] pt-[10px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
            >
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-left m-3 text-white font-bold text-[1vw]">
                        COMPARISON
                    </h2>
                </div>
                {loading && (
                    <div className="flex flex-col justify-center items-center h-[30vh] w-full">
                        <div className="loader"></div>
                    </div>
                )}

                {loading && <div id="loader"><div className="spinner" /></div>}
                <div id="exportoption" className={`${loading ? "hidden" : "text-right -mb-2.5 -mt-1 mr-2.5 z-[999]"}`}
                ></div>
                <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }} id="controls42">
                    <div className={`h-[30vh] ${loading ? "hidden" : ""}`} id="generated-power-chart" style={{ flex: 1, minWidth: 300, margin: 10 }} />
                    <div className={`h-[30vh] ${loading ? "hidden" : ""}`} id="predicted-power-chart" style={{ flex: 1, minWidth: 300, margin: 10 }} />
                    <div className={`h-[30vh] ${loading ? "hidden" : ""}`} id="radiation-intensity-chart" style={{ flex: 1, minWidth: 300, margin: 10 }} />
                </div>
            </div>
        </div>
    );
};

export default ComparisonCharts;
