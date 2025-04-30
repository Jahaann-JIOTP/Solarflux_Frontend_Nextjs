"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
// 👇 keep this at the top of your file with other imports
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StringTable = () => {
  const [selectedPlant, setSelectedPlant] = useState("Coca Cola Faisalabad");
  const [dateRange, setDateRange] = useState([
    moment().subtract(60, "days").toDate(),
    moment().subtract(45, "days").toDate(),
  ]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filters, setFilters] = useState({});
  const [uniqueValues, setUniqueValues] = useState({});
  const [loading, setLoading] = useState(false);

  const baseUrl = "https://solarfluxapi.nexalyze.com/";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [from, to] = dateRange;
    const payload = {
      resolution_option: 1,
      start_date: moment(from).format("YYYY-MM-DD"),
      end_date: moment(to).format("YYYY-MM-DD"),
      plant: selectedPlant,
      mppt: "",
      inverter: "",
      string: "",
    };

    try {
      const response = await axios.post(`${baseUrl}process_data`, payload);
      const rawData = response.data || [];

      if (rawData.length > 0) {
        const headerKeys = Object.keys(rawData[0])
          .filter((key) => key !== "Key")
          .sort((a, b) => new Date(a) - new Date(b)); // sort dates ascending

        setHeaders(headerKeys);

        const formatted = rawData.map((row) => {
          const [Plant, Inverter, MPPT, String] = row.Key.split("-");
          const watts_per_string = row[headerKeys[0]]?.watts_per_string || 0;
          const values = headerKeys.map((date) => ({
            date,
            power: row[date]?.power || 0,
            color: row[date]?.color || "white",
          }));
          return { Key: row.Key, Plant, Inverter, MPPT, String, watts_per_string, values };
        });

        setData(formatted);
        setFilteredData(formatted);
        initUniqueValues(formatted, headerKeys);
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const initUniqueValues = (formatted, headers) => {
    const unique = (array) => [...new Set(array)];
    const result = {
      Plant: unique(formatted.map((row) => row.Plant)),
      Inverter: unique(formatted.map((row) => row.Inverter)),
      MPPT: unique(formatted.map((row) => row.MPPT)),
      String: unique(formatted.map((row) => row.String)),
      "Watts/String": unique(formatted.map((row) => row.watts_per_string)),
    };
    headers.forEach((date) => {
      result[date] = unique(
        formatted.flatMap((row) =>
          row.values.filter((val) => val.date === date).map((val) => val.power)
        )
      );
    });

    setUniqueValues(result);
    const defaultFilters = {};
    headers.forEach((h) => (defaultFilters[h] = ""));
    setFilters({ ...filters, ...defaultFilters });
  };

  useEffect(() => {
    if (data.length && Object.keys(filters).length) {
      applyFilters();
    }
  }, [filters, data]);

  const applyFilters = () => {
    const filtered = data.filter((row) => {
      const match = (field, value) => !filters[field] || row[field] === filters[field];
      const matches =
        match("Plant", row.Plant) &&
        match("Inverter", row.Inverter) &&
        match("MPPT", row.MPPT) &&
        match("String", row.String) &&
        (!filters["Watts/String"] || row.watts_per_string === Number(filters["Watts/String"]));

      const matchesDates = headers.every((date) => {
        const filter = filters[date];
        if (!filter) return true;
        if (filter.startsWith("color:")) {
          const cellColor = row.values.find((val) => val.date === date)?.color;
          return cellColor === filter.split(":")[1];
        }
        return true;
      });

      return matches && matchesDates;
    });

    setFilteredData(filtered);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const formatDate = (d) => moment(d).format("DD MMM YYYY");
  const exportToExcel = () => {
    const exportData = filteredData.map((row) => {
      const base = {
        Inverter: row.Inverter,
        MPPT: row.MPPT,
        String: row.String,
        "Watts/String": row.watts_per_string,
      };
      row.values.forEach((val) => {
        base[moment(val.date).format("DD MMM YYYY")] = val.power;
      });
      return base;
    });
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StringData");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, `StringTable_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
  };
  
  return (
    <div className="p-2">
      {/* Filters and Date Range */}
      <div className="flex justify-end space-x-4 mb-8 items-center">
        <div className="flex items-center space-x-2">
          <label className="mr-2">Plant:</label>
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
          >
            <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="mr-2">Interval:</label>
          <div className="text-[14px] relative inline-flex min-w-[180px] z-50">
            <DatePicker
              selected={dateRange[0]}
              onChange={(dates) => dates && setDateRange(dates)}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              selectsRange
              className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] w-[200px] text-white pr-8"
              dateFormat="dd-MM-yyyy"
            />
            <FaCalendarAlt className="absolute top-2 right-2 text-blue-500 pointer-events-none" />
          </div>
        </div>
        <button
          className={`px-4 py-1 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition"
            }`}
          onClick={fetchData}
        >
          {loading ? "Loading..." : "Generate"}
        </button>
        {!loading && filteredData.length > 0 && (
  <button
    onClick={exportToExcel}
    className="px-4 py-1 rounded bg-blue-500 hover:bg-blue-600 transition"
  >
    Export Excel
  </button>
)}

      </div>

      {/* Table Section */}
      <div className="w-full h-[75vh] pt-[10px] mt-[20px] bg-[#0d2d42] p-5 rounded-lg mb-2 text-center shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
        {loading && (
          <div className="flex justify-center items-center h-full w-full">
            <div className="loader"></div>
          </div>
        )}

        <div
          id="main-section"
          className={`overflow-auto mt-5 max-h-[70vh] ${loading ? "hidden" : ""}`}
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        >
          <table className="border border-collapse min-w-fit text-[0.875rem]">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-[#0461A9] to-[#045A9E] text-white font-bold">
              <tr>
                <th className="p-4 border min-w-[120px]">Inverter</th>
                <th className="p-4 border min-w-[120px]">MPPT</th>
                <th className="p-4 border min-w-[120px]">String</th>
                <th className="p-4 border min-w-[120px]">Watts/String</th>
                {headers.map((date) => (
                  <th key={date} className="p-4 border min-w-[120px]">
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
              <tr>
                {["Inverter", "MPPT", "String", "Watts/String"].map((field) => (
                  <th key={field} className="p-3 border min-w-[120px]">
                    <select
                      className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-full text-[14px]"
                      onChange={(e) => handleFilterChange(field, e.target.value)}
                    >
                      <option value="">All</option>
                      {uniqueValues[field]?.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </th>
                ))}
                {headers.map((date) => (
                  <th key={date} className="p-3 border min-w-[120px]">
                    <select
                      className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-full text-[14px]"
                      onChange={(e) => handleFilterChange(date, e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="color:red">Critical</option>
                      <option value="color:orange">Warning</option>
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.Key} className="text-center">
                  <td className="p-4 border min-w-[120px]">{row.Inverter}</td>
                  <td className="p-4 border min-w-[120px]">{row.MPPT}</td>
                  <td className="p-4 border min-w-[120px]">{row.String}</td>
                  <td className="p-4 border min-w-[120px]">{row.watts_per_string} W</td>
                  {row.values.map((val) => (
                    <td
                      key={val.date}
                      className="p-4 border min-w-[120px]"
                      style={{ backgroundColor: val.color }}
                    >
                      {val.power}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StringTable;
