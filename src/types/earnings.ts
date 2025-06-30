
export interface DailyEntry {
  date: string;
  hours: number;
  orders: number;
  cashReceived: number;
  grossEarnings: number;
  netEarnings: number;
}

export interface MonthlyData {
  [date: string]: DailyEntry;
}

export interface EarningsData {
  [monthKey: string]: MonthlyData;
}

export interface MonthlySummary {
  totalGross: number;
  totalNet: number;
  totalHours: number;
  totalOrders: number;
  daysWorked: number;
}
