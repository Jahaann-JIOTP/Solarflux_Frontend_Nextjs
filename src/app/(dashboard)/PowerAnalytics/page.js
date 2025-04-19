'use client';

import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import config from "@/config";

import DemandAndCost from "@/components/DemandandCost";
import ActivePowerOptions from "@/components/ActivePowerOptions";
import ActivePowerConsumption from "@/components/ActivePowerConsumption";
import ActivePowerWeekdays from "@/components/ActivePowerWeekdays";

export default function PowerAnalytics() {
  const baseUrl = config.BASE_URL;

  const [plants] = useState([{ value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" }]);
  const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");

  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date(new Date().setDate(new Date().getDate() - 25)),
  ]);

  const [chartParams, setChartParams] = useState({
    plant: selectedPlant,
    start_date: dateRange[0],
    end_date: dateRange[1],
  });

  const handleGenerate = () => {
    setChartParams({
      plant: selectedPlant,
      start_date: dateRange[0],
      end_date: dateRange[1],
    });
  };

  return (
        <div className="mr-[-10px]">
            {/* 🔹 Dropdown & Date Range */}
            <div className="flex justify-end space-x-4 items-center rounded-lg mr-[15px]">
        {/* Plant Dropdown */}
                <div className="flex items-center space-x-2">
                    <label>Plant:</label>
          <select
                        className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
          >
            {plants.map((plant) => (
              <option key={plant.value} value={plant.value}>{plant.label}</option>
            ))}
          </select>
        </div>

        {/* Date Range Picker */}
                <div className="flex items-center space-x-2">
          <label className="text-white">Interval:</label>
                    <div className="text-[14px] relative inline-flex min-w-[180px]">
            <DatePicker
              selected={dateRange[0]}
              onChange={(dates) => dates && setDateRange(dates)}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              selectsRange
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
            />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>

        {/* Generate Button */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm"
          onClick={handleGenerate}
        >
          Generate
        </button>
      </div>

            {/* 🔹 Chart Section */}
            <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
          <DemandAndCost
            selectedOptionplant1={chartParams.plant}
            customFromDate={chartParams.start_date}
            customToDate={chartParams.end_date}
          />
          <ActivePowerConsumption
            selectedOptionplant1={chartParams.plant}
            customFromDate={chartParams.start_date}
            customToDate={chartParams.end_date}
          />
          <ActivePowerOptions
            selectedOptionplant1={chartParams.plant}
            customFromDate={chartParams.start_date}
            customToDate={chartParams.end_date}
          />
          
          <ActivePowerWeekdays
            selectedOptionplant1={chartParams.plant}
            customFromDate={chartParams.start_date}
            customToDate={chartParams.end_date}
          />
      </div>
    </div>
  );
}
