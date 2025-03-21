"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Check Authentication on Page Load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // 🚀 Redirect to Login Page if Not Logged In
    }
  }, [router]); // ✅ Run this when the router changes

  // Function to set the title dynamically based on pathname
  const getTitle = () => {
    if (pathname.includes("UserManagement")) return "USER MANAGEMENT";
    if (pathname.includes("Dashboard")) return "DASHBOARD";
    if (pathname.includes("NationWide")) return "COUNTRY LEVEL";
    if (pathname.includes("PlantLevel")) return "PLANT LEVEL";
    if (pathname.includes("InvertorLevel")) return "INVERTER LEVEL";
    if (pathname.includes("SolarAnalytics")) return "SOLAR ANALYTICS";
    if (pathname.includes("TrendAnalysis")) return "TREND ANALYSIS";
    if (pathname.includes("Settings")) return "SETTINGS";
    if (pathname.includes("Reports")) return "REPORTS";
    if (pathname.includes("SingleLineDiagram")) return "SINGLE LINE DIAGRAM";
    return "Dashboard"; // Default title
  };


  return (
    <div className={`h-screen w-screen flex overflow-hidden bg-black`}>
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow h-full ml-[90px] min-h-0 overflow-auto" id="main-section">
        {/* Header */}
        <main className={`p-6 flex-grow text-white h-full`}>
          <div className="ml-[1%] grid grid-cols-12 gap-5 w-[99%] h-[95%] rounded-lg bg-black/75">
            <div className="col-span-12 flex flex-col">
              <Header title={getTitle()} />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
