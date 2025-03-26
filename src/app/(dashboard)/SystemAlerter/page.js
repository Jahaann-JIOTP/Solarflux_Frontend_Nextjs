"use client";

import dynamic from "next/dynamic";

const StringTable = dynamic(() => import("@/components/AlerterTable"), { ssr: false });

export default function SystemAlerter() {
    return (
        <div className="mt-[0px]">
            <div className="h-[85vh] ml-2 text-white overflow-hidden">
                <StringTable />
            </div>
        </div>
    );
}