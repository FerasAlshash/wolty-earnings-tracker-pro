import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EarningsData } from '@/types/earnings';
import { format, parse } from 'date-fns';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChartsViewProps {
  earningsData: EarningsData;
}

const ChartsView = ({ earningsData }: ChartsViewProps) => {
  // Get available months for selection
  const availableMonths = Object.keys(earningsData).sort((a, b) => b.localeCompare(a));
  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

  // Prepare daily data for the selected month
  const prepareDailyData = (monthKey: string) => {
    if (!monthKey || !earningsData[monthKey]) return [];
    
    const monthData = earningsData[monthKey];
    return Object.entries(monthData)
      .map(([date, entry]: [string, any]) => ({
        date: format(new Date(date), 'dd'),
        fullDate: format(new Date(date), 'MMM dd'),
        hours: entry.hours,
        orders: entry.orders,
        grossEarnings: entry.grossEarnings,
        netEarnings: entry.netEarnings
      }))
      .sort((a, b) => parseInt(a.date) - parseInt(b.date));
  };

  const chartData = prepareDailyData(selectedMonth);

  if (availableMonths.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-8">
          <div className="text-center text-slate-400">
            <p>No data available for charts.</p>
            <p className="text-sm">Start tracking your earnings to see visual insights!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedMonthName = selectedMonth ? format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM yyyy') : '';

  return (
    <div className="space-y-6">
      {/* Month Selection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Select Month to View Daily Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {availableMonths.map((monthKey) => {
                const monthName = format(parse(monthKey, 'yyyy-MM', new Date()), 'MMMM yyyy');
                return (
                  <SelectItem key={monthKey} value={monthKey} className="text-white hover:bg-slate-600">
                    {monthName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Daily Hours vs Orders Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Daily Hours vs Orders - {selectedMonthName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div style={{ minWidth: `${Math.max(600, chartData.length * 60)}px`, height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#06b6d4" 
                    fontSize={12}
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#06b6d4' } }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981" 
                    fontSize={12}
                    label={{ value: 'Orders', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10b981' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'orders' ? `${value} orders` : `${value} hours`,
                      name === 'orders' ? 'Orders' : 'Hours'
                    ]}
                    labelFormatter={(label: any) => `Day: ${label}`}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsView;