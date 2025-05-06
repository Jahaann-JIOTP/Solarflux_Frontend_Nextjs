'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import config from '@/config';

const SolarCostChart = ({ option }) => {
  const chartRef = useRef(null);
  let solarCostChart = useRef(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.post(`${config.BASE_URL}dashboard/get_dash_cost_data`, { option });
        let { labels, datasets } = response.data;

        if (labels && datasets) {
          // Convert labels to date objects for sorting
          const labelDatePairs = labels.map((label, index) => ({
            label,
            datasetValues: datasets.map((dataset) => dataset.data[index]),
          }));

          // Sort by date
          labelDatePairs.sort((a, b) => new Date(a.label) - new Date(b.label));

          // Extract sorted labels and dataset values
          labels = labelDatePairs.map((pair) => pair.label);
          datasets.forEach((dataset, datasetIndex) => {
            dataset.data = labelDatePairs.map((pair) => pair.datasetValues[datasetIndex]);
          });

          createChart(labels, datasets);
        } else {
          console.error('Invalid chart data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching solar cost chart data:', error);
      }
    };

    const createChart = (labels, datasets) => {
      if (solarCostChart.current) {
        solarCostChart.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');

      const formattedDatasets = datasets.map((dataset) => ({
        ...dataset,
        type: 'bar',
        borderWidth: 2,
        borderColor: 'rgba(75, 192, 192, 2)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }));
      const addArrowPlugin = {
        id: "addArrowPlugin",
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          
          const dataset = data.datasets[0].data;
          const labels = data.labels;
          const meta = chart.getDatasetMeta(0).data;
      
          if (!dataset.length) return;
      
          // Get today's date
          const today = new Date();
          const currentMonth = today.toLocaleString("default", { month: "short" }); // e.g., "Mar"
          const currentYear = today.getFullYear().toString(); // e.g., "2025"
      
          let targetIndex = null;
      
          if (option === 1) {
            // Option 1: Find the bar with the highest date (latest entry)
            targetIndex = labels.length - 1;
          } else if (option === 2) {
            // Option 2: Find the current month in labels
            targetIndex = labels.findIndex(label => label.includes(currentMonth));
          } else if (option === 3) {
            // Option 3: Find the current year in labels
            targetIndex = labels.findIndex(label => label.includes(currentYear));
          }
      
          if (targetIndex !== null && targetIndex !== -1) {
            const targetValue = dataset[targetIndex];
      
            // Compare with previous value (if it exists)
            const compareIndex = targetIndex > 0 ? targetIndex - 1 : targetIndex + 1;
            const compareValue = dataset[compareIndex] !== undefined ? dataset[compareIndex] : targetValue;
            if (targetValue === 0 && compareValue === 0) return;

            const isHigher = targetValue > compareValue;
            const arrow = isHigher ? "\u2B06" : "\u2B07"; // ⬆️ or ⬇️
            const color = isHigher ? "green" : "red";
      
            // Arrow Positioning (Same as Before)
            const barLeftX = meta[targetIndex].x - meta[targetIndex].width / 2;
            const barMiddleY = (meta[targetIndex].y + chart.scales.y.getPixelForValue(0)) / 2;
      
            ctx.save();
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.font = "bold 20px Arial";
            ctx.fillText(arrow, barLeftX - 30, barMiddleY);
            ctx.restore();
          }
        },
      };
      
      solarCostChart.current = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: formattedDatasets },
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
                  if (value >= 1000000) return `${Math.floor(value / 1000000)}M`;
                  if (value >= 1000) return `${Math.floor(value / 1000)}K`;
                  return `${value} KW`;
                },
              },
            },
            datalabels: {
              display: true,
              color: 'white',
              anchor: 'end',
              align: 'end',
              formatter: (value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
                return value.toFixed(2);
              },
              offset: 0,
            },
          },
        },
        plugins: [ChartDataLabels, addArrowPlugin],
      });
    };

    fetchChartData();
    return () => {
      if (solarCostChart.current) {
        solarCostChart.current.destroy();
      }
    };
  }, [option]);

  return (
    <div style={{ height: "20vh",width:"95%" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SolarCostChart;