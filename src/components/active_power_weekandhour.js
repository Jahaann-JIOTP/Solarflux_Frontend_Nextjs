'use client';

import { useEffect, useRef, useState } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import axios from 'axios';
import config from '@/config';

am4core.useTheme(am4themes_animated);

export default function ActivePowerWeekAndHour({ selectedOptionplant1, selectedYear, selectedWeeks }) {
  const chartRef = useRef(null);
  const [aggregation, setAggregation] = useState(1);
  const [loading, setLoading] = useState(true);
  const baseUrl = config.BASE_URL;

  useEffect(() => {
    createChart();
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, selectedYear, selectedWeeks, aggregation]);

  const createChart = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}power/active_power_hour_week1`, {
        week_number: selectedWeeks,
        year: selectedYear,
        plant: selectedOptionplant1,
        option: aggregation,
      });

      const chartData = response.data.data || [];

      const formattedData = chartData.map((item) => ({
        hour: item.hour,
        ...item.weekdays,
      }));

      const weekdayShortNames = {
        Sunday: 'Sun',
        Monday: 'Mon',
        Tuesday: 'Tues',
        Wednesday: 'Wed',
        Thursday: 'Thurs',
        Friday: 'Fri',
        Saturday: 'Sat',
      };

      const colorPalette = ['#5072A7', '#ffdf00', '#59bdb1', '#1877F2', '#b2babb', '#7dcea0', '#a9cce3'];

      if (chartRef.current) chartRef.current.dispose();
      const chart = am4core.create('chartdivlayered1', am4charts.XYChart);
      chartRef.current = chart;
      chart.logo.disabled = true;
      chart.data = formattedData;

      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'hour';
      categoryAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      categoryAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');
      categoryAxis.renderer.labels.template.fontSize = 12;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      valueAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.numberFormatter = new am4core.NumberFormatter();
      valueAxis.numberFormatter.numberFormat = '#a';
      valueAxis.title.text = 'Power (KW)';
      valueAxis.title.fill = am4core.color('#FFFFFF');
      valueAxis.title.rotation = -90;

      let colorIndex = 0;
      Object.keys(weekdayShortNames).forEach((weekday) => {
        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = weekday;
        series.dataFields.categoryX = 'hour';
        series.name = weekdayShortNames[weekday];
        series.strokeWidth = 2;
        series.stroke = am4core.color(colorPalette[colorIndex % colorPalette.length]);
        series.tooltipText = `{name}: [bold]{valueY}[/]`;

        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.radius = 4;
        bullet.circle.fill = series.stroke;
        bullet.circle.stroke = am4core.color('#ffffff');
        bullet.circle.strokeWidth = 2;

        colorIndex++;
      });

      chart.cursor = new am4charts.XYCursor();
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fill = am4core.color('#FFFFFF');

      addControls();
      setLoading(false);
    } catch (error) {
      console.error('Error loading chart data:', error);
      setLoading(false);
    }
  };

  const addControls = () => {
    const controlsWrapper = document.getElementById('exportoption1');
    controlsWrapper.innerHTML = '';

    const createButton = (svgPath, callback, tooltip) => {
      const button = document.createElement('button');
      button.style.cssText = 'background:transparent;border:none;padding:5px;cursor:pointer;margin:2px;';
      button.title = tooltip;
      button.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          ${svgPath}
        </svg>`;
      button.addEventListener('click', callback);
      controlsWrapper.appendChild(button);
    };

    createButton(
      `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" /><rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
      () => chartRef.current?.exporting.export('png'),
      'Export as PNG'
    );

    createButton(
      `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
       <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
      () => chartRef.current?.exporting.export('xlsx'),
      'Export as XLSX'
    );

    createButton(
      `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
      () => {
        const el = document.getElementById('chartdivlayered1');
        !document.fullscreenElement ? el.requestFullscreen() : document.exitFullscreen();
      },
      'Toggle Fullscreen'
    );
  };

  return (
    <div className="w-full h-[40vh] mt-5 bg-[#0d2d42] rounded-lg p-5 text-white shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[1vw] font-semibold">HOURLY POWER CONSUMPTION</h4>
        <div className="flex items-center gap-2 text-[0.9vw]">
          <label>Aggregation:</label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(Number(e.target.value))}
            className="w-[120px] px-2 py-1 rounded bg-white text-black"
          >
            <option value={1}>Sum</option>
            <option value={2}>Average</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-[30vh]">
          <div className="loader"></div>
        </div>
      )}
      <div id="exportoption1" className={`${loading ? 'hidden' : ''}`} style={{ textAlign: 'right' }} />
      <div id="chartdivlayered1" className={`w-full h-[88%] ${loading ? 'hidden' : ''}`} />
    </div>
  );
}
