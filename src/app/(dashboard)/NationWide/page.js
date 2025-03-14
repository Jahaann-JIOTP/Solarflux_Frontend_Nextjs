"use client";

import SankeyChart from "@/components/nationwide_sankey";




export default function SingleLineDiagram() {
    return (
        <div className="mt-[10px]">
            <div
                className="h-[85vh] ml-2 text-white overflow-auto"
                id="main-section"
            >
              <SankeyChart/>
            </div>
        </div>
    );
}
