"use client";

import dynamic from "next/dynamic";

const SingleLineDiagramDetails = dynamic(() => import("@/components/sld_diagram"), { ssr: false });

export default function SingleLineDiagram() {
    return (
        <div className="mt-[0px]">
            <div className="h-[85vh] ml-2 text-white overflow-hidden">
                <SingleLineDiagramDetails />
            </div>
        </div>
    );
}