"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import config from "@/config";

export default function EnergyChart({ option }) {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const baseUrl = config.BASE_URL;

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.post(`${baseUrl}dashboard/get_dash_data`, { option });

        const { labels, datasets } = response.data;
        if (labels && datasets) {
          createChart(labels, datasets);
        } else {
          console.error("Invalid chart data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching energy chart data:", error);
      }
    };

    const createChart = (labels, datasets) => {
      if (!chartRef.current) return;

      // Function to select 5 data points (Start, Midpoints, End)
      const selectDataPoints = (arr) => {
        const n = arr.length;
        if (n <= 5) return arr; // Return all if <=5

        const indices = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1];
        return indices.map((i) => arr[i]);
      };

      // Reduce dataset
      const reducedLabels = selectDataPoints(labels);
      const reducedDatasets = datasets.map((dataset) => ({
        ...dataset,
        data: selectDataPoints(dataset.data),
      }));

      // Destroy old chart before creating new one
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Create new chart
      const newChartInstance = new Chart(chartRef.current, {
        type: "line",
        data: { labels: reducedLabels, datasets: reducedDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              ticks: { color: "white" },
            },
            y: {
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              ticks: {
                color: "white",
                callback: (value) => {
                  const roundedValue = Math.floor(value);
                  if (roundedValue >= 1000000) return `${Math.floor(roundedValue / 1000000)}M`;
                  if (roundedValue >= 1000) return `${Math.floor(roundedValue / 1000)}K`;
                  return roundedValue.toString();
                },
              },
            },
          },
          plugins: {
            legend: { labels: { color: "white" } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let value = Math.floor(context.raw);
                  if (value >= 1000000) return `${Math.floor(value / 1000000)}M`;
                  if (value >= 1000) return `${Math.floor(value / 1000)}K`;
                  return value.toString();
                },
              },
            },
          },
        },
      });

      setChartInstance(newChartInstance);
    };

    fetchChartData();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [option]); // Re-run effect when `option` changes

  return (
    <div style={{ height: "20vh" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
