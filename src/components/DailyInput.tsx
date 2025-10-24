
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { EarningsData, DailyEntry } from '@/types/earnings';

interface DailyInputProps {
  onAddEntry: (date: string, entry: DailyEntry) => void;
  earningsData: EarningsData;
  language: 'en' | 'de';
}

const DailyInput = ({ onAddEntry, earningsData, language }: DailyInputProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hours, setHours] = useState('');
  const [orders, setOrders] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const translations = {
    en: {
      title: 'Daily Entry',
      workDate: 'Work Date',
      pickDate: 'Pick a date',
      hoursWorked: 'Hours Worked',
      hoursPlaceholder: 'e.g., 8.5',
      numOrders: 'Number of Orders',
      ordersPlaceholder: 'e.g., 15',
      cashReceived: 'Cash Received (Hand-to-Hand)',
      cashPlaceholder: 'e.g., 25.50',
      grossEarnings: 'Gross Earnings:',
      netEarnings: 'Net Earnings:',
      saveEntry: 'Save Daily Entry',
      missingInfo: 'Missing Information',
      fillAllFields: 'Please fill in all fields',
      invalidValues: 'Invalid Values',
      positiveNumbers: 'Please enter positive numbers only',
      entrySaved: 'Entry Saved!',
      entryRecorded: 'Daily earnings for {date} have been recorded.',
      entryExists: 'Entry exists for this date:',
      entryInfo: '{hours}h, {orders} orders, €{net} net'
    },
    de: {
      title: 'Täglicher Eintrag',
      workDate: 'Arbeitsdatum',
      pickDate: 'Datum auswählen',
      hoursWorked: 'Arbeitsstunden',
      hoursPlaceholder: 'z.B. 8,5',
      numOrders: 'Anzahl der Bestellungen',
      ordersPlaceholder: 'z.B. 15',
      cashReceived: 'Bargeld erhalten (Hand zu Hand)',
      cashPlaceholder: 'z.B. 25,50',
      grossEarnings: 'Bruttoertrag:',
      netEarnings: 'Nettoertrag:',
      saveEntry: 'Täglichen Eintrag speichern',
      missingInfo: 'Fehlende Informationen',
      fillAllFields: 'Bitte füllen Sie alle Felder aus',
      invalidValues: 'Ungültige Werte',
      positiveNumbers: 'Bitte geben Sie nur positive Zahlen ein',
      entrySaved: 'Eintrag gespeichert!',
      entryRecorded: 'Tägliche Einnahmen für {date} wurden erfasst.',
      entryExists: 'Eintrag für dieses Datum vorhanden:',
      entryInfo: '{hours}h, {orders} Bestellungen, €{net} netto'
    }
  };

  const t = translations[language];

  const calculateEarnings = (hoursWorked: number, ordersCompleted: number, cash: number) => {
    const grossEarnings = (hoursWorked * 10) + (ordersCompleted * 3);
    const netEarnings = grossEarnings - cash;
    return { grossEarnings, netEarnings };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hours || !orders || !cashReceived) {
      toast({
        title: t.missingInfo,
        description: t.fillAllFields,
        variant: "destructive"
      });
      return;
    }

    const hoursNum = parseFloat(hours);
    const ordersNum = parseInt(orders);
    const cashNum = parseFloat(cashReceived);

    if (hoursNum < 0 || ordersNum < 0 || cashNum < 0) {
      toast({
        title: t.invalidValues,
        description: t.positiveNumbers,
        variant: "destructive"
      });
      return;
    }

    const { grossEarnings, netEarnings } = calculateEarnings(hoursNum, ordersNum, cashNum);
    const dateString = format(selectedDate, 'yyyy-MM-dd');

    const entry: DailyEntry = {
      date: dateString,
      hours: hoursNum,
      orders: ordersNum,
      cashReceived: cashNum,
      grossEarnings,
      netEarnings
    };

    onAddEntry(dateString, entry);

    toast({
      title: t.entrySaved,
      description: t.entryRecorded.replace('{date}', format(selectedDate, 'PPP')),
    });

    // Reset form
    setHours('');
    setOrders('');
    setCashReceived('');
  };

  const { grossEarnings, netEarnings } = hours && orders && cashReceived ? 
    calculateEarnings(parseFloat(hours) || 0, parseInt(orders) || 0, parseFloat(cashReceived) || 0) : 
    { grossEarnings: 0, netEarnings: 0 };

  // Check if there's existing data for the selected date
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const monthKey = dateString.substring(0, 7);
  const existingEntry = earningsData[monthKey]?.[dateString];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-300">{t.workDate}</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                    !selectedDate && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>{t.pickDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-slate-300">{t.hoursWorked}</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder={t.hoursPlaceholder}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orders" className="text-slate-300">{t.numOrders}</Label>
              <Input
                id="orders"
                type="number"
                min="0"
                value={orders}
                onChange={(e) => setOrders(e.target.value)}
                placeholder={t.ordersPlaceholder}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash" className="text-slate-300">{t.cashReceived}</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                min="0"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={t.cashPlaceholder}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {hours && orders && cashReceived && (
              <div className="bg-slate-700 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{t.grossEarnings}</span>
                  <span className="text-cyan-400 font-semibold">€{grossEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{t.netEarnings}</span>
                  <span className="text-green-400 font-semibold">€{netEarnings.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
            >
              {t.saveEntry}
            </Button>
          </form>

          {existingEntry && (
            <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 p-3 rounded-lg">
              <p className="text-yellow-300 text-sm font-medium">{t.entryExists}</p>
              <p className="text-yellow-200 text-xs">
                {t.entryInfo
                  .replace('{hours}', existingEntry.hours.toString())
                  .replace('{orders}', existingEntry.orders.toString())
                  .replace('{net}', existingEntry.netEarnings.toFixed(2))
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyInput;
