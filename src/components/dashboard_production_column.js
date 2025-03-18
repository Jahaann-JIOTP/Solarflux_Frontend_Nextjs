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
        const response = await axios.post(`${baseUrl}dashboard/get_dash_column_data`, { option });
        const { labels, datasets } = response.data;

        if (labels && datasets) {
          createChart(labels, datasets);
        } else {
          console.error("Invalid chart data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching solar production chart data:", error);
      }
    };

    const createChart = (labels, datasets) => {
      if (!chartRef.current) return;

      // Select specific data points: first 2, middle 1, last 2
      const middleIndex = Math.floor(labels.length / 2);
      const selectedIndexes = [0, 1, middleIndex, labels.length - 2, labels.length - 1];

      // Filter labels based on selected indexes
      const trimmedLabels = selectedIndexes.map(index => labels[index]);

      // Filter datasets based on selected indexes
      const trimmedBarDatasets = datasets
        .filter(dataset => dataset.type === "bar")
        .map(dataset => ({
          ...dataset,
          data: selectedIndexes.map(index => dataset.data[index]), // Keep only selected values
          borderWidth: 2,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        }));

      const trimmedLineDatasets = datasets
        .filter(dataset => dataset.type === "bar")
        .map(dataset => ({
          label: `${dataset.label} (x60)`, 
          data: selectedIndexes.map(index => 
            dataset.data[index] !== undefined && dataset.data[index] !== null ? dataset.data[index] * 60 : 0
          ), // Keep only selected values and multiply by 60
          type: "line",
          borderColor: "rgba(255, 99, 132, 1)", // Red color for the line
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          tension: 0, // Fix: Avoid control point error
          yAxisID: "y2", // Use secondary Y-axis
        }));

      if (chartInstance) {
        chartInstance.destroy();
      }

      const newChartInstance = new Chart(chartRef.current, {
        type: "bar",
        data: { labels: trimmedLabels, datasets: [...trimmedBarDatasets, ...trimmedLineDatasets] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "white",
                callback: (value) =>
                  value >= 1000000 ? `${value / 1000000}M` :
                  value >= 1000 ? `${value / 1000}K` :
                  value,
              },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              title: { display: true, text: "Power (KW)", color: "white", font: { size: 12 } },
            },
            y2: {
              beginAtZero: true,
              position: "right",
              grid: { drawOnChartArea: false },
              ticks: {
                color: "white",
                callback: (value) =>
                  value >= 1000000 ? `${value / 1000000}M` :
                  value >= 1000 ? `${value / 1000}K` :
                  value,
              },
              title: { display: true, text: "Power (KW x 60)", color: "white", font: { size: 12 } },
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
                  return rawValue >= 1000000 ? `${Math.round(rawValue / 1000000)}M` :
                         rawValue >= 1000 ? `${Math.round(rawValue / 1000)}K` :
                         rawValue.toString();
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
  }, [option]);

  return (
    <div style={{ height: "20vh",width:"100%" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
