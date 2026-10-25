import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  CloudSun, 
  ShoppingBag, 
  Tractor, 
  BookOpen,
  FlaskConical,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { LanguageCode } from '../layout/Navbar';

interface QuickLinksGridProps {
  lang: LanguageCode;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const QuickLinksGrid: React.FC<QuickLinksGridProps> = ({ lang, onNavigateTab }) => {
  const quickActions = [
    {
      id: 'mandi',
      icon: TrendingUp,
      titleHi: 'दैनिक मंडी भाव',
      titleEn: 'Mandi Rates',
      subHi: '2500+ मंडियां',
      subEn: 'Agmarknet APMC',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200'
    },
    {
      id: 'ai-advisor',
      icon: Sparkles,
      titleHi: 'एआई सलाहकार',
      titleEn: 'AI Voice',
      subHi: 'बोलकर पूछें',
      subEn: 'Voice & Scanner',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'weather',
      icon: CloudSun,
      titleHi: 'मौसम व स्प्रे',
      titleEn: 'Weather Radar',
      subHi: 'स्प्रे खिड़की',
      subEn: 'IMD Alert',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-800',
      borderColor: 'border-sky-200'
    },
    {
      id: 'marketplace',
      icon: ShoppingBag,
      titleHi: 'फसल खरीद-बिक्री',
      titleEn: 'Marketplace',
      subHi: 'सीधी सौदेबाजी',
      subEn: 'Direct Trade',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    {
      id: 'services',
      icon: Tractor,
      titleHi: 'गोदाम व यंत्र',
      titleEn: 'Storage & Rent',
      subHi: 'सत्यापित किराएदार',
      subEn: 'Machinery',
      bgColor: 'bg-stone-100',
      textColor: 'text-stone-800',
      borderColor: 'border-stone-200'
    },
    {
      id: 'schemes',
      icon: BookOpen,
      titleHi: 'किसान योजनाएं',
      titleEn: 'Farmer Schemes',
      subHi: 'पीएम किसान',
      subEn: 'PM Kisan Subsidy',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-2">
      {/* Groww-style 3-Column Grid for Mobile (< md), expands to 6 columns on md */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => onNavigateTab(action.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="p-2 sm:p-3 bg-white border border-stone-200/90 hover:border-emerald-500 rounded-xl sm:rounded-2xl shadow-2xs text-center group transition-all flex flex-col items-center justify-center min-h-[95px] sm:min-h-[110px]"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${action.bgColor} ${action.textColor} border ${action.borderColor} flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors shadow-2xs shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              
              <div className="text-[11px] sm:text-xs font-bold text-stone-900 mt-1.5 leading-tight line-clamp-1">
                {lang === 'hi' ? action.titleHi : action.titleEn}
              </div>
              <div className="text-[9px] sm:text-[10px] text-stone-500 font-medium leading-tight line-clamp-1 mt-0.5">
                {lang === 'hi' ? action.subHi : action.subEn}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
