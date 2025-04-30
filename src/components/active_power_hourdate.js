'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import config from '@/config';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from "react-icons/fa";
am4core.useTheme(am4themes_animated);

const ActivePowerHourDate = ({ selectedOptionplant1 }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDate1, setSelectedDate1] = useState(new Date());
  const [selectedDate2, setSelectedDate2] = useState(new Date());
  const chartRef = useRef(null); // Use ref for chart

  // Fetch chart data from the API
  const fetchChartData = async () => {
    setLoading(true);
    try {
      const payload = {
        start_date: moment(selectedDate1).format('YYYY-MM-DD'),
        end_date: moment(selectedDate2).format('YYYY-MM-DD'),
        plant: selectedOptionplant1,
      };

      const response = await axios.post(`${config.BASE_URL}power/active_power_hourly_values`, payload);
      const data = response.data;

      const hours = Array.from({ length: 24 }, (_, i) => i);
      const chartData = hours.map((hour) => {
        const hourEntry = { hour };
        data.forEach((entry) => {
          const value = entry.hourly_values.find((hv) => hv.hour === hour)?.value || 0;
          hourEntry[`value_${entry.date}`] = value;
        });
        return hourEntry;
      });

      createChart(data.map((entry) => entry.date), chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create the chart
  const createChart = (dates, chartData) => {
    if (chartRef.current) {
      try {
        chartRef.current.dispose();
      } catch (error) {
        console.error('Error while disposing of the chart:', error);
      }
    }

    const chart = am4core.create('chartdivlayered1', am4charts.XYChart);
    chartRef.current = chart; // Set chart to the ref
    chart.logo.disabled = true;
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = 'panX';

    const hourAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    hourAxis.dataFields.category = 'hour';
    hourAxis.renderer.labels.template.fill = am4core.color('#ffffff');
    hourAxis.renderer.grid.template.stroke = am4core.color('#ffffff');
    hourAxis.renderer.labels.template.fontSize = 12;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'Values';
    valueAxis.renderer.labels.template.fill = am4core.color('#ffffff');
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#a';
    valueAxis.numberFormatter.bigNumberPrefixes = [
      { number: 1e3, suffix: 'K' },
      { number: 1e6, suffix: 'M' },
      { number: 1e9, suffix: 'B' },
    ];

    const yAxisTitle = valueAxis.title;
    yAxisTitle.text = 'Power (KW)';
    yAxisTitle.rotation = -90;
    yAxisTitle.fill = am4core.color('#FFFFFF');
    yAxisTitle.fontSize = 12;
    yAxisTitle.marginRight = 5;

    chart.data = chartData;

    dates.forEach((date, index) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = `value_${date}`;
      series.dataFields.categoryX = 'hour';
      series.tooltipText = `{valueY}`;
      series.strokeWidth = 2;
      series.name = date;
      const colors = ['#FFBF00', '#0096FF', '#568203', '#8b0000', '#1F51FF'];
      series.stroke = am4core.color(colors[index % colors.length]);

      const bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.strokeWidth = 2;
      bullet.circle.radius = 4;
      bullet.circle.fill = series.stroke;
      bullet.circle.stroke = am4core.color('#ffffff');
    });

    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 12;
    chart.legend.labels.template.fill = am4core.color('#ffffff');

    addExportFunctionality(chart); // Add export buttons here
  };

  const addExportFunctionality = (chart) => {
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

    // Export as PNG
    createButton(
      `<path d="M12 2L19 9H14V15H10V9H5L12 2Z" /><rect x="4" y="17" width="16" height="4" rx="1" ry="1" />`,
      () => chart.exporting.export('png'),
      'Export as PNG'
    );

    // Export as XLSX
    createButton(
      `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
       <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
      () => chart.exporting.export('xlsx'),
      'Export as XLSX'
    );

    // Fullscreen Toggle
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

  useEffect(() => {
    fetchChartData();
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, selectedDate1, selectedDate2]);

  return (
    <div className="w-full h-[37vh] bg-[#0d2d42] rounded-lg p-5 text-white shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      <div className="flex justify-between mb-4">
        <h4 className="text-[1vw] font-semibold mb-2">HOURLY COMPARISON</h4>
        <div className="flex gap-2 font-normal text-[0.8vw]">
        <div className="flex gap-2">
          <label htmlFor="date1" className="text-sm pt-1">Date 1:</label>
          
          <div className="text-[14px] relative inline-flex min-w-[150px]">
                    <DatePicker
                      selected={selectedDate1}
                      onChange={setSelectedDate1}
                      className="px-2 py-1 rounded-md bg-white h-[32px] w-[150px] text-black pr-8"
                    />
                    <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
        </div>
        <div className="flex gap-2 mr-2">
          <label htmlFor="date2" className="text-sm pt-1">Date 2:</label>
          <div className="text-[14px] relative inline-flex min-w-[150px]">
                    <DatePicker
                     selected={selectedDate2}
                     onChange={setSelectedDate2}
                     minDate={selectedDate1}
                      className="px-2 py-1 rounded-md bg-white h-[32px] w-[150px] text-black pr-8"
                    />
                    <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
         
        </div>
        </div>
      </div>

      {/* Export Controls */}
      <div id="exportoption1" className={`mt-[-10px] mb-[-10px] ${loading ? 'hidden' : ''}`} style={{ textAlign: 'right' }} />
      <div id="chartdivlayered1" className={`w-full h-[91%] ${loading ? 'hidden' : ''}`} />
    </div>
  );
};

export default ActivePowerHourDate;
