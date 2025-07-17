import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsData } from '@/types/earnings';
import { format, parse } from 'date-fns';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartsViewProps {
  earningsData: EarningsData;
}

const ChartsView = ({ earningsData }: ChartsViewProps) => {
  // Prepare data for charts
  const chartData = Object.entries(earningsData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, monthData]) => {
      const entries = Object.values(monthData);
      const summary = entries.reduce((acc: any, entry: any) => ({
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
      
      const monthDate = parse(monthKey, 'yyyy-MM', new Date());
      
      return {
        month: format(monthDate, 'MMM yyyy'),
        monthKey,
        gross: summary.totalGross,
        net: summary.totalNet,
        hours: summary.totalHours,
        orders: summary.totalOrders,
        days: summary.daysWorked,
        avgDaily: summary.daysWorked > 0 ? summary.totalNet / summary.daysWorked : 0,
        avgHourly: summary.totalHours > 0 ? summary.totalNet / summary.totalHours : 0
      };
    });

  if (chartData.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Hours vs Orders Relationship */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Hours vs Orders Relationship</CardTitle>
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
                label={{ value: 'Hours Worked', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
              />
              <YAxis 
                dataKey="orders" 
                stroke="#94a3b8" 
                fontSize={12}
                name="Orders"
                label={{ value: 'Orders Completed', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'orders' ? `${value} orders` : `${value.toFixed(1)} hours`,
                  name === 'orders' ? 'Orders' : 'Hours'
                ]}
                labelFormatter={(label: any, payload: any) => {
                  if (payload && payload[0]) {
                    return `${payload[0].payload.month}`;
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