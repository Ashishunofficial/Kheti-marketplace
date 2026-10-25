import React from 'react';
import { PhoneCall, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../layout/Navbar';

interface RightSidebarProps {
  lang: LanguageCode;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ lang, onNavigateTab }) => {
  return (
    <div className="lg:col-span-4 space-y-4">

      {/* Important Links Box (Green Header) */}
      <div className="bg-white border border-emerald-700 rounded-lg overflow-hidden shadow-xs">
        {/* Box Header */}
        <div className="bg-emerald-800 px-4 py-2.5 text-white flex items-center gap-2">
          <span className="text-base">🔗</span>
          <h3 className="text-sm font-bold tracking-wide">
            {lang === 'hi' ? 'महत्वपूर्ण लिंक्स' : 'Important Links'}
          </h3>
        </div>

        {/* Links List with green arrows */}
        <div className="p-3 divide-y divide-stone-150 text-xs">
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span className="font-semibold">{lang === 'hi' ? 'खेती एआई सलाहकार (बोलकर पूछें)' : 'Kheti AI Advisor (Voice & Chat)'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('mandi')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span>{lang === 'hi' ? 'आज का ताजा मंडी भाव (Mandi Rates)' : "Today's Mandi Rates (APMC)"}</span>
          </button>

          <button
            onClick={() => onNavigateTab('schemes')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span>{lang === 'hi' ? 'सब्सिडी व योजना पात्रता जांच (Eligibility)' : 'Subsidy Eligibility Quiz'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('marketplace')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span>{lang === 'hi' ? 'अपनी फसल बेचने हेतु लिस्ट करें' : 'Post Produce for Sale'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('university')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span className="font-semibold text-emerald-950">{lang === 'hi' ? 'विश्वविद्यालय वैज्ञानिक संवाद (University Connect)' : 'University Scientist & KVK Connect'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('services')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span>{lang === 'hi' ? 'निकटतम कोल्ड स्टोरेज व गोदाम खोजें' : 'Find Cold Storage & Godown'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('farm')}
            className="w-full py-2 px-1 text-left flex items-center gap-2 text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">➔</span>
            <span>{lang === 'hi' ? 'किसान बहीखाता एवं खेत रिकॉर्ड' : 'Farmer Farm Ledger & Plots'}</span>
          </button>

          <a
            href="https://pmkisan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-1 text-left flex items-center justify-between text-stone-800 hover:text-emerald-800 hover:bg-emerald-50/50 rounded transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-bold">➔</span>
              <span>{lang === 'hi' ? 'पीएम-किसान पोर्टल (आधिकारिक लिंक)' : 'PM-KISAN Portal (Official Link)'}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>

      {/* Agricultural Market Notices & Updates Box (Restored Vibrant Orange Header!) */}
      <div className="bg-white border border-amber-500 rounded-lg overflow-hidden shadow-xs">
        {/* Box Header in Warm Orange Gradient */}
        <div className="bg-linear-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📢</span>
            <h3 className="text-sm font-bold tracking-wide">
              {lang === 'hi' ? 'ताज़ा समाचार / सूचना पट्ट' : 'Market Updates & Notices'}
            </h3>
          </div>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">Live</span>
        </div>

        {/* Notification items with NEW badges */}
        <div className="p-3 divide-y divide-stone-150 text-xs space-y-2">
          <div className="pt-1.5 first:pt-0">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold mt-0.5">❖</span>
              <div className="leading-snug">
                <span className="text-stone-800 font-medium">
                  {lang === 'hi'
                    ? 'रबी फसल 2026-27 के लिए गेहूं का न्यूनतम समर्थन मूल्य (MSP) ₹2,425/क्विंटल घोषित किया गया।'
                    : 'Wheat MSP announced at ₹2,425/quintal for Rabi marketing season 2026-27.'}
                </span>
                <span className="inline-block ml-1 px-1 py-0.2 bg-red-600 text-white text-[9px] font-extrabold uppercase rounded animate-pulse">
                  NEW
                </span>
              </div>
            </div>
            <div className="text-[10px] text-stone-700 mt-1 pl-4">17 Oct 2026 · APMC Feed</div>
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold mt-0.5">❖</span>
              <div className="leading-snug">
                <span className="text-stone-800 font-medium">
                  {lang === 'hi'
                    ? 'पीएम फसल बीमा योजना (PMFBY) के तहत रबी बीमा नामांकन की अंतिम तिथि 31 दिसंबर है।'
                    : 'PMFBY Rabi crop insurance enrolment open until 31 December.'}
                </span>
                <span className="inline-block ml-1 px-1 py-0.2 bg-red-600 text-white text-[9px] font-extrabold uppercase rounded">
                  NEW
                </span>
              </div>
            </div>
            <div className="text-[10px] text-stone-700 mt-1 pl-4">15 Oct 2026 · Agricultural Desk</div>
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold mt-0.5">❖</span>
              <div className="leading-snug">
                <span className="text-stone-800 font-medium">
                  {lang === 'hi'
                    ? 'करनाल व खन्ना मंडी में बासमती 1121 की भारी आवक; मॉडल दरें ₹4,120/क्विंटल दर्ज।'
                    : 'Heavy Basmati 1121 arrivals in Karnal & Khanna mandis; modal rate steady at ₹4,120/qtl.'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-stone-700 mt-1 pl-4">16 Oct 2026 · Agmarknet Feed</div>
          </div>
        </div>

        {/* View All Button in Warm Amber */}
        <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => onNavigateTab('schemes')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded transition-colors shadow-xs"
          >
            {lang === 'hi' ? 'सभी देखें (View All)' : 'View All Notices'}
          </button>
        </div>
      </div>

      {/* 24x7 Kisan Call Centre Helpline Box */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3.5 text-xs text-emerald-950 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block text-stone-900">
              {lang === 'hi' ? 'किसान कॉल सेंटर (टोल फ्री)' : 'Kisan Call Centre (Toll Free)'}
            </span>
            <span className="font-mono font-extrabold text-emerald-800 text-sm">1800-180-1551</span>
          </div>
        </div>
        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
          24x7 Active
        </span>
      </div>

    </div>
  );
};
