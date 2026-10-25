import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sprout,
  Bell,
  MapPin,
  Globe,
  Home,
  Bot,
  Store,
  FileText,
  MessageSquare,
  Menu,
  ChevronRight,
  ChevronDown,
  CloudSun,
  Droplets,
  Wind,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Tractor,
  GraduationCap,
  BookOpen,
  Building2,
  X,
  Check,
  Megaphone,
  User,
  SlidersHorizontal,
  ChevronLeft,
  CheckCircle2,
  Navigation,
  Compass,
  Loader2,
  HelpCircle,
  Info,
  LogIn,
  UserCircle
} from 'lucide-react';
import { LanguageCode } from '../layout/Navbar';
import { QuickLinksGrid } from './QuickLinksGrid';
import { HeroCarousel } from './HeroCarousel';
import { RightSidebar } from './RightSidebar';
import { useAuth } from '../../hooks/useAuth';

interface GovPortalHomeProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  lang: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  onOpenLogin?: () => void;
}

export const GovPortalHome: React.FC<GovPortalHomeProps> = ({ onNavigateTab, lang, onSelectLang, onOpenLogin }) => {
  const { user, profile, signOut } = useAuth();
  // Mobile & Location States (Automatic Geolocation)
  const [userLocation, setUserLocation] = useState<string>('Bilaspur, Chhattisgarh');
  const [locationStatus, setLocationStatus] = useState<'loading' | 'auto' | 'default' | 'denied'>('loading');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMoreMenuModal, setShowMoreMenuModal] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [activeDesktopTab, setActiveDesktopTab] = useState<'about' | 'features' | 'advisory' | 'success'>('about');

  // Automatic Browser Geolocation Detector
  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('default');
      setUserLocation('Bilaspur, Chhattisgarh');
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const district = address.state_district || address.county || address.city || address.town || address.village || address.suburb || 'Local District';
            const state = address.state || 'India';
            
            setUserLocation(`${district}, ${state}`);
            setLocationStatus('auto');
          } else {
            setUserLocation(`GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
            setLocationStatus('auto');
          }
        } catch {
          setUserLocation(`Bilaspur, Chhattisgarh`);
          setLocationStatus('auto');
        }
      },
      (error) => {
        console.log('Location permission info:', error.message);
        setLocationStatus('denied');
        setUserLocation('Bilaspur, Chhattisgarh');
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  }, []);

  // Request/Detect location automatically on mount
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  const drawerNavItems = [
    { id: 'home', labelHi: 'मुख्य पृष्ठ', labelEn: 'Home', labelHinglish: 'Home', icon: '🟢', color: 'text-emerald-700' },
    { id: 'ai-advisor', labelHi: 'एआई सलाहकार', labelEn: 'AI Advisor', labelHinglish: 'AI Advisor', icon: '🤖', color: 'text-sky-700' },
    { id: 'mandi', labelHi: 'मंडी भाव', labelEn: 'Mandi Rates', labelHinglish: 'Mandi Bhav', icon: '📊', color: 'text-amber-700' },
    { id: 'schemes', labelHi: 'योजनाएँ', labelEn: 'Farmer Schemes', labelHinglish: 'Kisan Yojana', icon: '📜', color: 'text-orange-700' },
    { id: 'university', labelHi: 'वैज्ञानिक संवाद', labelEn: 'Scientist Connect', labelHinglish: 'Scientist Connect', icon: '🧪', color: 'text-purple-700' },
    { id: 'farm', labelHi: 'मेरा खेत', labelEn: 'My Farm', labelHinglish: 'Mera Khet', icon: '🌱', color: 'text-lime-700' },
    { id: 'marketplace', labelHi: 'खरीद-बिक्री', labelEn: 'Buy & Sell', labelHinglish: 'Buy & Sell', icon: '🏬', color: 'text-amber-800' },
    { id: 'university', labelHi: 'विश्वविद्यालय कनेक्ट', labelEn: 'University Connect', labelHinglish: 'University Connect', icon: '🎓', color: 'text-emerald-800' },
    { id: 'services', labelHi: 'सेवाएं एवं मानचित्र', labelEn: 'Services & Map', labelHinglish: 'Services & Map', icon: '📍', color: 'text-teal-700' },
    { id: 'business', labelHi: 'व्यापार पोर्टल', labelEn: 'Business Portal', labelHinglish: 'Business Portal', icon: '💼', color: 'text-stone-700' },
    { id: 'admin', labelHi: 'प्रशासन / लॉगिन', labelEn: 'Admin / Login', labelHinglish: 'Admin / Login', icon: '⚙️', color: 'text-amber-900' }
  ];

  const heroSlides = [
    {
      tag: lang === 'hi' ? 'स्वतंत्र डिजिटल कृषि मंच' : 'Independent Digital Agri Platform',
      headline: lang === 'hi' ? 'खेती एआई — राष्ट्रीय कृषि सूचना एवं किसान मंच' : 'Kheti AI — National Agriculture Intelligence Platform',
      subtitle: lang === 'hi' ? 'किसान, मंडी भाव, मौसम पूर्वानुमान एवं सभी खरीद-बिक्री की जानकारी एक ही डिजिटल मंच पर' : 'One unified platform for farmers, APMC mandi rates, weather forecast, and produce trade',
      cta1: lang === 'hi' ? 'एआई सलाहकार से बात करें' : 'Talk to AI Advisor',
      cta1Action: 'ai-advisor',
      cta2: lang === 'hi' ? 'किसान योजनाएं' : 'Farmer Schemes',
      cta2Action: 'schemes'
    },
    {
      tag: lang === 'hi' ? 'एगमार्कनेट लाइव ट्रैक' : 'Agmarknet Live Feed',
      headline: lang === 'hi' ? 'दैनिक एगमार्कनेट एवं थोक मंडी भाव' : 'Daily Wholesale Mandi & Agmarknet Rates',
      subtitle: lang === 'hi' ? 'गेहूं, बासमती धान, सरसों व मक्का के वास्तविक मंडी भावों की तुलना करें' : 'Compare real-time market prices for Wheat, Basmati Paddy, Mustard & Maize',
      cta1: lang === 'hi' ? 'आज के मंडी भाव देखें' : 'View Mandi Rates',
      cta1Action: 'mandi',
      cta2: lang === 'hi' ? 'खरीद-बिक्री मंच' : 'Trade Marketplace',
      cta2Action: 'marketplace'
    },
    {
      tag: lang === 'hi' ? 'एआई फसल डॉक्टर' : 'AI Crop Doctor',
      headline: lang === 'hi' ? 'पत्ती की फोटो से 5 सेकंड में रोग निदान' : '5-Second Crop Leaf Disease Diagnosis',
      subtitle: lang === 'hi' ? 'भारतीय कृषि अनुसंधान परिषद (ICAR) प्रमाणित उपचार व वैज्ञानिक सलाह' : 'ICAR-guided organic & chemical treatment recommendations',
      cta1: lang === 'hi' ? 'फसल डॉक्टर प्रयोग करें' : 'Try Crop Doctor',
      cta1Action: 'ai-advisor',
      cta2: lang === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Forecast',
      cta2Action: 'weather'
    }
  ];

  // Auto carousel timer for mobile hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Mandi Rates list for Desktop & Mobile
  const mandiRatesList = [
    {
      id: 'paddy',
      cropHi: lang === 'hi' ? 'धान (Paddy)' : 'Paddy (Dhan)',
      mandiHi: `${userLocation.split(',')[0]} ${lang === 'hi' ? 'मंडी' : 'Mandi'}`,
      price: '₹2,369',
      unit: lang === 'hi' ? '/ क्विंटल' : '/ qtl',
      change: '+127 (5.7%)',
      isUp: true,
      iconBg: 'bg-amber-100 text-amber-900 border-amber-300',
      iconEmoji: '🌾'
    },
    {
      id: 'maize',
      cropHi: lang === 'hi' ? 'मक्का (Maize)' : 'Maize (Makka)',
      mandiHi: `${userLocation.split(',')[0]} ${lang === 'hi' ? 'मंडी' : 'Mandi'}`,
      price: '₹2,225',
      unit: lang === 'hi' ? '/ क्विंटल' : '/ qtl',
      change: '-35 (1.5%)',
      isUp: false,
      iconBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      iconEmoji: '🌽'
    },
    {
      id: 'wheat',
      cropHi: lang === 'hi' ? 'गेहूं (Wheat)' : 'Wheat (Gehun)',
      mandiHi: `${userLocation.split(',')[0]} ${lang === 'hi' ? 'मंडी' : 'Mandi'}`,
      price: '₹2,425',
      unit: lang === 'hi' ? '/ क्विंटल' : '/ qtl',
      change: '+50 (2.1%)',
      isUp: true,
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconEmoji: '🌾'
    }
  ];

  return (
    <div className="w-full space-y-4">

      {/* ========================================================================= */}
      {/* 📱 MOBILE HOMEPAGE VIEW (< md) — Strictly matching Reference Mockup Image */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3.5 pb-16">



        {/* 2. AUTOMATIC GPS LOCATION DISPLAY & LANGUAGE BAR */}
        <div className="flex items-center justify-between gap-2">
          {/* Automatic Location Status Display */}
          <button
            onClick={detectUserLocation}
            className="flex-1 bg-white border border-stone-200 rounded-full px-3 py-1.5 flex items-center justify-between text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer group"
            title="Click to refresh GPS location"
          >
            <div className="flex items-center gap-1.5 truncate">
              {locationStatus === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin shrink-0" />
              ) : locationStatus === 'auto' ? (
                <Navigation className="w-3.5 h-3.5 text-emerald-700 fill-emerald-100 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              )}
              <span className="truncate">{userLocation}</span>
            </div>

            {/* GPS Live / Default Status Indicator Pill */}
            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ml-1 ${
              locationStatus === 'loading'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : locationStatus === 'auto'
                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                : 'bg-stone-100 text-stone-700 border border-stone-300'
            }`}>
              {locationStatus === 'loading' ? 'GPS...' : locationStatus === 'auto' ? 'GPS Active' : 'Default'}
            </span>
          </button>

          {/* Language Selector Pill */}
          <button
            onClick={() => setShowMoreMenuModal(true)}
            className="bg-amber-50 border border-amber-300 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-950 shadow-2xs hover:bg-amber-100 transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'hi' ? 'हिंदी' : lang === 'hinglish' ? 'Hinglish' : 'English'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </div>

        {/* 3. 6 TOP CATEGORY NAVIGATION CARDS (2 Rows x 3 Columns) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: Home (Active Green Box) */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-emerald-800 text-white rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs hover:bg-emerald-900 transition-all h-[68px]"
          >
            <Home className="w-5 h-5 text-white mb-1" />
            <span className="text-[11px] font-bold leading-none">{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </button>

          {/* Card 2: AI Advisor */}
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="bg-amber-50/90 border border-amber-200/90 text-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-amber-100 transition-all h-[68px]"
          >
            <Sprout className="w-5 h-5 text-emerald-800 mb-1" />
            <span className="text-[11px] font-bold leading-none">{lang === 'hi' ? 'एआई सलाहकार' : 'AI Advisor'}</span>
          </button>

          {/* Card 3: Mandi Rates */}
          <button
            onClick={() => onNavigateTab('mandi')}
            className="bg-amber-50/90 border border-amber-200/90 text-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-amber-100 transition-all h-[68px]"
          >
            <Store className="w-5 h-5 text-amber-800 mb-1" />
            <span className="text-[11px] font-bold leading-none">{lang === 'hi' ? 'मंडी भाव' : lang === 'hinglish' ? 'Mandi Bhav' : 'Mandi Rates'}</span>
          </button>

          {/* Card 4: Schemes */}
          <button
            onClick={() => onNavigateTab('schemes')}
            className="bg-amber-50/90 border border-amber-200/90 text-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-amber-100 transition-all h-[68px]"
          >
            <FileText className="w-5 h-5 text-orange-800 mb-1" />
            <span className="text-[11px] font-bold leading-none">{lang === 'hi' ? 'योजनाएँ' : lang === 'hinglish' ? 'Kisan Yojana' : 'Schemes'}</span>
          </button>

          {/* Card 5: Scientist Desk */}
          <button
            onClick={() => onNavigateTab('university')}
            className="bg-amber-50/90 border border-amber-200/90 text-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-amber-100 transition-all h-[68px]"
          >
            <MessageSquare className="w-5 h-5 text-purple-800 mb-1" />
            <span className="text-[11px] font-bold leading-none">{lang === 'hi' ? 'वैज्ञानिक संवाद' : 'Scientist Desk'}</span>
          </button>

          {/* Card 6: More Menu */}
          <button
            onClick={() => setShowMoreMenuModal(true)}
            className="bg-amber-50/90 border border-amber-200/90 text-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-amber-100 transition-all h-[68px]"
          >
            <Menu className="w-5 h-5 text-stone-700 mb-1" />
            <span className="text-[11px] font-bold leading-none">{lang === 'hi' ? 'अधिक' : 'More'}</span>
          </button>
        </div>

        {/* 4. FLASH UPDATE NOTICE TICKER BAR */}
        <div 
          onClick={() => onNavigateTab('schemes')}
          className="bg-amber-100/90 border border-amber-300/80 rounded-xl p-2 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-200/80 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-orange-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
              {lang === 'hi' ? 'ताजा अपडेट' : 'Flash Update'}
            </span>
            <span className="text-[11px] font-bold text-amber-950 truncate">
              {lang === 'hi'
                ? 'फसल बीमा योजना (PMFBY) के तहत रबी बीमा नामांकन की अंतिम तिथि 31 दिसंबर है।'
                : 'Rabi crop insurance enrollment under PMFBY deadline is December 31.'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-900 shrink-0 ml-1" />
        </div>

        {/* 5. HERO CAROUSEL BANNER CARD (Saffron Rich Gradient with Watermark Graphic) */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl p-4 shadow-md overflow-hidden min-h-[220px] flex flex-col justify-between">
          {/* Subtle Watermark Graphic */}
          <div className="absolute right-[-10px] bottom-[-10px] w-48 h-48 opacity-15 pointer-events-none rounded-full border-8 border-white flex items-center justify-center">
            <Sprout className="w-32 h-32 text-white" />
          </div>

          <div>
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs border border-white/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-amber-50 mb-2">
              <Sprout className="w-3 h-3 text-amber-200" />
              <span>{heroSlides[currentHeroSlide].tag}</span>
            </div>

            {/* Headline */}
            <h2 className="text-lg font-extrabold text-white leading-tight drop-shadow-xs">
              {heroSlides[currentHeroSlide].headline}
            </h2>

            {/* Subtitle */}
            <p className="text-xs text-amber-100 font-medium leading-relaxed mt-1 line-clamp-2">
              {heroSlides[currentHeroSlide].subtitle}
            </p>
          </div>

          {/* Action Buttons & Carousel Navigation */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab(heroSlides[currentHeroSlide].cta1Action)}
                className="bg-white hover:bg-amber-50 text-orange-950 px-3.5 py-2 rounded-lg text-xs font-extrabold shadow-sm flex items-center gap-1 transition-all active:scale-95"
              >
                <span>{heroSlides[currentHeroSlide].cta1}</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-950" />
              </button>

              <button
                onClick={() => onNavigateTab(heroSlides[currentHeroSlide].cta2Action)}
                className="bg-white/15 hover:bg-white/25 border border-white/40 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
              >
                {heroSlides[currentHeroSlide].cta2}
              </button>
            </div>

            {/* Bottom Dots & Chevron Controls */}
            <div className="flex items-center justify-between pt-1 border-t border-white/20">
              <div className="flex items-center gap-1">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentHeroSlide === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentHeroSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                  className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. TODAY'S WEATHER WIDGET ("आज का मौसम") */}
        <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-150 pb-2">
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-stone-900 text-xs">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span>{lang === 'hi' ? 'आज का मौसम' : 'Today\'s Weather'}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-stone-500 font-semibold mt-0.5">
                <Navigation className="w-3 h-3 text-emerald-700" />
                <span>{userLocation}</span>
                <ChevronRight className="w-3 h-3 text-stone-400" />
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('weather')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-0.5 transition-colors"
            >
              <span>{lang === 'hi' ? '7 दिन का पूर्वानुमान' : '7-Day Forecast'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Weather Details Row */}
          <div className="grid grid-cols-3 gap-2 items-center text-stone-900">
            {/* Temp */}
            <div className="col-span-1 border-r border-stone-200 pr-2">
              <div className="text-2xl font-black font-mono leading-none">29°C</div>
              <div className="text-[10px] text-stone-700 font-bold mt-1">{lang === 'hi' ? 'आंशिक बादल' : 'Partly Cloudy'}</div>
              <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'महसूस 32° C' : 'Feels 32°C'}</div>
            </div>

            {/* Rain Prob */}
            <div className="col-span-1 text-center border-r border-stone-200 pr-2">
              <div className="flex items-center justify-center gap-1 text-sky-700 font-mono font-extrabold text-sm">
                <Droplets className="w-3.5 h-3.5 fill-sky-500 text-sky-600" />
                <span>20%</span>
              </div>
              <div className="text-[10px] text-stone-600 font-medium mt-1">{lang === 'hi' ? 'बारिश की संभावना' : 'Rain Chance'}</div>
            </div>

            {/* Wind */}
            <div className="col-span-1 text-center">
              <div className="flex items-center justify-center gap-1 text-stone-800 font-mono font-extrabold text-sm">
                <Wind className="w-3.5 h-3.5 text-stone-600" />
                <span>12 km/h</span>
              </div>
              <div className="text-[10px] text-stone-600 font-medium mt-1">{lang === 'hi' ? 'हवा की गति' : 'Wind Speed'}</div>
            </div>
          </div>
        </div>

        {/* 7. TODAY'S MANDI RATES WIDGET ("आज के मंडी भाव") */}
        <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-stone-150 pb-2">
            <div className="flex items-center gap-1.5 font-extrabold text-stone-900 text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <span>{lang === 'hi' ? 'आज के मंडी भाव' : 'Today\'s Mandi Rates'}</span>
            </div>

            <button
              onClick={() => onNavigateTab('mandi')}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-0.5"
            >
              <span>{lang === 'hi' ? 'सभी भाव देखें' : 'View All Rates'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mandi Rows */}
          <div className="divide-y divide-stone-100">
            {mandiRatesList.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateTab('mandi', item.id)}
                className="py-2 flex items-center justify-between hover:bg-amber-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${item.iconBg} border flex items-center justify-center font-bold text-base shrink-0`}>
                    {item.iconEmoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{item.cropHi}</div>
                    <div className="text-[10px] text-stone-500 font-medium">{item.mandiHi}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-stone-900 font-mono">
                    {item.price} <span className="text-[9px] text-stone-500 font-normal">{item.unit}</span>
                  </div>
                  <div className={`text-[10px] font-bold font-mono ${item.isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {item.isUp ? '▲ ' : '▼ '}{item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. QUICK SERVICES GRID 2x3 ("त्वरित सेवाएं") */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-extrabold text-stone-900">{lang === 'hi' ? 'त्वरित सेवाएं' : 'Quick Services'}</h3>
            <button
              onClick={() => onNavigateTab('services')}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-0.5"
            >
              <span>{lang === 'hi' ? 'सभी सेवाएं देखें' : 'View All Services'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: Mandi */}
            <button
              onClick={() => onNavigateTab('mandi')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{lang === 'hi' ? 'मंडी भाव' : 'Mandi Rates'}</div>
                  <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'ताजा भाव देखें' : 'Check latest prices'}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* Card 2: Weather */}
            <button
              onClick={() => onNavigateTab('weather')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{lang === 'hi' ? 'मौसम' : 'Weather'}</div>
                  <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'अपने क्षेत्र का पूर्वानुमान' : 'Local weather forecast'}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* Card 3: Crop Doctor */}
            <button
              onClick={() => onNavigateTab('ai-advisor')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{lang === 'hi' ? 'फसल डॉक्टर' : 'Crop Doctor'}</div>
                  <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'फसल की समस्या पहचानें' : 'Diagnose plant issues'}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* Card 4: Govt Schemes */}
            <button
              onClick={() => onNavigateTab('schemes')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{lang === 'hi' ? 'सरकारी योजनाएँ' : 'Govt Schemes'}</div>
                  <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'पात्रता जाँचें और लाभ पाएँ' : 'Check eligibility & apply'}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* Card 5: My Farm */}
            <button
              onClick={() => onNavigateTab('farm')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-lime-50 border border-lime-200 text-lime-900 flex items-center justify-center font-bold">
                  <Tractor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{lang === 'hi' ? 'मेरा खेत' : 'My Farm'}</div>
                  <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'अपनी फसल और रिकॉर्ड' : 'My crop records'}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* Card 6: Marketplace */}
            <button
              onClick={() => onNavigateTab('marketplace')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{lang === 'hi' ? 'खरीद-बिक्री' : 'Buy & Sell'}</div>
                  <div className="text-[9px] text-stone-500 font-medium">{lang === 'hi' ? 'उपज बेचें / खरीदें' : 'Trade farm produce'}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* 9. FLASH NEWS BULLETIN CARD ("ताजा समाचार / सूचना पटल") */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-950 text-xs">
              <Megaphone className="w-4 h-4 text-orange-600" />
              <span>{lang === 'hi' ? 'ताजा समाचार / सूचना पटल' : 'Latest Agri News & Notice Board'}</span>
            </div>

            <button
              onClick={() => onNavigateTab('schemes')}
              className="text-[11px] font-bold text-amber-900 hover:text-amber-950 flex items-center gap-0.5"
            >
              <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div 
            onClick={() => onNavigateTab('schemes')}
            className="p-2.5 bg-white border border-amber-200 rounded-xl space-y-1.5 cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs font-bold text-stone-900 leading-snug flex items-start gap-1.5">
                <span className="text-orange-600 text-sm leading-none">◆</span>
                <span>{lang === 'hi' ? 'रबी फसल 2026-27 के लिए गेहूं का न्यूनतम समर्थन मूल्य (MSP) ₹2,425/क्विंटल घोषित किया गया' : 'Wheat MSP declared at ₹2,425/quintal for Rabi season 2026-27'}</span>
              </div>
              <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shrink-0">
                NEW
              </span>
            </div>
            <div className="text-[10px] text-stone-500 font-medium pl-3.5">
              17 Oct 2026 · APMC Feed
            </div>
          </div>
        </div>



      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP HOMEPAGE VIEW (>= md) — Rich Institutional Portal Structure   */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">

        {/* 1. Top Quick Category Grid */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight">
              {lang === 'hi' ? 'त्वरित सेवाएं (Quick Actions)' : 'Quick Services & Portals'}
            </h2>
            <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              24x7 Live Feeds
            </span>
          </div>
          <QuickLinksGrid lang={lang} onNavigateTab={onNavigateTab} />
        </div>

        {/* 2. Hero Carousel Banner */}
        <HeroCarousel lang={lang} onNavigateTab={onNavigateTab} />

        {/* 3. QUICK ACCESS FEATURE CARDS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
              {lang === 'hi' ? 'विशेष सुविधाएं (Quick Access)' : 'Quick Access Features'}
            </h3>
            <button
              onClick={() => onNavigateTab('ai-advisor')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-0.5"
            >
              <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Card 1 */}
            <button
              onClick={() => onNavigateTab('ai-advisor')}
              className="bg-white border border-stone-200/90 hover:border-emerald-500 rounded-2xl p-3.5 shadow-2xs text-left transition-all group flex flex-col justify-between h-[110px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-extrabold text-amber-950 bg-amber-400 px-1.5 py-0.2 rounded-full">AI 24x7</span>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                  {lang === 'hi' ? 'फसल पत्ती रोग स्कैनर' : 'Leaf Disease Scanner'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                  {lang === 'hi' ? 'पत्ती की फोटो से 5 सेकंड में निदान' : 'Instant AI Plant Pathology'}
                </div>
              </div>
            </button>

            {/* Card 2 */}
            <button
              onClick={() => onNavigateTab('services')}
              className="bg-white border border-stone-200/90 hover:border-emerald-500 rounded-2xl p-3.5 shadow-2xs text-left transition-all group flex flex-col justify-between h-[110px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">WDRA</span>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                  {lang === 'hi' ? 'गोदाम व कोल्ड स्टोरेज' : 'Godown & Cold Storage'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                  {lang === 'hi' ? 'सत्यापित नजदीकी वेयरहाउस बुक करें' : 'Reserve WDRA Warehouses'}
                </div>
              </div>
            </button>

            {/* Card 3 */}
            <button
              onClick={() => onNavigateTab('university')}
              className="bg-white border border-stone-200/90 hover:border-emerald-500 rounded-2xl p-3.5 shadow-2xs text-left transition-all group flex flex-col justify-between h-[110px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center font-bold text-sm group-hover:bg-purple-800 group-hover:text-white transition-colors">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full">ICAR</span>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                  {lang === 'hi' ? 'विश्वविद्यालय वैज्ञानिक' : 'Scientist Desk'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                  {lang === 'hi' ? '42 कृषि विश्वविद्यालयों से परामर्श' : 'Ask University Faculty'}
                </div>
              </div>
            </button>

            {/* Card 4 */}
            <button
              onClick={() => onNavigateTab('schemes')}
              className="bg-white border border-stone-200/90 hover:border-emerald-500 rounded-2xl p-3.5 shadow-2xs text-left transition-all group flex flex-col justify-between h-[110px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 flex items-center justify-center font-bold text-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">Govt</span>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                  {lang === 'hi' ? 'पीएम-किसान योजना स्टेटस' : 'PM-Kisan Eligibility'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                  {lang === 'hi' ? '19वीं किश्त व सब्सिडी कैलकुलेटर' : '19th Installment Checker'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 4. ALL MANDI RATES TABLE */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-150">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-800" />
                <span>{lang === 'hi' ? 'दैनिक मॉडल भाव (All Mandi Rates)' : 'Wholesale Mandi Rates Today'}</span>
              </h3>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Agmarknet APMC Real-time Feeds
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('mandi')}
              className="flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-xs font-bold border border-stone-200 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-800" />
              <span>FILTER · SORT</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {mandiRatesList.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateTab('mandi', item.id)}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-amber-50/50 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                    {item.iconEmoji}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {item.cropHi}
                    </div>
                    <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <Store className="w-3 h-3 text-stone-400" />
                      <span>{item.mandiHi}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-stone-900 font-mono">
                    {item.price} <span className="text-xs text-stone-500 font-normal">{item.unit}</span>
                  </div>
                  <div className={`text-xs font-bold font-mono ${item.isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('mandi')}
            className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-emerald-900 border border-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <span>{lang === 'hi' ? 'सभी 2500+ मंडियों के भाव देखें' : 'View All 2500+ Mandi Price Feeds'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5. 2-COLUMN MAIN PORTAL LAYOUT */}
        <div className="grid grid-cols-12 gap-5 pt-2">
          {/* Left Column */}
          <div className="col-span-8 space-y-4">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-1 border-b border-stone-200 pb-2">
                <button
                  onClick={() => setActiveDesktopTab('about')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${
                    activeDesktopTab === 'about'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'खेती एआई परिचय' : 'About Kheti AI'}
                </button>
                <button
                  onClick={() => setActiveDesktopTab('features')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${
                    activeDesktopTab === 'features'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'मुख्य विशेषताएं' : 'Core Features'}
                </button>
                <button
                  onClick={() => setActiveDesktopTab('advisory')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${
                    activeDesktopTab === 'advisory'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'कृषि सलाह' : 'ICAR Advisory'}
                </button>
                <button
                  onClick={() => setActiveDesktopTab('success')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${
                    activeDesktopTab === 'success'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'किसान अनुभव' : 'Success Stories'}
                </button>
              </div>

              <div className="mt-3 p-4 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                {activeDesktopTab === 'about' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-amber-900">
                        {lang === 'hi' ? 'खेती एआई — राष्ट्रीय कृषि आसूचना एवं किसान मंच' : 'About Kheti AI Platform'}
                      </h4>
                      <span className="text-[10px] text-stone-700 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                        Open Public Agri Network
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {lang === 'hi'
                        ? 'खेती एआई एक स्वतंत्र व समर्पित कृषि मंच है जो किसानों को वास्तविक समय के मंडी भावों, स्थानीय मौसम, फसल रोग निदान और पारदर्शी खरीद-बिक्री से जोड़ता है।'
                        : 'Kheti AI is an independent, farmer-first platform designed to bridge information asymmetry across rural agriculture through voice AI, Agmarknet price tracking, and escrow trade.'}
                    </p>
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                      <div className="p-2 bg-white rounded-xl border border-stone-200">
                        <span className="font-bold text-amber-800 text-sm font-mono">1,42,500+</span>
                        <span className="text-[10px] text-stone-600 block">{lang === 'hi' ? 'सत्यापित किसान' : 'Active Farmers'}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-stone-200">
                        <span className="font-bold text-emerald-800 text-sm font-mono">2,500+</span>
                        <span className="text-[10px] text-stone-600 block">{lang === 'hi' ? 'मंडियां लाइव' : 'Mandis Tracked'}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-stone-200">
                        <span className="font-bold text-amber-800 text-sm font-mono">8,420+</span>
                        <span className="text-[10px] text-stone-600 block">{lang === 'hi' ? 'सत्यापित व्यापारी' : 'Verified Millers'}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-stone-200">
                        <span className="font-bold text-emerald-800 text-sm font-mono">100%</span>
                        <span className="text-[10px] text-stone-600 block">{lang === 'hi' ? 'सुरक्षित भुगतान' : 'Escrow Protected'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDesktopTab === 'features' && (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-stone-900">
                      {lang === 'hi' ? 'मंच की 4 प्रमुख सुविधाएं:' : 'The 4 Pillars of Kheti AI:'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white rounded-xl border border-stone-200">
                        <strong className="text-amber-800 block font-bold">1. केंद्रीय एआई सलाहकार</strong>
                        <span className="text-stone-700">हिंदी voice व पत्ती की फोटो से फसल रोग समाधान।</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-stone-200">
                        <strong className="text-emerald-800 block font-bold">2. लाइव मंडी भाव</strong>
                        <span className="text-stone-700">देश भर के थोक कृषि मंडियों के दैनिक मॉडल भाव।</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDesktopTab === 'advisory' && (
                  <div className="space-y-2 text-xs text-stone-700">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>भारतीय कृषि अनुसंधान परिषद (ICAR) परामर्श</span>
                    </div>
                    <p>रबी फसलों (गेहूं, सरसों, चना) में संतुलित पोषण प्रबंधन सुनिश्चित करें।</p>
                  </div>
                )}

                {activeDesktopTab === 'success' && (
                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="font-bold text-stone-900">किसान अनुभव: श्री रामेश्वर सिंह, करनाल</div>
                    <p className="italic">
                      "Kheti AI के जरिए मैंने अपने 140 क्विंटल बासमती धान के लिए पानीपत की मिल से सीधा सौदा किया।"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column Sidebar */}
          <div className="col-span-4">
            <RightSidebar lang={lang} onNavigateTab={onNavigateTab} />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🔮 MODALS & SLIDE-OVER NAVIGATION DRAWER (Screen 2 Mockup Match) */}
      {/* ========================================================================= */}

      {/* 1. Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>महत्वपूर्ण सूचनाएं (Notifications)</span>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>PM-Kisan 19th Installment Update</span>
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded">Live</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  19वीं किश्त के लिए ई-केवाईसी (e-KYC) आधार सीडिंग अनिवार्य है। अपनी स्थिति जांचें।
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900">Mandi Price Surge Notice</div>
                <p className="text-[11px] text-stone-600">
                  {userLocation.split(',')[0]} मंडी में बासमती धान 1121 के भाव में ₹120/क्विंटल की तेजी दर्ज की गई।
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowNotificationModal(false);
                onNavigateTab('schemes');
              }}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              योजनाएं व स्थिति देखें
            </button>
          </div>
        </div>
      )}

      {/* 2. Slide-Over Navigation Drawer (Exact Match to Screen 2 of Mockup) */}
      {showMoreMenuModal && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-xs flex animate-fade-in">
          <div className="bg-white w-[82%] max-w-xs h-full overflow-y-auto shadow-2xl p-4 space-y-4 text-stone-900 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-700 bg-emerald-50/50 flex flex-col items-center justify-center text-center shrink-0">
                    <Sprout className="w-4 h-4 text-emerald-800" />
                    <span className="text-[5.5px] font-extrabold uppercase text-emerald-900 tracking-tighter leading-none mt-0.5">
                      KHETI AI
                    </span>
                  </div>
                  <div>
                    <h2 className="font-extrabold text-stone-900 text-xs leading-tight">
                      राष्ट्रीय कृषि सूचना एवं किसान मंच
                    </h2>
                    <p className="text-[8px] font-bold text-stone-600 uppercase tracking-tight mt-0.5">
                      NATIONAL AGRICULTURE INTELLIGENCE PLATFORM
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowMoreMenuModal(false)}
                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Login / User Profile Card */}
              <div className="pt-2">
                {user ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <UserCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-emerald-900 truncate">{profile?.name || user.email}</div>
                        <div className="text-[10px] text-emerald-700">Online Account</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { signOut(); setShowMoreMenuModal(false); }}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowMoreMenuModal(false);
                      if (onOpenLogin) onOpenLogin();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'खेती खाते में लॉगिन (Login / Google)' : 'Login / Continue with Google'}</span>
                  </button>
                )}
              </div>

              {/* Drawer Menu Items List */}
              <div className="space-y-1 pt-1">
                {drawerNavItems.map((item, idx) => {
                  const itemLabel = lang === 'hi' ? item.labelHi : lang === 'hinglish' ? item.labelHinglish : item.labelEn;
                  return (
                    <button
                      key={item.id + '_' + idx}
                      onClick={() => {
                        setShowMoreMenuModal(false);
                        onNavigateTab(item.id);
                      }}
                      className="w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-colors text-stone-800 hover:bg-stone-50"
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{itemLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Utilities */}
            <div className="pt-3 border-t border-stone-200 space-y-1">
              <button
                onClick={() => {
                  if (onSelectLang) {
                    const nextLang = lang === 'hi' ? 'en' : lang === 'en' ? 'hinglish' : 'hi';
                    onSelectLang(nextLang);
                  }
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-stone-800 hover:bg-amber-50 border border-stone-200 flex items-center justify-between transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>
                    {lang === 'hi' ? 'भाषा बदलें (हिन्दी)' : lang === 'hinglish' ? 'Change Language (Hinglish)' : 'Change Language (English)'}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full">
                  {lang === 'hi' ? 'HI' : lang === 'hinglish' ? 'HING' : 'EN'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenuModal(false);
                  onNavigateTab('ai-advisor');
                }}
                className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-stone-500" />
                  <span>{lang === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => {
                  setShowMoreMenuModal(false);
                  onNavigateTab('legal-about');
                }}
                className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-stone-500" />
                  <span>{lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
