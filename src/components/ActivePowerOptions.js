"use client";

import { useEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import axios from "axios";
import config from "@/config";
import moment from 'moment';
am4core.useTheme(am4themes_animated);

const ActivePowerOptions = ({
  selectedOptionplant1,
  customFromDate,
  customToDate,
}) => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [tarrif, setTarrif] = useState(60);
  const [option, setOption] = useState(1);
  const baseUrl = config.BASE_URL;

  useEffect(() => {
    if (selectedOptionplant1 && customFromDate && customToDate) {
      createChart(option);
    }
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, customFromDate, customToDate]);

  const createChart = async (selectedOption) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}power/active_power_day`, {
        start_date: moment(customFromDate).format("YYYY-MM-DD"),
  end_date: moment(customToDate).format("YYYY-MM-DD"),
        option: selectedOption,
        tarrif,
        plant: selectedOptionplant1,
      });

      const chartData = response.data.data || [];
      const avg =
        chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;

      if (chartRef.current) chartRef.current.dispose();

      const chart = am4core.create("chartdivlayered3", am4charts.XYChart);
      chartRef.current = chart;
      chart.logo.disabled = true;
      chart.data = chartData;

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "group";
      categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
      categoryAxis.renderer.labels.template.fontSize = 12;
      categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = "Power (KW)";
      valueAxis.title.fill = am4core.color("#FFFFFF");
      valueAxis.title.fontSize = 12;
      valueAxis.title.rotation = -90;
      valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");

      let costAxis = chart.yAxes.push(new am4charts.ValueAxis());
      costAxis.renderer.opposite = true;
      costAxis.title.text = "Cost";
      costAxis.title.fill = am4core.color("#FFFFFF");
      costAxis.title.fontSize = 12;
      costAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
      costAxis.renderer.labels.template.fontSize = 12;
      costAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");

      const powerSeries = chart.series.push(new am4charts.ColumnSeries());
      powerSeries.dataFields.valueY = "value";
      powerSeries.dataFields.categoryX = "group";
      powerSeries.name = "Active Power";
      powerSeries.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      powerSeries.columns.template.width = am4core.percent(80);

      const gradient = new am4core.LinearGradient();
      gradient.addColor(am4core.color("#0066b2"), 1);
      gradient.addColor(am4core.color("#B2FFFF"), 0);
      gradient.rotation = 90;

      powerSeries.columns.template.fill = gradient;
      powerSeries.columns.template.stroke = gradient;

      const costSeries = chart.series.push(new am4charts.LineSeries());
      costSeries.dataFields.valueY = "cost";
      costSeries.dataFields.categoryX = "group";
      costSeries.name = "Cost";
      costSeries.yAxis = costAxis;
      costSeries.stroke = am4core.color("#fdd017");
      costSeries.strokeWidth = 2;
      const bullet = costSeries.bullets.push(new am4charts.CircleBullet());
      bullet.circle.fill = costSeries.stroke;
      bullet.circle.stroke = costSeries.stroke;
      bullet.circle.radius = 4;


      const range = valueAxis.axisRanges.create();
      range.value = avg;
      range.grid.stroke = am4core.color("#00FFFF");
      range.grid.strokeDasharray = "4,4";
      range.label.text = `Avg: ${avg.toFixed(2)}`;

      range.grid.strokeWidth = 4;

      // Label styling for better visibility
      range.label.text = `Avg: ${avg.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`;
      range.label.fill = am4core.color("#00FFFF");
      range.label.fontSize = 14;
      range.label.inside = true;
      range.label.align = "left";
      range.label.verticalCenter = "bottom";
      range.label.paddingBottom = 5;

      chart.cursor = new am4charts.XYCursor();
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fill = am4core.color("#FFFFFF");
      chart.legend.labels.template.fontSize = 12;

      addControls();
      setLoading(false);
    } catch (error) {
      console.error("Chart API error:", error);
      setLoading(false);
    }
  };

  const addControls = () => {
    const controlsWrapper = document.getElementById("exportoption3");
    controlsWrapper.innerHTML = "";

    const createButton = (svgPath, callback, tooltip) => {
      const button = document.createElement("button");
      button.style.cssText =
        "background:transparent;border:none;padding:2px;margin:2px;width:24px;height:24px;cursor:pointer;";
      button.title = tooltip;
      button.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          xmlns="http://www.w3.org/2000/svg">
          ${svgPath}
        </svg>`;
      button.addEventListener("click", callback);
      controlsWrapper.appendChild(button);
    };

    createButton(
      `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" /><rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
      () => chartRef.current?.exporting.export("png"),
      "Export as PNG"
    );

    createButton(
      `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
       <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
      () => chartRef.current?.exporting.export("xlsx"),
      "Export as XLSX"
    );

    createButton(
      `<path stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" 
          d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4" />`,
      () => {
          const chartElement = document.getElementById("chartdivlayered3");
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
    <div className="w-[97%] h-[40vh] pt-[10px] mt-[10px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="flex justify-between items-center text-white px-4 py-2 rounded-t-lg">
        <h2 className="text-[1vw] font-semibold">POWER CONSUMPTION</h2>
        <div className="flex items-center text-[0.9vw] gap-4">
          <div className="flex items-center gap-2">
            <label>Tariff:</label>
            <input
              type="number"
              value={tarrif}
              onChange={(e) => setTarrif(Number(e.target.value))}
              onBlur={() => createChart(option)}
              className="w-[60px] h-[30px] px-2 rounded bg-white text-black"
            />
          </div>
          {["Daily", "Weekly", "Monthly"].map((label, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${option === idx + 1 ? "bg-[#BF4A63]" : "bg-[#a1838a]"
                } text-white text-[0.9vw]`}
              onClick={() => {
                setOption(idx + 1);
                createChart(idx + 1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      {loading && (
        <div className="flex flex-col justify-center items-center h-[30vh] w-full">
          <div className="loader"></div>
        </div>
      )}
      <div
        id="exportoption3"
        className={`${loading ? "hidden" : ""}`}
        style={{ textAlign: "right", marginRight: "10px", zIndex: 999 }}
      />
      <div
        id="chartdivlayered3"
        className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}
      />
    </div>
  );
};

export default ActivePowerOptions;
