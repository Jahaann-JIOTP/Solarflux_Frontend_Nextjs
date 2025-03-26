"use client";

import dynamic from "next/dynamic";

const ClusterCharts = dynamic(() => import("@/components/cluster_mapping"), { ssr: false });

export default function StringClustering11() {
    return (
        <div className="mt-[0px]">
            <div className="h-[85vh] ml-2 text-white overflow-hidden">
                <ClusterCharts />
            </div>
        </div>
    );
}