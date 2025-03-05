"use client"; // Ensures it's a client component

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
    <header className="fixed top-2 right-1 w-[93%] z-[1000]">
      {/* Subheader with exact style */}
      <div
        className="subheader flex items-center relative text-white px-5"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% 56.39%, 67.91% 56.39%, 59.58% 100%, 43.09% 100%, 33.6% 56.39%, 0 56.39%)",
          background:
            "linear-gradient(90deg, #040421, #040421 15%, #0461a9 40%, #045a9e 60%, #040421 85%, #040421)",
          height: "50px",
          border: "2px solid #40a0d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          position: "relative",
        }}
      >
        {/* Dashboard Title */}
        <h2
          id="head"
          className="font-bold flex-grow ml-[3vw] text-[1.5vw] text-center"
        >
          DASHBOARD
        </h2>

        {/* Date and Time Display */}
        <div
          id="dateDisplay"
          className="absolute right-5 top-[30%] transform -translate-y-1/2 text-[0.8vw] font-bold text-gray-300"
        >
          <div id="clockdate">
            <div id="clock">{currentTime}</div>
            <div id="date">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Children will be inserted here */}
      {children}
    </header>
  );
}
