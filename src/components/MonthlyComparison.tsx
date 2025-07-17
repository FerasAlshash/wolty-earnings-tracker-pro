import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsData } from '@/types/earnings';
import { format, parse, subMonths } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MonthlyComparisonProps {
  earningsData: EarningsData;
}

interface SummaryData {
  totalGross: number;
  totalNet: number;
  totalHours: number;
  totalOrders: number;
  daysWorked: number;
  avgDaily: number;
  avgHourly: number;
}

const MonthlyComparison = ({ earningsData }: MonthlyComparisonProps) => {
  const currentDate = new Date();
  const currentMonthKey = format(currentDate, 'yyyy-MM');
  const previousMonthKey = format(subMonths(currentDate, 1), 'yyyy-MM');
  
  const currentMonthData = earningsData[currentMonthKey] || {};
  const previousMonthData = earningsData[previousMonthKey] || {};
  
  const calculateSummary = (monthData: any): SummaryData => {
    const entries = Object.values(monthData);
    if (entries.length === 0) {
      return {
        totalGross: 0,
        totalNet: 0,
        totalHours: 0,
        totalOrders: 0,
        daysWorked: 0,
        avgDaily: 0,
        avgHourly: 0
      };
    }
    
    const summary: SummaryData = {
      totalGross: 0,
      totalNet: 0,
      totalHours: 0,
      totalOrders: 0,
      daysWorked: 0,
      avgDaily: 0,
      avgHourly: 0
    };
    
    entries.forEach((entry: any) => {
      summary.totalGross += entry.grossEarnings;
      summary.totalNet += entry.netEarnings;
      summary.totalHours += entry.hours;
      summary.totalOrders += entry.orders;
      summary.daysWorked += 1;
    });
    
    return {
      totalGross: summary.totalGross,
      totalNet: summary.totalNet,
      totalHours: summary.totalHours,
      totalOrders: summary.totalOrders,
      daysWorked: summary.daysWorked,
      avgDaily: summary.daysWorked > 0 ? summary.totalNet / summary.daysWorked : 0,
      avgHourly: summary.totalHours > 0 ? summary.totalNet / summary.totalHours : 0
    };
  };
  
  const currentSummary = calculateSummary(currentMonthData);
  const previousSummary = calculateSummary(previousMonthData);
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  const ComparisonItem = ({ 
    title, 
    current, 
    previous, 
    unit = '',
    isPercentage = false 
  }: {
    title: string;
    current: number;
    previous: number;
    unit?: string;
    isPercentage?: boolean;
  }) => {
    const change = calculateChange(current, previous);
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    const formatValue = (value: number) => {
      if (unit === '€') return `€${value.toFixed(2)}`;
      if (unit === 'h') return `${value.toFixed(1)}h`;
      return value.toString();
    };
    
    return (
      <div className="bg-slate-700 p-4 rounded-lg">
        <h4 className="text-slate-300 text-sm mb-2">{title}</h4>
        <div className="flex items-center justify-between mb-2">
          <div className="text-white font-semibold text-lg">
            {formatValue(current)}
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            isNeutral ? 'text-slate-400' : isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isNeutral ? (
              <Minus className="h-4 w-4" />
            ) : isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
        <div className="text-slate-400 text-sm">
          Previous: {formatValue(previous)}
        </div>
      </div>
    );
  };
  
  const currentMonthName = format(currentDate, 'MMMM yyyy');
  const previousMonthName = format(subMonths(currentDate, 1), 'MMMM yyyy');
  
  if (Object.keys(currentMonthData).length === 0 && Object.keys(previousMonthData).length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-8">
          <div className="text-center text-slate-400">
            <p>No data available for comparison.</p>
            <p className="text-sm">Start tracking your earnings to see month-to-month comparisons!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">
            {currentMonthName} vs {previousMonthName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ComparisonItem
            title="Net Earnings"
            current={currentSummary.totalNet}
            previous={previousSummary.totalNet}
            unit="€"
          />
          
          <ComparisonItem
            title="Gross Earnings"
            current={currentSummary.totalGross}
            previous={previousSummary.totalGross}
            unit="€"
          />
          
          <ComparisonItem
            title="Total Hours"
            current={currentSummary.totalHours}
            previous={previousSummary.totalHours}
            unit="h"
          />
          
          <ComparisonItem
            title="Total Orders"
            current={currentSummary.totalOrders}
            previous={previousSummary.totalOrders}
          />
          
          <ComparisonItem
            title="Days Worked"
            current={currentSummary.daysWorked}
            previous={previousSummary.daysWorked}
          />
          
          <ComparisonItem
            title="Daily Average"
            current={currentSummary.avgDaily}
            previous={previousSummary.avgDaily}
            unit="€"
          />
          
          <ComparisonItem
            title="Hourly Average"
            current={currentSummary.avgHourly}
            previous={previousSummary.avgHourly}
            unit="€"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyComparison;