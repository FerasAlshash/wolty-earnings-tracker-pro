
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyInput from '@/components/DailyInput';
import MonthlyView from '@/components/MonthlyView';
import HistoryView from '@/components/HistoryView';
import LanguageSelector from '@/components/LanguageSelector';
import { EarningsData } from '@/types/earnings';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const [earningsData, setEarningsData] = useState<EarningsData>({});
  const { t } = useLanguage();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('wolt-earnings-data');
    if (savedData) {
      setEarningsData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever earningsData changes
  useEffect(() => {
    localStorage.setItem('wolt-earnings-data', JSON.stringify(earningsData));
  }, [earningsData]);

  const addDailyEntry = (date: string, entry: any) => {
    const monthKey = date.substring(0, 7); // YYYY-MM format
    
    setEarningsData(prev => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        [date]: entry
      }
    }));
  };

  const deleteDailyEntry = (monthKey: string, date: string) => {
    setEarningsData(prev => {
      const newData = { ...prev };
      if (newData[monthKey]) {
        const newMonthData = { ...newData[monthKey] };
        delete newMonthData[date];
        
        // If the month has no more entries, remove the month entirely
        if (Object.keys(newMonthData).length === 0) {
          delete newData[monthKey];
        } else {
          newData[monthKey] = newMonthData;
        }
      }
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{t('app.title')}</h1>
            <p className="text-cyan-400 text-lg">{t('app.subtitle')}</p>
          </div>
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger 
              value="daily" 
              className="text-slate-300 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              {t('tabs.daily')}
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className="text-slate-300 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              {t('tabs.current')}
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-slate-300 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              {t('tabs.history')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <DailyInput onAddEntry={addDailyEntry} earningsData={earningsData} />
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <MonthlyView earningsData={earningsData} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryView earningsData={earningsData} onDeleteEntry={deleteDailyEntry} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
