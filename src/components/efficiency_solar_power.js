import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import config from "@/config"; 
am4core.useTheme(am4themes_animated);

const EfficiencyChart = ({
    selectedOptionplant1,
    selectedOptioninverter1,
    selectedOptionmppt1,
    selectedOptionstring1,
    customFromDate,
    customToDate
}) => {
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const baseUrl = config.BASE_URL;
    useEffect(() => {
        fetchData();
        return () => {
            if (chartRef.current) {
                chartRef.current.dispose();
            }
        };
    }, [selectedOptionplant1, selectedOptioninverter1, selectedOptionmppt1, selectedOptionstring1, customFromDate, customToDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}solaranalytics/grouped_data_efficency`, {
                start_date: customFromDate,
                end_date: customToDate,
                plant: selectedOptionplant1,
                inverter: selectedOptioninverter1,
                mppt: selectedOptionmppt1,
                string: selectedOptionstring1
            });
            const chartData = processDataForChart(response.data);
            renderChart(chartData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processDataForChart = (data) => {
        return data.sort((a, b) => {
            const dateA = new Date(a.Day_Hour).getTime();
            const dateB = new Date(b.Day_Hour).getTime();
            return dateA === dateB ? a.Hour - b.Hour : dateA - dateB;
        }).map((item) => ({
            hour: `${item.Day_Hour} ${item.Hour}`,
            displayLabel: `${new Date(item.Day_Hour).getDate()} ${new Date(item.Day_Hour).toLocaleString('default', { month: 'short' })}`,
            tooltipDateHour: `${new Date(item.Day_Hour).getDate()} ${new Date(item.Day_Hour).toLocaleString('default', { month: 'short' })}, ${item.Hour}:00`,
            efficiency: item.P_abd_sum
        }));
    };

    const renderChart = (data) => {
        setTimeout(() => {
            const chartDiv = document.getElementById('chartdiv2');
            if (!chartDiv) {
                console.error("❌ Chart container 'chartdiv2' not found in the DOM.");
                return;
            }

            if (chartRef.current) {
                chartRef.current.dispose();
            }

            let chart = am4core.create("chartdiv2", am4charts.XYChart);
            chartRef.current = chart;
            chart.logo.disabled = true;
            chart.data = data;

            const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "hour";
            categoryAxis.renderer.labels.template.adapter.add("textOutput", (text, target) => {
                const dataItem = target.dataItem;
                return dataItem && dataItem.dataContext ? dataItem.dataContext.displayLabel : text;
            });
            categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
            categoryAxis.renderer.labels.template.fontSize = 12;
            categoryAxis.renderer.labels.template.horizontalCenter = "middle";
            categoryAxis.renderer.labels.template.textAlign = "middle";
            categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");
            categoryAxis.title.fontSize = 12;
            categoryAxis.title.fill = am4core.color("#FFFFFF");

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Efficiency (%)";
            valueAxis.title.fill = am4core.color("#FFFFFF");
            valueAxis.title.fontSize = 12;
            valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
            valueAxis.renderer.labels.template.fontSize = 12;
            valueAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");

            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "efficiency";
            series.dataFields.categoryX = "hour";
            series.stroke = am4core.color("#2e86c1");
            series.strokeWidth = 2;
            series.tooltipText = "Date: {tooltipDateHour}\nEfficiency: {valueY}";
            series.tooltip.getFillFromObject = false;
            series.tooltip.background.fill = am4core.color("#2e86c1");
            series.tooltip.background.stroke = am4core.color("#2e86c1");
            series.tooltip.label.fill = am4core.color("#FFFFFF");
            series.fillOpacity = 0.3;
            series.tensionX = 0.8;

            const gradient = new am4core.LinearGradient();
            gradient.addColor(am4core.color("#2e86c1"));
            gradient.addColor(am4core.color("#2e86c1", 0));
            gradient.rotation = 90;
            series.fill = gradient;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.snapToSeries = series;

            chart.legend = new am4charts.Legend();
            chart.legend.labels.template.text = "Efficiency";
            chart.legend.labels.template.fill = am4core.color("#FFFFFF");
            chart.legend.labels.template.fontSize = 12;
            chart.legend.visible = false;
        }, 0);
        addControls();
    };

    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionefficiency");
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
            `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
            () => {
                const chartElement = document.getElementById("chartdiv2");
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
            <h2 className='text-left m-3'><b>EFFICIENCY</b></h2>
            {loading && <div className="flex flex-col justify-center items-center h-[30vh] w-full"><div className="loader"></div></div>}
            <div id="exportoptionefficiency" className={`${loading ? "hidden" : ""}`} style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "-20px", zIndex: 999 }}></div>
            <div id="chartdiv2" className={`w-full h-[37vh] ${loading ? "hidden" : ""}`}></div>
        </div>

    );
};

export default EfficiencyChart;
