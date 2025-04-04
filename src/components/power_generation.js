import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import config from "@/config";

const PowerChart = () => {
    const chartRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [option, setOption] = useState(1);
    const [selectedPlant, setSelectedPlant] = useState("NE=53278269");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [chartInstance, setChartInstance] = useState(null);

    const [dateRange, setDateRange] = useState([
        moment().subtract(60, "days").toDate(),
        moment().subtract(30, "days").toDate(),
    ]);

    const fetchChartData = async (selectedOption) => {
        setLoading(true);
        try {
            const response = await axios.post(`https://solarfluxapi.nexalyze.com/process`, {
                option: selectedOption,
                start_date: moment(dateRange[0]).format("YYYY-MM-DD"),
                end_date: moment(dateRange[1]).format("YYYY-MM-DD"),
                plant: selectedPlant,
            });

            console.log("API Response:", response.data); // Debugging line
            console.log(selectedOption);


            if (selectedOption === 1) {
                createChartOption1(response.data.plot_data);
                console.log('--', response.data.plot_data);

            } else {
                createChartOption2(response.data.chart_data);
            }

        } catch (err) {
            console.error("Error fetching chart data:", err);
        } finally {
            setLoading(false);
        }
    };


    const createChartOption1 = async (data) => {
        try {
            const am4core = await import("@amcharts/amcharts4/core");
            const am4charts = await import("@amcharts/amcharts4/charts");
            const am4themes_animated = await import("@amcharts/amcharts4/themes/animated");

            am4core.useTheme(am4themes_animated.default);

            if (!chartRef.current) return;
            if (chartInstance) chartInstance.dispose();

            const chart = am4core.create(chartRef.current, am4charts.XYChart);
            chart.logo.disabled = true;
            chart.preloader.disabled = true;

            chart.data = data.map(item => ({
                timestamp: new Date(item.timestamp),
                actualPower: item.inverter_power,
                predictedPower: item["Predicted Power"],
                radiationIntensity: item.radiation_intensity
            }));

            // X Axis
            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.baseInterval = { timeUnit: "hour", count: 1 };
            dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm";
            dateAxis.dateFormatter.utc = true;
            dateAxis.tooltipDateFormat = "yyyy-MM-dd HH:mm";
            dateAxis.renderer.labels.template.fill = am4core.color("white");
            dateAxis.renderer.labels.template.fontSize = 12;
            dateAxis.title.fontSize = 12;
            dateAxis.title.fill = am4core.color("white");
            dateAxis.renderer.grid.template.stroke = am4core.color("white");

            // Power Y Axis (Secondary)
            const powerAxis = chart.yAxes.push(new am4charts.ValueAxis());
            powerAxis.title.text = "Power (KW)";
            powerAxis.title.fill = am4core.color("white");
            powerAxis.title.fontSize = 12;
            powerAxis.renderer.labels.template.fill = am4core.color("white");
            powerAxis.renderer.labels.template.fontSize = 12;
            powerAxis.renderer.grid.template.stroke = am4core.color("white");
            powerAxis.renderer.opposite = true;
            powerAxis.numberFormatter = new am4core.NumberFormatter();
            powerAxis.numberFormatter.numberFormat = "#a";
            powerAxis.numberFormatter.bigNumberPrefixes = [
                { number: 1e3, suffix: "K" },
                { number: 1e6, suffix: "M" },
                { number: 1e9, suffix: "B" }
            ];

            // Radiation Y Axis
            const radiationAxis = chart.yAxes.push(new am4charts.ValueAxis());
            radiationAxis.title.text = "Radiation Intensity (W/m²)";
            radiationAxis.title.fill = am4core.color("white");
            radiationAxis.title.fontSize = 12;
            radiationAxis.renderer.labels.template.fill = am4core.color("white");
            radiationAxis.renderer.labels.template.fontSize = 12;
            radiationAxis.renderer.grid.template.stroke = am4core.color("white");
            radiationAxis.numberFormatter = new am4core.NumberFormatter();
            radiationAxis.numberFormatter.numberFormat = "#a";
            radiationAxis.numberFormatter.bigNumberPrefixes = powerAxis.numberFormatter.bigNumberPrefixes;

            // Actual Power Series
            const actualPowerSeries = chart.series.push(new am4charts.LineSeries());
            actualPowerSeries.name = "Actual Power";
            actualPowerSeries.dataFields.valueY = "actualPower";
            actualPowerSeries.dataFields.dateX = "timestamp";
            actualPowerSeries.yAxis = powerAxis;
            actualPowerSeries.stroke = am4core.color("#e59866");
            actualPowerSeries.strokeWidth = 2;
            actualPowerSeries.tooltipText = "{name}: {valueY} KW";
            actualPowerSeries.tooltip.label.fill = am4core.color("white");
            actualPowerSeries.tooltip.getFillFromObject = false; // Disable default fill color
            actualPowerSeries.tooltip.background.fill = actualPowerSeries.stroke; // Tooltip background color
            actualPowerSeries.tooltip.background.stroke = actualPowerSeries.stroke; // Tooltip border color
            actualPowerSeries.tooltip.label.fill = am4core.color("#FFFFFF");
            const bullet1 = actualPowerSeries.bullets.push(new am4charts.CircleBullet());
            bullet1.circle.strokeWidth = 2;
            bullet1.circle.radius = 4;
            bullet1.circle.fill = actualPowerSeries.stroke;
            bullet1.circle.stroke = am4core.color("#ffffff");

            // Predicted Power Series (no bullet)
            const predictedPowerSeries = chart.series.push(new am4charts.LineSeries());
            predictedPowerSeries.name = "Predicted Power";
            predictedPowerSeries.dataFields.valueY = "predictedPower";
            predictedPowerSeries.dataFields.dateX = "timestamp";
            predictedPowerSeries.yAxis = powerAxis;
            predictedPowerSeries.stroke = am4core.color("#d5dbdb");
            predictedPowerSeries.strokeWidth = 4;
            predictedPowerSeries.strokeDasharray = "4,4";
            predictedPowerSeries.tooltipText = "{name}: {valueY} KW";
            predictedPowerSeries.tooltip.label.fill = am4core.color("white");
            predictedPowerSeries.tooltip.getFillFromObject = false; // Disable default fill color
            predictedPowerSeries.tooltip.background.fill = predictedPowerSeries.stroke; // Tooltip background color
            predictedPowerSeries.tooltip.background.stroke = predictedPowerSeries.stroke; // Tooltip border color
            predictedPowerSeries.tooltip.label.fill = am4core.color("#FFFFFF");
            // Radiation Series
            const radiationSeries = chart.series.push(new am4charts.LineSeries());
            radiationSeries.name = "Radiation Intensity";
            radiationSeries.dataFields.valueY = "radiationIntensity";
            radiationSeries.dataFields.dateX = "timestamp";
            radiationSeries.yAxis = radiationAxis;
            radiationSeries.stroke = am4core.color("#FFFF00");
            radiationSeries.strokeWidth = 2;
            radiationSeries.tooltipText = "{name}: {valueY} W/m²";
            radiationSeries.tooltip.label.fill = am4core.color("white");
            radiationSeries.tooltip.getFillFromObject = false; // Disable default fill color
            radiationSeries.tooltip.background.fill = radiationSeries.stroke; // Tooltip background color
            radiationSeries.tooltip.background.stroke = radiationSeries.stroke; // Tooltip border color
            radiationSeries.tooltip.label.fill = am4core.color("#FFFFFF");
            const bullet2 = radiationSeries.bullets.push(new am4charts.CircleBullet());
            bullet2.circle.strokeWidth = 2;
            bullet2.circle.radius = 4;
            bullet2.circle.fill = radiationSeries.stroke;
            bullet2.circle.stroke = am4core.color("#ffffff");

            chart.legend = new am4charts.Legend();
            chart.legend.labels.template.fill = am4core.color("white");
            chart.cursor = new am4charts.XYCursor();
            chart.legend.fontSize = 12;
            setChartInstance(chart);
        } catch (error) {
            console.error("Error loading hourly chart:", error);
        }
        addControls();
    };


    const createChartOption2 = async (data) => {
        try {
            const am4core = await import("@amcharts/amcharts4/core");
            const am4charts = await import("@amcharts/amcharts4/charts");
            const am4themes_animated = await import("@amcharts/amcharts4/themes/animated");

            am4core.useTheme(am4themes_animated.default);

            if (!chartRef.current) return;
            if (chartInstance) chartInstance.dispose();

            const chart = am4core.create(chartRef.current, am4charts.XYChart);
            chart.logo.disabled = true;
            chart.preloader.disabled = true;

            const chartData = data.dates.map((date, index) => ({
                date: new Date(date),
                inverterPower: data.inverter_power[index],
                predictedPower: data.predicted_power[index],
                radiationIntensity: data.radiation_intensity[index],
                difference: data.difference[index]
            }));

            chart.data = chartData;

            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.baseInterval = { timeUnit: "day", count: 1 };
            dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd";
            dateAxis.renderer.labels.template.fill = am4core.color("white");
            dateAxis.renderer.labels.template.fontSize = 12;
            dateAxis.title.fontSize = 12;
            dateAxis.title.fill = am4core.color("white");
            dateAxis.renderer.grid.template.stroke = am4core.color("white");

            const powerAxis = chart.yAxes.push(new am4charts.ValueAxis());
            powerAxis.title.text = "Power (KW)";
            powerAxis.title.fill = am4core.color("white");
            powerAxis.title.fontSize = 12;
            powerAxis.renderer.labels.template.fill = am4core.color("white");
            powerAxis.renderer.labels.template.fontSize = 12;
            powerAxis.renderer.grid.template.stroke = am4core.color("white");
            powerAxis.renderer.opposite = true;
            powerAxis.numberFormatter = new am4core.NumberFormatter();
            powerAxis.numberFormatter.numberFormat = "#a";
            powerAxis.numberFormatter.bigNumberPrefixes = [
                { number: 1e3, suffix: "K" },
                { number: 1e6, suffix: "M" },
                { number: 1e9, suffix: "B" }
            ];

            const radiationAxis = chart.yAxes.push(new am4charts.ValueAxis());
            radiationAxis.title.text = "Radiation Intensity (W/m²)";
            radiationAxis.title.fill = am4core.color("white");
            radiationAxis.title.fontSize = 12;
            radiationAxis.renderer.labels.template.fill = am4core.color("white");
            radiationAxis.renderer.labels.template.fontSize = 12;
            radiationAxis.renderer.grid.template.stroke = am4core.color("white");
            radiationAxis.numberFormatter = new am4core.NumberFormatter();
            radiationAxis.numberFormatter.numberFormat = "#a";
            radiationAxis.numberFormatter.bigNumberPrefixes = powerAxis.numberFormatter.bigNumberPrefixes;

            const inverterPowerSeries = chart.series.push(new am4charts.LineSeries());
            inverterPowerSeries.name = "Generated Power";
            inverterPowerSeries.dataFields.dateX = "date";
            inverterPowerSeries.dataFields.valueY = "inverterPower";
            inverterPowerSeries.yAxis = powerAxis;
            inverterPowerSeries.stroke = am4core.color("#e59866");
            inverterPowerSeries.strokeWidth = 2;
            inverterPowerSeries.tooltipText = "{name}: {valueY} KW";
            inverterPowerSeries.tooltip.label.fill = am4core.color("white");
            inverterPowerSeries.tooltip.getFillFromObject = false; // Disable default fill color
            inverterPowerSeries.tooltip.background.fill = inverterPowerSeries.stroke; // Tooltip background color
            inverterPowerSeries.tooltip.background.stroke = inverterPowerSeries.stroke; // Tooltip border color
            inverterPowerSeries.tooltip.label.fill = am4core.color("#FFFFFF");
            const bullet1 = inverterPowerSeries.bullets.push(new am4charts.CircleBullet());
            bullet1.circle.strokeWidth = 2;
            bullet1.circle.radius = 4;
            bullet1.circle.fill = inverterPowerSeries.stroke;
            bullet1.circle.stroke = am4core.color("#ffffff");

            const predictedPowerSeries = chart.series.push(new am4charts.LineSeries());
            predictedPowerSeries.name = "Predicted Power";
            predictedPowerSeries.dataFields.dateX = "date";
            predictedPowerSeries.dataFields.valueY = "predictedPower";
            predictedPowerSeries.yAxis = powerAxis;
            predictedPowerSeries.stroke = am4core.color("#d5dbdb");
            predictedPowerSeries.strokeDasharray = "4,4";
            predictedPowerSeries.strokeWidth = 4;
            predictedPowerSeries.tooltipText = "{name}: {valueY} KW";
            predictedPowerSeries.tooltip.label.fill = am4core.color("white");
            predictedPowerSeries.tooltip.getFillFromObject = false; // Disable default fill color
            predictedPowerSeries.tooltip.background.fill = predictedPowerSeries.stroke; // Tooltip background color
            predictedPowerSeries.tooltip.background.stroke = predictedPowerSeries.stroke; // Tooltip border color
            predictedPowerSeries.tooltip.label.fill = am4core.color("#FFFFFF");
            const radiationSeries = chart.series.push(new am4charts.LineSeries());
            radiationSeries.name = "Radiation Intensity";
            radiationSeries.dataFields.dateX = "date";
            radiationSeries.dataFields.valueY = "radiationIntensity";
            radiationSeries.yAxis = radiationAxis;
            radiationSeries.stroke = am4core.color("#FFFF00");
            radiationSeries.strokeWidth = 2;
            radiationSeries.tooltipText = "{name}: {valueY} W/m²";
            radiationSeries.tooltip.label.fill = am4core.color("white");
            radiationSeries.tooltip.getFillFromObject = false; // Disable default fill color
            radiationSeries.tooltip.background.fill = radiationSeries.stroke; // Tooltip background color
            radiationSeries.tooltip.background.stroke = radiationSeries.stroke; // Tooltip border color
            radiationSeries.tooltip.label.fill = am4core.color("#FFFFFF");
            const bullet2 = radiationSeries.bullets.push(new am4charts.CircleBullet());
            bullet2.circle.strokeWidth = 2;
            bullet2.circle.radius = 4;
            bullet2.circle.fill = radiationSeries.stroke;
            bullet2.circle.stroke = am4core.color("#ffffff");

            chart.legend = new am4charts.Legend();
            chart.legend.labels.template.fill = am4core.color("white");
            chart.cursor = new am4charts.XYCursor();
            chart.legend.fontSize = 12;
            setChartInstance(chart);
        } catch (error) {
            console.error("Error loading daily chart:", error);
        }
        addControls();
    };

    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoptionpowergen");
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
            const chartElement = document.getElementById("chartdiv");
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
        fetchChartData(option);
    }, [option]);

    useEffect(() => {
        return () => {
            if (chartInstance) {
                chartInstance.dispose();
            }
        };
    }, [chartInstance]);
    return (
        <div className="p-2">
            <div className="flex justify-end space-x-4 mb-5 items-center">
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


            </div>
            <div
                id="main-section"
                className="w-full h-[40vh] pt-[10px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
            >

                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-left m-3 text-white font-bold text-[1vw]">
                        POWER GENERATION
                    </h2>
                    <div className="flex items-center gap-3 mr-3 text-white" style={{ fontSize: "0.9vw" }}>
                        <button
                            onClick={() => setOption(1)}
                            className={`${option === 1 ? 'bg-[#BF4A63]' : 'bg-[#a1838a]'}`}
                            style={{ fontSize: "0.9vw", padding: "5px 10px", height: "35px", width: "80px", borderRadius: "5px", border: "0px", color: "white" }}
                        >
                            Hourly
                        </button>
                        <button
                            onClick={() => setOption(2)}
                            className={`${option === 2 ? 'bg-[#BF4A63]' : 'bg-[#a1838a]'}`}
                            style={{ fontSize: "0.9vw", padding: "5px 10px", height: "35px", width: "80px", borderRadius: "5px", border: "0px", color: "white" }}
                        >
                            Daily
                        </button>
                    </div>
                </div>
                {loading && (
                    <div className="flex flex-col justify-center items-center h-[30vh] w-full">
                    <div className="loader"></div>
                  </div>
                )}
                <div id="exportoptionpowergen" className={`${loading ? "hidden" : "text-right -mb-2.5 -mt-1 mr-2.5 z-[999]"}`}
                ></div>
                <div id="chartdiv" ref={chartRef} className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(PowerChart), { ssr: false });
