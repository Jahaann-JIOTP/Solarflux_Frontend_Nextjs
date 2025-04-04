"use client";

import dynamic from "next/dynamic";

const PowerChart = dynamic(() => import("@/components/power_generation"), { ssr: false });
const PowerRatioChart = dynamic(() => import("@/components/power_ratio"), { ssr: false });
export default function suppression() {
    return (
        <div className="mt-[0px]">
            <div className="ml-2 text-white overflow-hidden">
                <PowerChart />
            </div>
            <div className="ml-2 text-white overflow-hidden">
                <PowerRatioChart />
            </div>
        </div>
    );
}