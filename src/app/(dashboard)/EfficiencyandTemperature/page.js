"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
const InverterTemperatureChart = dynamic(() => import("@/components/solar_temperature"), { ssr: false });
const InverterEfficiencyChart = dynamic(() => import("@/components/solar_efficiency"), { ssr: false });

export default function IntraSystem() {
    // Temporary user inputs
    const [tempPlant, setTempPlant] = useState('Coca Cola Faisalabad');
    const [tempDateRange, setTempDateRange] = useState([
        moment().subtract(40, 'days').toDate(),
        moment().subtract(30, 'days').toDate(),
    ]);

    // Submitted values sent to child chart
    const [submittedPlant, setSubmittedPlant] = useState(null);
    const [submittedDateRange, setSubmittedDateRange] = useState(null);

    // ✅ Send default data on initial load
    useEffect(() => {
        setSubmittedPlant(tempPlant);
        setSubmittedDateRange(tempDateRange);
    }, []);

    return (
        <div className="mt-[0px]">
            {/* Controls */}
            <div className="flex flex-wrap justify-end gap-4 items-center text-white p-4">
                {/* Plant Selection */}
                <div className="flex items-center space-x-2">
                    <label>Plant:</label>
                    <select
                        value={tempPlant}
                        onChange={(e) => setTempPlant(e.target.value)}
                        className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
                    >
                        <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
                        {/* Add more plant options if needed */}
                    </select>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center space-x-2">
                    <label>Interval:</label>
                    <div className="relative inline-flex min-w-[180px]">
                        <DatePicker
                            selected={tempDateRange[0]}
                            onChange={(update) => setTempDateRange(update)}
                            startDate={tempDateRange[0]}
                            endDate={tempDateRange[1]}
                            selectsRange
                            dateFormat="dd-MM-yyyy"
                            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
                        />
                        <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={() => {
                        setSubmittedPlant(tempPlant);
                        setSubmittedDateRange(tempDateRange);
                    }}
                    className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                    Generate
                </button>
            </div>

            {/* Chart Output */}
            <div className="ml-2 text-white overflow-hidden">
                {/* ✅ Only render chart after initial values are set */}
                {submittedPlant && submittedDateRange && (
                    <InverterTemperatureChart
                        selectedPlant={submittedPlant}
                        dateRange={submittedDateRange}
                    />
                )}
            </div>
            <div className="ml-2 text-white overflow-hidden">
                {/* ✅ Only render chart after initial values are set */}
                {submittedPlant && submittedDateRange && (
                    <InverterEfficiencyChart
                        selectedPlant={submittedPlant}
                        dateRange={submittedDateRange}
                    />
                )}
            </div>
        </div>
    );
}
