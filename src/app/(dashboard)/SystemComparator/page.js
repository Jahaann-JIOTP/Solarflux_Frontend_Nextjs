"use client";

import dynamic from "next/dynamic";

const ChartComponent = dynamic(() => import("@/components/IntraSystemComparator"), { ssr: false });
const InterSystemComparison = dynamic(() => import("@/components/InterSystemComparator"), { ssr: false });

export default function IntraSystem() {
    return (
        <div className="mt-[0px]">
            <div className="ml-2 text-white overflow-hidden">
                <ChartComponent />
            </div>
            <div className="ml-2 text-white overflow-hidden">
                <InterSystemComparison />
            </div>
        </div>
    );
}