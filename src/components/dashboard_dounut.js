"use client";

import React, { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import config from '@/config';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ option }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchDataAndRenderChart = async () => {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let startDate, endDate;

        if (option === 1 || option === 2) {
          // Option 1 & 2: Last 90 days
          endDate = yesterday.toISOString().split('T')[0];
          const startDateObj = new Date(yesterday);
          startDateObj.setDate(startDateObj.getDate() - 90);
          startDate = startDateObj.toISOString().split('T')[0];
        } else if (option === 3) {
          // Option 3: From the start of last year
          endDate = yesterday.toISOString().split('T')[0];
          const startDateObj = new Date(yesterday.getFullYear() - 1, 0, 1); // January 1 of last year
          startDate = startDateObj.toISOString().split('T')[0];
        }

        // Fetch suppression data
        const suppressionResponse = await axios.post("https://solarfluxapi.nexalyze.com/calculate_dash_suppression",
          {
            start_date: startDate,
            end_date: endDate,
            stationCode: 'NE=53278269', // Replace with dynamic stationCode if necessary
            tarrif: 10, // Replace with dynamic tarrif if necessary
            option: option,
          }
        );

        // Fetch kw data
        const statResponse = await axios.post(`${config.BASE_URL}dashboard/get_dash_stat_data`, { option });
        const kw = statResponse.data.kw || 0; // Use kw from API response
        let suppressionValue = 0;

        if (option === 1) {
          // For Option 1: Yesterday's value
          suppressionValue = suppressionResponse.data[1]?.Suppression || 0;
        } else if (option === 2) {
          // Get current month in 'YYYY-MM' format
          const currentMonth = yesterday.toISOString().slice(0, 7);

          // For Option 2: Current month's value
          suppressionValue =
            suppressionResponse.data.find((item) =>
              item.Month.startsWith(currentMonth)
            )?.Suppression || 0;
        } else if (option === 3) {
          // For Option 3: Current year's value
          suppressionValue =
            suppressionResponse.data.find(
              (item) => item.Year === yesterday.getFullYear()
            )?.Suppression || 0;
        }

        // Calculate remaining value using kw
        const remainingValue = kw - suppressionValue;

        if (chartRef.current) {
          chartRef.current.data.datasets[0].data = [
            suppressionValue,
            remainingValue > 0 ? remainingValue : 0,
          ];
          chartRef.current.update();
        }
      } catch (error) {
        console.error('Error fetching data for DonutChart:', error);
      }
    };

    fetchDataAndRenderChart();
  }, [option]);

  const data = {
    labels: ['Suppression', 'Remaining'],
    datasets: [
      {
        label: 'Suppression Data',
        data: [0, 0], // Initial data; will be updated
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)', // Suppression
          'rgba(75, 192, 192, 0.2)', // Remaining
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)', // Suppression
          'rgba(75, 192, 192, 1)', // Remaining
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display:true,
        position: 'top',
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.chart.data.datasets[0];
            const value = dataset.data[tooltipItem.dataIndex];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(0);
            return `${percentage}%`;
          },
        },
        displayColors: false,
      },
    },
  };

  return (
    <div style={{ height: '18vh' }}>
      <Doughnut data={data} options={options} ref={chartRef} />
    </div>
  );
};

export default DonutChart;
