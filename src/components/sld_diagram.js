"use client";
import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "orgchart/dist/css/jquery.orgchart.css";
import "orgchart";
import config from '@/config';
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

const SingleLineDiagramDetails = () => {
  const chartContainer = useRef(null);
  const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
  const [selectedVariable, setSelectedVariable] = useState("power");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(moment().subtract(1, "days").toDate());

  useEffect(() => {
    fetchChartData();
  }, [selectedPlant, selectedVariable, dateRange]);  // ✅ Include selectedVariable


  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    // ✅ Clear chart when new data is being fetched
    if (chartContainer.current) {
      $(chartContainer.current).empty();
    }

    try {
      const response = await fetch(`${config.BASE_URL}sld/org`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plant: selectedPlant,
          option: selectedVariable,
          targetDate: dateRange,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setChartData(result.data[0]); // Assume first item is root node
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
    if (chartData && chartContainer.current) {
      // 🔹 FIX: Clear previous chart before initializing a new one
      $(chartContainer.current).empty();

      $(chartContainer.current).orgchart({
        pan: true,
        data: chartData,
        nodeContent: "title",
        visibleLevel: 2,
        createNode: function ($node, data) {
          const imagePath = data.image.startsWith("/")
            ? data.image
            : `/assets/images/${data.image}`;

          const imageElement = $(`
            <div class='node-image'>
              <img src='${imagePath}' alt='Node Image' />
            </div>
          `);
          $node.prepend(imageElement);

          $node.on("click", function () {
            $(".orgchart .node").removeClass("selected");
            $node.addClass("selected");
          });
        },
        toggleSiblingsResp: true,
        collapsible: true,
      });
    }
  }, [chartData]);

  return (
    <div className="p-2">
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
        <div className="flex items-center space-x-2">
          <label className="text-white">Parameter:</label>
          <select
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[250px] text-[14px]"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
          >
            <option value="power">Power</option>
            <option value="current">Current</option>
            <option value="voltage">Voltage</option>
          </select>
        </div>
        {/* Datepicker (Single Date Selection) */}
        <div className="flex items-center space-x-2">
          <label className="text-white">Date:</label>
          <div className="text-[14px] relative inline-flex min-w-[180px]">
            <DatePicker
              selected={dateRange}
              onChange={(date) => setDateRange(date)}
              dateFormat="MMMM d, yyyy"
              className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[250px] text-white pr-8"
            />
            <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>

      </div>

      <div
        id="main-section"
        className="w-full h-[75vh] pt-[10px] mt-[20px] !overflow-auto bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]"
      >
        {loading ? (
          // ✅ Center the loader inside the full height of main-section
          <div className="flex justify-center items-center h-full w-full">
            <div className="loader"></div>
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : chartData ? (
          // ✅ Ensure chart only appears when chartData is available
          <div id="chart-container" ref={chartContainer} className="w-full h-auto mt-[30px]"></div>
        ) : (
          <p className="text-white">No data available</p>
        )}
      </div>



    </div>
  );
};

export default SingleLineDiagramDetails;
