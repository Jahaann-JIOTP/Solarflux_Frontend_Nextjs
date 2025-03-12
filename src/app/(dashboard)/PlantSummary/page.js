import EnergyChart from "@/components/dashboard_area";
import SolarCostChart from "@/components/dashboard_cost_column";
import DonutChart from "@/components/dashboard_dounut";
import SolarProductionChart from "@/components/dashboard_production_column";
import SolarSuppressionChart from "@/components/dashboard_suppression_column";
import Co2Dashboard from "@/components/dashboard_sustainability";

export default function PlantSummary({ }) {
  return (
    <div className="relative h-full w-full flex flex-col text-white ">
      {/* Main Section Grid Layout */}
      <div className="grid grid-cols-3 gap-36 mt-[-20px]">
        {/* Left Column */}
        <div className="flex flex-col z-10">
          <ChartCard title="ENERGY SPLIT">
            <DonutChart option={3} />
          </ChartCard>
          <ChartCard title="CHANGE IN CONSUMPTION">
            <SolarCostChart option={3}/>
          </ChartCard>
          <ChartCard title="CHANGE IN SUPPRESSION">
            <SolarSuppressionChart option={3}/>
          </ChartCard>
        </div>

        {/* Center Column - Pakistan Map */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 flex justify-center items-center">
            <img src="/pakistanbg.png" alt="Pakistan Map" className="w-full object-cover scale-300" />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col z-10">
        <ChartCard title="CONSUMPTION COMPARISON">
            <EnergyChart option={3}/>
          </ChartCard>
          <ChartCard title="COST AND CONSUMPTION">
            <SolarProductionChart option={3}/>
          </ChartCard>
          <ChartCard title="SUSTAINABILITY GOALS">
            <Co2Dashboard option={3}/>
          </ChartCard>
        </div>
      </div>

      {/* Bottom Section (Solar & Other Sources) */}
      <div className="flex flex-col items-center mt-[-80px] space-y-6 z-10">
        {/* First Row */}
        <div className="flex justify-center space-x-20">
          <div className="text-center">
            <p className="custom-header !w-[200px]">SOLAR</p>
            <p className="text-2xl font-digital mt-3">0 KW</p>
          </div>
          <div className="text-center">
            <p className="custom-header !w-[200px]">OTHER SOURCES</p>
            <p className="text-2xl font-digital mt-3">0 KW</p>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex justify-center space-x-20">
          <div className="text-center">
            <p className="custom-header !w-[200px]">BATTERY</p>
            <p className="text-2xl font-digital mt-3">0 KW</p>
          </div>
          <div className="text-center">
            <p className="custom-header !w-[200px]">GRID</p>
            <p className="text-2xl font-digital mt-3">0 KW</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Chart Card Component
function ChartCard({ title, children}) {
  return (
    <div className="py-2 px-4 mb-2 rounded-xl shadow-lg">
      <h3 className="custom-header">{title}</h3>
      <div className="chart-container1">
        {children ? children : <p className="text-gray-400">Chart Placeholder</p>}
      </div>
    </div>
  );
}

