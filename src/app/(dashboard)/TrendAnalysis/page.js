"use client";

import dynamic from "next/dynamic";

const ChartComponent = dynamic(() => import("@/components/trend_analysis"), { ssr: false });

export default function TrendAnalysis() {
    return (
        <div className="mt-[0px]">
            <div className="h-[85vh] ml-2 text-white overflow-hidden">
                <ChartComponent />
            </div>
        </div>
    );
}