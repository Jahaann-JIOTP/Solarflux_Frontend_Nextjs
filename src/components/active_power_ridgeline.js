'use client';

import { useEffect, useState } from 'react';
import config from '@/config';
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import Exporting from "highcharts/modules/exporting";

// Initialize the modules
HighchartsMore(Highcharts);
Exporting(Highcharts);

export default function ActivePowerRidgeline() {
  const [discipline, setDiscipline] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jstat/1.9.0/jstat.min.js'),
      loadScript('https://marketing-demo.s3-eu-west-1.amazonaws.com/densityFunction/processDensity.js'),
    ])
      .then(fetchAPIData)
      .catch((err) => console.error('Script loading failed:', err));
  }, []);

  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const fetchAPIData = async () => {
    try {
      const payload = {
        start_date: '2024-11-01',
        end_date: '2024-12-07',
        plant: 'Coca Cola Faisalabad',
      };

      const response = await fetch(`${config.BASE_URL}ridge_line_chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      const rawData = data.data.filter((item) => item.weight > 0);
      const uniqueDisciplines = [...new Set(rawData.map((item) => item.sport))];

      setDiscipline(uniqueDisciplines);
      setChartData(rawData);

      drawChart(rawData, uniqueDisciplines);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  const drawChart = (rawData, disciplines) => {
    const dataArray = disciplines.map((_, i) =>
      rawData.filter((e) => e.sport === disciplines[i]).map((e) => e.weight)
    );

    const step = 1;
    const precision = 0.00000000001;
    const width = 15;

    if (typeof processDensity !== 'undefined') {
      const data = processDensity(step, precision, width, ...dataArray);
      const xi = data.xiData;

      const baseColors = [
        'rgba(8, 143, 143, 0.6)',
        'rgba(0, 71, 171, 0.2)',
        'rgba(72, 130, 196, 0.6)',
        'rgba(159, 226, 191, 0.6)',
        'rgba(64, 181, 173, 0.6)',
        'rgba(115, 147, 179, 0.6)',
        'rgba(100, 149, 237, 0.6)',
      ];
      const lineColors = [
        '#088F8F',
        '#89CFF0',
        '#CCCCFF',
        '#9FE2BF',
        '#40B5AD',
        '#7393B3',
        '#6495ED',
      ];

      const series = data.results.map((e, i) => ({
        data: e,
        name: disciplines[i],
        zIndex: data.results.length - i,
        fillColor: baseColors[i % baseColors.length],
        color: lineColors[i % lineColors.length],
        lineWidth: 2,
      }));

      Highcharts.chart('ridgelineContainer', {
        chart: {
          type: 'areasplinerange',
          backgroundColor: null,
          height: 270,
        },
        title: { text: null },
        credits: { enabled: false },
        xAxis: {
          labels: {
            format: '{value}',
            style: { fontSize: '12px', color: 'white' },
          },
          min: xi[0],
          max: xi[xi.length - 1],
          gridLineWidth: 0,
        },
        yAxis: {
          title: { text: null },
          categories: [
            'Monday', '', 'Tuesday', '', 'Wednesday', '', 'Thursday',
            '', 'Friday', '', 'Saturday', '', 'Sunday',
          ],
          labels: {
            style: {
              fontSize: '12px',
              color: 'white',
              lineHeight: '18px',
              textTransform: 'capitalize',
            },
            useHTML: true,
          },
          gridLineWidth: 0,
        },
        tooltip: {
          shared: true,
          useHTML: true,
          crosshairs: true,
          valueDecimals: 3,
          pointFormat: '<b>{series.name}</b>: {point.x} kW<br/>',
        },
        plotOptions: {
          areasplinerange: {
            marker: { enabled: false },
            connectNulls: true,
            animation: false,
          },
        },
        legend: { enabled: false },
        series: series,
      });
    } else {
      console.error('processDensity not defined');
    }
  };

  return (
    <div className="text-white">
      <h4 className="flex justify-between items-center font-semibold text-[1vw] mb-2">
        WEEKDAYS POWER CONSUMPTION (NORMALIZED)
      </h4>
      <div id="ridgelineContainer" className="w-full h-[280px]" />
    </div>
  );
}
