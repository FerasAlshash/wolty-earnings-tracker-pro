
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsData, MonthlySummary } from '@/types/earnings';
import { format } from 'date-fns';

interface MonthlyViewProps {
  earningsData: EarningsData;
}

const MonthlyView = ({ earningsData }: MonthlyViewProps) => {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthData = earningsData[currentMonth] || {};

  const calculateMonthlySummary = (): MonthlySummary => {
    const entries = Object.values(currentMonthData);
    
    return entries.reduce((acc, entry) => ({
      totalGross: acc.totalGross + entry.grossEarnings,
      totalNet: acc.totalNet + entry.netEarnings,
      totalHours: acc.totalHours + entry.hours,
      totalOrders: acc.totalOrders + entry.orders,
      daysWorked: acc.daysWorked + 1
    }), {
      totalGross: 0,
      totalNet: 0,
      totalHours: 0,
      totalOrders: 0,
      daysWorked: 0
    });
  };

  const summary = calculateMonthlySummary();
  const currentMonthName = format(new Date(), 'MMMM yyyy');

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">{currentMonthName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-lg text-center">
              <div className="text-white text-2xl font-bold">€{summary.totalGross.toFixed(2)}</div>
              <div className="text-cyan-100 text-sm">Total Gross</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-lg text-center">
              <div className="text-white text-2xl font-bold">€{summary.totalNet.toFixed(2)}</div>
              <div className="text-green-100 text-sm">Total Net</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-white text-xl font-semibold">{summary.totalHours.toFixed(1)}</div>
              <div className="text-slate-300 text-sm">Hours Worked</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-white text-xl font-semibold">{summary.totalOrders}</div>
              <div className="text-slate-300 text-sm">Total Orders</div>
            </div>
          </div>

          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <div className="text-white text-xl font-semibold">{summary.daysWorked}</div>
            <div className="text-slate-300 text-sm">Days Worked</div>
          </div>

          {summary.daysWorked > 0 && (
          <div className="space-y-2 bg-slate-700 p-4 rounded-lg">
            <h3 className="text-white font-semibold text-center mb-3">Averages</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Avg. Daily Gross:</span>
              <span className="text-cyan-400">€{(summary.totalGross / summary.daysWorked).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Avg. Daily Net:</span>
              <span className="text-green-400">€{(summary.totalNet / summary.daysWorked).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Avg. Hours/Day:</span>
              <span className="text-slate-400">{(summary.totalHours / summary.daysWorked).toFixed(1)}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Avg. Orders/Day:</span>
              <span className="text-slate-400">{(summary.totalOrders / summary.daysWorked).toFixed(1)}</span>
            </div>
          </div>
          )}

          {summary.daysWorked === 0 && (
            <div className="text-center text-slate-400 py-8">
              <p>No entries for this month yet.</p>
              <p className="text-sm">Start by adding a daily entry!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyView;
