"use client";

import { useEffect, useState } from "react";

export default function Header({ children, title }) {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: true }));
      setCurrentDate(now.toDateString());
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header>
        <div className="!z-[999] mt-[-10] mb-5 relative flex items-center justify-between h-[70px] px-5 text-white shadow-[0px_0px_15px_rgba(0,136,255,0.7)  bg-gradient-to-r from-[#040421] via-[#0461a9] to-[#040421] [clip-path:polygon(0%_0%,100%_0%,100%_56.39%,67.91%_56.39%,59.58%_100%,43.09%_100%,33.6%_56.39%,0%_56.39%)]">
          <h2 className="text-[1.5vw] font-bold text-center flex-grow ml-[3.5vw] uppercase">
            {title}
          </h2>
          <div className="absolute right-5 top-[30%] transform -translate-y-1/2 text-[0.8vw] font-bold text-gray-300">
          <div className="text-center rounded-md mx-auto">
            <div className="text-white text-[0.8rem] shadow-sm">
              {currentTime}
            </div>
            <div className="tracking-[3px] text-[0.7rem] text-white">
              {currentDate}
            </div>
          </div>
        </div>
        </div>
      </header>
  );
}
