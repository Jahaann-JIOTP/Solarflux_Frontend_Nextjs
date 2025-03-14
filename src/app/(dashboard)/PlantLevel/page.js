"use client";

import PlantSankeyChart from "@/components/plant_sankey";

export default function PlantAnalysis() {
    return (
        <div className="mt-[10px]">
            <div className="h-[85vh] ml-2 text-white overflow-auto" id="main-section">
                <PlantSankeyChart />
            </div>
        </div>
    );
}
