import React, { useEffect, useState, useRef } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import axios from 'axios';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import config from '@/config';

am4core.useTheme(am4themes_animated);

const ScoreVsSuppressionChart = () => {
    const chartRef = useRef(null);
    const createChartRef = useRef(() => { });

    const [tarrif, setTarrif] = useState(30);
    const [option, setOption] = useState(1);
    const [selectedPlant, setSelectedPlant] = useState('NE=53278269');
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [dateRange, setDateRange] = useState([
        moment().subtract(90, "days").toDate(),
        moment().subtract(1, "days").toDate(),
    ]);
    const fetchData = async (selectedOption = option) => {
        setLoading(true);
        try {
            const response = await axios.post(`https://solarfluxapi.nexalyze.com/calculate_suppression`, {
                start_date: moment(dateRange[0]).format("YYYY-MM-DD"),
                end_date: moment(dateRange[1]).format("YYYY-MM-DD"),
                stationCode: selectedPlant,
                tarrif,
                option: selectedOption,
            });

            if (response.status === 200) {
                setChartData(response.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
 useEffect(() => {
        fetchData(option);
    }, [option]);
    createChartRef.current = () => {
        if (chartRef.current) {
            chartRef.current.dispose();
        }

        const chart = am4core.create('scoreVsSuppressionChart', am4charts.XYChart);
        chartRef.current = chart;
        chart.logo.disabled = true;

        const processedData = chartData.map(record => ({
            date: option === 1 ? new Date(record.Date) : moment(record.YearMonth, 'MMM YYYY').toDate(),
            total_suppression: record.Suppression,
            loss: option === 1 ? record['Suppression Cost'] : record.Cost,
        }));

        chart.data = processedData;

        const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;
        dateAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        dateAxis.renderer.labels.template.fontSize = 12;
        dateAxis.title.fontSize = 12;
        dateAxis.title.fill = am4core.color("#FFFFFF");
        const suppressionAxis = chart.yAxes.push(new am4charts.ValueAxis());
        suppressionAxis.title.text = 'Suppression (KW)';
        suppressionAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        suppressionAxis.renderer.labels.template.fontSize = 12;
        suppressionAxis.title.fontSize = 12;
        suppressionAxis.title.fill = am4core.color("#FFFFFF");
        const lossAxis = chart.yAxes.push(new am4charts.ValueAxis());
        lossAxis.renderer.opposite = true;
        lossAxis.title.text = 'Loss (PKR)';
        lossAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
        lossAxis.renderer.labels.template.fontSize = 12;
        lossAxis.title.fontSize = 12;
        lossAxis.title.fill = am4core.color("#FFFFFF");
        const suppressionSeries = chart.series.push(new am4charts.ColumnSeries());
        suppressionSeries.dataFields.valueY = 'total_suppression';
        suppressionSeries.dataFields.dateX = 'date';
        suppressionSeries.name = 'Total Suppression';
        suppressionSeries.tooltipText = '{name}: [bold]{valueY}[/]';

        const gradient = new am4core.LinearGradient();
        gradient.addColor(am4core.color('rgba(245, 0, 0, 0.8)'), 1);
        gradient.addColor(am4core.color('rgba(245, 0, 0, 0.8)'), 0);
        gradient.rotation = 90;
        suppressionSeries.columns.template.fill = gradient;
        suppressionSeries.columns.template.stroke = gradient;

        const lossSeries = chart.series.push(new am4charts.LineSeries());
        lossSeries.dataFields.valueY = 'loss';
        lossSeries.dataFields.dateX = 'date';
        lossSeries.name = 'Loss';
        lossSeries.tooltipText = '{name}: [bold]{valueY}[/]';
        lossSeries.stroke = am4core.color('#FFFF00');
        lossSeries.strokeWidth = 2;
        lossSeries.yAxis = lossAxis;

        chart.cursor = new am4charts.XYCursor();
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fill = am4core.color("#FFFFFF");
        chart.legend.labels.template.fontSize = 12;
        chart.legend.position = 'bottom';
        addControls();
    };

    useEffect(() => {
        if (!loading && chartData.length) {
            createChartRef.current();
        }
    }, [loading, chartData]);

    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionsupp");
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
                const chartElement = document.getElementById("scoreVsSuppressionChart");
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

    return (
        <div className="p-2">
            <div className="flex justify-end space-x-4 mb-5 items-center">
                <div className="flex items-center space-x-2">
                    <label className="text-white">Tariff:</label>
                    <input type="number" value={tarrif} className="w-[60px] h-[30px] text-black bg-white rounded px-[10px]"
                        onChange={(e) => setTarrif(Number(e.target.value))} />
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-white">Plant:</label>
                    <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                        <option value="NE=53278269">Coca Cola Faisalabad</option>
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
                        SUPPRESSION
                    </h2>
                    <div className="flex items-center gap-3 mr-3 text-white" style={{ fontSize: "0.9vw" }}>
                        <button
                            onClick={() => setOption(1)}
                            className={`
                                ${option === 1 ? 'bg-[#BF4A63]' : 'bg-[#a1838a]'}
                                text-white text-[0.9vw] px-[10px] py-[5px] h-[35px] w-[80px] rounded-[5px] border-0 cursor-pointer
                              `}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setOption(2)}
                            className={`
                                ${option === 2 ? 'bg-[#BF4A63]' : 'bg-[#a1838a]'}
                                text-white text-[0.9vw] px-[10px] py-[5px] h-[35px] w-[80px] rounded-[5px] border-0 cursor-pointer
                              `}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                {loading && (
                    <div className="flex flex-col justify-center items-center h-[30vh] w-full">
                        <div className="loader"></div>
                    </div>
                )}
                <div id="exportoptionsupp" className={`${loading ? "hidden" : "text-right -mb-2.5 -mt-1 mr-2.5 z-[999]"}`}
                ></div>
                <div id="scoreVsSuppressionChart" className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
            </div>
        </div>
    );
};

export default ScoreVsSuppressionChart;