import React, { useState } from 'react';
import { 
  Sprout, 
  Home, 
  Smartphone, 
  Monitor, 
  Globe, 
  ChevronDown, 
  ChevronRight,
  Check, 
  Sparkles,
  ShieldCheck,
  LogIn,
  UserCircle,
  Menu,
  X,
  LogOut,
  Crown,
  Users,
  Building2,
  Store,
  Layers,
  Award,
  Bot,
  TrendingUp,
  FileText,
  FlaskConical,
  Tractor,
  GraduationCap,
  MapPin,
  Briefcase,
  Settings,
  HelpCircle,
  Info,
  Bell
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { CURRENT_USER } from '../../data/mockData';

export type LanguageCode = 'hi' | 'en' | 'hinglish';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  lang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  fontSizeMultiplier: number;
  onSetFontSize: (multiplier: number) => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  onRoleChange,
  isMobilePreview,
  onToggleMobilePreview,
  lang,
  onSelectLang,
  fontSizeMultiplier,
  onSetFontSize,
  onOpenLogin
}) => {
  const { user, profile, signOut, isPitchDemo, togglePitchDemo, isAuthenticated, isAdmin } = useAuth();
  
  // Mobile & Dropdown States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const navItems = [
    { id: 'home', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ', labelHinglish: 'Home', isHome: true },
    { id: 'ai-advisor', labelEn: 'AI Advisor', labelHi: 'एआई सलाहकार', labelHinglish: 'AI Advisor' },
    { id: 'mandi', labelEn: 'Mandi Rates', labelHi: 'दैनिक मंडी भाव', labelHinglish: 'Mandi Bhav' },
    { id: 'weather', labelEn: 'Weather & Spray', labelHi: 'मौसम व स्प्रे', labelHinglish: 'Mausam & Spray' },
    { id: 'marketplace', labelEn: 'Marketplace', labelHi: 'उपज खरीद-बिक्री', labelHinglish: 'Buy & Sell' },
    { id: 'services', labelEn: 'Storage & Machinery', labelHi: 'गोदाम व यंत्र', labelHinglish: 'Godown & Machines' },
    { id: 'university', labelEn: 'University & Scientists', labelHi: 'वैज्ञानिक संवाद', labelHinglish: 'Scientist Connect' },
    { id: 'schemes', labelEn: 'Farmer Schemes', labelHi: 'किसान योजनाएं', labelHinglish: 'Kisan Yojana' },
    ...(isAdmin ? [{ 
      id: activeRole === 'admin' ? 'admin' : activeRole === 'business' ? 'business' : activeRole === 'scientist' ? 'university' : 'farm', 
      labelEn: activeRole === 'admin' ? 'Admin Portal' : activeRole === 'business' ? 'Business Portal' : activeRole === 'scientist' ? 'Scientist Desk' : 'My Farm',
      labelHi: activeRole === 'admin' ? 'प्रशासनिक पोर्टल' : activeRole === 'business' ? 'व्यापारी खाता' : activeRole === 'scientist' ? 'वैज्ञानिक डेस्क' : 'मेरा खेत',
      labelHinglish: activeRole === 'admin' ? 'Admin' : activeRole === 'business' ? 'Business' : activeRole === 'scientist' ? 'Scientist' : 'Mera Khet'
    }] : [{
      id: activeRole === 'business' ? 'business' : activeRole === 'scientist' ? 'university' : 'farm', 
      labelEn: activeRole === 'business' ? 'Business Portal' : activeRole === 'scientist' ? 'Scientist Desk' : 'My Farm',
      labelHi: activeRole === 'business' ? 'व्यापारी खाता' : activeRole === 'scientist' ? 'वैज्ञानिक डेस्क' : 'मेरा खेत',
      labelHinglish: activeRole === 'business' ? 'Business' : activeRole === 'scientist' ? 'Scientist' : 'Mera Khet'
    }])
  ];

  // Drawer Menu Items with Multi-language labels
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

  const getNavLabel = (item: typeof navItems[0]) => {
    if (lang === 'hi') return item.labelHi;
    if (lang === 'hinglish') return item.labelHinglish;
    return item.labelEn;
  };

  const handleMobileNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-stone-200 shadow-xs sticky top-0 z-40">
      
      {/* ─── MOBILE Top Header Bar (Always visible on Mobile) ─── */}
      <div className="md:hidden bg-emerald-900 text-white shadow-md block">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-white hover:bg-emerald-800 rounded-lg transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Logo Circle */}
            <button
              onClick={() => handleMobileNavClick('home')}
              className="w-9 h-9 rounded-full bg-amber-50 text-emerald-900 font-extrabold flex items-center justify-center border border-amber-300 shadow-xs shrink-0"
            >
              <Sprout className="w-5 h-5 text-emerald-800" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-xs text-white tracking-tight truncate flex items-center gap-1.5">
                <span>Kheti AI (खेती एआई)</span>
              </div>
              <div className="text-[9px] text-amber-200 font-medium truncate leading-tight">
                National Agriculture Intelligence & Marketplace
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
            {/* Notification Bell */}
            <button
              onClick={() => onTabChange('schemes')}
              className="relative p-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-200 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {/* Mobile Header Login Button */}
            {user ? (
              <button
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                }}
                className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-amber-200 border border-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <UserCircle className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate max-w-[50px]">{profile?.name?.split(' ')[0] || 'User'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                }}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </button>
            )}

            {/* Language Selector Pill */}
            <button
              onClick={() => onSelectLang(lang === 'hi' ? 'en' : 'hi')}
              className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-amber-200 border border-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>{lang === 'hi' ? 'HI' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP Topmost Utility Bar (Hidden on Mobile < md) ─── */}
      <div className="hidden md:block bg-stone-100 border-b border-stone-200 text-stone-700 text-[11px] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-stone-900 tracking-wide">KHETI AI BHARAT</span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-600">डिजिटल कृषि एवं किसान मंच (Kheti AI National Agriculture Intelligence Network)</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="#main-content" className="hover:underline text-stone-600">
              {lang === 'hi' ? 'मुख्य विषय पर जाएं' : 'Skip to Content'}
            </a>
            <span className="text-stone-300">|</span>

            {/* Accessibility Font Sizers */}
            <div className="flex items-center border border-stone-300 rounded overflow-hidden bg-white text-[10px] font-bold">
              <button
                onClick={() => onSetFontSize(0.9)}
                className={`px-1.5 py-0.5 hover:bg-stone-200 transition-colors ${fontSizeMultiplier === 0.9 ? 'bg-amber-100 text-amber-900 font-extrabold' : ''}`}
                title="Small Font (A-)"
              >
                A-
              </button>
              <button
                onClick={() => onSetFontSize(1.0)}
                className={`px-1.5 py-0.5 border-x border-stone-300 hover:bg-stone-200 transition-colors ${fontSizeMultiplier === 1.0 ? 'bg-amber-100 text-amber-900 font-extrabold' : ''}`}
                title="Normal Font (A)"
              >
                A
              </button>
              <button
                onClick={() => onSetFontSize(1.15)}
                className={`px-1.5 py-0.5 hover:bg-stone-200 transition-colors ${fontSizeMultiplier === 1.15 ? 'bg-amber-100 text-amber-900 font-extrabold' : ''}`}
                title="Large Font (A+)"
              >
                A+
              </button>
            </div>

            <span className="text-stone-300">|</span>

            {/* Desktop Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 font-bold text-amber-950 hover:text-amber-900 px-2 py-0.5 rounded bg-amber-50 border border-amber-300 transition-colors"
              >
                <Globe className="w-3 h-3 text-amber-700" />
                <span>{lang === 'hi' ? 'हिन्दी (Hindi)' : lang === 'hinglish' ? 'Hinglish' : 'English'}</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-stone-200 rounded-md shadow-lg py-1 z-50 text-xs">
                  <button onClick={() => { onSelectLang('hi'); setShowLangDropdown(false); }} className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-amber-50 ${lang === 'hi' ? 'font-bold text-amber-900 bg-amber-50/70' : 'text-stone-700'}`}>
                    <span>हिन्दी</span>
                    {lang === 'hi' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                  <button onClick={() => { onSelectLang('en'); setShowLangDropdown(false); }} className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-amber-50 ${lang === 'en' ? 'font-bold text-amber-900 bg-amber-50/70' : 'text-stone-700'}`}>
                    <span>English</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                  <button onClick={() => { onSelectLang('hinglish'); setShowLangDropdown(false); }} className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-amber-50 ${lang === 'hinglish' ? 'font-bold text-amber-900 bg-amber-50/70' : 'text-stone-700'}`}>
                    <span>Hinglish</span>
                    {lang === 'hinglish' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                </div>
              )}
            </div>

            {/* Account Button */}
            {user ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Manage Account or Switch User"
              >
                <UserCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>{profile?.name || user.email?.split('@')[0] || 'Account'}</span>
                <span className="text-[10px] text-emerald-700 font-normal">▾</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-white border border-stone-300 px-2.5 py-0.5 rounded hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'hi' ? 'लॉगिन / खाता' : 'Login / Accounts'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP Main Institutional Header ─── */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 hidden md:block">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <button
              onClick={() => onTabChange('home')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-emerald-800 bg-linear-to-b from-amber-50 to-emerald-50 flex items-center justify-center p-1 shadow-xs shrink-0 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full border border-emerald-700 flex flex-col items-center justify-center text-center">
                <Sprout className="w-6 h-6 text-emerald-800" />
                <span className="text-[7px] font-extrabold tracking-tighter uppercase text-amber-800 mt-0.5 leading-none">
                  KHETI AI
                </span>
              </div>
            </button>

            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-stone-900 leading-tight">
                खेती एआई (Kheti AI) — राष्ट्रीय कृषि आसूचना एवं किसान मंच
              </h1>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-700 tracking-wide uppercase">
                Kheti AI — National Agriculture Intelligence & Farmers Platform
              </h2>
              <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                Connecting Farmers, Mandis, Storage, Machinery & Kheti AI Marketplace
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={togglePitchDemo}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[11px] font-bold border transition-colors ${
                  isPitchDemo ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isPitchDemo ? 'bg-amber-600' : 'bg-emerald-600 animate-pulse'}`} />
                <span>{isPitchDemo ? '🎭 Pitch Demo: ON' : '🟢 Live User Account'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>🎭 Prototype Demo</span>
              </div>
            )}

            <div className="flex items-center gap-2 border-r border-stone-200 pr-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block leading-none flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" /> Agmarknet & IMD
                </span>
                <span className="text-[9px] text-stone-500 font-medium leading-none">Public Feeds Synced</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center font-bold text-emerald-800 text-xs">
                🌾
              </div>
            </div>

            {/* Desktop Role Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="capitalize">{activeRole} Role</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-lg shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-stone-200 text-stone-700 bg-stone-50">
                    <div className="font-bold text-stone-900">
                      {isAuthenticated ? (profile?.name || user?.email || 'Logged In User') : CURRENT_USER.name}
                    </div>
                    <div className="text-[11px] text-stone-600">
                      {isAuthenticated ? 'Isolated Workspace · Live Cloud' : `${CURRENT_USER.village}, ${CURRENT_USER.district}`}
                    </div>
                  </div>

                  <div className="py-1 divide-y divide-stone-100">
                    <button onClick={() => { onRoleChange('farmer'); setShowRoleDropdown(false); onTabChange('farm'); }} className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">Farmer Mode (किसान)</div>
                        <div className="text-[10px] text-stone-600">Crop records, Mandi & Farm Ledger</div>
                      </div>
                      {activeRole === 'farmer' && <Check className="w-4 h-4 text-emerald-700" />}
                    </button>

                    <button onClick={() => { onRoleChange('business'); setShowRoleDropdown(false); onTabChange('business'); }} className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">Business Mode (व्यापारी/मिलर)</div>
                        <div className="text-[10px] text-stone-600">Procurement & Storage Operations</div>
                      </div>
                      {activeRole === 'business' && <Check className="w-4 h-4 text-emerald-700" />}
                    </button>

                    <button onClick={() => { onRoleChange('scientist'); setShowRoleDropdown(false); onTabChange('university'); }} className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">Scientist / Faculty (वैज्ञानिक)</div>
                        <div className="text-[10px] text-stone-600">Answer field queries & lead trials</div>
                      </div>
                      {activeRole === 'scientist' && <Check className="w-4 h-4 text-emerald-700" />}
                    </button>

                    {isAdmin && (
                      <button onClick={() => { onRoleChange('admin'); setShowRoleDropdown(false); onTabChange('admin'); }} className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-900">Admin Portal (प्रशासन)</div>
                          <div className="text-[10px] text-stone-600">KYC verification, Users, Disputes & AI Logs</div>
                        </div>
                        {activeRole === 'admin' && <Check className="w-4 h-4 text-emerald-700" />}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP Saffron Ribbon Navigation (Hidden on Mobile < md) ─── */}
      <div className="hidden md:block bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex items-center text-xs font-bold">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              if (item.isHome) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`px-4 py-3 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isActive ? 'bg-emerald-800 text-white shadow-inner font-extrabold' : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>{getNavLabel(item)}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3.5 py-3 transition-colors border-r border-orange-500/50 whitespace-nowrap ${
                    isActive ? 'bg-orange-800 text-amber-200 shadow-inner' : 'hover:bg-orange-700/80 text-white'
                  }`}
                >
                  {getNavLabel(item)}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Flash News Marquee Ticker */}
      <div className="bg-amber-100/90 border-b border-amber-300 text-xs px-3 sm:px-4 py-1 text-stone-900 flex items-center gap-2 overflow-hidden">
        <div className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-extrabold uppercase rounded shrink-0 shadow-xs animate-pulse">
          {lang === 'hi' ? 'ताज़ा अपडेट्स' : 'FLASH NEWS'}
        </div>
        <div className="overflow-hidden whitespace-nowrap text-[10px] sm:text-[11px] font-medium text-amber-950 flex-1">
          <div className="inline-block animate-marquee">
            <span>
              {lang === 'hi'
                ? '🌾 रबी 2026-27 के लिए गेहूं एमएसपी ₹2,425 घोषित · करनाल व खन्ना मंडी में बासमती धान की बंपर आवक दर्ज · 100% एस्क्रो सुरक्षित उपज व्यापार · 1800-180-1551 पर 24x7 किसान कॉल सेंटर चालू'
                : '🌾 Rabi 2026-27 Wheat MSP announced at ₹2,425/quintal · Peak Basmati arrivals recorded in Karnal & Khanna mandis · 100% Escrow protected produce trade · 24x7 Kisan Call Centre 1800-180-1551 active'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── MOBILE HAMBURGER SLIDE-OVER DRAWER (Screen 2 Mockup Match) ─── */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-xs flex animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[82%] max-w-xs h-full overflow-y-auto shadow-2xl p-4 space-y-4 text-stone-900 flex flex-col justify-between"
          >
            
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
                  onClick={() => setMobileMenuOpen(false)}
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
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shrink-0"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenLogin) onOpenLogin();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'खेती खाते में लॉगिन (Login / Google)' : 'Login / Continue with Google'}</span>
                  </button>
                )}
              </div>

              {/* Drawer Menu Items List */}
              <div className="space-y-1 pt-1">
                {drawerNavItems.map((item, idx) => {
                  const isActive = activeTab === item.id;
                  const itemLabel = lang === 'hi' ? item.labelHi : lang === 'hinglish' ? item.labelHinglish : item.labelEn;
                  return (
                    <button
                      key={item.id + '_' + idx}
                      onClick={() => handleMobileNavClick(item.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                          : 'text-stone-800 hover:bg-stone-50'
                      }`}
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
                  const nextLang = lang === 'hi' ? 'en' : lang === 'en' ? 'hinglish' : 'hi';
                  onSelectLang(nextLang);
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

              {/* Legal Pages Listed Below Language Section */}
              <div className="pt-2 border-t border-stone-200 space-y-1">
                <div className="text-[10px] font-extrabold text-stone-500 uppercase px-1 tracking-wider">
                  {lang === 'hi' ? 'कानूनी एवं नीतियां' : 'Legal & Policies'}
                </div>
                <button onClick={() => handleMobileNavClick('legal-about')} className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'हमारे बारे में (About Us)' : 'About Us'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button onClick={() => handleMobileNavClick('legal-privacy')} className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button onClick={() => handleMobileNavClick('legal-terms')} className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'सेवा की शर्तें (Terms of Service)' : 'Terms of Service'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button onClick={() => handleMobileNavClick('legal-copyright')} className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'कॉपीराइट नीति (Copyright)' : 'Copyright Policy'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button onClick={() => handleMobileNavClick('legal-disclaimer')} className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'अस्वीकरण (Disclaimer)' : 'Legal Disclaimer'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button onClick={() => handleMobileNavClick('legal-grievance')} className="w-full p-2 rounded-lg text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'शिकायत निवारण (Grievance Redressal)' : 'Grievance Redressal'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


    </header>
  );
};
