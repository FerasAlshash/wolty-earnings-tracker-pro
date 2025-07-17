import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EarningsData } from '@/types/earnings';
import { format, parse } from 'date-fns';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="hours" 
                stroke="#94a3b8" 
                fontSize={12}
                name="Hours"
                type="number"
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                label={{ value: 'Hours Worked', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
              />
              <YAxis 
                dataKey="orders" 
                stroke="#94a3b8" 
                fontSize={12}
                name="Orders"
                type="number"
                domain={['dataMin - 1', 'dataMax + 1']}
                label={{ value: 'Orders Completed', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string, props: any) => [
                  name === 'orders' ? `${value} orders` : `${value} hours`,
                  name === 'orders' ? 'Orders' : 'Hours'
                ]}
                labelFormatter={(label: any, payload: any) => {
                  if (payload && payload[0]) {
                    return `Day: ${payload[0].payload.fullDate}`;
                  }
                  return '';
                }}
              />
              <Scatter 
                dataKey="orders" 
                fill="#06b6d4"
                stroke="#0891b2"
                strokeWidth={2}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsView;