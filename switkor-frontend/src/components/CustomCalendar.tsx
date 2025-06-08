'use client';

import Calendar from 'react-calendar';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface CustomCalendarProps {
  sessionsByDate: Record<string, string>;
  onClickDay: (value: Date) => void;
}

export default function CustomCalendar({ sessionsByDate, onClickDay }: CustomCalendarProps) {
  const tileContent = ({ date }: { date: Date }) => {
    const iso = date.toISOString().split('T')[0];
    if (sessionsByDate[iso]) {
      return (
        <div
          data-tooltip-id="session-tooltip"
          data-tooltip-content={sessionsByDate[iso]}
          className="text-lg text-emerald-700"
        >
          🏋️‍♀️
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Calendar
        onClickDay={onClickDay}
        tileContent={tileContent}
        className="
          !border-none
          p-4 rounded-3xl shadow-md bg-white
          [&_.react-calendar__navigation]:mb-4
          [&_.react-calendar__navigation__label]:text-lg
          [&_.react-calendar__navigation__arrow]:text-xl
          [&_.react-calendar__month-view__weekdays]:text-sky-900 [&_.react-calendar__month-view__weekdays]:text-sm [&_.react-calendar__month-view__weekdays]:font-medium
          [&_.react-calendar__month-view__days]:grid [&_.react-calendar__month-view__days]:grid-cols-7
          [&_.react-calendar__tile]:aspect-square [&_.react-calendar__tile]:rounded-xl [&_.react-calendar__tile]:text-sm [&_.react-calendar__tile]:p-2
          [&_.react-calendar__tile--now]:bg-sky-100 [&_.react-calendar__tile--now]:font-semibold [&_.react-calendar__tile--now]:ring-2 [&_.react-calendar__tile--now]:ring-emerald-300
          [&_.react-calendar__tile--active]:bg-emerald-500 [&_.react-calendar__tile--active]:text-white
        "
      />
      <Tooltip id="session-tooltip" />
    </div>
  );
}
