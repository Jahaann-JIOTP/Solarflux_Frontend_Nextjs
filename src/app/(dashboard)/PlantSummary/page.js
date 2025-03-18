"use client";
import dynamic from "next/dynamic";

const EnergyChart = dynamic(() => import("@/components/dashboard_area"), { ssr: false });
import SolarCostChart from "@/components/dashboard_cost_column";
import DonutChart from "@/components/dashboard_dounut";
import SolarProductionChart from "@/components/dashboard_production_column";
import SolarSources from "@/components/dashboard_stats";
import SolarSuppressionChart from "@/components/dashboard_suppression_column";
import Co2Dashboard from "@/components/dashboard_sustainability";
import { useState } from "react";

export default function PlantSummary() {
  const [activeButton, setActiveButton] = useState("last day");

  // Mapping of button values to option numbers
  const optionMap = {
    "last day": 1,
    month: 2,
    year: 3,
  };

  return (
    <div className="relative h-full w-full flex flex-col text-white">
      {/* Main Section Grid Layout */}
      <div className="grid grid-cols-3 gap-36 mt-[-20px]">
        {/* Left Column */}
        <div className="flex flex-col z-10">
          <ChartCard title="ENERGY SPLIT">
            <DonutChart option={optionMap[activeButton]} />
          </ChartCard>
          <ChartCard title="CHANGE IN CONSUMPTION">
            <SolarCostChart option={optionMap[activeButton]} />
          </ChartCard>
          <ChartCard title="CHANGE IN SUPPRESSION">
            <SolarSuppressionChart option={optionMap[activeButton]} />
          </ChartCard>
        </div>

        {/* Center Column - Pakistan Map */}
        <div className="relative flex justify-center items-center">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center py-2 gap-3 z-[9999] ml-5 mt-1">

            {["last day", "month", "year"].map((period) => (
              <button
                key={period}
                id={`${period}Btn`}
                className={`px-5 py-1 mx-2 text-sm rounded-md ${
                  activeButton === period
                    ? "dash-button !bg-[#bf4a63]"
                    : "dash-button"
                }`}
                onClick={() => setActiveButton(period)}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="absolute inset-0 flex justify-center items-center">
            <img
              src="/pakistanbg.png"
              alt="Pakistan Map"
              className="w-full object-cover scale-300"
            />
          </div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col z-10">
          <ChartCard title="CONSUMPTION COMPARISON">
            <EnergyChart option={optionMap[activeButton]} />
          </ChartCard>
           <ChartCard title="COST AND CONSUMPTION">
            <SolarProductionChart option={optionMap[activeButton]} />
          </ChartCard>
          <ChartCard title="SUSTAINABILITY GOALS">
            <Co2Dashboard option={optionMap[activeButton]} />
          </ChartCard>
        </div>
      </div>

      {/* Bottom Section (Solar & Other Sources) */}
        <SolarSources option={optionMap[activeButton]}/>
    </div>
  );
}

// Reusable Chart Card Component
function ChartCard({ title, children }) {
  return (
    <div className="py-2 px-4 mb-2 rounded-xl shadow-lg">
      <h3 className="custom-header">{title}</h3>
      <div className="chart-container1">
        {children ? (
          children
        ) : (
          <p className="text-gray-400">Chart Placeholder</p>
        )}
      </div>
    </div>
  );
}
