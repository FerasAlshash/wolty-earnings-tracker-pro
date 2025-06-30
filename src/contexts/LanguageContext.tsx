
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'de' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    'app.title': 'Wolt Driver',
    'app.subtitle': 'Earnings Tracker',
    'tabs.daily': 'Daily',
    'tabs.current': 'Current',
    'tabs.history': 'History',
    'history.noData': 'No historical data available.',
    'history.startTracking': 'Start tracking your earnings to see history here!',
    'history.gross': 'Gross',
    'history.net': 'Net',
    'history.days': 'Days',
    'history.hours': 'Hours',
    'history.orders': 'Orders',
    'history.dailyLog': 'Daily Work Log',
    'history.deleteEntry': 'Delete Entry',
    'history.deleteConfirm': 'Are you sure you want to delete the entry for {date}? This action cannot be undone.',
    'history.cancel': 'Cancel',
    'history.delete': 'Delete',
    'history.cash': 'Cash',
    'toast.entryDeleted': 'Entry Deleted',
    'toast.entryDeletedDesc': 'Entry for {date} has been deleted.',
    'language.select': 'Language'
  },
  de: {
    'app.title': 'Wolt Fahrer',
    'app.subtitle': 'Einnahmen Tracker',
    'tabs.daily': 'Täglich',
    'tabs.current': 'Aktuell',
    'tabs.history': 'Verlauf',
    'history.noData': 'Keine historischen Daten verfügbar.',
    'history.startTracking': 'Beginnen Sie mit der Verfolgung Ihrer Einnahmen, um den Verlauf hier zu sehen!',
    'history.gross': 'Brutto',
    'history.net': 'Netto',
    'history.days': 'Tage',
    'history.hours': 'Stunden',
    'history.orders': 'Bestellungen',
    'history.dailyLog': 'Tägliches Arbeitsprotokoll',
    'history.deleteEntry': 'Eintrag löschen',
    'history.deleteConfirm': 'Sind Sie sicher, dass Sie den Eintrag für {date} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    'history.cancel': 'Abbrechen',
    'history.delete': 'Löschen',
    'history.cash': 'Bargeld',
    'toast.entryDeleted': 'Eintrag gelöscht',
    'toast.entryDeletedDesc': 'Eintrag für {date} wurde gelöscht.',
    'language.select': 'Sprache'
  },
  ar: {
    'app.title': 'سائق وولت',
    'app.subtitle': 'متتبع الدخل',
    'tabs.daily': 'يومي',
    'tabs.current': 'الحالي',
    'tabs.history': 'التاريخ',
    'history.noData': 'لا توجد بيانات تاريخية متاحة.',
    'history.startTracking': 'ابدأ في تتبع أرباحك لرؤية التاريخ هنا!',
    'history.gross': 'إجمالي',
    'history.net': 'صافي',
    'history.days': 'أيام',
    'history.hours': 'ساعات',
    'history.orders': 'طلبات',
    'history.dailyLog': 'سجل العمل اليومي',
    'history.deleteEntry': 'حذف الإدخال',
    'history.deleteConfirm': 'هل أنت متأكد أنك تريد حذف الإدخال لـ {date}؟ لا يمكن التراجع عن هذا الإجراء.',
    'history.cancel': 'إلغاء',
    'history.delete': 'حذف',
    'history.cash': 'نقدي',
    'toast.entryDeleted': 'تم حذف الإدخال',
    'toast.entryDeletedDesc': 'تم حذف الإدخال لـ {date}.',
    'language.select': 'اللغة'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('wolt-language') as Language;
    if (savedLanguage && ['en', 'de', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wolt-language', language);
    // Set document direction for Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
