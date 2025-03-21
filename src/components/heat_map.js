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
            const response = await axios.post(`https://solarfluxapi.nexalyze.com/grouped_data`, {
                "start_date": "2024-12-07",
                "end_date": "2024-12-13",
                "plant": "Coca Cola Faisalabad",
                "inverter": "",
                "mppt": "",
                "string": ""
            });

            const apiData = response.data;
            const uniqueWeekdays = [...new Set(apiData.map((item) => item.Day_Hour))];
            const hours = Array.from({ length: 24 }, (_, i) => `${i}`);

            const groupedData = apiData.reduce((acc, item) => {
                const key = `${item.Day_Hour}-${item.Hour}`;
                acc[key] = {
                    weekday: item.Day_Hour,
                    hour: `${item.Hour}`,
                    value: item.P_abd_sum,
                };
                return acc;
            }, {});

            const chartData = [];
            uniqueWeekdays.forEach((weekday) => {
                hours.forEach((hour) => {
                    chartData.push(groupedData[`${weekday}-${hour}`] || { weekday, hour, value: 0 });
                });
            });

            if (chartRef.current) {
                chartRef.current.data = chartData;
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setLoading(false);
        }
    };

    const createChart = () => {
        setLoading(true);
        const chart = am4core.create('chartdiv', am4charts.XYChart);
        chartRef.current = chart;
        chart.logo.disabled = true;
        chart.maskBullets = false;

        const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.dataFields.category = 'weekday';
        xAxis.renderer.labels.template.rotation = 90;
        xAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
        xAxis.renderer.labels.template.fontSize = 12;

        const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        yAxis.dataFields.category = 'hour';
        yAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
        yAxis.renderer.labels.template.fontSize = 12;

        const series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = 'weekday';
        series.dataFields.categoryY = 'hour';
        series.dataFields.value = 'value';
        series.defaultState.transitionDuration = 3000;

        series.columns.template.tooltipText = 'Date: {weekday}\nHour: {hour}\nValue: {value.workingValue.formatNumber("#.")}';
        series.columns.template.fillOpacity = 1;
        series.columns.template.strokeWidth = 1;
        series.columns.template.stroke = am4core.color('#E5E4E2');
        series.columns.template.width = am4core.percent(100);
        series.columns.template.height = am4core.percent(100);
        series.heatRules.push({
            target: series.columns.template,
            property: 'fill',
            min: am4core.color('#89CFF0'),
            max: am4core.color('#AE0000'),
        });

        // Add Heat Legend
        let heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend);
        heatLegend.width = am4core.percent(100);
        heatLegend.series = series;
        heatLegend.valueAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
        heatLegend.valueAxis.renderer.labels.template.fontSize = 12;
        heatLegend.valueAxis.renderer.minGridDistance = 30;

        addControls();
        fetchChartData();
    };

    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoption4");
        controlsWrapper.innerHTML = "";
    
        const createButton = (svgPath, callback) => {
            const button = document.createElement("button");
            button.style.backgroundColor = "transparent";
            button.style.border = "none";
            button.style.padding = "5px";
            button.style.cursor = "pointer";
            button.style.display = "inline-flex";
            button.style.justifyContent = "center";
            button.style.alignItems = "center";
            button.style.width = "40px";
            button.style.height = "40px";
            button.style.margin = "2px";
        
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    ${svgPath}
                </svg>
            `;
        
            button.addEventListener("click", callback);
            controlsWrapper.appendChild(button);
        };
    
        // Add buttons with appropriate icons
        createButton(`<path d="M12 2L15 8H9L12 2ZM2 20V22H22V20H2ZM4 18H20V16H4V18ZM6 14H18V12H6V14ZM8 10H16V8H8V10Z" />`, () => { 
            if (chartRef.current) {
                chartRef.current.exporting.export("png");
            }
        });
    
        createButton(`<path d="M3 3V21H21V3H3ZM19 19H5V5H19V19ZM7 17H9V15H7V17ZM11 17H13V15H11V17ZM15 17H17V15H15V17ZM7 13H9V11H7V13ZM11 13H13V11H11V13ZM15 13H17V11H15V13ZM7 9H9V7H7V9ZM11 9H13V7H11V9ZM15 9H17V7H15V9Z" />`, () => { 
            if (chartRef.current) {
                chartRef.current.exporting.export("xlsx");
            }
        });
    
        createButton(`<path d="M5 5H19V19H5V5ZM7 17H17V7H7V17ZM11 15V13H9V11H11V9H13V11H15V13H13V15H11Z" />`, () => {
            const chartElement = document.getElementById("chartdiv");
            if (!document.fullscreenElement) {
                chartElement.requestFullscreen().catch(err => {
                    console.error("Error attempting to enable fullscreen mode:", err.message);
                });
            } else {
                document.exitFullscreen();
            }
        });
    };
    

    return (
        <div id="main-section" className="w-[97%] h-[40vh] pt-[10px] mt-[10px] ml-2 bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
            <h2 className='text-left m-3'><b>PRODUCTION INTENSITY</b></h2>
            {loading && <div className="flex flex-col justify-center items-center h-[35vh] w-full"><div className="loader"></div></div>}
            <div id="exportoption4" className={`${loading ? "hidden" : ""}`} style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "-20px", zIndex: 999 }}></div>
            <div id="chartdiv" className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
        </div>
    );
};

export default ProductionLayeredColumn;