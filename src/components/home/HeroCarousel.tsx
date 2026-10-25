import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageCode } from '../layout/Navbar';

const slides = [
  {
    id: 1,
    titleEn: 'Kheti AI — National Agriculture Intelligence & Farmers Platform',
    titleHi: 'खेती एआई — राष्ट्रीय कृषि आसूचना एवं किसान मंच',
    titleHinglish: 'Kheti AI — National Agriculture Intelligence & Farmers Platform',
    subtitleEn: 'One Intelligent Platform connecting Farmers, APMC Mandis, Weather & Direct Commerce',
    subtitleHi: 'किसान, मंडी भाव, मौसम पूर्वानुमान एवं सीधी खरीद-बिक्री का साझा डिजिटल मंच',
    subtitleHinglish: 'Kisan, Mandi Bhav, Mausam aur Direct Trade ka Ek Manch',
    badgeHi: 'किसान आपका, साथ हमारा',
    badgeEn: 'Empowering Indian Agriculture',
    badgeHinglish: 'Kisan Aapka, Saath Humara',
    tagHi: 'स्वतंत्र डिजिटल कृषि मंच',
    tagEn: 'Independent Agri-Intelligence Network',
    tagHinglish: 'Digital Krishi Manch',
    ctaTextEn: 'Talk to AI Advisor',
    ctaTextHi: 'एआई सलाहकार से बात करें',
    ctaTextHinglish: 'AI Advisor se Baat Karein',
    ctaAction: 'ai-advisor',
  },
  {
    id: 2,
    titleEn: 'Real-time Agmarknet & APMC Mandi Rates',
    titleHi: 'दैनिक एगमार्कनेट एवं राज्य मंडी भाव',
    titleHinglish: 'Daily Agmarknet & Mandi Bhav',
    subtitleEn: 'Compare modal rates for Wheat, Paddy, Mustard & Pulses across Haryana, Punjab & MP',
    subtitleHi: 'गेहूं, बासमती धान, सरसों व दलहन के थोक मंडी भावों की तुलना करें व सही समय पर उपज बेचें',
    subtitleHinglish: 'Gehun, Basmati Dhan aur Sarson ke Mandi Bhav compare karein',
    badgeHi: 'पारदर्शी भाव खोज',
    badgeEn: 'Transparent Price Discovery',
    badgeHinglish: 'Sahi Mandi Rate',
    tagHi: '2500+ मंडियां लाइव कनेक्टेड',
    tagEn: '2500+ Mandis Live Tracked',
    tagHinglish: '2500+ Mandis Tracked',
    ctaTextEn: 'Check Mandi Rates',
    ctaTextHi: 'आज के मंडी भाव देखें',
    ctaTextHinglish: undefined,
    ctaAction: 'mandi',
  },
  {
    id: 3,
    titleEn: 'Direct Produce Buy & Sell Marketplace',
    titleHi: 'बिचौलिया-मुक्त सीधी कृषि खरीद एवं बिक्री',
    titleHinglish: 'Direct Produce Buy & Sell Marketplace',
    subtitleEn: 'Connect directly with verified flour mills, exporters and certified godown operators',
    subtitleHi: 'सत्यापित मिलर्स, तेल मिलों एवं थोक खरीदारों से सीधे बातचीत करें और सुरक्षित भुगतान पाएं',
    subtitleHinglish: 'Verified millers aur buyers ke saath seedha sauda karein',
    badgeHi: '100% एस्क्रो सुरक्षित भुगतान',
    badgeEn: '100% Escrow Protected Trade',
    badgeHinglish: '100% Escrow Protected',
    tagHi: 'सत्यापित किसान व व्यापारी',
    tagEn: 'Verified KYC Network',
    tagHinglish: 'Verified Network',
    ctaTextEn: 'Explore Marketplace',
    ctaTextHi: 'खरीद-बिक्री मंच देखें',
    ctaTextHinglish: undefined,
    ctaAction: 'marketplace',
  },
];

type Slide = typeof slides[0];

const getSlideText = (
  slide: Slide,
  field: 'title' | 'subtitle' | 'badge' | 'tag' | 'ctaText',
  lang: LanguageCode
): string => {
  if (lang === 'hi') {
    if (field === 'title') return slide.titleHi;
    if (field === 'subtitle') return slide.subtitleHi;
    if (field === 'badge') return slide.badgeHi;
    if (field === 'tag') return slide.tagHi;
    if (field === 'ctaText') return slide.ctaTextHi;
  } else if (lang === 'hinglish') {
    if (field === 'title') return slide.titleHinglish || slide.titleHi;
    if (field === 'subtitle') return slide.subtitleHinglish || slide.subtitleHi;
    if (field === 'badge') return slide.badgeHinglish || slide.badgeHi;
    if (field === 'tag') return slide.tagHinglish || slide.tagHi;
    if (field === 'ctaText') return slide.ctaTextHinglish || slide.ctaTextHi;
  }
  if (field === 'title') return slide.titleEn;
  if (field === 'subtitle') return slide.subtitleEn;
  if (field === 'badge') return slide.badgeEn;
  if (field === 'tag') return slide.tagEn;
  return slide.ctaTextEn;
};

interface HeroCarouselProps {
  lang: LanguageCode;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ lang, onNavigateTab }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto carousel rotation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-amber-300 shadow-xs bg-linear-to-r from-amber-600 via-orange-500 to-amber-700 text-white min-h-[340px] sm:min-h-[380px] flex flex-col justify-between p-6 sm:p-8">
      {/* Background Subtle Watermark */}
      <div className="absolute right-[-20px] bottom-[-20px] w-72 h-72 opacity-10 pointer-events-none rounded-full border-12 border-white flex items-center justify-center">
        <Sprout className="w-48 h-48 text-white" />
      </div>

      {/* Top Badge & Slide Count */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center font-bold text-white shadow-xs">
            🌾
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100 bg-white/15 px-2.5 py-0.5 rounded-full inline-block">
              {getSlideText(slides[currentSlide], 'tag', lang)}
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          title={isPlaying ? 'Pause banner' : 'Play banner'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      {/* Animated Slide Text Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
          className="my-auto py-4 z-10 max-w-xl"
        >
          <div className="inline-block px-3 py-1 bg-white text-orange-900 font-bold text-xs uppercase tracking-wider rounded-md shadow-xs mb-3">
            {getSlideText(slides[currentSlide], 'badge', lang)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
            {getSlideText(slides[currentSlide], 'title', lang)}
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-amber-50 leading-relaxed font-medium">
            {getSlideText(slides[currentSlide], 'subtitle', lang)}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => onNavigateTab(slides[currentSlide].ctaAction)}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-orange-950 bg-amber-100 hover:bg-white rounded-md shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{getSlideText(slides[currentSlide], 'ctaText', lang)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('schemes')}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white border border-white/50 hover:bg-white/10 rounded-md transition-colors"
            >
              {lang === 'hi' ? 'किसान योजनाएं' : 'Farmer Schemes'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation Arrows & Indicators */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20 z-10">
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
