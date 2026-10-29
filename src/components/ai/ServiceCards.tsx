import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ArrowRight,
  Droplets,
  Wind,
  Download,
  Loader2
} from 'lucide-react';
import { MandiPriceRecord, WeatherCondition, CropDiagnosticResult, GovernmentScheme, MarketplaceListing } from '../../types';
import { downloadPrescriptionPDF } from '../../utils/pdfReportGenerator';

interface ServiceCardsProps {
  cardType: 'mandi_comparison' | 'weather_alert' | 'crop_diagnosis' | 'offer_action' | 'scheme_details';
  data: any;
  onNavigate?: (tab: string, filter?: string) => void;
  onAction?: (actionType: string, payload: any) => void;
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({ cardType, data, onNavigate, onAction }) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (cardType === 'mandi_comparison') {
    const items: MandiPriceRecord[] = Array.isArray(data) ? data : [data];
    return (
      <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Mandi Price Intelligence</span>
            <h4 className="text-sm font-bold text-stone-900">Live APMC Market Rates</h4>
          </div>
          <span className="text-xs text-stone-700 bg-stone-100 px-2 py-0.5 rounded">Agmarknet Synced</span>
        </div>

        <div className="mt-3 space-y-2.5">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="p-3 bg-stone-50 border border-stone-150 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-stone-900">{item.mandiName}</span>
                  <span className="text-xs text-stone-700">· {item.district}, {item.state}</span>
                </div>
                <div className="text-xs text-stone-700 mt-0.5">
                  <span>{item.commodity}</span>
                  <span className="mx-1.5">·</span>
                  <span>{item.variety}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-stone-900">
                    ₹{item.modalPrice.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-700">/qtl</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs justify-end">
                    {item.change >= 0 ? (
                      <span className="text-emerald-700 font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> +₹{item.change}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center">
                        <TrendingDown className="w-3 h-3 mr-0.5" /> ₹{item.change}
                      </span>
                    )}
                    <span className="text-stone-700">· MSP ₹{item.mspPrice}</span>
                  </div>
                </div>

                {onNavigate && (
                  <button 
                    onClick={() => onNavigate('mandi', item.commodity)}
                    className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                    title="View Mandi History"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {onNavigate && (
          <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
            <button 
              onClick={() => onNavigate('mandi')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              Compare 20+ Mandis Statewide <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (cardType === 'weather_alert') {
    const w: WeatherCondition = data;
    return (
      <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">Agri-Weather & Spray Radar</span>
            <h4 className="text-sm font-bold text-stone-900">{w.location}</h4>
          </div>
          <span className="text-xs text-stone-700 font-mono">Today, {w.forecastDate.split(',')[1] || ''}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-700">Temperature</span>
            <div className="text-lg font-bold font-mono text-stone-900">{w.currentTemp}°C</div>
            <span className="text-xs text-stone-700">{w.conditionHindi}</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-700 flex items-center gap-1"><Droplets className="w-3 h-3 text-sky-600" /> Humidity</span>
            <div className="text-lg font-bold font-mono text-stone-900">{w.humidityPercent}%</div>
            <span className="text-xs text-stone-700">Rain Prob: {w.rainfallProbabilityPercent}%</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-700 flex items-center gap-1"><Wind className="w-3 h-3 text-emerald-600" /> Wind Speed</span>
            <div className="text-lg font-bold font-mono text-stone-900">{w.windSpeedKmh} <span className="text-xs font-normal">km/h</span></div>
            <span className="text-xs text-stone-700">{w.windDirection}</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${w.sprayAdvisory.isSafe ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <span className="text-xs font-semibold flex items-center gap-1">
              {w.sprayAdvisory.isSafe ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              Spray Condition
            </span>
            <div className="text-xs font-bold mt-1">{w.sprayAdvisory.isSafe ? 'Foliar Spray Safe' : 'Spray Not Advised'}</div>
            <span className="text-xs opacity-85 block truncate">{w.sprayAdvisory.bestWindow}</span>
          </div>
        </div>

        <div className="mt-3 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-950">
          <strong>Advisory Note:</strong> {w.sprayAdvisory.reason}
        </div>
      </div>
    );
  }

  if (cardType === 'crop_diagnosis') {
    if (!data || typeof data !== 'object') return null;
    const diag: Partial<CropDiagnosticResult> = data;
    const plantNetMatch = (data as any).plantNetMatch;

    const chemicalTreatment = Array.isArray(diag.chemicalTreatment) ? diag.chemicalTreatment : [];
    const organicTreatment = Array.isArray(diag.organicTreatment) ? diag.organicTreatment : [];
    const preventativeMeasures = Array.isArray(diag.preventativeMeasures) ? diag.preventativeMeasures : [];

    // If data doesn't have diagnostic details, return null safely
    if (!diag.cropIdentified && !diag.diseaseOrPest && chemicalTreatment.length === 0 && organicTreatment.length === 0) {
      return null;
    }

    const handleDownloadPdf = async () => {
      setIsDownloadingPdf(true);
      try {
        await downloadPrescriptionPDF({
          cropName: diag.cropIdentified || 'Crop Health Assessment',
          speciesName: plantNetMatch?.speciesName,
          diseaseName: diag.diseaseOrPest || 'Diagnostic Assessment',
          diseaseHindi: diag.diseaseHindi,
          confidence: diag.confidencePercent ?? 95,
          chemicalTreatment,
          organicTreatment,
          preventativeMeasures,
          userImage: (diag as any).userImage || (data as any).image
        });
      } catch (e) {
        console.error('PDF Download Error:', e);
      } finally {
        setIsDownloadingPdf(false);
      }
    };

    return (
      <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">🩺 AI Doctor Prescription</span>
            <h4 className="text-sm font-bold text-stone-900">{diag.cropIdentified || 'Crop Analysis'}</h4>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs flex items-center gap-1">
              🌱 Kheti AI Vision Verified: {diag.confidencePercent ?? 95}% Match
            </span>
          </div>
        </div>

        {plantNetMatch && (
          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-950">
            <div>
              <span className="font-bold">🌿 वानस्पतिक प्रजाति (Botanical Species):</span> {plantNetMatch.speciesName || 'Identified Species'}
              {Array.isArray(plantNetMatch.commonNames) && plantNetMatch.commonNames.length > 0 && (
                <span className="text-stone-700 ml-1">({plantNetMatch.commonNames.slice(0, 2).join(', ')})</span>
              )}
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
              ✓ Kheti AI Verified
            </span>
          </div>
        )}

        <div className="mt-2.5 p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <div className="text-sm font-bold text-stone-900">{diag.diseaseOrPest || 'Diagnostic Assessment'}</div>
              {diag.diseaseHindi && (
                <div className="text-xs text-amber-900 font-medium">हिंदी नाम: {diag.diseaseHindi}</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chemicalTreatment.length > 0 && (
            <div className="p-3 bg-stone-50 border border-stone-150 rounded-lg">
              <span className="text-xs font-bold text-stone-900 block mb-1.5">🔬 Chemical Treatment:</span>
              <ul className="text-xs text-stone-700 space-y-1">
                {chemicalTreatment.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {organicTreatment.length > 0 && (
            <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg">
              <span className="text-xs font-bold text-emerald-950 block mb-1.5">🌿 Organic / Bio Alternative:</span>
              <ul className="text-xs text-emerald-900 space-y-1">
                {organicTreatment.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {preventativeMeasures.length > 0 && (
          <div className="mt-3 text-xs text-stone-700">
            <strong>Preventative rule:</strong> {preventativeMeasures[0]}
          </div>
        )}

        {/* Download PDF Button */}
        <div className="mt-3 pt-3 border-t border-stone-150 flex items-center justify-between">
          <span className="text-[11px] font-medium text-stone-500">Official Kheti AI Rx Report</span>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>PDF डाउनलोड हो रहा है...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>📥 PDF पर्चा डाउनलोड करें</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (cardType === 'offer_action') {
    const listing: MarketplaceListing = data;
    return (
      <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Verified Buyer Demand</span>
            <h4 className="text-sm font-bold text-stone-900">{listing.sellerName}</h4>
          </div>
          <span className="text-xs text-stone-700 flex items-center gap-1">
            📍 {listing.location.district}, {listing.location.state}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-700">Commodity Requirement:</span>
            <div className="text-sm font-bold text-stone-900">{listing.commodity}</div>
          </div>
          <div className="text-right">
            <span className="text-stone-700">Target Volume:</span>
            <div className="text-sm font-bold font-mono text-stone-900">{listing.quantity} {listing.unit}</div>
          </div>
          <div className="text-right">
            <span className="text-stone-700">Offered Rate:</span>
            <div className="text-sm font-bold font-mono text-emerald-800">₹{listing.askingPrice}/qtl</div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-end gap-2">
          {onAction && (
            <button
              onClick={() => onAction('negotiate_listing', listing)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              Start Negotiation
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              View in Marketplace
            </button>
          )}
        </div>
      </div>
    );
  }

  if (cardType === 'scheme_details') {
    const s: GovernmentScheme = data;
    return (
      <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Official Government Portal</span>
            <h4 className="text-sm font-bold text-stone-900">{s.nameEn}</h4>
            <div className="text-xs text-stone-700">{s.nameHi}</div>
          </div>
          <span className="text-xs text-stone-700">{s.verifiedDate.split('(')[0]}</span>
        </div>

        <div className="mt-2.5 p-2.5 bg-stone-50 rounded-lg text-xs text-stone-700 space-y-1">
          <div><strong>Financial Benefit:</strong> <span className="text-emerald-800 font-semibold">{s.financialAssistance}</span></div>
          <div><strong>Eligibility:</strong> {s.eligibilityCriteria[0]}</div>
          <div><strong>Documents Required:</strong> {s.requiredDocuments.join(', ')}</div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-stone-700">{s.ministry}</span>
          <a
            href={s.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
          >
            Visit Official Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return null;
};
