'use client';

import { useEffect, useRef, useState } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import axios from 'axios';
import config from '@/config';

am4core.useTheme(am4themes_animated);

export default function ActivePowerWeekdays({ selectedOptionplant1, customFromDate, customToDate }) {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [aggregation, setAggregation] = useState(1);
  const baseUrl = config.BASE_URL;

  useEffect(() => {
    createChart();
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, customFromDate, customToDate, aggregation]);

  const createChart = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}power/active_power_weekday`, {
        start_date: customFromDate,
        end_date: customToDate,
        aggregation,
        plant: selectedOptionplant1
      });

      const chartData = response.data.data;
      if (chartRef.current) chartRef.current.dispose();

      const chart = am4core.create('chartdivlayered2', am4charts.XYChart);
      chartRef.current = chart;
      chart.logo.disabled = true;
      chart.data = chartData;

      // X Axis (Weekdays)
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'weekday';
      categoryAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      categoryAxis.renderer.labels.template.fontSize = 12;
      categoryAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');

      // Y Axis (Power)
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

      // Series (Columns)
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = 'value';
      series.dataFields.categoryX = 'weekday';
      series.name = 'Total Active Power';
      series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
      series.columns.template.width = am4core.percent(95);

      // Gradient fill
      const gradient = new am4core.LinearGradient();
      gradient.addColor(am4core.color('#0066b2'), 1);
      gradient.addColor(am4core.color('#B2FFFF'), 0);
      gradient.rotation = 90;
      series.columns.template.fill = gradient;
      series.columns.template.stroke = gradient;

      chart.cursor = new am4charts.XYCursor();

      // Legend
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fill = am4core.color('#FFFFFF');
      chart.legend.labels.template.fontSize = 12;
      chart.legend.data = [{ name: 'Active Power', fill: gradient }];

      addControls();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weekday data:', error);
      setLoading(false);
    }
  };

  const addControls = () => {
    const controlsWrapper = document.getElementById('exportoption1');
    controlsWrapper.innerHTML = '';

    const createButton = (svgPath, callback, tooltip) => {
      const button = document.createElement('button');
      button.style.cssText =
        'background:transparent;border:none;padding:2px;margin:2px;width:24px;height:24px;cursor:pointer;';
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
      `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
      () => {
        const chartElement = document.getElementById("chartdivlayered2");
        !document.fullscreenElement
          ? chartElement.requestFullscreen()
          : document.exitFullscreen();
      },
      "Toggle Fullscreen"
    );
  };

  return (
    <div className="w-[97%] h-[40vh] pt-[10px] mt-[10px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="flex justify-between items-center text-white px-4 py-2 rounded-t-lg">
        <h2 className="text-[1vw] font-semibold">DAY WISE CONSUMPTION</h2>
        <div className="flex items-center gap-4 text-[0.9vw]">
          <div className="flex items-center gap-2">
            <label htmlFor="aggregation">Aggregation:</label>
            <select
              id="aggregation"
              value={aggregation}
              onChange={(e) => setAggregation(Number(e.target.value))}
              className="w-[120px] px-2 py-1 rounded-md text-black bg-white"
            >
              <option value={1}>Sum</option>
              <option value={2}>Average</option>
            </select>
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
        id="exportoption1"
        className={`${loading ? "hidden" : ""}`}
        style={{ textAlign: "right", marginRight: "10px", zIndex: 999 }}
      />
      <div
        id="chartdivlayered2"
        className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}
      />
    </div>
  );
}
