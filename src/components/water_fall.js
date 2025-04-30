"use client";
import React, { useEffect, useState, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import axios from "axios";
import config from "@/config"; 

am4core.useTheme(am4themes_animated);

const WaterfallChart = ({
    selectedOptionplant1,
    selectedOptioninverter1,
    selectedOptionmppt1,
    selectedOptionstring1,
    customFromDate,
    customToDate,
}) => {
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const chartContainerRef = useRef(null);
    const baseUrl = config.BASE_URL;
    useEffect(() => {
        fetchData();
    }, [selectedOptionplant1, selectedOptioninverter1, selectedOptionmppt1, selectedOptionstring1, customFromDate, customToDate]);

    const fetchData = () => {
        setLoading(true);
        const formattedStartDate = customFromDate ? customFromDate.toISOString().split("T")[0] : "";
        const formattedEndDate = customToDate ? customToDate.toISOString().split("T")[0] : "";
        const payload = {
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            plant: selectedOptionplant1,
            inverter: selectedOptioninverter1,
            mppt: selectedOptionmppt1,
            string: selectedOptionstring1,
        };

        axios.post(`${baseUrl}solaranalytics/chart-water-data`, payload)
            .then((response) => {
                createChart(response.data);
            })
            .catch((error) => console.error("Error fetching chart data:", error))
            .finally(() => setLoading(false));
    };

    const createChart = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) return;

        let cumulativeValue = 0;
        let chart = am4core.create(chartContainerRef.current, am4charts.XYChart);
        chart.logo.disabled = true;
        chart.hiddenState.properties.opacity = 0;

        data.forEach((item) => {
            item.open = cumulativeValue;
            cumulativeValue += item.value;
        });

        chart.data = data;

        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        categoryAxis.renderer.grid.template.stroke = am4core.color("#899499");
        categoryAxis.renderer.labels.template.fontSize = 12;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        valueAxis.renderer.grid.template.stroke = am4core.color("#899499");
        valueAxis.extraMax = 0.8;
        valueAxis.title.text = "Power (KW)";
        valueAxis.title.fontSize = 12;
        valueAxis.title.fill = am4core.color("#FFFFFF");
        valueAxis.title.rotation = -90;
        valueAxis.title.marginBottom = 10;
        valueAxis.title.fontFamily = "Raleway";
        valueAxis.renderer.labels.template.fontSize = 12;
        valueAxis.numberFormatter = new am4core.NumberFormatter();
        valueAxis.numberFormatter.numberFormat = "#a"; // Enables prefix display
        valueAxis.numberFormatter.bigNumberPrefixes = [
            { number: 1e3, suffix: "K" },
            { number: 1e6, suffix: "M" },
            { number: 1e9, suffix: "B" }
        ];
        let columnSeries = chart.series.push(new am4charts.ColumnSeries());
        columnSeries.dataFields.categoryX = "category";
        columnSeries.dataFields.valueY = "value";
        columnSeries.dataFields.openValueY = "open";
        columnSeries.fillOpacity = 0.8;

        let columnTemplate = columnSeries.columns.template;
        columnTemplate.strokeOpacity = 1;
        columnTemplate.stroke = am4core.color("#ffffff");
        columnTemplate.width = am4core.percent(90);

        let label = columnTemplate.createChild(am4core.Label);
        label.text = "{value}";
        label.align = "center";
        label.valign = "top";
        label.dy = -20;
        label.fontSize = 12;
        label.fill = am4core.color("#FFFFFF");

        let gradient = new am4core.LinearGradient();
        gradient.addColor(am4core.color("#0066b2"), 1);
        gradient.addColor(am4core.color("#B2FFFF"), 0);
        gradient.rotation = 90;
        columnTemplate.fill = gradient;

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "none";

        chartRef.current = chart;
        addControls();
    };

    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionwaterfall");
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
                const chartElement = document.getElementById("waterfallChart");
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
        return () => {
            if (chartRef.current) {
                chartRef.current.dispose();
            }
        };
    }, []);

    return (
        <div id="main-section" className="w-[97%] h-[40vh] pt-[10px] mt-[10px] ml-2 bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
            <h2 className='text-left m-3'><b>PRODUCTION WATERFALL</b></h2>
            {loading && <div className="flex flex-col justify-center items-center h-[30vh] w-full"><div className="loader"></div></div>}
            
            <div id="exportoptionwaterfall" className={`${loading ? "hidden" : ""}`} style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "-20px", zIndex: 999 }}></div>
            <div ref={chartContainerRef} id="waterfallChart" className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
        </div>
    );
};

export default WaterfallChart;
