"use client";

import { useEffect, useState, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment";
import axios from "axios";

const ClusterCharts = () => {
    const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
    const [dateRange, setDateRange] = useState([
        moment().subtract(29, "days").toDate(),
        moment().subtract(1, "days").toDate(),
    ]);
    const [clusters, setClusters] = useState({});
    const [clusterMeans, setClusterMeans] = useState({});
    const [loading, setLoading] = useState(true);
    const [legends, setLegends] = useState({});
    const chartRefs = useRef({});

    const baseUrl = "https://solarfluxapi.nexalyze.com/"; // Replace with your real API

    useEffect(() => {
        am4core.useTheme(am4themes_animated);
        fetchData();
        return () => {
            am4core.disposeAllCharts();
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(baseUrl + "cluster", {
                start_date: moment(dateRange[0]).format("YYYY-MM-DD"),
                end_date: moment(dateRange[1]).format("YYYY-MM-DD"),
                plant: selectedPlant,
            });
            setClusters(res.data.clustered_datapoints || {});
            setClusterMeans(res.data.cluster_means || {});
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderCharts = () => {
        const newLegends = {};

        Object.entries(clusters).forEach(([index, data]) => {
            const chart = am4core.create(`chartdiv-${index}`, am4charts.XYChart);
            chart.logo.disabled = true;

            const meanData = clusterMeans[index];
            const chartData = data.map((d) => ({
                Date: new Date(d.Date),
                Perf_score: d.Perf_score,
                Key: d.Key,
                Cluster_Mean: meanData && meanData[d.Date] ? meanData[d.Date] : null,
            }));

            chart.data = chartData;

            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.labels.template.fill = am4core.color("#fff");
            dateAxis.renderer.grid.template.stroke = am4core.color("#fff");

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "AI Score";
            valueAxis.title.fill = am4core.color("#fff");
            valueAxis.renderer.labels.template.fill = am4core.color("#fff");
            valueAxis.renderer.grid.template.stroke = am4core.color("#fff");

            const uniqueKeys = [...new Set(data.map((d) => d.Key))];
            const legendItems = [];

            uniqueKeys.forEach((key) => {
                const series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = "Perf_score";
                series.dataFields.dateX = "Date";
                series.name = key;
                series.data = chartData.filter((item) => item.Key === key);
                series.stroke = am4core.color("#1f618d");
                series.tooltip.disabled = true;

                legendItems.push({ name: key, color: "#1f618d" });
            });

            const meanSeries = chart.series.push(new am4charts.LineSeries());
            meanSeries.dataFields.valueY = "Cluster_Mean";
            meanSeries.dataFields.dateX = "Date";
            meanSeries.name = "Cluster Mean";
            meanSeries.stroke = am4core.color("#922b21");
            meanSeries.strokeWidth = 4;
            meanSeries.tooltipText = "Cluster Mean: {Cluster_Mean}";

            legendItems.push({ name: "Cluster Mean", color: "#922b21" });

            newLegends[index] = legendItems;
            chartRefs.current[index] = chart; // Save reference for controls
            addControls(index);
            chart.cursor = new am4charts.XYCursor();
        });
        setLegends(newLegends);
       
    };
    const addControls = (index) => {
        const controlsWrapper = document.getElementById(`exportoption-cluster-${index}`);
        if (!controlsWrapper || !chartRefs.current[index]) return;
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
    
        const chart = chartRefs.current[index];
    
        // Export PNG
        createButton(
            `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" />
             <rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
            () => { chart.exporting.export("png"); },
            "Export as PNG"
        );
    
        // Export XLSX
        createButton(
            `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
             <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
            () => { chart.exporting.export("xlsx"); },
            "Export as XLSX"
        );
    
        // Fullscreen
        createButton(
            `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
            () => {
                const chartElement = document.getElementById(`chartdiv-${index}`);
                if (!document.fullscreenElement) {
                    chartElement?.requestFullscreen().catch(err => {
                        console.error("Fullscreen error:", err.message);
                    });
                } else {
                    document.exitFullscreen();
                }
            },
            "Toggle Fullscreen"
        );
    };    
    useEffect(() => {
        if (!loading && Object.keys(clusters).length > 0) {
            am4core.disposeAllCharts();
            renderCharts();
        }
    }, [clusters, clusterMeans]);

    return (
        <div className="p-4 text-white">
            <div className="flex justify-end space-x-4 mb-8 items-center">
                <div className="flex items-center space-x-2">
                    <label className="mr-2">Plant:</label>
                    <select
                        value={selectedPlant}
                        onChange={(e) => setSelectedPlant(e.target.value)}
                        className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
                    >
                        <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={dateRange[0]}
                            onChange={(dates) => dates && setDateRange(dates)}
                            startDate={dateRange[0]}
                            endDate={dateRange[1]}
                            selectsRange
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>
                <button
                    className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
                        } text-white transition`}
                    onClick={() => {
                        fetchData();
                    }}

                >
                    {loading ? "Loading..." : "Generate"}
                </button>
            </div>

            <div className="flex flex-wrap gap-6 w-full h-[75vh] pt-[10px] mt-[20px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)] overflow-auto" id="main-section">

                {loading && (
                    <div className="flex justify-center items-center h-full w-full">
                        <div className="loader"></div>
                    </div>
                )}
                {!loading &&
                    Object.entries(clusters).map(([index]) => (
                        <div key={index} className="w-[48%] mb-6 mt-5">
                            <h5 className="mb-2 text-center">CLUSTER - {Number(index) + 1}</h5>
                            <div
            id={`exportoption-cluster-${index}`}
            style={{
                textAlign: "right",
                marginBottom: "-10px",
                marginRight: "10px",
                marginTop: "-10px",
                zIndex: 999,
            }}
        ></div>

        <div
            id={`chartdiv-${index}`}
            style={{ height: "250px", width: "100%" }}
        />
                            {/* ✅ Legends */}
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2 pl-6">

                                {legends[index]?.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center mr-4 text-sm mb-1 ml-[20px] gap-5 justify-items-start"
                                    >
                                        <div
                                            style={{
                                                backgroundColor: item.color,
                                                width: "14px",
                                                height: "14px",
                                                marginRight: "6px",
                                            }}
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                    }
            </div>
        </div>
    );
};

export default ClusterCharts;
