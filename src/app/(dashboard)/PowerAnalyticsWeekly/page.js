'use client';

import { useState } from "react";
import Select from "react-select";
import ActivePowerWeekAndDay from "@/components/active_power_weekandday";
import ActivePowerWeekAndHour from "@/components/active_power_weekandhour";
// import ActivePowerRidgeline from "@/components/active_power_ridgeline";

export default function PowerAnalyticsWeekly() {
  const [selectedPlant, setSelectedPlant] = useState({ value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" });
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedWeeks, setSelectedWeeks] = useState([
    { label: "Week 40", value: 40 },
    { label: "Week 41", value: 41 },
    { label: "Week 42", value: 42 },
    { label: "Week 43", value: 43 },
    { label: "Week 44", value: 44 },
    { label: "Week 45", value: 45 },
  ]);

  const plantOptions = [
    { value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" },
    { value: "Coca Cola Lahore", label: "Coca Cola Lahore" },
    { value: "Coca Cola Karachi", label: "Coca Cola Karachi" },
  ];

  const yearOptions = [2022, 2023, 2024];

  const weekOptions = Array.from({ length: 53 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: i + 1,
  }));

  return (
    <div className="w-full">
      {/* 🔹 Filters */}
      <div className="flex flex-wrap items-center justify-end gap-4 text-white rounded-lg shadow-md">
        {/* Plant Dropdown */}
        <div className="flex items-center space-x-2">
          <label>Plant:</label>
          <select
            value={selectedPlant.value}
            onChange={(e) =>
              setSelectedPlant(plantOptions.find((p) => p.value === e.target.value))
            }
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
          >
            {plantOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div className="flex items-center space-x-2">
          <label>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[100px] text-[14px]"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Week Multi-select */}
        <div className="flex items-center space-x-2 min-w-[300px]">
          <label>Weeks:</label>
          <Select
            isMulti
            options={weekOptions}
            value={selectedWeeks}
            onChange={(selected) => setSelectedWeeks(selected)}
            placeholder="Select weeks"
            className="w-[700px] text-sm text-black"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#0D2D42',
                color: 'white',
                borderRadius: '8px',
                border:'none',
                minHeight: '32px',
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#3498db',
                color: 'white',
                borderRadius: '6px',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: 'white',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: 'white',
                ':hover': {
                  backgroundColor: '#2c80b4',
                  color: 'white',
                },
              }),
            }}
          />
        </div>
      </div>

      {/* 🔹 Charts */}
      <div className="">
        <ActivePowerWeekAndDay
          selectedOptionplant1={selectedPlant.value}
          selectedYear={selectedYear}
          selectedWeeks={selectedWeeks.map((w) => w.value)}
        />
        <ActivePowerWeekAndHour
          selectedOptionplant1={selectedPlant.value}
          selectedYear={selectedYear}
          selectedWeeks={selectedWeeks.map((w) => w.value)}
        />
        {/* <div className="col-span-2">
          <ActivePowerRidgeline />
        </div> */}
      </div>
    </div>
  );
}
