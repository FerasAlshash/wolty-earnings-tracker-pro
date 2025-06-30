
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EarningsData, MonthlySummary } from '@/types/earnings';
import { format, parse } from 'date-fns';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface HistoryViewProps {
  earningsData: EarningsData;
  onDeleteEntry: (monthKey: string, date: string) => void;
}

const HistoryView = ({ earningsData, onDeleteEntry }: HistoryViewProps) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const calculateMonthlySummary = (monthData: any): MonthlySummary => {
    const entries = Object.values(monthData);
    
    if (entries.length === 0) {
      return {
        totalGross: 0,
        totalNet: 0,
        totalHours: 0,
        totalOrders: 0,
        daysWorked: 0
      };
    }
    
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

  const handleDeleteEntry = (monthKey: string, date: string) => {
    onDeleteEntry(monthKey, date);
    toast({
      title: "Entry Deleted",
      description: `Entry for ${format(new Date(date), 'PPP')} has been deleted.`,
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
                  <h4 className="text-white font-medium mb-3">Daily Work Log</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(monthData)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, entry]: [string, any]) => (
                        <div key={date} className="bg-slate-700 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium">
                              {format(new Date(date), 'MMM dd, yyyy')}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="text-green-400 font-semibold">€{entry.netEarnings.toFixed(2)}</div>
                                <div className="text-cyan-400 text-sm">€{entry.grossEarnings.toFixed(2)} gross</div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-800 border-slate-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Entry</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-300">
                                      Are you sure you want to delete the entry for {format(new Date(date), 'PPP')}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteEntry(monthKey, date)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                            <div>
                              <span className="text-slate-300">Hours:</span> {entry.hours}h
                            </div>
                            <div>
                              <span className="text-slate-300">Orders:</span> {entry.orders}
                            </div>
                            <div>
                              <span className="text-slate-300">Cash:</span> €{entry.cashReceived.toFixed(2)}
                            </div>
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
