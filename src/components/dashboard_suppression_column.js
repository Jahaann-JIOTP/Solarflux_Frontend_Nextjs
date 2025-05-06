"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
import config from "@/config";

export default function SolarSuppressionChart({ option }) {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const baseUrl = config.BASE_URL;

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let startDate, endDate;
        if (option === 1 || option === 2) {
          endDate = yesterday;
          startDate = new Date(yesterday);
          startDate.setDate(startDate.getDate() - 90);
        } else if (option === 3) {
          endDate = yesterday;
          startDate = new Date(yesterday.getFullYear() - 1, 0, 1); // January 1 of last year
        }

        const response = await axios.post("https://solarfluxapi.nexalyze.com/calculate_dash_suppression", {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          stationCode: "NE=53278269",
          tarrif: 10,
          option,
        });

        if (Array.isArray(response.data)) {
          const labels = response.data.map((entry) =>
            option === 1 ? entry.Date : option === 2 ? entry.Month : entry.Year
          );

          const suppressionValues = response.data.map((entry) => entry.Suppression || 0);
          
          // Find the index of the highest date, month, or year
          const highestIndex = suppressionValues.length - 1;

          const datasets = [
            {
              label: "Suppression",
              data: suppressionValues,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
            },
          ];

          createChart(labels, datasets, highestIndex);
        } else {
          console.error("Invalid chart data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching solar cost chart data:", error);
      }
    };

    const createChart = (labels, datasets, highestIndex) => {
      if (!chartRef.current) return;

      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      // Custom arrow plugin for the highest date, month, or year
      const addArrowPlugin = {
        id: "addArrowPlugin",
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          const dataset = data.datasets[0].data;
          const meta = chart.getDatasetMeta(0).data;
      
          if (dataset.length === 0 || highestIndex < 0) return;
      
          // Get the highest column value
          const highestValue = dataset[highestIndex];
      
          // Find the max value in the dataset excluding the highestIndex column
          const maxOtherValue = Math.max(...dataset.filter((_, index) => index !== highestIndex));
      
          // Condition to hide the arrow if both values are 0
          if (highestValue === 0 && maxOtherValue === 0) return;
      
          // Determine arrow direction and color
          const isHigher = highestValue > maxOtherValue;
          const arrow = isHigher ? "\u2B06" : "\u2B07"; // ⬆️ (Up) or ⬇️ (Down)
          const color = isHigher ? "rgba(0, 255, 0, 1)" : "rgba(255, 0, 0, 1)"; // Green for up, Red for down
      
          // Positioning the arrow
          const barLeftX = meta[highestIndex].x - meta[highestIndex].width / 2;
          const barMiddleY = (meta[highestIndex].y + chart.scales.y.getPixelForValue(0)) / 2;
      
          ctx.save();
          ctx.fillStyle = color; // Apply color based on condition
          ctx.textAlign = "center";
          ctx.font = "bold 20px Arial";
          ctx.fillText(arrow, barLeftX - 30, barMiddleY);
          ctx.restore();
        },
      };
      
      const newChartInstance = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                color: 'white',
                beginAtZero: true,
                callback: (value) => {
                  if (value >= 1000000) return `${Math.floor(value / 1000000)}M`;
                  if (value >= 1000) return `${Math.floor(value / 1000)}K`;
                  return value;
                },
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              afterDataLimits: (scale) => {
                scale.max *= 1.21; // Increase Y-axis max by 1%
              },
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'white',
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  return value >= 1000000 ? `${Math.floor(value / 1000000)}M` : value >= 1000 ? `${Math.floor(value / 1000)}K` : `${value} KW`;
                },
              },
            },
            datalabels: {
              display: true,
              color: "white",
              anchor: "end",
              align: "end",
              formatter: (value) => (value >= 1000000 ? `${(value / 1000000).toFixed(2)}M` : value >= 1000 ? `${(value / 1000).toFixed(2)}K` : value.toFixed(2)),
              offset: 0,
            },
          },
        },
        plugins: [ChartDataLabels, addArrowPlugin],
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
    <div style={{ height: "20vh", width: "95%" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
