'use client';

import { useEffect, useRef, useState } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import config from '@/config';
import { FaCalendarAlt } from "react-icons/fa";
am4core.useTheme(am4themes_animated);

const PeakHourActivePower = ({ selectedOptionplant1 }) => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), // Default start date
    new Date(new Date().setDate(new Date().getDate() - 1))  // Default end date
  ]);

  // Function to fetch chart data
  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.BASE_URL}power/active_peak_power`, {
        plant: selectedOptionplant1,
        start_date: dateRange[0].toISOString().split('T')[0],
        end_date: dateRange[1].toISOString().split('T')[0],
      });

      const chartData = response.data.data;
      const totalHours = chartData.reduce((sum, item) => sum + parseInt(item.hour), 0);
      const averageHour = totalHours / chartData.length;

      if (chartRef.current) chartRef.current.dispose();
      const chart = am4core.create('peak_hour_chartdiv', am4charts.XYChart);
      chart.logo.disabled = true;
      chart.data = chartData;
      chartRef.current = chart;

      // X-Axis (Category Axis)
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'date';
      categoryAxis.renderer.labels.template.fill = am4core.color('#fff');
      categoryAxis.renderer.grid.template.stroke = am4core.color('#fff');
      categoryAxis.renderer.labels.template.fontSize = 12;

      // Y-Axis (Value Axis)
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = 'Hour';
      valueAxis.title.rotation = -90;
      valueAxis.title.fill = am4core.color('#fff');
      valueAxis.renderer.labels.template.fill = am4core.color('#fff');
      valueAxis.renderer.grid.template.stroke = am4core.color('#fff');
      valueAxis.title.fontSize = 12;  // Setting label font size
      valueAxis.renderer.labels.template.fontSize = 12;  // Setting label font size

      // Right Y-Axis (for Power in K)
      const secondAxis = chart.yAxes.push(new am4charts.ValueAxis());
      secondAxis.renderer.opposite = true;
      secondAxis.title.text = 'Power (KW)';
      secondAxis.title.rotation = -90;
      secondAxis.title.fill = am4core.color('#fff');
      secondAxis.title.fontSize = 12;  // Setting title font size
      secondAxis.renderer.labels.template.fontSize = 12;
      secondAxis.renderer.labels.template.fill = am4core.color('#fff');
      secondAxis.numberFormatter = new am4core.NumberFormatter();
      secondAxis.numberFormatter.numberFormat = "#a";  // Format in K (Thousands)
      secondAxis.numberFormatter.bigNumberPrefixes = [
        { number: 1e3, suffix: 'K' },
        { number: 1e6, suffix: 'M' },
        { number: 1e9, suffix: 'B' }
      ];

      // Column Series (for Hour)
      const columnSeries = chart.series.push(new am4charts.ColumnSeries());
      columnSeries.dataFields.valueY = 'hour';
      columnSeries.dataFields.categoryX = 'date';
      columnSeries.name = 'Hour';
      columnSeries.tooltipText = '{name}: [bold]{valueY}[/]';

      // Applying Gradient Fill
      const gradient = new am4core.LinearGradient();
      gradient.addColor(am4core.color("#0066b2"), 1);  // Color at the top
      gradient.addColor(am4core.color("#B2FFFF"), 0);  // Color at the bottom
      gradient.rotation = 90; // Gradient rotation (vertical)

      columnSeries.columns.template.fill = gradient;  // Apply gradient fill to columns
      columnSeries.columns.template.stroke = gradient; // Apply gradient stroke to columns

      // Line Series (for Max Active Power)
      const lineSeries = chart.series.push(new am4charts.LineSeries());
      lineSeries.dataFields.valueY = 'max_active_power';
      lineSeries.dataFields.categoryX = 'date';
      lineSeries.name = 'Max Active Power';
      lineSeries.yAxis = secondAxis;
      lineSeries.stroke = am4core.color('#fdd017');
      lineSeries.strokeWidth = 2;
      lineSeries.tooltipText = '{name}: [bold]{valueY}[/]';

      // Bullet for Line Series
      const bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
      bullet.circle.fill = lineSeries.stroke;
      bullet.circle.stroke = am4core.color('#fff');
      bullet.circle.strokeWidth = 2;

      const avgRange = valueAxis.axisRanges.create();
      avgRange.value = averageHour;
      avgRange.grid.stroke = am4core.color('#00FFFF');
      avgRange.grid.strokeDasharray = "5,5";  // Dash line style
      avgRange.grid.strokeWidth = 3;  // Increase stroke width for bold effect
      avgRange.label.text = `Avg: ${averageHour.toFixed(2)}`;
      avgRange.label.fill = am4core.color('#00FFFF');
      avgRange.label.fontSize = 12;  // Make font bold and 12px
      avgRange.label.fontWeight = 'bold';
      avgRange.label.valign = 'top'; // Align label inside the grid
      avgRange.label.inside = true;

      
      // Legend
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fill = am4core.color('#fff');
      chart.legend.fontSize = 12;
      chart.cursor = new am4charts.XYCursor();

      addExportFunctionality(chart);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setLoading(false);
    }
  };

  const addExportFunctionality = (chart) => {
    const controlsWrapper = document.getElementById('exportoption');
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

    createButton(
      `<path stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" 
          d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4" />`,
      () => {
          const chartElement = document.getElementById("peak_hour_chartdiv");
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

  // useEffect hook to fetch data when component mounts or state changes
  useEffect(() => {
    if (selectedOptionplant1) fetchChartData();
    return () => chartRef.current?.dispose();
  }, [selectedOptionplant1, dateRange]);

  return (
    <div className="w-full h-[37vh] bg-[#0d2d42] rounded-lg p-5 text-white shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[1vw] font-semibold">PEAK HOUR</h4>
        <div className="flex items-center text-[0.8vw] gap-2">
          <label>Interval:</label>
          <div className="text-[14px] relative inline-flex min-w-[180px]">
          <DatePicker
            selected={dateRange[0]}
            onChange={(dates) => dates && setDateRange(dates)} // Updating both start and end dates
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            selectsRange
            className="px-2 py-1 rounded-md bg-white h-[32px] w-[200px] text-black pr-8"
          />
          <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-[30vh]">
          <div className="loader"></div>
        </div>
      )}
      <div id="exportoption" className={`mt-[-5px] mb-[-5px] ${loading ? 'hidden' : ''}`} style={{ textAlign: 'right' }} />
      <div id="peak_hour_chartdiv" className={`w-full h-[92%] ${loading ? 'hidden' : ''}`} />
    </div>
  );
};

export default PeakHourActivePower;
