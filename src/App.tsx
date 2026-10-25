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
import { ExternalLink } from 'lucide-react';

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

function AppContent() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeRole, setActiveRole] = useState<UserRole>('farmer');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1.0);
  const [mandiFilterCommodity, setMandiFilterCommodity] = useState<string | undefined>(undefined);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleNavigateTab = (tab: string, filter?: string) => {
    setActiveTab(tab);
    if (filter) {
      setMandiFilterCommodity(filter);
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
              setActiveTab('marketplace');
            }}
          />
        );
      case 'mandi':
        return (
          <MandiTrackerView
            initialCommodity={mandiFilterCommodity}
            onSelectCommodityForAI={() => {
              setActiveTab('ai-advisor');
            }}
          />
        );
      case 'weather':
        return (
          <WeatherAdvisoryView
            onAskAI={() => {
              setActiveTab('ai-advisor');
            }}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceView
            onOpenAIQuery={() => {
              setActiveTab('ai-advisor');
            }}
          />
        );
      case 'services':
        return (
          <ServicesView
            onAskAI={() => {
              setActiveTab('ai-advisor');
            }}
          />
        );
      case 'schemes':
        return (
          <SchemesView
            onAskAI={() => {
              setActiveTab('ai-advisor');
            }}
          />
        );
      case 'university':
        return (
          <UniversityConnectView
            onAskAI={() => {
              setActiveTab('ai-advisor');
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
              setActiveTab(role === 'farmer' ? 'farm' : 'business');
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
          setActiveTab(tab);
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
              setActiveTab(t);
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
        <footer className="bg-white border-t border-stone-200 mt-10 py-6 text-xs text-stone-600">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-semibold text-stone-700">
              <button onClick={() => handleNavigateTab('home')} className="hover:text-emerald-800 hover:underline">
                {lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
              </button>
              <span>/</span>
              <button onClick={() => handleNavigateTab('ai-advisor')} className="hover:text-emerald-800 hover:underline">
                {lang === 'hi' ? 'खेती एआई सलाहकार' : 'AI Advisor'}
              </button>
              <span>/</span>
              <button onClick={() => handleNavigateTab('mandi')} className="hover:text-emerald-800 hover:underline">
                {lang === 'hi' ? 'मंडी नेटवर्क' : 'Mandi Rates'}
              </button>
              <span>/</span>
              <button onClick={() => handleNavigateTab('university')} className="hover:text-emerald-800 hover:underline">
                {lang === 'hi' ? 'विश्वविद्यालय वैज्ञानिक संवाद' : 'University Connect'}
              </button>
              <span>/</span>
              <button onClick={() => handleNavigateTab('schemes')} className="hover:text-emerald-800 hover:underline">
                {lang === 'hi' ? 'किसान योजनाएं' : 'Farmer Schemes'}
              </button>
              {isAdmin && (
                <>
                  <span>/</span>
                  <button
                    onClick={() => {
                      setActiveRole('admin');
                      setActiveTab('admin');
                    }}
                    className="hover:text-emerald-800 hover:underline"
                  >
                    {lang === 'hi' ? 'प्रशासनिक पोर्टल' : 'Admin Portal'}
                  </button>
                </>
              )}
              <span>/</span>
              <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-800 hover:underline flex items-center gap-1">
                <span>PM-KISAN Portal (Official)</span>
                <ExternalLink className="w-3 h-3" />
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
                Public Agri Data Sources: Agmarknet APMC Mandis &amp; India Meteorological Department (IMD).
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
