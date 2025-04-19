'use client';

import { useState } from 'react';
import PeakHourActivePower from '@/components/peak_hour_active_power';
import ActivePowerBusyMonday from '@/components/active_power_busymonday';
import ActivePowerHourDate from '@/components/active_power_hourdate';
import ActivePowerAllWeekday from '@/components/active_power_allweekday';

const PowerAnalyticsHourly = () => {
  const [selectedOptionplant1, setSelectedOptionplant1] = useState('Coca Cola Faisalabad');

  return (
    <div className="w-full">

      {/* Filters */}
      <div className="flex justify-end items-center gap-4 mb-6 text-[0.9vw] text-white">
        <label htmlFor="plantSelect">Plant:</label>
        <select
          id="plantSelect"
          className="px-2 py-1 rounded-md bg-[#0D2D42] h-[32px] text-white w-[200px] text-[14px]"
          value={selectedOptionplant1}
          onChange={(e) => setSelectedOptionplant1(e.target.value)}
        >
          <option value="Coca Cola Faisalabad">Coca Cola Faisalabad</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PeakHourActivePower selectedOptionplant1={selectedOptionplant1} />
        </div>
        <div>
          <ActivePowerHourDate selectedOptionplant1={selectedOptionplant1} />
        </div>
        <div>
          <ActivePowerBusyMonday selectedOptionplant1={selectedOptionplant1} />
        </div>
        <div>
          <ActivePowerAllWeekday selectedOptionplant1={selectedOptionplant1} />
        </div>
      </div>
    </div>
  );
};

export default PowerAnalyticsHourly;
