"use client";

import PlantSankeyChart from "@/components/plant_sankey";

export default function PlantAnalysis() {
    return (
        <div className="mt-[0px]">
            <div className="h-[85vh] ml-2 text-white overflow-hidden" id="main-section">
                <PlantSankeyChart />
            </div>
        </div>
    );
}
