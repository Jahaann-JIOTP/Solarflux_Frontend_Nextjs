"use client";
import { useEffect, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import moment from "moment";

export default function InverterLevel() {
  const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
  const [selectedInverter, setSelectedInverter] = useState("");
  const [inverterOptions, setInverterOptions] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(29, "days").format("YYYY-MM-DD"),
    to: moment().subtract(1, "days").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    fetchInverters(); // Fetch inverters on page load
    createChart(); // Initialize Sankey chart
  }, []);

  const fetchInverters = async () => {
    try {
      const response = await fetch("https://solarfluxapi.nexalyze.com/get-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ station: selectedPlant }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setInverterOptions(data);

      if (data.length > 0) {
        setSelectedInverter(data[0].value); // Auto-select first inverter
      } else {
        setSelectedInverter("");
      }
    } catch (error) {
      console.error("❌ Error fetching inverters:", error);
    }
  };

  const fetchSankeyData = async () => {
    if (!selectedPlant || !selectedInverter || !dateRange.from || !dateRange.to) {
      console.error("🚨 Missing required fields in API request");
      return;
    }

    const payload = {
      Plant: selectedPlant,
      devId: selectedInverter,
      startDate: dateRange.from,
      endDate: dateRange.to,
    };

    console.log("📡 Sending API Request with Payload:", payload);

    try {
      const response = await fetch("https://solarfluxapi.nexalyze.com/sankey-data-mppts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      updateChartData(data);
    } catch (error) {
      console.error("❌ Error fetching Sankey data:", error);
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
    chart.padding(50, 100, 10, 10);

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
    nodeTemplate.nameLabel.label.fill = am4core.color("#ffffff");
    nodeTemplate.tooltipText = "{name}";

    window.chart = chart;
    fetchSankeyData(); // Fetch data after creating the chart
  };

  return (
    <div className="p-6">
      {/* Dropdown Controls */}
      <div className="flex justify-end space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-white">Plant:</label>
          <select
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
          >
            <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white">Inverter:</label>
          <select
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={selectedInverter}
            onChange={(e) => setSelectedInverter(e.target.value)}
          >
            <option value="" disabled>Select Inverter</option>
            {inverterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white">Date:</label>
          <input
            type="date"
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
          <span className="text-white">to</span>
          <input
            type="date"
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>

        <button
          className="px-4 py-2 rounded-md bg-blue-500 text-white"
          onClick={fetchSankeyData}
        >
          Generate
        </button>
      </div>

      {/* Chart Container */}
      <div className="bg-[#0d2d42] p-5 rounded-lg text-center w-full h-[71vh] shadow-[0_0_15px_rgba(0,136,255,0.7),inset_0_10px_15px_rgba(0,0,0,0.6)] overflow-auto">
        <h2 className="text-white text-lg font-bold">Inverter-Level Analysis</h2>
        <div id="chartdiv" className="w-full h-[1000px]"></div>
      </div>
    </div>
  );
}
