export interface DashboardSession {
  id: number;
  date: string;
  weekNumber: number;
  focus: string;
  sessionType: string;
  completed: boolean;
}

export interface DashboardData {
  allSessions: DashboardSession[];
  nextSession: { id: number; date: string } | null;
  streak: number;
  chartData: { month: string; count: number }[];
}