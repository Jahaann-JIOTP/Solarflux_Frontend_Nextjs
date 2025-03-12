"use client";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [activeButton, setActiveButton] = useState("today");

  return (
    <div className="h-screen w-screen flex bg-black overflow-hidden">
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow h-full ml-[90px] min-h-0 overflow-auto" id="main-section">

        {/* Header */}
        <Header>
          <div className="flex justify-center ml-[50px] items-center py-2 gap-3 mt-[-70]">
            {["today", "month", "year"].map((period) => (
              <button
                key={period}
                id={`${period}Btn`}
                className={`px-5 py-1 mx-2 text-sm rounded-md ${
                  activeButton === period
                    ? "dash-button !bg-[#bf4a63]"
                    : "dash-button"
                }`}
                onClick={() => setActiveButton(period)}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </Header>

        {/* Page Content (Scrollable) */}
        <main className="p-6 flex-grow bg-black text-white mt-[80px] h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
