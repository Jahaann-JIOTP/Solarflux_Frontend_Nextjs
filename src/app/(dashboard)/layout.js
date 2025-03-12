"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Function to set the title dynamically based on pathname
  const getTitle = () => {
    if (pathname.includes("UserManagement")) return "USER MANAGMENT";
    if (pathname.includes("Dashboard")) return "DASHBOARD";
    if (pathname.includes("Settings")) return "Settings";
    if (pathname.includes("Reports")) return "Reports";
    return "Dashboard"; // Default title
  };

  return (
    <div className="h-screen w-screen flex bg-black overflow-hidden">
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow h-full ml-[90px] min-h-0 overflow-auto" id="main-section">

        {/* Header */}
        <Header title={getTitle()} />

        {/* Page Content (Scrollable) */}
        <main className="p-6 flex-grow bg-black text-white mt-[80px] h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
