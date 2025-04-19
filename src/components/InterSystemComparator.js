import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import config from "@/config";
am4core.useTheme(am4themes_animated);

const InterSystemComparison = () => {
   const baseUrl = config.BASE_URL;

    const [selectedDate, setSelectedDate] = useState(moment().subtract(30, 'days').toDate());
    const [loading1, setLoading1] = useState(true);
    const [plant2, setPlant2] = useState("Coca Cola Faisalabad");
    const [inverter2, setInverter2] = useState("");
    const [mppt2, setMppt2] = useState("");
    const [string2, setString2] = useState("");

    const [plant3, setPlant3] = useState("Coca Cola Faisalabad");
    const [inverter3, setInverter3] = useState("");
    const [mppt3, setMppt3] = useState("");
    const [string3, setString3] = useState("");
  const [selectedParameter, setSelectedParameter] = useState("power");
    const [inverterOptions2, setInverterOptions2] = useState([]);
    const [mpptOptions2, setMpptOptions2] = useState([]);
    const [stringOptions2, setStringOptions2] = useState([]);

    const [inverterOptions3, setInverterOptions3] = useState([]);
    const [mpptOptions3, setMpptOptions3] = useState([]);
    const [stringOptions3, setStringOptions3] = useState([]);

    const chartRef1 = useRef(null);
    const chartRef2 = useRef(null);
    useEffect(() => {
        fetchAllChartData();
    }, []);

    useEffect(() => {
        fetchDeviceIds(plant2, setInverterOptions2);
        fetchDeviceIds(plant3, setInverterOptions3);
    }, [plant2, plant3]);

    useEffect(() => {
        if (inverter2) fetchMppt(inverter2, setMpptOptions2);
    }, [inverter2]);

    useEffect(() => {
        if (inverter3) fetchMppt(inverter3, setMpptOptions3);
    }, [inverter3]);

    useEffect(() => {
        if (inverter2 && mppt2) fetchStrings(inverter2, mppt2, plant2, setStringOptions2);
    }, [mppt2]);
    
    useEffect(() => {
        if (inverter3 && mppt3) fetchStrings(inverter3, mppt3, plant3, setStringOptions3);
    }, [mppt3]);
    

    const fetchDeviceIds = async (plant, setFn) => {
        try {
            const res = await axios.post(`${baseUrl}production/get-devices`, { station: plant });
            setFn(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMppt = async (devId, setFn) => {
        try {
            const res = await axios.post(`${baseUrl}production/get-mppt`, { devId });
            setFn(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStrings = async (devId, mppt, plant, setFn) => {
        try {
            const res = await axios.post(`${baseUrl}solaranalytics/get-strings`, {
                    "Plant": plant,
                    "devId": devId,
                    "mppt": mppt,
            });
            setFn(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    

    const fetchAllChartData = async () => {
        setLoading1(true);
        if (chartRef1.current) chartRef1.current.dispose();
        if (chartRef2.current) chartRef2.current.dispose();

        const chart1Payload = {
            date: moment(selectedDate).format('YYYY-MM-DD'),
            plant: plant2,
            inverter: inverter2,
            mppt: mppt2,
            string: string2,
            plant1: plant3,
            inverter1: inverter3,
            mppt1: mppt3,
            string1: string3,
            option: selectedParameter
        };

        const chart2Payload = {
            date: moment(selectedDate).format('YYYY-MM-DD'),
            stationCode1: "NE=53278269",
            stationCode2: "NE=53278269",
            option: 1
        };

        try {
            const [chart1Res, chart2Res] = await Promise.all([
                axios.post(`${baseUrl}health/get_hourly_values_inter`, chart1Payload),
                axios.post(`${baseUrl}health/radiation_intensity_inter`, chart2Payload),
            ]);

            drawChart1(Object.keys(chart1Res.data), formatHourly(chart1Res.data));
            drawChart2(chart2Res.data.map(d => d.stationCode), formatHourlySN(chart2Res.data));
            addControls();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading1(false);
        }
    };

    const formatHourly = (data) => {
        return Array.from({ length: 24 }, (_, hour) => {
            const obj = { hour };
            Object.keys(data).forEach(key => {
                const hourly = data[key][0]?.hourly_values || [];
                obj[key] = hourly.find(h => h.hour === hour)?.value || 0;
            });
            return obj;
        });
    };

    const formatHourlySN = (data) => {
        return Array.from({ length: 24 }, (_, hour) => {
            const obj = { hour };
            data.forEach(station => {
                const hourly = station.hourly_values || [];
                obj[`value_${station.stationCode}`] = hourly.find(h => h.hour === hour)?.value || 0;
            });
            return obj;
        });
    };

    const drawChart1 = (keys, data) => {
        const chart = am4core.create("chartdiv1", am4charts.XYChart);
        chartRef1.current = chart;
        chart.data = data;
        chart.logo.disabled = true;
        
        // Cursor Behavior
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panX";
        
        // X-Axis (Hour Axis)
        const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "hour";
        // categoryAxis.title.text = "Hour";
        categoryAxis.title.fill = am4core.color("#ffffff");
        categoryAxis.title.fontSize = 14;
        categoryAxis.title.fontWeight = "bold";
        categoryAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        categoryAxis.renderer.labels.template.fontSize = 12;
        categoryAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
        categoryAxis.renderer.grid.template.strokeOpacity = 0.3;
        
        // Y-Axis (Value Axis)
        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        let yAxisTitle = "";
switch (selectedParameter) {
    case "power":
        yAxisTitle = "Power (kW)";
        break;
    case "voltage":
        yAxisTitle = "Voltage (V)";
        break;
    case "current":
        yAxisTitle = "Current (A)";
        break;
    default:
        yAxisTitle = "Value";
}

valueAxis.title.text = yAxisTitle;

        valueAxis.title.rotation = -90;
        valueAxis.title.fill = am4core.color("#ffffff");
        valueAxis.title.fontSize = 12;
        valueAxis.title.marginRight = 5;
        valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        valueAxis.renderer.labels.template.fontSize = 12;
        valueAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
        valueAxis.renderer.grid.template.strokeOpacity = 0.3;
        
        // Color Palette
        const colors = ["#FFBF00", "#0096FF", "#568203", "#8b0000", "#1F51FF"];
        
        // Line Series
        keys.forEach((key, i) => {
            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = key;
            series.dataFields.categoryX = "hour";
            series.name = key;
            series.strokeWidth = 2;
            series.stroke = am4core.color(colors[i % colors.length]);
            
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
        
        // Appear Animation
        chart.series.each((series) => series.appear());
        chart.appear();
    };
    

    const drawChart2 = (keys, data) => {
        const chart = am4core.create("chartdiv2", am4charts.XYChart);
        chartRef2.current = chart;
        chart.data = data;
        chart.logo.disabled = true;
        
        // Cursor Behavior
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panX";
        
        // X-Axis (Hour Axis)
        const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "hour";
        // categoryAxis.title.text = "Hour";
        categoryAxis.title.fill = am4core.color("#ffffff");
        categoryAxis.title.fontSize = 14;
        categoryAxis.title.fontWeight = "bold";
        categoryAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        categoryAxis.renderer.labels.template.fontSize = 12;
        categoryAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
        categoryAxis.renderer.grid.template.strokeOpacity = 0.3;
        
        // Y-Axis (Value Axis)
        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Solar Irradiance";
        valueAxis.title.rotation = -90;
        valueAxis.title.fill = am4core.color("#ffffff");
        valueAxis.title.fontSize = 12;
        valueAxis.title.marginRight = 5;
        valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        valueAxis.renderer.labels.template.fontSize = 12;
        valueAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
        valueAxis.renderer.grid.template.strokeOpacity = 0.3;
        
        // Color Palette
        const colors = ["#FFBF00", "#0096FF", "#568203", "#8b0000", "#1F51FF"];
        
        // Line Series
        keys.forEach((key, i) => {
            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = `value_${key}`;
            series.dataFields.categoryX = "hour";
            series.name = key;
            series.strokeWidth = 2;
            series.stroke = am4core.color(colors[i % colors.length]);
            
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
        
        // Appear Animation
        chart.series.each((series) => series.appear());
        chart.appear();
    };
    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionintersystem");
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
    
        // Export as PNG
        createButton(
            `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" />
             <rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
            () => {
                if (chartRef1.current) chartRef1.current.exporting.export("png");
                if (chartRef2.current) chartRef2.current.exporting.export("png");
            },
            "Export Charts as PNG"
        );
    
        // Export as XLSX
        createButton(
            `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
             <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
            () => {
                if (chartRef1.current) chartRef1.current.exporting.export("xlsx");
                if (chartRef2.current) chartRef2.current.exporting.export("xlsx");
            },
            "Export Charts as XLSX"
        );
    
        // Fullscreen toggle
        createButton(
            `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
            () => {
                const container = document.getElementById("chartFullscreenInter");
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => {
                        console.error("Fullscreen error:", err.message);
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
            <div className="flex justify-end space-x-4 mb-4 mt-3 items-center">
            <div className="flex items-center space-x-2">
                    {[{ label: "Plant 1: ", value: plant2, setter: setPlant2 },
                    { label: "Inverter 1: ", value: inverter2, setter: setInverter2, options: inverterOptions2 },
                    { label: "MPPT 1: ", value: mppt2, setter: setMppt2, options: mpptOptions2 },
                    { label: "String 1: ", value: string2, setter: setString2, options: stringOptions2 }
                    ].map((item, i) => (
                        <div key={i}>
                            <label>{item.label}</label>
                            <select value={item.value} onChange={e => item.setter(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                                <option value="">Select</option>
                                {(item.options || [{ value: plant2, label: plant2 }]).map((opt, i) => (
                                    <option key={i} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                </div>
            </div>
            <div className="flex justify-end space-x-4 mb-4 items-center">
                <div className="flex items-center space-x-2">
                    {[{ label: "Plant 2: ", value: plant3, setter: setPlant3 },
                    { label: "Inverter 2: ", value: inverter3, setter: setInverter3, options: inverterOptions3 },
                    { label: "MPPT 2: ", value: mppt3, setter: setMppt3, options: mpptOptions3 },
                    { label: "String 2: ", value: string3, setter: setString3, options: stringOptions3 }
                    ].map((item, i) => (
                        <div key={i}>
                            <label>{item.label}</label>
                            <select value={item.value} onChange={e => item.setter(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
                                <option value="">Select</option>
                                {(item.options || [{ value: plant3, label: plant3 }]).map((opt, i) => (
                                    <option key={i} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-4 mb-4 items-center">
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
                <div className="flex items-center space-x-2">
                    <label className="text-white">Date:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={selectedDate}
                            onChange={setSelectedDate}
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                            dateFormat="dd-MM-yyyy"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => {
                            fetchAllChartData();
                        }}
                        className={`px-4 py-1 rounded ${loading1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
                        }`}
                    >
                        {loading1 ? "Loading..." : "Generate"}
                    </button>
                </div>
            </div>
            <div
                id="main-section"
                className="w-full h-[40vh] pt-[10px] mt-[20px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
            >
                <h2 className='text-left m-3'><b>INTER SYSTEM COMPARISON</b></h2>
                <div id="exportoptionintersystem" className="flex justify-end mb-2" style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "-20px", zIndex: 999 }}></div>
                {loading1 && <div className="flex flex-col justify-center items-center h-[35vh] w-full"><div className="loader"></div></div>}
                <div id="chartFullscreenInter" className="flex">
    <div id="chartdiv1" className={`w-full h-[30vh] mt-[20px] ${loading1 ? "hidden" : ""}`}></div>
    <div id="chartdiv2" className={`w-full h-[30vh] mt-[20px] ${loading1 ? "hidden" : ""}`}></div>
</div>

            </div>
        </div>
    );
};

export default InterSystemComparison;
