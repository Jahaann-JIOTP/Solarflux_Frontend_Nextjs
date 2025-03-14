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

          const datasets = [
            {
              label: "Suppression",
              data: response.data.map((entry) => entry.Suppression || 0),
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
            },
          ];

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

      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      // Custom arrow plugin for higher bar values
      const addArrowPlugin = {
        id: "addArrowPlugin",
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          const dataset = data.datasets[0].data;
          const meta = chart.getDatasetMeta(0).data;

          dataset.forEach((value, index) => {
            let compareValue = index === 0 && dataset.length > 1 ? dataset[index + 1] : dataset[index - 1];

            if (compareValue !== null && value > compareValue) {
              const barLeftX = meta[index].x - meta[index].width / 2;
              const barMiddleY = (meta[index].y + chart.scales.y.getPixelForValue(0)) / 2;

              ctx.save();
              ctx.fillStyle = "rgba(255, 99, 132)";
              ctx.textAlign = "center";
              ctx.font = "bold 16px Arial";
              ctx.fillText("⬆", barLeftX - 10, barMiddleY);
              ctx.restore();
            }
          });
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
                color: "white",
                beginAtZero: true,
                callback: (value) =>
                  value >= 1000000 ? `${Math.floor(value / 1000000)}M` : value >= 1000 ? `${Math.floor(value / 1000)}K` : value,
              },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              afterFit: (scale) => {
                scale.paddingTop = 20;
              },
            },
            x: {
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              ticks: { color: "white" },
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
    <div>
      <canvas ref={chartRef} style={{ height: "20vh" }}></canvas>
    </div>
  );
}
