'use client';

import Calendar from 'react-calendar';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { patternTranslations } from '@/lib/patternTranslations';

interface CustomCalendarProps {
  sessionsByDate: Record<string,  { id: number; label: string; focus: string; sessionType: string; completed: boolean }>;
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

        const icon = session.completed ? '✔️' : session.sessionType === 'recovery' ? '🧘' : '🏋️';

      return (
        <div
          data-tooltip-id="session-tooltip"
          data-tooltip-content={translatedFocus}
          className="text-lg text-emerald-700 emoji-session"
        >
          {icon}
        </div>
      );
    }
    return null;
  };

  const tileClassName = ({ date }: { date: Date }) => {
  const iso = formatDateKey(date);
  const session = sessionsByDate[iso];

  
  if (!session) return null;

 if (session.completed) return ['tile-completed'];
    if (session.sessionType === 'recovery') return ['tile-recovery'];
    return ['tile-main']; 
  };
  return (
    <div className="w-full sm:max-w-3xl sm:mx-auto px-0 flex justify-center">
        <div className="origin-top inline-block">
          <Calendar
            onClickDay={onClickDay}
            tileContent={tileContent}
            tileClassName={tileClassName}
            prevLabel={<span className="text-emerald-600 text-3xl font-bold ml-2 me-2">{'‹'}</span>}
            nextLabel={<span className="text-emerald-600 text-3xl font-bold mr-2 ms-2">{'›'}</span>}
            prev2Label={null}
            next2Label={null}
            navigationLabel={({ label }) => (
              <span className="text-base sm:text-lg font-semibold mx-4">
                {label}
              </span>
            )}
            
            className="!border-none p-4 rounded-3xl shadow-md bg-white"
          />
          <Tooltip id="session-tooltip" />
        </div>
    </div>
     
  );
}
