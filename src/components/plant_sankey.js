"use client";

import { useEffect, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

export default function PlantSankeyChart() {
  const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
  const [dateRange, setDateRange] = useState([
    moment().subtract(29, "days").toDate(),
    moment().subtract(1, "days").toDate(),
  ]);

  useEffect(() => {
    createChart();
  }, []);

  const fetchSankeyData = async () => {
    const payload = {
      Plant: selectedPlant,
      startDate: moment(dateRange[0]).format("YYYY-MM-DD"),
      endDate: moment(dateRange[1]).format("YYYY-MM-DD"),
    };

    try {
      const response = await fetch(
        "https://solarfluxapi.nexalyze.com/sankey-data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      updateChartData(data);
    } catch (error) {
      console.error("Error fetching Sankey data:", error);
    }
  };

  const updateChartData = (sankeyData) => {
    if (window.chart) {
      window.chart.data = sankeyData.map((item) => ({
        from: item.source.replace("[bold]", ""),
        to: item.target.replace("[bold]", ""),
        value: item.value,
      }));
    }
  };

  const createChart = () => {
    const chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
    chart.logo.disabled = true;
    chart.padding(50, 120, 10, 10);

    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";
    chart.nodeWidth = 10;
    chart.nodePadding = 40;

    const linkTemplate = chart.links.template;
    linkTemplate.colorMode = "gradient";
    linkTemplate.fillOpacity = 0.75;
    linkTemplate.tooltipText = "{fromName} → {toName}: {value} KW";

    const nodeTemplate = chart.nodes.template;
    nodeTemplate.nameLabel.label.text = "{name}";
    nodeTemplate.nameLabel.label.wrap = true;
    nodeTemplate.nameLabel.label.fontSize = 14;
    nodeTemplate.stroke = am4core.color("#fff");
    nodeTemplate.strokeWidth = 2;
    nodeTemplate.nameLabel.label.fill = am4core.color("#ffffff");
    nodeTemplate.tooltipText = "{name}";

    window.chart = chart;
    fetchSankeyData();
  };

  return (
    <div className="p-2">
      {/* Controls */}
      <div className="flex justify-end space-x-4 mb-4 items-center">
        {/* Plant Selection */}
        <div className="flex items-center space-x-2">
          <label className="text-white">Plant:</label>
          <select
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[250px] text-[14px]"
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
          >
            <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
          </select>
        </div>

        {/* Datepicker */}
        <div className="flex items-center space-x-2">
          <label className="text-white">Interval:</label>
          <div className="text-[14px] relative inline-flex min-w-[180px]">
            <DatePicker
              selected={dateRange[0]}
              onChange={(dates) => dates && setDateRange(dates)}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              selectsRange
              dateFormat="MMMM d, yyyy"
              className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[270px] text-white pr-8"
            />
            <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>

        {/* Generate Button */}
        <button
          className="px-4 py-1 rounded-md bg-red-500 text-white h-[32px]"
          onClick={fetchSankeyData}
        >
          Generate
        </button>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[70vh] pt-[50px] mt-[20px] overflow-hidden bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
        <div id="chartdiv" className="w-full h-[90%]"></div>
      </div>
    </div>
  );
}
