"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/config";

export default function Co2Dashboard({ option }) {
    const [actualCo2, setActualCo2] = useState(0);
    const baseUrl = config.BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${baseUrl}dashboard/get_dash_stat_data`, { option });
                setActualCo2(response.data.actualco2 || 0);
            } catch (error) {
                console.error("Error fetching CO₂ data:", error);
            }
        };

        fetchData();
    }, [option]); // Re-fetch data when `option` changes

    return (
        <div

        >
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                {/* Trees Saved */}
                <div className="mr-[30px]">
                    <img
                        src="/tree.png"
                        alt="Tree Icon"
                        style={{ width: "5vw", height: "5vw", marginBottom: "-10px" }}
                    />
                    <p className="font-digital !text-[1.1vw] !text-gray-300 text-center">
                        {Math.round(actualCo2 / 22)} <br />
                        <span className="text-[0.6vw] text-gray-300">Trees</span>
                    </p>
                </div>

                {/* CO2 Emission */}
                <div className="ml-[30px]">
                    <img
                        src="/cloudco2.png"
                        alt="CO₂ Icon"
                        style={{ width: "5vw", height: "5vw", marginBottom: "-10px" }}
                    />
                    <p className="font-digital !text-[1.1vw] !text-gray-300 text-center">
                        {Math.round(actualCo2)} <br />
                        <span className="text-[0.6vw] text-gray-300">kg/CO₂</span>
                    </p>

                </div>
            </div>
        </div>
    );
}
