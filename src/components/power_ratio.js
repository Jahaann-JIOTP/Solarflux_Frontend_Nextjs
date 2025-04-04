"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import "daterangepicker/daterangepicker.css";
import "daterangepicker";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import config from "@/config";

const PowerRatioChart = () => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState("NE=53278269");
  const [fromDate, setFromDate] = useState(moment().subtract(90, "days").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().subtract(1, "days").format("YYYY-MM-DD"));

  const plantOptions = [
    { value: "NE=53278269", label: "Coca Cola Faisalabad" },
  ];

  useEffect(() => {
    $("#reportrange2").daterangepicker(
      {
        startDate: moment(fromDate),
        endDate: moment(toDate),
      },
      function (start, end) {
        setFromDate(start.format("YYYY-MM-DD"));
        setToDate(end.format("YYYY-MM-DD"));
      }
    );
  }, []);

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, selectedPlant]);

  const [chartData, setChartData] = useState(null);

  // Call API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`https://solarfluxapi.nexalyze.com/power_ratio`, {
        start_date: fromDate,
        end_date: toDate,
        plant: selectedPlant,
      });
      if (response.data.status === "success") {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Draw chart only when loading ends and chartData is available
  useEffect(() => {
    if (!loading && chartData) {
      drawChart(chartData);
    }
  }, [loading, chartData]);
  
  const drawChart = (data) => {
    if (chartRef.current) chartRef.current.dispose();

    let chart = am4core.create("powerRatioChart", am4charts.XYChart);
    chart.logo.disabled = true;
    chart.data = data.dates.map((date, index) => ({
      date: new Date(date),
      power_ratio: data.power_ratios[index],
    }));

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    dateAxis.renderer.labels.template.fontSize = 12;
    dateAxis.renderer.grid.template.stroke = am4core.color("#E5E5E5");
    dateAxis.renderer.minGridDistance = 50;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Power Ratio (%)";
    valueAxis.title.fill = am4core.color("#FFFFFF");
    valueAxis.title.fontSize = 12;
    valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.renderer.grid.template.stroke = am4core.color("#E5E5E5");
    valueAxis.min = 0;
    valueAxis.max = 130;

    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "power_ratio";
    series.tooltipText = "{valueY}";

    let gradient = new am4core.LinearGradient();
    gradient.addColor(am4core.color("#0066b2"), 1);
    gradient.addColor(am4core.color("#B2FFFF"), 0);
    gradient.rotation = 90;
    series.columns.template.fill = gradient;
    series.columns.template.stroke = am4core.color("#004085");
    series.columns.template.strokeOpacity = 1;
    series.columns.template.strokeWidth = 1;

    const range = valueAxis.axisRanges.create();
    range.value = 90;
    range.endValue = 110;
    range.axisFill.fill = am4core.color("rgba(0, 255, 0, 0.2)");
    range.axisFill.fillOpacity = 0.9;
    range.grid.strokeOpacity = 0;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.legend = new am4charts.Legend();
    chart.legend.visible = false;
    chartRef.current = chart;
  };

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.dispose();
    };
  }, []);

  return (
    <div className="p-2">
      <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: -20 }}>
        PRODUCTION EFFICIENCY
        <div className="flex justify-end space-x-4 mb-5 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-white">Plant:</label>
            <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]">
              {plantOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-white">Interval:</label>
            <div id="reportrange2" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 10 }}>
              <span id="dateshow2">{moment(fromDate).format("MMMM D, YYYY")} - {moment(toDate).format("MMMM D, YYYY")}</span>
              <i className="far fa-calendar-alt" title="Select Date" style={{ marginLeft: 8, color: "#40a0d0" }}></i>
            </div>
          </div>
        </div>
      </h4>

      <div style={{ height: 400, overflow: "auto", marginTop: 20, position: "relative" }}>
        {loading && (
          <div className="spinner" style={{ textAlign: "center", marginTop: 50 }}>Loading...</div>
        )}
        {!loading && <div id="powerRatioChart" style={{ width: "100%", height: "100%" }}></div>}
      </div>
    </div>
  );
};

export default PowerRatioChart;
