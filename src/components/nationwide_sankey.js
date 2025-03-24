"use client";
import { useEffect, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import config from "@/config";
export default function NationWide() {
  const [selectedOption2, setSelectedOption2] = useState(2);
  const [selectedOption3, setSelectedOption3] = useState(3);
  const baseUrl = config.BASE_URL;
  const [loading, setLoading] = useState(false);
  const [dropdown3Options, setDropdown3Options] = useState([
    { value: 3, label: "City" },
    { value: 5, label: "Plant" },
  ]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(29, "days").toDate(),
    moment().subtract(1, "days").toDate(),
  ]);

  useEffect(() => {
    createChart();
  }, []);

  const updateThirdDropdown = (value) => {
    setSelectedOption2(value);

    let newOptions = [];
    if (value === 2) {
      newOptions = [
        { value: 3, label: "City" },
        { value: 5, label: "Plant" },
      ];
    } else if (value === 3) {
      newOptions = [{ value: 5, label: "Plant" }];
    }

    setDropdown3Options(newOptions);

    // Ensure selectedOption3 updates correctly with the new options
    setSelectedOption3(newOptions.length > 0 ? newOptions[0].value : "");
  };

  const fetchSankeyData = async () => {
    setLoading(true);
    const payload = {
      options: [1, selectedOption2, selectedOption3].filter((o) => o),
      start_date: moment(dateRange[0]).format("YYYY-MM-DD"),
      end_date: moment(dateRange[1]).format("YYYY-MM-DD"),
    };

    try {
      const response = await fetch(`${baseUrl}production/sankey`, {
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
    finally {
      setLoading(false); // Hide loader after data fetch
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
    chart.padding(50, 150, 10, 10);

    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";
    chart.nodeWidth = 10;
    chart.nodePadding = 70;

    const linkTemplate = chart.links.template;
    linkTemplate.colorMode = "gradient";
    linkTemplate.fillOpacity = 0.75;
    linkTemplate.tooltipText = "{fromName} → {toName}: {value} KW";

    const nodeTemplate = chart.nodes.template;
    nodeTemplate.nameLabel.label.text = "{name}";
    nodeTemplate.nameLabel.label.wrap = true;
    nodeTemplate.nameLabel.label.maxWidth = 750;
    nodeTemplate.nameLabel.label.fontSize = 14;
    nodeTemplate.nameLabel.label.fill = am4core.color("#ffffff");
    nodeTemplate.inert = true;
    nodeTemplate.stroke = am4core.color("#fff");
    nodeTemplate.strokeWidth = 2;
    nodeTemplate.tooltipText = "{name}";
    nodeTemplate.adapter.add("fill", (fill, target) =>
      target.dataItem.dataContext.nodeColor
        ? am4core.color(target.dataItem.dataContext.nodeColor)
        : fill
    );

    nodeTemplate.cornerRadiusTopLeft = 5;
    nodeTemplate.cornerRadiusTopRight = 5;
    nodeTemplate.cornerRadiusBottomLeft = 5;
    nodeTemplate.cornerRadiusBottomRight = 5;
    window.chart = chart;
    fetchSankeyData();
    addControls();
  };
  const addControls = () => {
    const controlsWrapper = document.getElementById("exportoptionsankeycountry");
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
        () => { if (chartRef.current) chartRef.current.exporting.export("png"); },
        "Export as PNG"
    );

    // Export as XLSX
    createButton(
        `<path d="M4 3h12l5 5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
         <path d="M14 3v5h5M9 17l-3-3m0 0 3-3m-3 3h6" />`,
        () => { if (chartRef.current) chartRef.current.exporting.export("xlsx"); },
        "Export as XLSX"
    );

    // Fullscreen Mode
    createButton(
        `<path d="M4 14h4v4m6 0h4v-4m-10-4H4V6m10 0h4v4" />`,
        () => {
            const chartElement = document.getElementById("chartdiv");
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
      {/* Dropdown Controls */}
      <div className="flex justify-end space-x-4 mb-4 items-center">
        {/* Tier 1 Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-white">Tier 1:</label>
          <select
            className="px-2 py-1 rounded-md text-[14px] bg-[#0D2D42]  h-[32px] text-white w-[200px]"
            value={selectedOption2}
            onChange={(e) => updateThirdDropdown(Number(e.target.value))}
          >
            <option value={2}>Province</option>
            <option value={3}>City</option>
          </select>
        </div>

        {/* Tier 2 Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-white">Tier 2:</label>
          <select
            className="px-2 py-1 rounded-md bg-[#0D2D42] text-[14px]  h-[32px] text-white w-[200px]"
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
              
              className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
            />
            <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>

        {/* Generate Button */}
        <button
          className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
          } text-white transition`}
          onClick={fetchSankeyData} // ✅ Call API on button click
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </div>

      {/* Chart Container */}
      <div
        id="main-section"
        className="w-full h-[77vh] pt-[10px] mt-[25px] !overflow-hidden bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
      >
        {loading && (
          <div className="flex justify-center items-center h-full w-full">
          <div className="loader"></div>
        </div>
        )}
        <div id="exportoptionsankeycountry" className={`${loading ? "hidden" : ""}`} style={{ textAlign: "right", marginBottom: "-10px", marginRight: "10px", marginTop: "20px", zIndex: 999 }}></div>
        <div id="chartdiv" className={`w-full h-[40vh] mt-[100px] ${loading ? "hidden" : ""}`}></div>
      </div>
    </div>
  );
}
