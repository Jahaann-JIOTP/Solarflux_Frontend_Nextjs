"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import ProductionLayeredColumn from "@/components/heat_map";

const API_BASE_URL = "http://15.206.128.214:5000";

export default function PlantAnalysis() {
    // 🔹 State for dropdown values
    const [plants] = useState([{ value: "Coca Cola Faisalabad", label: "Coca Cola Faisalabad" }]);
    const [inverters, setInverters] = useState([]);
    const [mppts, setMppts] = useState([]);
    const [strings, setStrings] = useState([]);

    // 🔹 Selected values
    const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
    const [selectedInverter, setSelectedInverter] = useState("");
    const [selectedMppt, setSelectedMppt] = useState("");
    const [selectedString, setSelectedString] = useState("");
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);

    // 🔹 Fetch inverters based on selected plant
    useEffect(() => {
        if (!selectedPlant) return;
        axios.post(`${API_BASE_URL}/production/get-devices`, { station: selectedPlant })
            .then(response => setInverters(response.data))
            .catch(error => console.error("Error fetching inverters:", error));
    }, [selectedPlant]);

    // 🔹 Fetch MPPT based on selected inverter
    useEffect(() => {
        if (!selectedInverter) return;
        axios.post(`${API_BASE_URL}/production/get-mppt`, { devId: selectedInverter })
            .then(response => setMppts(response.data))
            .catch(error => console.error("Error fetching MPPT:", error));
    }, [selectedInverter]);

    // 🔹 Fetch Strings based on selected inverter and MPPT
    useEffect(() => {
        if (!selectedInverter || !selectedMppt) return;
        axios.post(`${API_BASE_URL}/solaranalytics/get-strings`, {
            Plant: selectedPlant,
            devId: selectedInverter,
            mppt: selectedMppt,
        })
            .then(response => setStrings(response.data))
            .catch(error => console.error("Error fetching strings:", error));
    }, [selectedInverter, selectedMppt]);

    // 🔹 Store values for component rendering
    const [chartParams, setChartParams] = useState({
        plant: selectedPlant,
        inverter: selectedInverter,
        mppt: selectedMppt,
        string: selectedString,
        start_date: dateRange[0],
        end_date: dateRange[1],
    });

    // 🔹 Handle Generate Chart Click
    const handleGenerateChart = () => {
        setChartParams({
            plant: selectedPlant,
            inverter: selectedInverter,
            mppt: selectedMppt,
            string: selectedString,
            start_date: dateRange[0],
            end_date: dateRange[1],
        });
    };

    return (
        <div className="mr-[-10px]">
            {/* 🔹 Dropdown Section */}
            <div className="flex justify-end space-x-4 items-center rounded-lg mr-[15px]">
                {/* Plant Dropdown */}
                <div className="flex items-center space-x-2">
                    <label>Plant:</label>
                    <select
                        className="px-2 py-1 rounded-md bg-[#0D2D42] w-[190px]"
                        value={selectedPlant}
                        onChange={(e) => setSelectedPlant(e.target.value)}
                    >
                        {plants.map((plant) => (
                            <option key={plant.value} value={plant.value}>{plant.label}</option>
                        ))}
                    </select>
                </div>

                {/* Inverter Dropdown */}
                <div className="flex items-center space-x-2">
                    <label>Inverter:</label>
                    <select
                        className="px-2 py-1 rounded-md bg-[#0D2D42] w-[190px]"
                        value={selectedInverter}
                        onChange={(e) => setSelectedInverter(e.target.value)}
                    >
                        <option value="">Select</option>
                        {inverters.map((inv) => (
                            <option key={inv.value} value={inv.value}>{inv.label}</option>
                        ))}
                    </select>
                </div>

                {/* MPPT Dropdown */}
                <div className="flex items-center space-x-2">
                    <label>MPPT:</label>
                    <select
                        className="px-2 py-1 rounded-md bg-[#0D2D42] w-[190px]"
                        value={selectedMppt}
                        onChange={(e) => setSelectedMppt(e.target.value)}
                    >
                        <option value="">Select</option>
                        {mppts.map((mppt) => (
                            <option key={mppt.value} value={mppt.value}>{mppt.label}</option>
                        ))}
                    </select>
                </div>

                {/* String Dropdown */}
                <div className="flex items-center space-x-2">
                    <label>String:</label>
                    <select
                        className="px-2 py-1 rounded-md bg-[#0D2D42] w-[190px]"
                        value={selectedString}
                        onChange={(e) => setSelectedString(e.target.value)}
                    >
                        <option value="">Select</option>
                        {strings.map((str) => (
                            <option key={str.value} value={str.value}>{str.label}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center space-x-2">
                    <label>Interval:</label>
                    <DatePicker
                        selected={dateRange[0]}
                        onChange={(dates) => setDateRange(dates)}
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        selectsRange
                        className="px-2 py-1 rounded-md bg-[#0D2D42] w-[190px]"
                    />
                    <FaCalendarAlt className="text-blue-500" />
                </div>

                {/* Generate Chart Button */}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={handleGenerateChart}
                >
                    Generate
                </button>
            </div>

            {/* 🔹 Chart Section */}
            <div className="grid grid-cols-2 gap-4">
                <ProductionLayeredColumn
                    selectedOptionplant1={chartParams.plant}
                    selectedOptioninverter1={chartParams.inverter}
                    selectedOptionmppt1={chartParams.mppt}
                    selectedOptionstring1={chartParams.string}
                    customFromDate={chartParams.start_date}
                    customToDate={chartParams.end_date}
                />
                <ProductionLayeredColumn
                    selectedOptionplant1={chartParams.plant}
                    selectedOptioninverter1={chartParams.inverter}
                    selectedOptionmppt1={chartParams.mppt}
                    selectedOptionstring1={chartParams.string}
                    customFromDate={chartParams.start_date}
                    customToDate={chartParams.end_date}
                />
                <ProductionLayeredColumn
                    selectedOptionplant1={chartParams.plant}
                    selectedOptioninverter1={chartParams.inverter}
                    selectedOptionmppt1={chartParams.mppt}
                    selectedOptionstring1={chartParams.string}
                    customFromDate={chartParams.start_date}
                    customToDate={chartParams.end_date}
                />
                <ProductionLayeredColumn
                    selectedOptionplant1={chartParams.plant}
                    selectedOptioninverter1={chartParams.inverter}
                    selectedOptionmppt1={chartParams.mppt}
                    selectedOptionstring1={chartParams.string}
                    customFromDate={chartParams.start_date}
                    customToDate={chartParams.end_date}
                />
            </div>
        </div>
    );
}
