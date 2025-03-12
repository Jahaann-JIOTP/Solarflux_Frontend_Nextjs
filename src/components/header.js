"use client";

import { useEffect, useState } from "react";

export default function Header({ children }) {
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
    <header className="fixed top-2 right-1 w-[93%] z-[1000] h-auto">
      {/* Header content remains unchanged */}
      <div
        className="subheader flex items-center relative text-white px-5"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% 56.39%, 67.91% 56.39%, 59.58% 100%, 43.09% 100%, 33.6% 56.39%, 0 56.39%)",
          background:
            "linear-gradient(90deg, #040421, #040421 15%, #0461a9 40%, #045a9e 60%, #040421 85%, #040421)",
          height: "70px",
          border: "2px solid #40a0d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          position: "relative",
          marginRight:"10px"
        }}
      >
        <h2 className="font-bold flex-grow ml-[3vw] text-[1.5vw] text-center">
          DASHBOARD
        </h2>
        <div className="absolute right-5 top-[30%] transform -translate-y-1/2 text-[0.8vw] font-bold text-gray-300">
          <div className="text-center rounded-md mx-auto">
            <div className="text-white text-[0.8rem] shadow-sm">{currentTime}</div>
            <div className="tracking-[3px] text-[0.7rem] text-white">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Ensures content below header is properly spaced */}
      <div className="mt-[80px]">{children}</div>
    </header>
  );
}
