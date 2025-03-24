import React, { useEffect, useState, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import axios from "axios";
import config from "@/config";
am4core.useTheme(am4themes_animated);

const GenerationCostChart = ({
  selectedOptionplant1,
  selectedOptioninverter1,
  selectedOptionmppt1,
  selectedOptionstring1,
  customFromDate,
  customToDate,
}) => {
  const [loading, setLoading] = useState(true);
  const [tariff, setTariff] = useState(60);
  const [selectedOption, setSelectedOption] = useState(1);
  const chartRef = useRef(null);
  const baseUrl = config.BASE_URL;
  const fetchChartData = async (option) => {
    setLoading(true);
    const formattedStartDate = customFromDate ? customFromDate.toISOString().split("T")[0] : "";
    const formattedEndDate = customToDate ? customToDate.toISOString().split("T")[0] : "";
    try {
      const payload = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        plant: selectedOptionplant1,
        inverter: selectedOptioninverter1,

        mppt: selectedOptionmppt1,
        string: selectedOptionstring1,
        option: option || 1,
        ph: tariff,
      };

      const { data } = await axios.post(
        `${baseUrl}solaranalytics/get_data`,
        payload
      );
      const chartData = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      renderChart(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
    setLoading(false);
  };

  const renderChart = (chartData) => {
    if (chartRef.current) {
      chartRef.current.dispose();
    }

    let chart = am4core.create("chartdivlayered3", am4charts.XYChart);
    chart.logo.disabled = true;
    chart.data = chartData;

    const averageValue =
      chartData.reduce((sum, item) => sum + item.P_abd, 0) / chartData.length;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "date";
    categoryAxis.renderer.minGridDistance = 70;
    categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");
    valueAxis.title.text = "Power (KW)";
    valueAxis.title.fill = am4core.color("#FFFFFF");
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#a"; // Enables prefix display
    valueAxis.title.fontSize = 12;
    valueAxis.numberFormatter.bigNumberPrefixes = [
      { number: 1e3, suffix: "K" },
      { number: 1e6, suffix: "M" },
      { number: 1e9, suffix: "B" },
    ];

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "P_abd";
    series.dataFields.categoryX = "date";
    series.name = "Power (kW)";
    series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
    series.columns.template.width = am4core.percent(80);
    series.clustered = false;

    let gradient = new am4core.LinearGradient();
    gradient.addColor(am4core.color("#0066b2"), 1);
    gradient.addColor(am4core.color("#B2FFFF"), 0);
    gradient.rotation = 90;
    series.columns.template.fill = gradient;
    series.columns.template.stroke = gradient;

    let range = valueAxis.axisRanges.create();
    range.value = averageValue;
    range.grid.stroke = am4core.color("#00FFFF");
    range.grid.strokeWidth = 2.5;
    range.grid.strokeDasharray = "3,3";
    range.label.inside = true;
    range.label.text = `Avg: ${averageValue.toFixed(2)}`;
    range.label.fill = am4core.color("#00FFFF");
    range.label.fontSize = 12;
    range.label.fontWeight = "bold";
    range.label.align = "right";
    range.label.verticalCenter = "bottom";

    chart.cursor = new am4charts.XYCursor();
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fill = am4core.color("#FFFFFF");
    chart.legend.labels.template.fontSize = 12;

    let valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis2.renderer.opposite = true;
    valueAxis2.renderer.labels.template.fill = am4core.color("#FFFFFF");
    valueAxis2.renderer.labels.template.fontSize = 12;
    valueAxis2.title.text = "Cost";
    valueAxis2.title.fill = am4core.color("#FFFFFF");
    valueAxis2.numberFormatter = new am4core.NumberFormatter();
    valueAxis2.title.fontSize = 12;
    valueAxis2.numberFormatter.numberFormat = "#a"; // Enables prefix display
    valueAxis2.numberFormatter.bigNumberPrefixes = [
      { number: 1e3, suffix: "K" },
      { number: 1e6, suffix: "M" },
      { number: 1e9, suffix: "B" },
    ];

    let lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.dataFields.valueY = "sum_abd";
    lineSeries.dataFields.categoryX = "date";
    lineSeries.name = "Cost";
    lineSeries.stroke = am4core.color("#fdd017");
    lineSeries.yAxis = valueAxis2;
    lineSeries.tooltipText = "{name}: [bold]{valueY}[/]";
    let bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
    bullet.circle.fill = am4core.color("#fdd017");
    bullet.circle.strokeWidth = 2;

    // chart.exporting.menu = new am4core.ExportMenu();
    chartRef.current = chart;
    addControls();
  };
  const addControls = () => {
    const controlsWrapper = document.getElementById("exportoption88");
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
        const chartElement = document.getElementById("chartdivlayered3");
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
    fetchChartData(selectedOption);
  }, [
    selectedOptionplant1,
    selectedOptioninverter1,
    selectedOptionmppt1,
    selectedOptionstring1,
    customFromDate,
    customToDate,
    tariff,
    selectedOption,
  ]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      id="main-section"
      className="w-[97%] h-[40vh] pt-[10px] mt-[10px] ml-2 bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-left m-3 text-white font-bold text-[1vw]">
          GENERATION AND COST
        </h2>
        <div
          className="flex items-center gap-3 mr-3 text-white"
          style={{ fontSize: "0.9vw" }}
        >
          <label>Tariff:</label>
          <input
            type="number"
            value={tariff}
            onChange={(e) => setTariff(Number(e.target.value))}
            style={{
              width: "60px",
              height: "30px",
              color: "black",
              backgroundColor: "white",
              borderRadius: "5px",
              paddingLeft: "10px",
            }}
          />

          {[1, 2, 3].map((opt) => (
            <input
              key={opt}
              type="button"
              value={opt === 1 ? "Daily" : opt === 2 ? "Weekly" : "Monthly"}
              onClick={() => setSelectedOption(opt)}
              className={selectedOption === opt ? "selectedclass" : ""}
              style={{
                fontSize: "0.9vw",
                padding: "5px 10px",
                height: "35px",
                width: "80px",
                borderRadius: "5px",
                border: "0px",
                color: "white",
                background: selectedOption === opt ? "#BF4A63" : "#a1838a",
              }}
            />
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col justify-center items-center h-[30vh] w-full">
          <div className="loader"></div>
        </div>
      )}
      <div
        id="exportoption88"
        className={`${loading ? "hidden" : ""}`}
        style={{
          textAlign: "right",
          marginBottom: "-10px",
          marginRight: "10px",
          marginTop: "-5px",
          zIndex: 999,
        }}
      ></div>
      <div
        id="chartdivlayered3"
        className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}
      ></div>
    </div>
  );
};

export default GenerationCostChart;
