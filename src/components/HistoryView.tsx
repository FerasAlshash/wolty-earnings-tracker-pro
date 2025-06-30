
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EarningsData, MonthlySummary } from '@/types/earnings';
import { format, parse } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryViewProps {
  earningsData: EarningsData;
}

const HistoryView = ({ earningsData }: HistoryViewProps) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const calculateMonthlySummary = (monthData: any): MonthlySummary => {
    const entries = Object.values(monthData);
    
    return entries.reduce((acc: MonthlySummary, entry: any) => ({
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

  // Sort months in descending order (most recent first)
  const sortedMonths = Object.keys(earningsData).sort((a, b) => b.localeCompare(a));

  if (sortedMonths.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-8">
          <div className="text-center text-slate-400">
            <p>No historical data available.</p>
            <p className="text-sm">Start tracking your earnings to see history here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMonths.map((monthKey) => {
        const monthData = earningsData[monthKey];
        const summary = calculateMonthlySummary(monthData);
        const monthDate = parse(monthKey, 'yyyy-MM', new Date());
        const monthName = format(monthDate, 'MMMM yyyy');
        const isExpanded = expandedMonth === monthKey;

        return (
          <Card key={monthKey} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{monthName}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedMonth(isExpanded ? null : monthKey)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-700 p-3 rounded text-center">
                  <div className="text-cyan-400 text-lg font-semibold">€{summary.totalGross.toFixed(2)}</div>
                  <div className="text-slate-400 text-xs">Gross</div>
                </div>
                <div className="bg-slate-700 p-3 rounded text-center">
                  <div className="text-green-400 text-lg font-semibold">€{summary.totalNet.toFixed(2)}</div>
                  <div className="text-slate-400 text-xs">Net</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-white font-medium">{summary.daysWorked}</div>
                  <div className="text-slate-400 text-xs">Days</div>
                </div>
                <div>
                  <div className="text-white font-medium">{summary.totalHours.toFixed(1)}</div>
                  <div className="text-slate-400 text-xs">Hours</div>
                </div>
                <div>
                  <div className="text-white font-medium">{summary.totalOrders}</div>
                  <div className="text-slate-400 text-xs">Orders</div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h4 className="text-white font-medium mb-3">Daily Breakdown</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(monthData)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, entry]: [string, any]) => (
                        <div key={date} className="bg-slate-700 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium">
                              {format(new Date(date), 'MMM dd')}
                            </span>
                            <div className="text-right">
                              <div className="text-green-400 font-semibold">€{entry.netEarnings.toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                            <div>{entry.hours}h</div>
                            <div>{entry.orders} orders</div>
                            <div>€{entry.cashReceived.toFixed(2)} cash</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HistoryView;
