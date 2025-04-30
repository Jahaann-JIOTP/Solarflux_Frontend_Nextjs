'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import config from "@/config"; 

am4core.useTheme(am4themes_animated);


const InverterEfficiencyChart = ({ selectedPlant, dateRange }) => {
    const chartRef = useRef(null);
    const [option, setOption] = useState(2); 
    const [loading, setLoading] = useState(true);
    const baseUrl = config.BASE_URL;
  
    useEffect(() => {
      fetchChartData();
    }, [selectedPlant, option, dateRange]);
  
    useEffect(() => {
      if (!loading && chartRef.currentData) {
        renderChart(chartRef.currentSNList, chartRef.currentData);
      }
    }, [loading]);
  
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const payload = {
          start_date: moment(dateRange[0]).format('YYYY-MM-DD'),
          end_date: moment(dateRange[1]).format('YYYY-MM-DD'),
          option,
          plant: selectedPlant,
          tag: 2,
        };
  
        const response = await axios.post(`${baseUrl}health/temperature`, payload);
        const data = response.data;
  
        chartRef.currentSNList = data.map(entry => entry.sn);
        chartRef.currentData = formatChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const formatChartData = (data) => {
      const chartData = data.flatMap(entry =>
        entry.data.map(item => ({
          hour: item.category,
          [`value_${entry.sn}`]: item.value
        }))
      );
  
      const uniqueHours = [...new Set(chartData.map(item => item.hour))];
  
      return uniqueHours.map(hour => {
        const row = { hour };
        data.forEach(entry => {
          const match = entry.data.find(d => d.category === hour);
          row[`value_${entry.sn}`] = match ? match.value : 0;
        });
        return row;
      }).sort((a, b) => new Date(`${a.hour}:00`) - new Date(`${b.hour}:00`));
    };
  
    const renderChart = (snList, chartData) => {
      if (chartRef.current) {
        chartRef.current.dispose();
      }
  
      let chart = am4core.create('chartdivlayered3', am4charts.XYChart);
      chartRef.current = chart;
      chart.logo.disabled = true;
      chart.data = chartData;
  
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'hour';
      categoryAxis.renderer.labels.template.fontSize = 12;
      categoryAxis.renderer.labels.template.adapter.add("textOutput", function (text) {
        if (option === 2 && text && /^\d{4}-\d{2}-\d{2}/.test(text)) {
          const [year, month, day] = text.split("-").map(Number);
          const dateObj = new Date(year, month - 1, day);
          return `${dateObj.getDate()} ${dateObj.toLocaleString("default", { month: "short" })}`;
        }
        return text;
      });
      categoryAxis.renderer.labels.template.fill = am4core.color('#fff');
  
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = 'Efficiency (%)';
      valueAxis.title.fill = am4core.color("#ffffff");
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.title.fontSize = 12;
      valueAxis.renderer.labels.template.fill = am4core.color('#fff');
      valueAxis.renderer.grid.template.strokeOpacity = 0.3;
  
      const colors = ['#FFBF00', '#0096FF', '#568203', '#8b0000', '#1F51FF', '#73c6b6', '#d2b4de'];
  
      snList.forEach((sn, index) => {
        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = `value_${sn}`;
        series.dataFields.categoryX = 'hour';
        series.name = sn;
  
        const color = am4core.color(colors[index % colors.length]);
        series.stroke = color;
        series.strokeWidth = 2;
  
        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 3;
        bullet.circle.fill = color;
        bullet.circle.stroke = am4core.color('#fff');
  
        series.tooltipText = "{hour}: {valueY}";
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = color;
        series.tooltip.background.stroke = color;
        series.tooltip.label.fill = am4core.color("#fff");
      });
  
      chart.legend = new am4charts.Legend();
      chart.legend.labels.template.fontSize = 12;
      chart.legend.labels.template.fill = am4core.color('#fff');
      chart.cursor = new am4charts.XYCursor();
      addControls();
    };
    const addControls = () => {
        const controlsWrapper = document.getElementById("exportoption3");
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
      <div className="p-2">
        <div
          id="main-section"
          className="w-full h-[40vh] pt-[10px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-left m-3 text-white font-bold text-[1vw]">
              INVERTER EFFICIENCY
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
      <div
        id="exportoption3"
        className={`${loading ? "hidden" : ""}`}
        style={{
          textAlign: "right",
          marginBottom: "-10px",
          marginRight: "10px",
          marginTop: "-5px",
          zIndex: 999,
        }}
      ></div>
            <div id="chartdivlayered3" className={`w-full h-[30vh] ${loading ? "hidden" : ""}`}></div>
         
        </div>
      </div>
    );
  };  
  export default InverterEfficiencyChart;
  

