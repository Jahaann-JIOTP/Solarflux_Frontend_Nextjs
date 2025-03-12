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
        const response = await axios.post(`${config.BASE_URL}get_dash_cost_data`, { option });
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
        id: 'addArrowPlugin',
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          const dataset = data.datasets[0].data;
          const meta = chart.getDatasetMeta(0).data;

          dataset.forEach((value, index) => {
            let compareValue = index === 0 ? dataset[index + 1] : dataset[index - 1];
            if (compareValue !== undefined && value > compareValue) {
              const barLeftX = meta[index].x - meta[index].width / 2;
              const barMiddleY = (meta[index].y + chart.scales.y.getPixelForValue(0)) / 2;

              ctx.save();
              ctx.fillStyle = 'rgba(255, 99, 132)';
              ctx.textAlign = 'center';
              ctx.font = 'bold 20px Arial';
              ctx.fillText('\u2B06', barLeftX - 10, barMiddleY);
              ctx.restore();
            }
          });
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
    <div>
      <canvas ref={chartRef} style={{ height: '20vh' }}></canvas>
    </div>
  );
};

export default SolarCostChart;