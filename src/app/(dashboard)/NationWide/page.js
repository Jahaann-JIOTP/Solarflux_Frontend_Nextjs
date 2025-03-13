"use client";
import { useEffect, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import moment from "moment";

export default function NationWide() {
  const [selectedOption2, setSelectedOption2] = useState(2);
  const [selectedOption3, setSelectedOption3] = useState(3);
  const [dropdown3Options, setDropdown3Options] = useState([
    { value: 3, label: "City" },
    { value: 5, label: "Plant" },
  ]);
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(29, "days").format("YYYY-MM-DD"),
    to: moment().subtract(1, "days").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    createChart(); // Create chart on first render
  }, []);

  const updateThirdDropdown = (value) => {
    setSelectedOption2(value);
    if (value === 2) {
      setDropdown3Options([
        { value: 3, label: "City" },
        { value: 5, label: "Plant" },
      ]);
    } else if (value === 3) {
      setDropdown3Options([{ value: 5, label: "Plant" }]);
    } else {
      setDropdown3Options([]);
    }
    setSelectedOption3(dropdown3Options.length ? dropdown3Options[0].value : "");
  };

  const fetchSankeyData = async () => {
    const payload = {
      options: [1, selectedOption2, selectedOption3].filter((o) => o),
      start_date: dateRange.from,
      end_date: dateRange.to,
    };

    try {
      const response = await fetch("https://solarfluxapi.nexalyze.com/sankey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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

    fetchSankeyData(); // Fetch actual data and update chart
  };

  return (
    <div className="p-6">
      {/* Dropdown Controls */}
      <div className="flex justify-end space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-white">Tier 1:</label>
          <select
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={selectedOption2}
            onChange={(e) => updateThirdDropdown(Number(e.target.value))}
          >
            <option value={2}>Province</option>
            <option value={3}>City</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white">Tier 2:</label>
          <select
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={selectedOption3}
            onChange={(e) => setSelectedOption3(Number(e.target.value))}
            disabled={dropdown3Options.length === 0}
          >
            {dropdown3Options.map((option) => (
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
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
          />
          <span className="text-white">&#160;&#160;to</span>
          <input
            type="date"
            className="px-3 py-2 rounded-md bg-[#0d2d42] text-white"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange({ ...dateRange, to: e.target.value })
            }
          />
        </div>

        <button
          className="px-4 py-2 rounded-md bg-blue-500 text-white cursor-pointer"
          onClick={fetchSankeyData}
        >
          Generate
        </button>
      </div>

      {/* Chart Container */}
      <div className="bg-[#0d2d42] p-5 rounded-lg text-center w-full h-[71vh] shadow-[0_0_15px_rgba(0,136,255,0.7),inset_0_10px_15px_rgba(0,0,0,0.6)]">
        <div id="chartdiv" className="w-full h-[90%]"></div>
      </div>
    </div>
  );
}
