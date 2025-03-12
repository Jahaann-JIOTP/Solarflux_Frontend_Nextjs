"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import config from "@/config";

export default function SolarProductionChart({ option }) {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const baseUrl = config.BASE_URL;

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.post(`${baseUrl}get_dash_column_data`, { option });

        const { labels, datasets } = response.data;
        if (labels && datasets) {
          createChart(labels, datasets);
        } else {
          console.error("Invalid chart data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching solar cost chart data:", error);
      }
    };

    const createChart = (labels, datasets) => {
      if (!chartRef.current) return;

      // Select 5 data points (Start, Midpoints, End)
      const selectDataPoints = (arr) => {
        const n = arr.length;
        if (n <= 5) return arr;
        return [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1].map((i) => arr[i]);
      };

      // Reduce dataset
      const reducedLabels = selectDataPoints(labels);
      const reducedDatasets = datasets.map((dataset, index) => ({
        ...dataset,
        data: selectDataPoints(dataset.data),
        type: index === 0 ? "bar" : "line", // First dataset as bar, others as line
        yAxisID: index === 0 ? "left-y-axis" : "right-y-axis",
        borderWidth: 2,
        borderColor: index === 0 ? "rgba(75, 192, 192, 1)" : dataset.borderColor,
        backgroundColor: index === 0 ? "rgba(75, 192, 192, 0.2)" : dataset.backgroundColor,
        fill: index === 0,
        order: index === 0 ? 1 : 0, // Render line dataset on top
      }));

      // Destroy old chart before creating new one
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Create new chart
      const newChartInstance = new Chart(chartRef.current, {
        type: "bar",
        data: { labels: reducedLabels, datasets: reducedDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            "left-y-axis": {
              type: "linear",
              position: "left",
              ticks: {
                color: "white",
                beginAtZero: true,
                callback: (value) => (value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}K` : value),
              },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              title: { display: true, text: "Power (KW)", color: "white", font: { size: 12 } },
            },
            "right-y-axis": {
              type: "linear",
              position: "right",
              ticks: {
                color: "white",
                beginAtZero: true,
                callback: (value) => (value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}K` : value),
              },
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Cost", color: "white", font: { size: 12 } },
            },
            x: {
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              ticks: { color: "white" },
            },
          },
          plugins: {
            legend: { labels: { color: "white" } },
            tooltip: {
              enabled: true,
              callbacks: {
                label: (context) => {
                  const rawValue = Math.round(context.raw);
                  return rawValue >= 1000000 ? `${Math.round(rawValue / 1000000)}M` : rawValue >= 1000 ? `${Math.round(rawValue / 1000)}K` : rawValue.toString();
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
