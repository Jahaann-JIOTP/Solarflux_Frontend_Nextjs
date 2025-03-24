"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import config from "@/config";

export default function ProductionComparison() {
  const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
  const [selectedInverter, setSelectedInverter] = useState("");
  const [selectedMppt, setSelectedMppt] = useState("");
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    new Date(new Date().setDate(new Date().getDate() - 25))  // 25 days ago
  ]);
  const [loading, setLoading] = useState(true);
  const [plantOptions, setPlantOptions] = useState([
    { value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" },
  ]);
  const [inverterOptions, setInverterOptions] = useState([]);
  const [mpptOptions, setMpptOptions] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState("Power");
  const chartRef = useRef(null);
  const [selectedResolution, setSelectedResolution] = useState("weekly");

  const isChartCreated = useRef(false);
  const apiCallTimeout = useRef(null);

  useEffect(() => {
    if (!isChartCreated.current) {
      fetchDeviceIds();
      createChart();
      isChartCreated.current = true;
    }
  }, []);
  const fetchDeviceIds = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        config.BASE_URL + "production/get-devices",
        {
          station: selectedPlant,
        }
      );
      setInverterOptions(response.data);
    } catch (error) {
      console.error("Error fetching device IDs:", error);
    }
  };

  const fetchMpptIds = async (devIdParam) => {
    if (!selectedInverter) return;
    const devId = devIdParam || selectedInverter;
    if (!devId) return;

    try {
      setLoading(true);
      const response = await axios.post(config.BASE_URL + "production/get-mppt", {
        devId,
      });
      setMpptOptions(response.data);
    } catch (error) {
      console.error("Error fetching MPPT IDs:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChart = async () => {
    setLoading(true);
  
    try {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
  
      const response = await axios.post("http://15.206.128.214:5000/analysis/aggregate-data1", {
        plant: selectedPlant,
        inverter: selectedInverter || null,
        mppt: selectedMppt || null,
        start_date: dateRange[0],
        end_date: dateRange[1],
        attribute: selectedVariable,
        resolution: selectedResolution || '5min',
      });
  
      const rawData = response.data;
  
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.warn("No data received or data format invalid");
        setLoading(false);
        return;
      }
  
      const processedData = {};
  
      rawData.forEach((entry) => {
        let timestamp;
  
        if (selectedResolution === "hourly") {
          timestamp = new Date(`${entry.timestamp}:00:00`);
        } else if (selectedResolution === "daily" || selectedResolution === "5min") {
          timestamp = new Date(entry.timestamp);
        } else if (selectedResolution === "weekly") {
          const { year, week } = entry.timestamp;
          timestamp = getDateFromWeek(year, week);
        } else if (selectedResolution === "monthly") {
          const { year, month } = entry.timestamp;
          timestamp = new Date(year, month - 1, 1);
        } else if (selectedResolution === "quarter") {
          const { year, quarter } = entry.timestamp;
          const month = (quarter - 1) * 3;
          timestamp = new Date(year, month, 1);
        } else if (selectedResolution === "half-yearly") {
          const { year, half } = entry.timestamp;
          const month = (half - 1) * 6;
          timestamp = new Date(year, month, 1);
        } else if (selectedResolution === "yearly") {
          const { year } = entry.timestamp;
          timestamp = new Date(year, 0, 1);
        }
  
        entry.values.forEach((v) => {
          if (v.value1 == null || isNaN(v.value1)) return; // ✅ Skip invalid values
  
          if (!processedData[v.sn]) processedData[v.sn] = [];
  
          processedData[v.sn].push({
            date: timestamp,
            value1: v.value1,
            xLabel:
              selectedResolution === "weekly"
                ? `W${getWeekNumber(timestamp)}`
                : selectedResolution === "monthly"
                ? moment(timestamp).format("MMM YYYY")
                : selectedResolution === "quarter"
                ? `Q${entry.timestamp.quarter} ${entry.timestamp.year}`
                : selectedResolution === "half-yearly"
                ? `H${entry.timestamp.half} ${entry.timestamp.year}`
                : selectedResolution === "yearly"
                ? `${entry.timestamp.year}`
                : selectedResolution === "hourly"
                ? moment(timestamp).format("HH:mm")
                : selectedResolution === "daily"
                ? moment(timestamp).format("MMM D")
                : moment(timestamp).format("MMM D, HH:mm"),
          });
        });
      });
  
      // ✅ Downsampling large data sets for better rendering
      function downsampleData(data, maxPoints = 1000) {
        const factor = Math.ceil(data.length / maxPoints);
        return data.filter((_, index) => index % factor === 0);
      }
  
      Object.keys(processedData).forEach((sn) => {
        processedData[sn].sort((a, b) => new Date(a.date) - new Date(b.date));
  
        if (selectedResolution === "5min" && processedData[sn].length > 2000) {
          processedData[sn] = downsampleData(processedData[sn], 1000);
        }
      });
  
      am4core.useTheme(am4themes_animated);
      const chart = am4core.create("chartdivirradiance", am4charts.XYChart);
      chartRef.current = chart;
      chart.logo.disabled = true;
      chart.padding(0, 0, 0, 0);
      chart.useCORS = true;
  
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.groupData = true;
      dateAxis.skipEmptyPeriods = true;
      dateAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
      dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");
      dateAxis.renderer.labels.template.fontSize = 11;
      dateAxis.renderer.labelRotation = 0;
      dateAxis.renderer.autoScale = false;
      dateAxis.renderer.minLabelPosition = 0.02;
      dateAxis.renderer.maxLabelPosition = 0.98;
      dateAxis.renderer.labels.template.truncate = false;
      dateAxis.renderer.labels.template.wrap = true;
      dateAxis.renderer.minGridDistance = 30;
  
      if (["quarter", "half-yearly"].includes(selectedResolution)) {
        dateAxis.renderer.labelFrequency = 1;
        dateAxis.renderer.minGridDistance = 1;
        dateAxis.startLocation = 0;
        dateAxis.endLocation = 1;
      }
  
      dateAxis.baseInterval =
        selectedResolution === "hourly"
          ? { timeUnit: "hour", count: 1 }
          : selectedResolution === "daily"
          ? { timeUnit: "day", count: 1 }
          : selectedResolution === "weekly"
          ? { timeUnit: "day", count: 1 }
          : selectedResolution === "monthly"
          ? { timeUnit: "month", count: 1 }
          : selectedResolution === "quarter"
          ? { timeUnit: "month", count: 1 }
          : selectedResolution === "half-yearly"
          ? { timeUnit: "month", count: 1 }
          : selectedResolution === "yearly"
          ? { timeUnit: "year", count: 1 }
          : { timeUnit: "minute", count: 5 };
  
      dateAxis.tooltipDateFormat =
        selectedResolution === "hourly"
          ? "MMM d, HH:mm"
          : selectedResolution === "daily"
          ? "MMM d"
          : selectedResolution === "weekly"
          ? "'Week' W, yyyy"
          : selectedResolution === "monthly"
          ? "MMM yyyy"
          : selectedResolution === "quarter"
          ? "'Q'Q yyyy"
          : selectedResolution === "half-yearly"
          ? "'H'H yyyy"
          : selectedResolution === "yearly"
          ? "yyyy"
          : "HH:mm";
  
      if (selectedResolution === "weekly") {
        dateAxis.renderer.labels.template.adapter.add("text", (_, target) => {
          const date = target.dataItem?.date;
          if (!date) return "";
          const week = getWeekNumber(date);
          return `W${week}`;
        });
      } else if (selectedResolution === "quarter") {
        dateAxis.renderer.labels.template.adapter.add("text", (_, target) => {
          const date = target.dataItem?.date;
          if (!date) return "";
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          const year = date.getFullYear();
          return `Q${quarter} ${year}`;
        });
      } else if (selectedResolution === "half-yearly") {
        dateAxis.renderer.labels.template.adapter.add("text", (_, target) => {
          const date = target.dataItem?.date;
          if (!date) return "";
          const half = date.getMonth() < 6 ? 1 : 2;
          const year = date.getFullYear();
          return `H${half} ${year}`;
        });
      } else if (selectedResolution === "yearly") {
        dateAxis.renderer.labels.template.adapter.add("text", (_, target) => {
          const date = target.dataItem?.date;
          if (!date) return "";
          return `${date.getFullYear()}`;
        });
      } else {
        dateAxis.renderer.labels.template.adapter.add("textOutput", (text) =>
          text.length > 10 ? text.substring(0, 10) + "..." : text
        );
      }
  
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = false;
      valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");
      valueAxis.renderer.grid.template.stroke = am4core.color("#ffffff");
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.extraMax = 0.1;
      valueAxis.strictMinMax = true;
      valueAxis.maxPrecision = 2;
  
      Object.keys(processedData)
        .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)))
        .forEach((sn, index) => {
          const series = chart.series.push(new am4charts.LineSeries());
          series.data = processedData[sn];
          series.dataFields.dateX = "date";
          series.dataFields.valueY = "value1";
          series.name = sn;
          series.strokeWidth = 2;
          series.fillOpacity = 0.3;
          series.tooltipText = `${sn}: [bold]{valueY}[/] at [bold]{xLabel}[/]`;
  
          series.stroke = am4core.color(getColor(index));
          series.tensionX = 0.8;
  
          const gradient = new am4core.LinearGradient();
          gradient.addColor(am4core.color(getColor(index)), 1);
          gradient.addColor(am4core.color("#0d2d42"), 0);
          gradient.rotation = 90;
          series.fill = gradient;
        });
  
      chart.legend = new am4charts.Legend();
      chart.legend.position = "bottom";
      chart.legend.labels.template.fill = am4core.color("#ffffff");
      chart.legend.markers.template.strokeWidth = 2;
      chart.legend.markers.template.stroke = am4core.color("#ffffff");
  
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.lineX.disabled = true;
      chart.cursor.lineY.disabled = true;
      chart.cursor.behavior = "none";
  
      chart.xAxes.each((axis) => {
        axis.tooltip.disabled = true;
      });
      chart.yAxes.each((axis) => {
        axis.tooltip.disabled = true;
      });
      addControls();
      chart.events.on("datavalidated", () => {
        const allSeries = chart.series?.values;
      
        if (Array.isArray(allSeries) && allSeries.length > 0) {
          const hasValidData = allSeries.every(
            (s) => Array.isArray(s.data) && s.data.length > 0
          );
      
          if (hasValidData) {
            setLoading(false);
          }
        }
      });
      
    } catch (error) {
      console.error("Error creating chart:", error);
      setLoading(false);
    }
  };
  const addControls = () => {
    const controlsWrapper = document.getElementById("exportoptiontrend");
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
            const chartElement = document.getElementById("chartdivirradiance");
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

  function getDateFromWeek(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  function getWeekNumber(date) {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }

  const getColor = (index) => {
    const colors = [
      "#00CCFF",
      "#6CB4EE",
      "#A3C1AD",
      "#4682B4",
      "#A3C1AD",
      "#72A0C1",
      "#7CB9E8",
      "#00CCFF",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="p-2">
      <div className="flex justify-end space-x-4 mb-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="mr-2">Plant:</label>
          <select
            value={selectedPlant}
            onChange={async (e) => {
              const value = e.target.value;
              setSelectedInverter(value);
              await fetchMpptIds(value);  // Pass value directly and wait for it
            }}

            onBlur={fetchDeviceIds}
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
          >
            {plantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="mr-2">Inverter:</label>
          <select
            value={selectedInverter}
            onChange={(e) => setSelectedInverter(e.target.value)}
            onBlur={fetchMpptIds}
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
          >
            <option value="">Select</option>
            {inverterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="mr-2">MPPT:</label>
          <select
            value={selectedMppt}
            onChange={(e) => setSelectedMppt(e.target.value)}
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
          >
            <option value="">Select</option>
            {mpptOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-white">Parameter:</label>
          <select
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
          >
            <option value="Power">Power</option>
            <option value="Current">Current</option>
            <option value="Voltage">Voltage</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-white">Resolution:</label>
          <select
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
            value={selectedResolution}
            onChange={(e) => {
              setSelectedResolution(e.target.value);
            }}
          >
            <option value="5min">5-Minute</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="half-yearly">Half-Yearly</option>
            <option value="yearly">Yearly</option>

            {/*
        
        
         */}
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
              //   dateFormat="MMMM d, yyyy"
              className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
            />
            <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              if (selectedInverter) {
                await fetchMpptIds(); // ✅ Step 1: Fetch MPPTs first
              }
              await createChart(); // ✅ Step 2: Then generate chart
            }}
            disabled={loading}
            className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
              } text-white transition`}
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>
      </div>
      <div
        id="main-section"
        className="w-full h-[77vh] pt-[10px] mt-[25px] !overflow-auto bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
      >
        {loading && (
          <div className="flex flex-col justify-center items-center h-[70vh] w-full">
            <div className="loader"></div>
            <p className="text-white mt-2 text-lg font-semibold">
              This action may take some time, please hold on...
            </p>
          </div>
        )}
        <div id="exportoptiontrend" className={`${loading ? "hidden" : ""}`} style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "20px", zIndex: 999 }}></div>
        <div
          id="chartdivirradiance"
          className={`w-full h-[67vh] ${loading ? "hidden" : ""}`}
        />
      </div>
    </div>
  );
}
