"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/config";

export default function SolarSources({ option }) {
  const [solarData, setSolarData] = useState(0);
  const [otherSources, setOtherSources] = useState(0);
  const [pvSufficiency, setPvSufficiency] = useState(0); // New state for PV Sufficiency

  useEffect(() => {
    let isMounted = true;

    async function fetchSolarData() {
      try {
        const response = await axios.post(`${config.BASE_URL}dashboard/get_dash_stat_data`, { option });
        if (isMounted) {
          setSolarData(response.data.kw ?? 0);
        }
      } catch (error) {
        console.error("Error fetching solar data:", error);
      }
    }

    async function fetchOtherSourcesData() {
      try {
        const response = await axios.post(`${config.BASE_URL}dashboard/get_dash_active_stat_data`, { option });
        const data = response.data;
        if (isMounted) {
          const activePowerSum = Object.values(data)[0] ?? 0;
          setOtherSources(activePowerSum);
        }
      } catch (error) {
        console.error("Error fetching other sources data:", error);
      }
    }

    async function fetchPvSufficiencyData() {
      try {
        const response = await axios.post(`${config.BASE_URL}dashboard/get_dash_pv_sufficiency`, { option });
        if (isMounted) {
          setPvSufficiency(response.data.PV_Sufficiency ?? 0);
        }
      } catch (error) {
        console.error("Error fetching PV sufficiency data:", error);
      }
    }

    if (option) {
      fetchSolarData();
      fetchOtherSourcesData();
      fetchPvSufficiencyData();
    }

    return () => {
      isMounted = false;
    };
  }, [option]);

  return (
    <div className="flex flex-col items-center mt-[-12.3vw] space-y-6 z-10">
      {/* First Row */}
      <div className="flex justify-center space-x-20">
        <div className="text-center">
          <p className="custom-header !w-[260px]">PV CONSUMPTION</p>
          <p className="text-2xl font-digital mt-3 !h-[70px]">{solarData} KW</p>
        </div>
        <div className="text-center">
          <p className="custom-header !w-[260px]">NON PV CONSUMPTION</p>
          <p className="text-2xl font-digital mt-3 !h-[70px]">{otherSources} KW</p>
        </div>
      </div>

      {/* Second Row */}
      <div className="flex justify-center space-x-20">
        <div className="text-center">
          <p className="custom-header !w-[260px]">PV SUFFICIENCY</p>
          <p className="text-2xl font-digital mt-3 !h-[70px]">{pvSufficiency.toFixed(2)} %</p>
        </div>
        <div className="text-center">
          <p className="custom-header !w-[260px]">ALLOWED PV CONSUMPTION</p>
          <p className="text-2xl font-digital mt-3 !h-[70px]">100 %</p>
        </div>
      </div>
    </div>
  );
}
