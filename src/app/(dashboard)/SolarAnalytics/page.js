"use client";

import ProductionLayeredColumn from "@/components/heat_map";

export default function PlantAnalysis() {
    return (
        <div className="grid grid-cols-2 gap-2 mt-[0px] text-white">
            <div className="h-[45vh] w-full ml-[5px] overflow-hidden">
                <ProductionLayeredColumn />
            </div>
            <div className="h-[45vh] w-full ml-2 overflow-hidden">
                {/* this is the for just for reperesenation it will change with actual component */}
                <ProductionLayeredColumn /> 
            </div>
            <div className="h-[45vh] w-full mt-[-15px] ml-2 overflow-hidden">
                {/* this is the for just for reperesenation it will change with actual component */}
                <ProductionLayeredColumn />
            </div>
            <div className="h-[45vh] w-full mt-[-15px] ml-2 overflow-hidden">
                {/* this is the for just for reperesenation it will change with actual component */}
                <ProductionLayeredColumn />
            </div>
        </div>
    );
}
