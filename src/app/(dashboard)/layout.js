"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Function to set the title dynamically based on pathname
  const getTitle = () => {
    if (pathname.includes("UserManagement")) return "USER MANAGEMENT";
    if (pathname.includes("Dashboard")) return "DASHBOARD";
    if (pathname.includes("NationWide")) return "COUNTRY LEVEL";
    if (pathname.includes("Settings")) return "Settings";
    if (pathname.includes("Reports")) return "Reports";
    if (pathname.includes("SingleLineDiagram")) return "Single Line Diagram";
    return "Dashboard"; // Default title
  };

  // Determine background based on pathname
  const backgroundStyle = pathname.includes("PlantSummary")
    ? "bg-black"
    : "bg-gradient-to-b from-[#0b3c75] via-[#1e609e] to-[#468faf]";

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${backgroundStyle}`} >
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow h-full ml-[90px] min-h-0 overflow-auto" id="main-section">
        {/* Header */}
        <main className={`p-6 flex-grow text-white h-full ${backgroundStyle}`}>
          <div className="ml-[1%] grid grid-cols-12 gap-5 w-[99%] h-[95%] rounded-lg bg-black/75">
            <div className="col-span-12 flex flex-col justify-between">
              <Header title={getTitle()} />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
