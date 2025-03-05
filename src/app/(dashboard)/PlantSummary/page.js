export default function PlantSummary() {
  return (
    <div className="relative h-full w-full flex flex-col text-white">
      {/* Main Section Grid Layout */}
      <div className="grid grid-cols-3 gap-6 mt-[-20px]">
        {/* Left Column */}
        <div className="flex flex-col z-10">
          <ChartCard title="ENERGY SPLIT" />
          <ChartCard title="CHANGE IN PRODUCTION" />
          <ChartCard title="CHANGE IN SUPPRESSION" />
        </div>

        {/* Center Column - Pakistan Map */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 flex justify-center items-center">
            <img src="/pakistanbg.png" alt="Pakistan Map" className="w-full object-cover scale-230" />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col z-10">
          <ChartCard title="CONSUMPTION COMPARISON" />
          <ChartCard title="COST AND CONSUMPTION" />
          <ChartCard title="SUSTAINABILITY GOALS" />
        </div>
      </div>

      {/* Bottom Section (Solar & Other Sources) */}
      <div className="flex justify-center mt-[-80px] space-x-20 z-10">
        <div className="text-center">
          <p className="custom-header">SOLAR</p>
          <p className="text-2xl font-digital mt-3">0 KW</p>
        </div>
        <div className="text-center">
          <p className="custom-header">OTHER SOURCES</p>
          <p className="text-2xl font-digital mt-3">0 KW</p>
        </div>
      </div>
    </div>
  );
}

// Reusable Chart Card Component
function ChartCard({ title }) {
  return (
    <div className="py-2 px-4 mb-2 rounded-xl shadow-lg">
      <h3 className="custom-header">{title}</h3>
      <div className="chart-container1">
        <p className="text-gray-400">Chart Placeholder</p>
      </div>
    </div>
  );
}
