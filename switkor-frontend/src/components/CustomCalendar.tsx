'use client';

import Calendar from 'react-calendar';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { patternTranslations } from '@/lib/patternTranslations';

interface CustomCalendarProps {
  sessionsByDate: Record<string,  { id: number; label: string; focus: string; sessionType: string }>;
  onClickDay: (value: Date) => void;
}

export default function CustomCalendar({ sessionsByDate, onClickDay }: CustomCalendarProps) {

  const formatDateKey = (date: Date) => date.toLocaleDateString('sv-SE');


  const tileContent = ({ date }: { date: Date }) => {
    const iso = formatDateKey(date);
    const session = sessionsByDate[iso];
    if (session) {
      const translatedFocus = session.focus
        .split(',')
        .map((key) => patternTranslations[key.trim()] || key)
        .join(' / ');

        const emoji = session.sessionType === 'recovery' ? '🧘' : '🏋️';

      return (
        <div
          data-tooltip-id="session-tooltip"
          data-tooltip-content={translatedFocus}
          className="text-lg text-emerald-700"
        >
          {emoji}
        </div>
      );
    }
    return null;
  };

  const tileClassName = ({ date }: { date: Date }) => {
  const iso = formatDateKey(date);
  const session = sessionsByDate[iso];

  //debug
   if (session) {
    console.log(iso, session.sessionType); // 👈 esto te dirá qué valores están llegando
  }
  //debug
  if (!session) return null;

  if (session.sessionType === 'recovery') return ['tile-recovery'];
  return ['tile-main'];; // todo lo que no sea recovery se considera sesión normal
  };
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Calendar
        onClickDay={onClickDay}
        tileContent={tileContent}
        tileClassName={tileClassName}
        
        className="
          !border-none
          p-4 rounded-3xl shadow-md bg-white
        "
      />
      <Tooltip id="session-tooltip" />
    </div>
  );
}
