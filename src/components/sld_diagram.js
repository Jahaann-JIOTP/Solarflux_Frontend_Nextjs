"use client";
import { useState, useEffect, useRef } from "react";
import config from "@/config";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import Select from "react-select";
import Head from "next/head";

const parameterOptions = [
  { value: "power", label: "Energy" },
  { value: "current", label: "Current" },
  { value: "voltage", label: "Voltage" },
];

const SingleLineDiagramDetails = () => {
  const chartContainer = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState({
    plant: "Coca Cola Faisalabad",
    date: moment().subtract(40, "days").toDate(),
    option: parameterOptions,
  });

  // Dynamically load jQuery and orgchart scripts in order
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    async function loadScripts() {
      try {
        // Load jQuery first
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");

        // Then load orgchart
        await loadScript("/orgchart/dist/js/jquery.orgchart.js");
      } catch (error) {
        console.error("Error loading scripts", error);
      }
    }

    loadScripts();

    // Optional cleanup if you want to remove scripts on unmount
    return () => {
      const jqScript = document.querySelector('script[src="https://code.jquery.com/jquery-3.6.0.min.js"]');
      if (jqScript) document.body.removeChild(jqScript);

      const orgScript = document.querySelector('script[src="/orgchart/dist/js/jquery.orgchart.js"]');
      if (orgScript) document.body.removeChild(orgScript);
    };
  }, []);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    if (chartContainer.current) {
      // Clear old chart
      if (window.$ && window.$(chartContainer.current)) {
        window.$(chartContainer.current).empty();
      }
    }

    try {
      const response = await fetch(`${config.BASE_URL}sld/org`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plant: formValues.plant,
          option: formValues.option.map((o) => o.value),
          targetDate: moment(formValues.date).format("YYYY-MM-DD"),
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setChartData(result.data[0]);
      } else {
        throw new Error("Failed to fetch chart data");
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Render orgchart only if jQuery and orgchart plugin loaded
    if (
      chartData &&
      chartContainer.current &&
      window.$ &&
      window.$.fn.orgchart
    ) {
      window.$(chartContainer.current).empty();

      window.$(chartContainer.current).orgchart({
        pan: true,
        data: chartData,
        nodeContent: "title",
        visibleLevel: 2,
        createNode: function ($node, data) {
          const imagePath = data.image.startsWith("/")
            ? data.image
            : `/assets/images/${data.image}`;

          const imageElement = window.$(
            `<div class='node-image'><img src='${imagePath}' alt='Node Image' /></div>`
          );
          $node.prepend(imageElement);

          $node.on("click", function () {
            window.$(".orgchart .node").removeClass("selected");
            $node.addClass("selected");
          });
        },
        toggleSiblingsResp: true,
        collapsible: true,
      });
    }
  }, [chartData]);

  return (
    <>
      {/* Include orgchart CSS */}
      <Head>
        <link
          rel="stylesheet"
          href="/orgchart/dist/css/jquery.orgchart.css"
        />
      </Head>

      <div className="p-2">
        <div className="flex flex-wrap justify-end gap-4 mb-8 items-center text-white">
          {/* Plant Dropdown */}
          <div className="flex items-center space-x-2">
            <label>Plant:</label>
            <select
              className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
              value={formValues.plant}
              onChange={(e) =>
                setFormValues({ ...formValues, plant: e.target.value })
              }
            >
              <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
            </select>
          </div>

          {/* React-Select Multi Parameter Dropdown */}
          <div className="flex items-center space-x-2 min-w-[350px]">
            <label>Parameters:</label>
            <Select
              isMulti
              options={parameterOptions}
              value={formValues.option}
              onChange={(selected) =>
                setFormValues({ ...formValues, option: selected })
              }
              className="w-[350px] text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#0D2D42",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  minHeight: "32px",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#3498db",
                  color: "white",
                  borderRadius: "6px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "white",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "white",
                  ":hover": {
                    backgroundColor: "#2c80b4",
                    color: "white",
                  },
                }),
              }}
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center space-x-2">
            <label>Date:</label>
            <div className="text-[14px] relative inline-flex min-w-[180px]">
              <DatePicker
                selected={formValues.date}
                onChange={(date) => setFormValues({ ...formValues, date })}
                className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                dateFormat="dd-MM-yyyy"
              />
              <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={fetchChartData}
            className={`px-4 py-1 rounded ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
            }`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>

        {/* Chart Area */}
        <div
          id="main-section"
          className="w-full h-[75vh] pt-[10px] mt-[20px] overflow-auto bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
        >
          {loading && (
            <div className="flex justify-center items-center h-full w-full">
              <div className="loader"></div>
            </div>
          )}
          <div
            id="chart-container"
            ref={chartContainer}
            className="w-full h-auto mt-[30px]"
          ></div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default SingleLineDiagramDetails;
