'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import config from '@/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { FaCalendarAlt } from "react-icons/fa";
am4core.useTheme(am4themes_animated);

const ActivePowerBusyMonday = ({ selectedOptionplant1 }) => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [weekday, setWeekday] = useState('Monday');
  const [range, setRange] = useState({
    start: moment().subtract(29, 'days').toDate(),
    end: moment().subtract(1, 'days').toDate(),
  });

  // Function to fetch data
  const fetchData = async () => {
    if (!selectedOptionplant1) return;
    setLoading(true);
    try {
      const payload = {
        start_date: moment(range.start).format('YYYY-MM-DD'),
        end_date: moment(range.end).format('YYYY-MM-DD'),
        weekday,
        plant: selectedOptionplant1
      };

      const response = await axios.post(`${config.BASE_URL}power/active_power_monday_values`, payload);
      const data = response.data;

      const hours = Array.from({ length: 24 }, (_, i) => i);
      const chartData = hours.map(hour => {
        const hourEntry = { hour: String(hour) };
        data.forEach(entry => {
          const value = entry.hourly_values.find(h => h.hour === hour)?.value || 0;
          hourEntry[`value_${entry.description}`] = value;
        });
        return hourEntry;
      });

      renderChart(data.map(entry => entry.description), chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to render the chart using amCharts
  const renderChart = (labels, data) => {
    if (chartRef.current) {
      chartRef.current.dispose();
    }

    const chart = am4core.create('chartdivlayered2', am4charts.XYChart);
    chartRef.current = chart;
    chart.logo.disabled = true;
    chart.data = data;
    chart.cursor = new am4charts.XYCursor();

    const hourAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    hourAxis.dataFields.category = 'hour';
    hourAxis.renderer.labels.template.fill = am4core.color('#ffffff');
    hourAxis.renderer.grid.template.stroke = am4core.color('#ffffff');
    hourAxis.renderer.labels.template.fontSize = 12;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'Power (KW)';
    valueAxis.title.rotation = -90;
    valueAxis.title.fontSize = 12;
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.title.fill = am4core.color('#ffffff');
    valueAxis.renderer.labels.template.fill = am4core.color('#ffffff');
    valueAxis.renderer.grid.template.stroke = am4core.color('#ffffff');
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#a";
    valueAxis.numberFormatter.bigNumberPrefixes = [
      { number: 1e3, suffix: 'K' },
      { number: 1e6, suffix: 'M' },
      { number: 1e9, suffix: 'B' }
    ];

    const colors = ['#FFBF00', '#0096FF', '#568203', '#8b0000', '#1F51FF'];

    labels.forEach((label, index) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = `value_${label}`;
      series.dataFields.categoryX = 'hour';
      series.name = label;
      series.strokeWidth = 2;
      series.stroke = am4core.color(colors[index % colors.length]);
      series.tooltipText = `{name}: [bold]{valueY}[/]`;

      const bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.strokeWidth = 2;
      bullet.circle.radius = 4;
      bullet.circle.fill = series.stroke;
      bullet.circle.stroke = am4core.color('#ffffff');
    });

    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fill = am4core.color('#ffffff');
    chart.legend.fontSize = 12;
    chart.data = data;

    addExportFunctionality(chart); // Add export buttons here
  };

  // Add export functionality (PNG, XLSX, Fullscreen)
  const addExportFunctionality = (chart) => {
    const controlsWrapper = document.getElementById('exportoption2'); // Unique ID for this chart
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
      () => chart.exporting.export('png'),
      'Export as PNG'
    );

    createButton(
      `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
       <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
      () => chart.exporting.export('xlsx'),
      'Export as XLSX'
    );

    createButton(
      `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
      () => {
        const el = document.getElementById('chartdivlayered2');
        !document.fullscreenElement ? el.requestFullscreen() : document.exitFullscreen();
      },
      'Toggle Fullscreen'
    );
  };

  // useEffect hook to fetch data when component mounts or state changes
  useEffect(() => {
    fetchData();
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, [selectedOptionplant1, range, weekday]);

  return (
    <div className="w-full h-[38vh] bg-[#0d2d42] rounded-lg p-5 text-white shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      <h4 className="text-[1vw] font-semibold mb-2 flex justify-between items-center">
        LAST VS BUSIEST WEEKDAY
        <div className="flex gap-4 items-center text-[0.8vw] font-normal">
          <div className="flex items-center gap-2">
            <label>Day:</label>
            <select
              className="text-black px-2 py-1 rounded bg-white h-[32px]" 
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label>Interval:</label>
            <div className="text-[14px] relative inline-flex min-w-[180px]">
                      <DatePicker
                        selected={range.start}
                        onChange={(dates) => setRange({ start: dates[0], end: dates[1] })}
                        selectsRange
                        startDate={range.start}
                        endDate={range.end}
                        className="px-2 py-1 rounded-md bg-white h-[32px] w-[200px] text-black pr-8"
                        maxDate={new Date()}
                      />
                      <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                      </div>
          </div>
        </div>
      </h4>

      {/* Export Controls */}
    

      {loading && (
        <div className="flex justify-center items-center h-[30vh]">
          <div className="loader"></div>
        </div>
      )}
        <div id="exportoption2" className={`mt-[-5px] mb-[-5px] ${loading ? 'hidden' : ''}`} style={{ textAlign: 'right' }}  />
      <div id="chartdivlayered2" className="w-full h-[92%]" />
    </div>
  );
};

export default ActivePowerBusyMonday;
