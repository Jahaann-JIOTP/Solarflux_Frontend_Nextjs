"use client";

import { useEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import axios from "axios";
import config from "@/config";

am4core.useTheme(am4themes_animated);

export default function ActivePowerConsumption({ selectedOptionplant1, customFromDate, customToDate }) {
  const chartRef = useRef(null);
  const baseUrl = config.BASE_URL;
  const [loading, setLoading] = useState(true);
  const [peakhour1, setPeakhour1] = useState(70);
  const [nonpeakhour1, setNonpeakhour1] = useState(60);

  useEffect(() => {
    createChart();
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, customFromDate, customToDate, peakhour1, nonpeakhour1]);

  const createChart = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}power/active_power_hourgroup`, {
        start_date: customFromDate,
        end_date: customToDate,
        peakhour: peakhour1,
        nonpeakhour: nonpeakhour1,
        plant: selectedOptionplant1,
      });

      const chartData = response.data.data.sort((a, b) => {
        const startA = parseInt(a.hour_range.split('-')[0]);
        const startB = parseInt(b.hour_range.split('-')[0]);
        return startA - startB;
      });

      if (chartRef.current) chartRef.current.dispose();

      const chart = am4core.create('chartdivlayered1', am4charts.XYChart);
      chartRef.current = chart;
      chart.logo.disabled = true;
      chart.data = chartData;

      // Category Axis
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'hour_range';
      categoryAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      categoryAxis.renderer.labels.template.fontSize = 12;
      categoryAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');

      // Power Value Axis
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');
      valueAxis.numberFormatter = new am4core.NumberFormatter();
      valueAxis.numberFormatter.numberFormat = '#a';
      valueAxis.title.text = 'Power (KW)';
      valueAxis.title.rotation = -90;
      valueAxis.title.fill = am4core.color('#FFFFFF');
      valueAxis.title.fontSize = 12;

      // Cost Axis (Right)
      const costAxis = chart.yAxes.push(new am4charts.ValueAxis());
      costAxis.renderer.opposite = true;
      costAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      costAxis.renderer.labels.template.fontSize = 12;
      costAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');
      costAxis.title.text = 'Cost';
      costAxis.title.rotation = -90;
      costAxis.title.fill = am4core.color('#FFFFFF');
      costAxis.title.fontSize = 12;

      // Column Series
      const powerSeries = chart.series.push(new am4charts.ColumnSeries());
      powerSeries.dataFields.valueY = 'value';
      powerSeries.dataFields.categoryX = 'hour_range';
      powerSeries.name = 'Active Power';
      powerSeries.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
      powerSeries.columns.template.width = am4core.percent(95);

      const gradient = new am4core.LinearGradient();
      gradient.addColor(am4core.color('#0066b2'), 1);
      gradient.addColor(am4core.color('#B2FFFF'), 0);
      gradient.rotation = 90;
      powerSeries.columns.template.fill = gradient;
      powerSeries.columns.template.stroke = gradient;

      // Line Series
      const costSeries = chart.series.push(new am4charts.LineSeries());
      costSeries.dataFields.valueY = 'cost';
      costSeries.dataFields.categoryX = 'hour_range';
      costSeries.name = 'Cost';
      costSeries.yAxis = costAxis;
      costSeries.stroke = am4core.color('#fdd017');
      costSeries.strokeWidth = 2;
      costSeries.tooltipText = '{name}: [bold]{valueY}[/]';

      const bullet = costSeries.bullets.push(new am4charts.CircleBullet());
      bullet.circle.radius = 4;
      bullet.circle.fill = am4core.color('#fdd017');

      // Cursor & Legend
      chart.cursor = new am4charts.XYCursor();
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fill = am4core.color('#FFFFFF');
      chart.legend.labels.template.fontSize = 12;

      addControls();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setLoading(false);
    }
  };

  const addControls = () => {
    const controlsWrapper = document.getElementById('exportoption4');
    controlsWrapper.innerHTML = "";

    const createButton = (svgPath, callback, tooltip) => {
      const btn = document.createElement('button');
      btn.style.cssText =
        'background:transparent;border:none;padding:2px;margin:2px;width:24px;height:24px;cursor:pointer;';
      btn.title = tooltip;
      btn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          xmlns="http://www.w3.org/2000/svg">
          ${svgPath}
        </svg>`;
      btn.addEventListener("click", callback);
      controlsWrapper.appendChild(btn);
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
          const chartElement = document.getElementById("chartdivlayered1");
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
        <h2 className="text-[1vw] font-semibold">SHIFT WISE CONSUMPTION</h2>
        <div className="flex items-center gap-4 text-[0.9vw]">
          <div className="flex items-center gap-2">
            <label>Tariff PH:</label>
            <input
              type="number"
              value={peakhour1}
              onChange={(e) => setPeakhour1(Number(e.target.value))}
              className="w-[60px] h-[30px] px-2 rounded bg-white text-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <label>Tariff Non PH:</label>
            <input
              type="number"
              value={nonpeakhour1}
              onChange={(e) => setNonpeakhour1(Number(e.target.value))}
              className="w-[60px] h-[30px] px-2 rounded bg-white text-black"
            />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {loading && (
        <div className="flex flex-col justify-center items-center h-[30vh] w-full">
          <div className="loader"></div>
        </div>
      )}
      <div
        id="exportoption4"
        className={`${loading ? "hidden" : ""}`}
        style={{ textAlign: "right", marginRight: "10px", zIndex: 999 }}
      ></div>
      <div
        id="chartdivlayered1"
        className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}
      ></div>
    </div>
  );
}
