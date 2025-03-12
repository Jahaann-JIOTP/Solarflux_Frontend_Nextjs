"use client"; // Ensures it's a client component

import Link from "next/link";
import { useState } from "react";
import {
  FaChevronLeft,
  FaTachometerAlt,
  FaSitemap,
  FaProjectDiagram,
  FaChartBar,
  FaHeartbeat,
  FaChartLine,
  FaSolarPanel,
  FaBolt,
  FaUserAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`fixed top-2 left-2 h-[95vh] ${
        isExpanded ? "w-64" : "w-[90px]"
      } bg-[#04192b] rounded-2xl p-5 flex flex-col items-center transition-all duration-300 ease-in-out z-[9999]`}
    >
      {/* Toggle Button */}
      <button
        className="text-white mb-4 absolute top-[45px] right-[-25px] bg-[#04192b] rounded-xl p-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FaChevronLeft
          className={`text-lg transition-transform duration-300 ${
            isExpanded ? "" : "rotate-180"
          }`}
        />
      </button>

      {/* Logo */}
      <img src="/shams.png" alt="Logo" className="max-w-none" />

      <div className="border-t border-gray-500 w-full my-2"></div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col w-full space-y-3">
        <SidebarItem icon={FaTachometerAlt} text="Dashboard" href="/PlantSummary" isExpanded={isExpanded} />
        <SidebarItem icon={FaSitemap} text="Production" href="/Production" isExpanded={isExpanded} />
        <SidebarItem icon={FaProjectDiagram} text="SLD" href="/SingleLineDiagram" isExpanded={isExpanded} />
        <SidebarItem icon={FaChartBar} text="Suppression" href="/SuppressionView" isExpanded={isExpanded} />
        <SidebarItem icon={FaHeartbeat} text="Health" href="/Health" isExpanded={isExpanded} />
        <SidebarItem icon={FaChartLine} text="Analysis" href="/AnalysisTrend" isExpanded={isExpanded} />
        <SidebarItem icon={FaSolarPanel} text="Solar Analytics" href="/SolarAnalytics" isExpanded={isExpanded} />
        <SidebarItem icon={FaBolt} text="Power Analytics" href="/PowerAnalytics" isExpanded={isExpanded} />
        <SidebarItem icon={FaUserAlt} text="User Management" href="/UserManagement" isExpanded={isExpanded} />
      </nav>

      <div className="flex-grow"></div>

      {/* Footer Logo */}
      <img
        src="/company.png"
        alt="Footer Logo"
        className="h-[90px] mt-4 max-w-none"
      />
    </aside>
  );
}

/* Sidebar Item Component */
const SidebarItem = ({ icon: Icon, text, href, isExpanded }) => {
  return (
    <Link href={href} passHref>
      <div className="flex items-center space-x-3 text-white p-3 hover:bg-blue-500 rounded-md transition w-full cursor-pointer">
        <Icon className="text-lg" />
        {isExpanded && <span className="text-sm">{text}</span>}
      </div>
    </Link>
  );
};
