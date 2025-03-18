"use client";

import InverterSankeyChart from "@/components/InverterSankeyChart";

export default function InverterLevel() {
    return (
        <div className="mt-[10px]">
            <div className="h-[85vh] ml-2 text-white overflow-hidden">
                <InverterSankeyChart />
            </div>
        </div>
    );
}
