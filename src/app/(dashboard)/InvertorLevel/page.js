"use client";

import InverterSankeyChart from "@/components/InverterSankeyChart";

export default function InverterLevel() {
    return (
        <div className="mt-[10px]">
            <div className="h-[80vh] ml-2 text-white overflow-auto" id="main-section">
                <InverterSankeyChart />
            </div>
        </div>
    );
}
