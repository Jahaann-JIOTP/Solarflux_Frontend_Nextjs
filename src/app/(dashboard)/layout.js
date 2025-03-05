"use client"; // Ensures it's a client component
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [activeButton, setActiveButton] = useState("today");

  return (
    <div className="h-screen w-screen flex bg-black">
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow h-full ml-[90px]"> {/* Push content right */}
        {/* Header */}
        <Header>
          <div className="flex justify-center ml-[50px] items-center py-2 gap-3">
            {["today", "month", "year"].map((period) => (
              <button
                key={period}
                id={`${period}Btn`}
                className={`px-5 py-1 mx-2 text-sm rounded-md ${
                  activeButton === period
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setActiveButton(period)}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </Header>

        {/* Page Content (Fixed) */}
        <main className="p-6 flex-grow bg-black text-white overflow-auto mt-[70px]"> {/* Added margin to prevent overlap */}
          {children}
        </main>
      </div>
    </div>
  );
}
