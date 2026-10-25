import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar, LanguageCode } from './components/layout/Navbar';
import { MobileFrame } from './components/layout/MobileFrame';
import { GovPortalHome } from './components/home/GovPortalHome';
import { AIAdvisor } from './components/ai/AIAdvisor';
import { MandiTrackerView } from './components/mandi/MandiTrackerView';
import { WeatherAdvisoryView } from './components/weather/WeatherAdvisoryView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { ServicesView } from './components/marketplace/ServicesView';
import { SchemesView } from './components/schemes/SchemesView';
import { UniversityConnectView } from './components/university/UniversityConnectView';
import { FarmManagerView } from './components/farmer/FarmManagerView';
import { BusinessPortalView } from './components/business/BusinessPortalView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { LegalPagesView } from './components/legal/LegalPagesView';
import LoginModal from './components/auth/LoginModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import { ExternalLink, ShieldCheck } from 'lucide-react';

// Smooth page transition wrapper
const PageTransition: React.FC<{ tabKey: string; children: React.ReactNode }> = ({ tabKey, children }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

// ─── Canonical Permalink & Route Maps ─────────────────────────────────────────
export const TAB_ROUTE_MAP: Record<string, string> = {
  home: '/',
  'ai-advisor': '/ai-advisor',
  mandi: '/mandi-bhav',
  weather: '/weather-advisory',
  marketplace: '/marketplace',
  services: '/storage-machinery',
  university: '/university-connect',
  schemes: '/farmer-schemes',
  farm: '/my-farm',
  business: '/business-portal',
  admin: '/admin',
  'legal-about': '/about-us',
  'legal-privacy': '/privacy-policy',
  'legal-terms': '/terms-of-service',
  'legal-copyright': '/copyright-policy',
  'legal-disclaimer': '/disclaimer',
  'legal-grievance': '/grievance-redressal',
};

export const ROUTE_TAB_MAP: Record<string, string> = {
  '/': 'home',
  '/home': 'home',
  '/ai-advisor': 'ai-advisor',
  '/ai': 'ai-advisor',
  '/advisor': 'ai-advisor',
  '/mandi-bhav': 'mandi',
  '/mandi': 'mandi',
  '/bhav': 'mandi',
  '/weather-advisory': 'weather',
  '/weather': 'weather',
  '/mausam': 'weather',
  '/marketplace': 'marketplace',
  '/kheti-ai-marketplace': 'marketplace',
  '/buy-and-sell': 'marketplace',
  '/storage-machinery': 'services',
  '/services': 'services',
  '/godowns': 'services',
  '/godown': 'services',
  '/machinery': 'services',
  '/university-connect': 'university',
  '/university': 'university',
  '/scientists': 'university',
  '/farmer-schemes': 'schemes',
  '/schemes': 'schemes',
  '/yojana': 'schemes',
  '/my-farm': 'farm',
  '/farm': 'farm',
  '/business-portal': 'business',
  '/business': 'business',
  '/admin': 'admin',
  '/admin-portal': 'admin',
  '/about-us': 'legal-about',
  '/about': 'legal-about',
  '/privacy-policy': 'legal-privacy',
  '/privacy': 'legal-privacy',
  '/terms-of-service': 'legal-terms',
  '/terms': 'legal-terms',
  '/copyright-policy': 'legal-copyright',
  '/copyright': 'legal-copyright',
  '/disclaimer': 'legal-disclaimer',
  '/grievance-redressal': 'legal-grievance',
  '/grievance': 'legal-grievance',
};

export const TAB_SEO_TITLES: Record<string, string> = {
  home: 'Kheti AI — National Agriculture Intelligence, Mandi Bhav & Marketplace',
  'ai-advisor': 'AI Crop Doctor & Advisor — Kheti AI (खेती एआई)',
  mandi: 'Daily APMC Mandi Bhav & Modal Rates — Kheti AI',
  weather: 'Hyperlocal Weather Forecast & Spray Window — Kheti AI',
  marketplace: "Kheti AI's Marketplace — Buy & Sell Agricultural Produce",
  services: 'Storage, Godowns & Farm Machinery Services — Kheti AI',
  university: 'University Scientists & Research Connect — Kheti AI',
  schemes: 'Central & State Government Farmer Schemes — Kheti AI',
  farm: 'Farm Management & Crop Records — Kheti AI',
  business: 'Agribusiness & Procurement Portal — Kheti AI',
  admin: 'Platform Oversight & Moderation Console — Kheti AI',
  'legal-about': 'About Us — Kheti AI National Agriculture Platform',
  'legal-privacy': 'Privacy Policy — Kheti AI',
  'legal-terms': 'Terms of Service — Kheti AI',
  'legal-copyright': 'Copyright Policy — Kheti AI',
  'legal-disclaimer': 'Legal Disclaimer — Kheti AI',
  'legal-grievance': 'Grievance Redressal Mechanism — Kheti AI',
};

function getInitialTab(): string {
  if (typeof window === 'undefined') return 'home';

  // 1. Check pathname first (e.g. /marketplace, /ai-advisor, /mandi-bhav)
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (ROUTE_TAB_MAP[path]) {
    return ROUTE_TAB_MAP[path];
  }

  // 2. Check hash as fallback (e.g. /#marketplace, /#mandi)
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash) {
    const cleanHash = '/' + hash;
    if (ROUTE_TAB_MAP[cleanHash]) {
      return ROUTE_TAB_MAP[cleanHash];
    }
    if (TAB_ROUTE_MAP[hash]) {
      return hash;
    }
  }

  return 'home';
}

function AppContent() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [activeRole, setActiveRole] = useState<UserRole>('farmer');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1.0);
  const [mandiFilterCommodity, setMandiFilterCommodity] = useState<string | undefined>(undefined);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Sync route and title on browser Back / Forward buttons (popstate)
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        const title = TAB_SEO_TITLES[event.state.tab] || TAB_SEO_TITLES.home;
        document.title = title;
      } else {
        const tab = getInitialTab();
        setActiveTab(tab);
        const title = TAB_SEO_TITLES[tab] || TAB_SEO_TITLES.home;
        document.title = title;
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial title and ensure URL has the clean permalink
    const currentTab = getInitialTab();
    const title = TAB_SEO_TITLES[currentTab] || TAB_SEO_TITLES.home;
    document.title = title;

    const initialPath = TAB_ROUTE_MAP[currentTab] || '/';
    if (window.location.pathname !== initialPath && initialPath !== '/') {
      window.history.replaceState({ tab: currentTab }, '', initialPath);
    } else if (!window.history.state) {
      window.history.replaceState({ tab: currentTab }, '', window.location.pathname + window.location.search);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateTab = (tab: string, filter?: string) => {
    setActiveTab(tab);
    if (filter) {
      setMandiFilterCommodity(filter);
    }

    // Update browser URL permalink & history dynamically
    const targetPath = TAB_ROUTE_MAP[tab] || '/';
    const targetTitle = TAB_SEO_TITLES[tab] || TAB_SEO_TITLES.home;
    document.title = targetTitle;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentView = () => {
    if (activeTab.startsWith('legal-')) {
      const pageType = activeTab.replace('legal-', '') as 'about' | 'privacy' | 'terms' | 'copyright' | 'disclaimer' | 'grievance';
      return <LegalPagesView pageType={pageType} onNavigateTab={handleNavigateTab} lang={lang} />;
    }

    switch (activeTab) {
      case 'home':
        return <GovPortalHome onNavigateTab={handleNavigateTab} lang={lang} onSelectLang={(l) => setLang(l)} onOpenLogin={() => setShowLoginModal(true)} />;
      case 'ai-advisor':
        return (
          <AIAdvisor
            onNavigateTab={handleNavigateTab}
            onOpenNegotiation={() => {
              handleNavigateTab('marketplace');
            }}
          />
        );
      case 'mandi':
        return (
          <MandiTrackerView
            initialCommodity={mandiFilterCommodity}
            onSelectCommodityForAI={() => {
              handleNavigateTab('ai-advisor');
            }}
          />
        );
      case 'weather':
        return (
          <WeatherAdvisoryView
            onAskAI={() => {
              handleNavigateTab('ai-advisor');
            }}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceView
            onOpenAIQuery={() => {
              handleNavigateTab('ai-advisor');
            }}
          />
        );
      case 'services':
        return (
          <ServicesView
            onAskAI={() => {
              handleNavigateTab('ai-advisor');
            }}
          />
        );
      case 'schemes':
        return (
          <SchemesView
            onAskAI={() => {
              handleNavigateTab('ai-advisor');
            }}
          />
        );
      case 'university':
        return (
          <UniversityConnectView
            onAskAI={() => {
              handleNavigateTab('ai-advisor');
            }}
            lang={lang}
          />
        );
      case 'farm':
        return <FarmManagerView onNavigateTab={handleNavigateTab} />;
      case 'business':
        return (
          <BusinessPortalView
            onNavigateTab={handleNavigateTab}
            onSwitchRole={(role) => {
              setActiveRole(role);
              handleNavigateTab(role === 'farmer' ? 'farm' : 'business');
            }}
          />
        );
      case 'admin':
        if (!isAdmin) {
          return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
              <div className="w-16 h-16 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto border border-rose-200 font-bold text-2xl">
                🔒
              </div>
              <h2 className="text-xl font-bold text-stone-900">Restricted Administration Access</h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                The Platform Oversight Portal is restricted exclusively to registered developer and system administrator accounts (<strong className="text-stone-800">niteshunofficial1234@gmail.com</strong>).
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleNavigateTab('home')}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          );
        }
        return <AdminPortalView />;
      default:
        return <GovPortalHome onNavigateTab={handleNavigateTab} lang={lang} onSelectLang={(l) => setLang(l)} />;
    }
  };

  return (
    <div
      style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
      className="min-h-screen flex flex-col bg-stone-100 text-stone-900 transition-all font-sans"
    >
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          handleNavigateTab(tab);
          setMandiFilterCommodity(undefined);
        }}
        activeRole={activeRole}
        onRoleChange={(role) => {
          setActiveRole(role);
        }}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        lang={lang}
        onSelectLang={(selectedLang) => setLang(selectedLang)}
        fontSizeMultiplier={fontSizeMultiplier}
        onSetFontSize={setFontSizeMultiplier}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 pt-3 pb-6">
        {isMobilePreview ? (
          <MobileFrame
            activeTab={activeTab}
            onTabChange={(t) => {
              handleNavigateTab(t);
              setMandiFilterCommodity(undefined);
            }}
            onCloseMobileMode={() => setIsMobilePreview(false)}
          >
            <div className="p-3">
              <PageTransition tabKey={activeTab}>
                {renderCurrentView()}
              </PageTransition>
            </div>
          </MobileFrame>
        ) : (
          <PageTransition tabKey={activeTab}>
            {renderCurrentView()}
          </PageTransition>
        )}
      </main>

      {/* Footer (Hidden on AI Advisor page per user request) */}
      {activeTab !== 'ai-advisor' && (
        <footer className="bg-white border-t border-stone-200 mt-10 py-7 text-xs text-stone-600">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            {/* Primary Modules Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-semibold text-stone-700">
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('home'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/ai-advisor"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('ai-advisor'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'खेती एआई सलाहकार' : 'AI Advisor'}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/mandi-bhav"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('mandi'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'मंडी नेटवर्क' : 'Mandi Rates'}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/marketplace"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('marketplace'); }}
                className="hover:text-emerald-800 hover:underline font-bold text-emerald-900"
              >
                {lang === 'hi' ? 'खेती एआई मार्केटप्लेस' : "Kheti AI's Marketplace"}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/weather-advisory"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('weather'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Advisory'}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/storage-machinery"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('services'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'भंडारण व मशीनरी' : 'Storage & Machinery'}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/university-connect"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('university'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'वैज्ञानिक संवाद' : 'University Connect'}
              </a>
              <span className="text-stone-300">/</span>
              <a
                href="/farmer-schemes"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('schemes'); }}
                className="hover:text-emerald-800 hover:underline"
              >
                {lang === 'hi' ? 'किसान योजनाएं' : 'Farmer Schemes'}
              </a>
              {isAdmin && (
                <>
                  <span className="text-stone-300">/</span>
                  <a
                    href="/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveRole('admin');
                      handleNavigateTab('admin');
                    }}
                    className="hover:text-emerald-800 hover:underline"
                  >
                    {lang === 'hi' ? 'प्रशासनिक पोर्टल' : 'Admin Portal'}
                  </a>
                </>
              )}
              <span className="text-stone-300">/</span>
              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 hover:underline inline-flex items-center gap-1 text-stone-500"
              >
                <span>PM-KISAN Portal (Official)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Dedicated Legal, Compliance & Policy Links Row (Desktop & Mobile) */}
            <div className="bg-stone-50 border border-stone-200/90 rounded-xl py-2.5 px-4 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[12px] font-semibold text-stone-700 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'hi' ? 'वैधानिक नीतियां' : 'Legal & Policies'}:</span>
              </span>
              <a
                href="/about-us"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('legal-about'); }}
                className="hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'हमारे बारे में' : 'About Us'}
              </a>
              <span className="text-stone-300">|</span>
              <a
                href="/privacy-policy"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('legal-privacy'); }}
                className="hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </a>
              <span className="text-stone-300">|</span>
              <a
                href="/terms-of-service"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('legal-terms'); }}
                className="hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
              </a>
              <span className="text-stone-300">|</span>
              <a
                href="/copyright-policy"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('legal-copyright'); }}
                className="hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'कॉपीराइट नीति' : 'Copyright Policy'}
              </a>
              <span className="text-stone-300">|</span>
              <a
                href="/disclaimer"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('legal-disclaimer'); }}
                className="hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
              </a>
              <span className="text-stone-300">|</span>
              <a
                href="/grievance-redressal"
                onClick={(e) => { e.preventDefault(); handleNavigateTab('legal-grievance'); }}
                className="hover:text-emerald-800 hover:underline transition-colors text-emerald-800 font-bold cursor-pointer"
              >
                {lang === 'hi' ? 'शिकायत निवारण अधिकारी' : 'Grievance Redressal'}
              </a>
            </div>

            <div className="text-[11px] text-stone-500 font-medium">
              <span>Last Reviewed &amp; Updated: <strong className="text-stone-800 font-mono">{new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</strong></span>
              <span className="mx-2">|</span>
              <span>Total Portal Visitors: <strong className="text-stone-800 font-mono">1,482,910</strong></span>
              <span className="mx-2">|</span>
              <span>Kisan Call Centre 24x7: <strong className="text-emerald-800 font-mono">1800-180-1551</strong></span>
            </div>

            <div className="text-[11px] text-stone-500 border-t border-stone-200/70 pt-2.5">
              Copyright {new Date().getFullYear()}. All Rights Reserved. National Agriculture Intelligence &amp; Farmers Platform (Kheti AI).
              <div className="text-[10px] text-stone-400 mt-0.5">
                Public Agri Data Sources: Agmarknet APMC Mandis &amp; India Meteorological Department (IMD). SSL Secured · 256-Bit Encrypted.
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        lang={lang}
      />

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
