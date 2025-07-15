import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsData } from '@/types/earnings';
import { format, parse } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

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
      {/* Earnings Trend Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  `€${value.toFixed(2)}`,
                  name === 'gross' ? 'Gross' : 'Net'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="gross" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hours and Orders Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Work Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'hours' ? `${value.toFixed(1)}h` : `${value}`,
                  name === 'hours' ? 'Hours' : 'Orders'
                ]}
              />
              <Bar dataKey="hours" fill="#8b5cf6" />
              <Bar dataKey="orders" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Area Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`€${value.toFixed(2)}`, 'Avg Daily']}
              />
              <Area 
                type="monotone" 
                dataKey="avgDaily" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsView;