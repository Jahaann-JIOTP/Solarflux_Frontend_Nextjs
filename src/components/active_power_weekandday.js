'use client';

import { useEffect, useRef, useState } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import axios from 'axios';
import config from '@/config';

am4core.useTheme(am4themes_animated);

const ActivePowerWeekAndDay = ({ selectedOptionplant1, selectedYear, selectedWeeks }) => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.BASE_URL}power/active_power_week1`, {
        week_numbers: selectedWeeks,
        year: selectedYear,
        plant: selectedOptionplant1,
      });
  
      const chartData = response.data.data;
  
      let formattedData = [];
      let weekNumbers = new Set();
  
      chartData.forEach((dayEntry) => {
        const weekday = dayEntry.weekday;
        const weekData = dayEntry.week_data[0];
  
        Object.entries(weekData).forEach(([weekKey, value]) => {
          const cleanWeekNumber = weekKey.replace("week", ""); // e.g., "week40" → "40"
          weekNumbers.add(cleanWeekNumber);
          formattedData.push({ weekday, weekNumber: cleanWeekNumber, value });
        });
      });
  
      weekNumbers = Array.from(weekNumbers);
  
      if (chartRef.current) chartRef.current.dispose();
  
      const chart = am4core.create('chartdivlayered', am4charts.XYChart);
      chart.logo.disabled = true;
      chart.data = formattedData;
      chartRef.current = chart;
  
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'weekday';
      categoryAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      categoryAxis.renderer.labels.template.fontSize = 12;
      categoryAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');
  
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.labels.template.fill = am4core.color('#FFFFFF');
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.renderer.grid.template.stroke = am4core.color('#FFFFFF');
      valueAxis.title.text = 'Power (KW)';
      valueAxis.title.rotation = -90;
      valueAxis.title.fill = am4core.color('#FFFFFF');
      valueAxis.title.fontSize = 12;
      valueAxis.title.marginRight = 5;
      valueAxis.numberFormatter = new am4core.NumberFormatter();
      valueAxis.numberFormatter.numberFormat = "#a";
      valueAxis.numberFormatter.bigNumberPrefixes = [
        { number: 1e3, suffix: 'K' },
        { number: 1e6, suffix: 'M' },
        { number: 1e9, suffix: 'B' },
      ];
  
      const colorPalette = ['#5072A7', '#ffdf00', '#59bdb1', '#1877F2', '#b2babb', '#7dcea0', '#a9cce3'];
      let colorIndex = 0;
  
      weekNumbers.forEach((weekNumber) => {
        const lineSeries = chart.series.push(new am4charts.LineSeries());
        lineSeries.dataFields.valueY = 'value';
        lineSeries.dataFields.categoryX = 'weekday';
        lineSeries.name = `Week ${weekNumber}`;
        lineSeries.strokeWidth = 2;
        lineSeries.tooltipText = '{name}: [bold]{valueY}[/]';
        lineSeries.stroke = am4core.color(colorPalette[colorIndex % colorPalette.length]);
        lineSeries.data = formattedData.filter((data) => data.weekNumber === weekNumber);
  
        const bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 4;
        bullet.circle.fill = lineSeries.stroke;
        bullet.circle.stroke = am4core.color('#ffffff');
  
        colorIndex++;
      });
  
      chart.cursor = new am4charts.XYCursor();
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fill = am4core.color('#FFFFFF');
      chart.legend.labels.template.fontSize = 12;
      chart.legend.markers.template.width = 15;
      chart.legend.markers.template.height = 15;
      chart.legend.contentAlign = 'center';
  
      addControls1();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setLoading(false);
    }
  };
  

  const addControls1 = (chartInstance) => {
    const controlsWrapper = document.getElementById('exportoption2');
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
      () => chartInstance?.exporting.export('png'),
      'Export as PNG'
    );
  
    createButton(
      `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
       <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
      () => chartInstance?.exporting.export('xlsx'),
      'Export as XLSX'
    );
  
    createButton(
      `<path stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" 
          d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4" />`,
      () => {
          const chartElement = document.getElementById("chartdivlayered");
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
  

  useEffect(() => {
    fetchData();
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, selectedYear, selectedWeeks]);

  return (
    <div className="w-full h-[40vh] mt-4 mb-5 bg-[#0d2d42] rounded-lg p-5 text-white shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      <h4 className="text-[1vw] font-semibold mb-2">WEEKLY POWER CONSUMPTION</h4>
      {loading && (
        <div className="flex justify-center items-center h-[30vh]">
          <div className="loader"></div>
        </div>
      )}
      <div id="exportoption2" className={`${loading ? 'hidden' : ''}`} style={{ textAlign: 'right' }} />
      <div id="chartdivlayered" className={`w-full h-[88%] ${loading ? 'hidden' : ''}`} />
    </div>
  );
};

export default ActivePowerWeekAndDay;
