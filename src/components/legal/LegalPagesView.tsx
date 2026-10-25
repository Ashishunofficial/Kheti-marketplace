import React from 'react';
import { ShieldCheck, ArrowLeft, FileText, Lock, Copyright, AlertTriangle, HelpCircle, Building2 } from 'lucide-react';

interface LegalPagesViewProps {
  pageType: 'about' | 'privacy' | 'terms' | 'copyright' | 'disclaimer' | 'grievance';
  onNavigateTab: (tab: string) => void;
  lang?: string;
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({ pageType, onNavigateTab, lang = 'hi' }) => {
  const titles = {
    about: { hi: 'हमारे बारे में - खेती एआई (Kheti AI)', en: 'About Us - National Agriculture Intelligence Platform' },
    privacy: { hi: 'गोपनीयता नीति - खेती एआई', en: 'Privacy Policy - Kheti AI' },
    terms: { hi: 'सेवा की शर्तें - खेती एआई', en: 'Terms of Service - Kheti AI' },
    copyright: { hi: 'कॉपीराइट नीति - खेती एआई', en: 'Copyright Policy - Kheti AI' },
    disclaimer: { hi: 'अस्वीकरण - खेती एआई', en: 'Legal Disclaimer - Kheti AI' },
    grievance: { hi: 'शिकायत निवारण एवं अधिकारी - खेती एआई', en: 'Grievance Redressal Mechanism - Kheti AI' }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigateTab('home')}
        className="flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
      </button>

      <div className="space-y-6">
        <div className="border-b border-stone-200 pb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            {pageType === 'about' && <Building2 className="w-6 h-6" />}
            {pageType === 'privacy' && <Lock className="w-6 h-6" />}
            {pageType === 'terms' && <FileText className="w-6 h-6" />}
            {pageType === 'copyright' && <Copyright className="w-6 h-6" />}
            {pageType === 'disclaimer' && <AlertTriangle className="w-6 h-6" />}
            {pageType === 'grievance' && <HelpCircle className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {titles[pageType][lang === 'hi' ? 'hi' : 'en']}
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              National Agriculture Intelligence &amp; Farmers Platform (Kheti AI) · Government of Bharat Initiative
            </p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-stone-700">
          {pageType === 'about' && (
            <>
              <h3 className="text-base font-bold text-stone-900">Introduction to Kheti AI (खेती एआई)</h3>
              <p>
                Kheti AI is India's premier National Agriculture Intelligence &amp; Farmers Platform designed to empower smallholder farmers, APMC mandis, agricultural universities, and rural commerce through real-time data, AI-driven advisory, and secure escrow marketplace transactions.
              </p>
              <h4 className="text-sm font-bold text-stone-900">Our Mission</h4>
              <p>
                To bridge the information asymmetry in Indian agriculture by integrating real-time Agmarknet mandi prices, IMD weather forecasts, university scientific recommendations, and direct farmer-to-business produce trading with guaranteed escrow safety.
              </p>
              <h4 className="text-sm font-bold text-stone-900">Key Pillars</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>AI Kisan Advisor:</strong> Multilingual voice and text agronomy support in Hindi, English, and regional dialects.</li>
                <li><strong>Mandi Intelligence:</strong> Live modal prices across 3,200+ APMC mandis nationwide.</li>
                <li><strong>University Connect:</strong> Direct linkage with Krishi Vigyan Kendras (KVKs) and agricultural university scientists.</li>
                <li><strong>Escrow Marketplace:</strong> Secure input and produce trading with transparent quality grading.</li>
              </ul>
            </>
          )}

          {pageType === 'privacy' && (
            <>
              <h3 className="text-base font-bold text-stone-900">Privacy Policy</h3>
              <p>
                At Kheti AI, we respect your privacy and are committed to protecting the personal and agricultural data of farmers, traders, and institutional users.
              </p>
              <h4 className="text-sm font-bold text-stone-900">Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Profile Details:</strong> Name, mobile number, village, district, and state location.</li>
                <li><strong>Agricultural Data:</strong> Crop records, soil health card details, farm acreage, and livestock listings.</li>
                <li><strong>Device & Usage Data:</strong> IP address, browser type, language preference, and interaction logs.</li>
              </ul>
              <h4 className="text-sm font-bold text-stone-900">Use of Data</h4>
              <p>
                Data collected is strictly utilized to provide localized weather advisories, mandi rate alerts, scheme eligibility checks, and secure trade execution. We never sell personal or farm data to third parties.
              </p>
            </>
          )}

          {pageType === 'terms' && (
            <>
              <h3 className="text-base font-bold text-stone-900">Terms of Service</h3>
              <p>
                By accessing and using Kheti AI (kheti-ai.gov.in / platform), you agree to comply with and be bound by the following terms and conditions.
              </p>
              <h4 className="text-sm font-bold text-stone-900">User Conduct</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Users must provide accurate registration and farm details.</li>
                <li>Fraudulent produce listings or misleading mandi rates are strictly prohibited and subject to account suspension.</li>
                <li>AI advisories are intended for decision support and should be verified with local agricultural extension officers for critical crop treatments.</li>
              </ul>
            </>
          )}

          {pageType === 'copyright' && (
            <>
              <h3 className="text-base font-bold text-stone-900">Copyright Policy</h3>
              <p>
                © {new Date().getFullYear()} National Agriculture Intelligence &amp; Farmers Platform (Kheti AI). All rights reserved.
              </p>
              <p>
                The content, design, graphics, source code, data compilations, and AI models presented on this platform are protected under Indian and international copyright laws. Public APMC data feeds (Agmarknet) and IMD weather bulletins remain property of their respective government departments and are utilized under open data policies.
              </p>
              <p>
                Unauthorized reproduction, commercial redistribution, or scraping of proprietary portal data is strictly prohibited.
              </p>
            </>
          )}

          {pageType === 'disclaimer' && (
            <>
              <h3 className="text-base font-bold text-stone-900">Legal Disclaimer</h3>
              <p>
                The information provided on Kheti AI is for general informational and advisory purposes only. While we make every effort to ensure accuracy through synced feeds from Agmarknet, IMD, and ICAR agricultural institutions, the platform makes no warranties regarding the absolute completeness or real-time infallibility of market prices and weather forecasts.
              </p>
              <p>
                Financial transactions conducted through the escrow marketplace are governed by our verified banking and partner terms. Kheti AI is not liable for indirect losses arising from weather anomalies or market price fluctuations.
              </p>
            </>
          )}

          {pageType === 'grievance' && (
            <>
              <h3 className="text-base font-bold text-stone-900">Grievance Redressal Mechanism</h3>
              <p>
                In accordance with the Information Technology Act 2000 and applicable rules, the details of the Grievance Officer and Nodal Officer are provided below for addressing any complaints or queries regarding platform operations, data privacy, or trade disputes.
              </p>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900">Grievance &amp; Nodal Officer</div>
                <div className="text-stone-700">Dr. R. K. Sharma (Director, Digital Agriculture Operations)</div>
                <div className="text-stone-700">Email: grievance@kheti-ai.gov.in</div>
                <div className="text-stone-700">Helpline: 1800-180-1551 (24x7 Toll Free)</div>
                <div className="text-stone-700">Address: Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-stone-200 pt-4 flex items-center justify-between text-xs text-stone-500">
          <span>Last Updated: October 2026</span>
          <button
            onClick={() => onNavigateTab('home')}
            className="text-emerald-800 font-bold hover:underline"
          >
            Return to Homepage →
          </button>
        </div>
      </div>
    </div>
  );
};
