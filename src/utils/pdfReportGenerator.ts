import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PrescriptionReportData {
  title?: string;
  cropName?: string;
  speciesName?: string;
  diseaseName?: string;
  diseaseHindi?: string;
  confidence?: number | string;
  rawContent?: string;
  chemicalTreatment?: string[];
  organicTreatment?: string[];
  preventativeMeasures?: string[];
  userImage?: string;
  date?: string;
  reportId?: string;
  lang?: 'hi' | 'en' | 'hinglish';
}

const pdfLabels = {
  hi: {
    brandTitle: 'Kheti AI (खेती एआई)',
    subtitle: 'डिजिटल फसल क्लीनिक व AI डॉक्टर पर्चा',
    verifiedBadge: '✓ सत्यापित क्लिनिकल पर्चा',
    targetCropLabel: 'लक्ष्य फसल (Target Crop)',
    diagnosedPathologyLabel: 'निदान / पहचाना गया रोग',
    specimenNote: 'Kheti AI विज़न हाई-रिज़ॉल्यूशन लीफ स्कैनर द्वारा फोटो विश्लेषित। 100,000+ कृषि रोग नमूनों से मिलान किया गया।',
    sectionTitle: '🩺 एआई डॉक्टर क्लिनिकल परामर्श व उपचार योजना',
    chemicalLabel: '🔬 रासायनिक उपचार व खुराक:',
    organicLabel: '🌿 जैविक / बायोलॉजिकल विकल्प:',
    preventativeLabel: '🛡️ रोकथाम व सुरक्षा सलाह:',
    footerTag: 'खेती AI इंटेलिजेंस सिस्टम · अधिकृत कृषि सलाह',
    sealHeader: 'खेती AI',
    sealMain: 'SEAL',
    sealSub: 'सत्यापित'
  },
  en: {
    brandTitle: 'Kheti AI Prescription Report',
    subtitle: 'Digital Crop Clinic & AI Doctor Clinical Prescription',
    verifiedBadge: '✓ VERIFIED CLINICAL Rx',
    targetCropLabel: 'Target Crop / Specimen',
    diagnosedPathologyLabel: 'Diagnosed Pathology',
    specimenNote: 'Image scanned via Kheti AI Vision high-resolution leaf scanner. Pathogen patterns matched against 100,000+ agricultural pathology samples.',
    sectionTitle: '🩺 AI Doctor Clinical Advisory & Treatment Plan',
    chemicalLabel: '🔬 Chemical Treatment & Dosage:',
    organicLabel: '🌿 Organic / Bio Alternative:',
    preventativeLabel: '🛡️ Preventative Care Measures:',
    footerTag: 'Kheti AI Intelligence System · Verified Agricultural Advisory',
    sealHeader: 'KHETI AI',
    sealMain: 'SEAL',
    sealSub: 'VERIFIED'
  },
  hinglish: {
    brandTitle: 'Kheti AI Doctor Report',
    subtitle: 'Digital Crop Clinic & AI Doctor Prescription Report',
    verifiedBadge: '✓ VERIFIED CLINICAL REPORT',
    targetCropLabel: 'Target Crop / Fasal',
    diagnosedPathologyLabel: 'Diagnosed Pathology / Rog',
    specimenNote: 'Kheti AI Vision high-resolution leaf scanner dwara image analyze ki gayi. Pathogen patterns 100,000+ agricultural samples se match hue.',
    sectionTitle: '🩺 AI Doctor Clinical Advisory & Treatment Plan',
    chemicalLabel: '🔬 Chemical Treatment Dosage:',
    organicLabel: '🌿 Organic / Bio Alternative:',
    preventativeLabel: '🛡️ Prevention & Safety Tips:',
    footerTag: 'Kheti AI Intelligence System · Official Agricultural Advisory',
    sealHeader: 'KHETI AI',
    sealMain: 'SEAL',
    sealSub: 'VERIFIED'
  }
};

/**
 * Line-by-line translator & transformer to convert raw AI Doctor text into Hindi, English, or Hinglish
 */
function translateLineForLanguage(line: string, lang: 'hi' | 'en' | 'hinglish'): string {
  if (!line || !line.trim()) return '';

  let text = line.trim();

  if (lang === 'en') {
    text = text
      .replace(/एआई डॉक्टर/gi, 'AI Doctor')
      .replace(/फसल रोग निदान एवं पर्चा/gi, 'Crop Clinical Diagnosis & Prescription')
      .replace(/पहचान की गई फसल/gi, 'Plant & Crop Identification')
      .replace(/वानस्पतिक नाम/gi, 'Botanical Scientific Name')
      .replace(/Kheti AI बॉटनिकल मैच/gi, 'Kheti AI Vision Match Accuracy')
      .replace(/खेती AI बॉटनिकल मैच/gi, 'Kheti AI Vision Match Accuracy')
      .replace(/बीमारी की पहचान व लक्षण/gi, 'Disease Identification & Pathology')
      .replace(/बीमारी का नाम/gi, 'Disease & Pathogen Name')
      .replace(/रोग का नाम/gi, 'Disease Name')
      .replace(/गंभीरता/gi, 'Severity Level')
      .replace(/लक्षण/gi, 'Symptoms Observed')
      .replace(/उपचार पर्चा/gi, 'Clinical Treatment Protocol')
      .replace(/उपचार/gi, 'Treatment Protocol')
      .replace(/रासायनिक दवा व खुराक/gi, 'Chemical Spray & Dosage')
      .replace(/रासायनिक दवा/gi, 'Chemical Treatment')
      .replace(/जैविक व देसी इलाज/gi, 'Organic & Bio Alternative')
      .replace(/जैविक इलाज/gi, 'Organic Remedy')
      .replace(/पोषक तत्व व खुराक/gi, 'Nutritional Care & Fertilizer')
      .replace(/सुरक्षा व बचाव के उपाय/gi, 'Preventive Care & Protection Measures')
      .replace(/सुरक्षा व बचाव/gi, 'Preventive Care')
      .replace(/सामान्य \(Mild\)/gi, '🟢 Mild')
      .replace(/सामान्य/gi, 'Mild')
      .replace(/मध्यम \(Moderate\)/gi, '🟡 Moderate')
      .replace(/मध्यम/gi, 'Moderate')
      .replace(/गंभीर \(Severe Emergency\)/gi, '🔴 Severe / Emergency')
      .replace(/गंभीर/gi, 'Severe Emergency')
      .replace(/पीला रतुआ/gi, 'Yellow Rust (Puccinia striiformis)')
      .replace(/भूरा रतुआ/gi, 'Brown Rust')
      .replace(/झुलसा रोग/gi, 'Blight Disease')
      .replace(/झुलसा/gi, 'Blight')
      .replace(/उकठा रोग/gi, 'Wilt Disease')
      .replace(/गेहूं/gi, 'Wheat Crop')
      .replace(/धान/gi, 'Paddy / Rice Crop')
      .replace(/सरसों/gi, 'Mustard Crop')
      .replace(/कपास/gi, 'Cotton Crop')
      .replace(/आलू/gi, 'Potato Crop')
      .replace(/प्रति एकड़/gi, 'per acre')
      .replace(/लीटर पानी में/gi, 'in liters of water')
      .replace(/लीटर पानी/gi, 'liters of water')
      .replace(/मिली\/एकड़/gi, 'ml / acre')
      .replace(/मिली/gi, 'ml')
      .replace(/ग्राम/gi, 'grams')
      .replace(/छिड़काव करें/gi, 'spray thoroughly')
      .replace(/स्प्रे करें/gi, 'spray')
      .replace(/रोगग्रस्त पत्तियों को/gi, 'affected crop leaves')
      .replace(/खेत में जल निकासी/gi, 'proper field drainage')
      .replace(/फफूंद/gi, 'fungal infection')
      .replace(/कीट/gi, 'insect pest')
      .replace(/जैविक/gi, 'Organic')
      .replace(/रासायनिक/gi, 'Chemical')
      .replace(/पत्तियों/gi, 'leaves')
      .replace(/पौधे/gi, 'plants')
      .replace(/दवा/gi, 'medicine');

  } else if (lang === 'hi') {
    text = text
      .replace(/AI Doctor/gi, 'एआई डॉक्टर')
      .replace(/Crop Clinical Diagnosis/gi, 'फसल रोग निदान एवं क्लिनिकल पर्चा')
      .replace(/Plant Identified/gi, 'पहचान की गई फसल')
      .replace(/Botanical Species/gi, 'वानस्पतिक प्रजाति नाम')
      .replace(/Kheti AI Botanical Match/gi, 'खेती एआई विज़न पहचान सटीकता')
      .replace(/Disease & Pathology/gi, 'बीमारी की पहचान व लक्षण (रोग विज्ञान)')
      .replace(/Disease Name/gi, 'बीमारी का नाम')
      .replace(/Severity Level/gi, 'रोग की गंभीरता')
      .replace(/Symptoms Observed/gi, 'देखे गए लक्षण')
      .replace(/Clinical Treatment Protocol/gi, 'क्लिनिकल उपचार एवं दवा का पर्चा')
      .replace(/Chemical Spray & Dosage/gi, 'रासायनिक दवा व छिड़काव खुराक')
      .replace(/Organic Remedy/gi, 'जैविक व देसी उपचार')
      .replace(/Nutritional Care/gi, 'पोषक तत्व व उर्वरक सलाह')
      .replace(/Preventive Care/gi, 'सुरक्षा व बचाव के उपाय')
      .replace(/Mild/gi, '🟢 सामान्य (माइल्ड)')
      .replace(/Moderate/gi, '🟡 मध्यम (मॉडरेट)')
      .replace(/Severe/gi, '🔴 गंभीर (आपतकालीन)')
      .replace(/Yellow Rust/gi, 'पीला रतुआ')
      .replace(/Blight/gi, 'झुलसा रोग')
      .replace(/Wilt/gi, 'उकठा रोग')
      .replace(/per acre/gi, 'प्रति एकड़')
      .replace(/liters of water/gi, 'लीटर पानी में')
      .replace(/spray/gi, 'छिड़काव');

  } else if (lang === 'hinglish') {
    text = text
      .replace(/एआई डॉक्टर/gi, 'AI Doctor')
      .replace(/फसल रोग निदान एवं पर्चा/gi, 'Crop Clinical Diagnosis Aur Parcha')
      .replace(/पहचान की गई फसल/gi, 'Pehchani Gayi Fasal (Crop Identification)')
      .replace(/वानस्पतिक नाम/gi, 'Botanical Species Name')
      .replace(/Kheti AI बॉटनिकल मैच/gi, 'Kheti AI Vision Match Percent')
      .replace(/खेती AI बॉटनिकल मैच/gi, 'Kheti AI Vision Match Percent')
      .replace(/बीमारी की पहचान व लक्षण/gi, 'Bimari Ki Pehchan Aur Lakshan')
      .replace(/बीमारी का नाम/gi, 'Bimari Ka Naam')
      .replace(/गंभीरता/gi, 'Gambhirta (Severity Level)')
      .replace(/लक्षण/gi, 'Dekhe Gaye Lakshan')
      .replace(/उपचार पर्चा/gi, 'Upchar Aur Dawai Ka Parcha')
      .replace(/रासायनिक दवा व खुराक/gi, 'Chemical Spray Aur Khurak')
      .replace(/जैविक व देसी इलाज/gi, 'Jaivik Aur Desi Ilaaj')
      .replace(/पोषक तत्व व खुराक/gi, 'Poshan Aur Fertilizer Khurak')
      .replace(/सुरक्षा व बचाव के उपाय/gi, 'Suraksha Aur Bachav Ke Upay')
      .replace(/सामान्य \(Mild\)/gi, '🟢 Samanya (Mild)')
      .replace(/सामान्य/gi, 'Samanya')
      .replace(/मध्यम \(Moderate\)/gi, '🟡 Madhyam (Moderate)')
      .replace(/मध्यम/gi, 'Madhyam')
      .replace(/गंभीर \(Severe Emergency\)/gi, '🔴 Gambhir (Severe Emergency)')
      .replace(/गंभीर/gi, 'Gambhir')
      .replace(/पीला रतुआ/gi, 'Pila Ratua (Yellow Rust)')
      .replace(/झुलसा रोग/gi, 'Jhalsa Rog (Blight)')
      .replace(/गेहूं/gi, 'Gehun (Wheat)')
      .replace(/धान/gi, 'Dhan (Paddy)')
      .replace(/सरसों/gi, 'Sarson (Mustard)')
      .replace(/कपास/gi, 'Kapas (Cotton)')
      .replace(/आलू/gi, 'Aaloo (Potato)')
      .replace(/प्रति एकड़/gi, 'per acre')
      .replace(/लीटर पानी में/gi, 'liter paani mein')
      .replace(/लीटर पानी/gi, 'liter paani')
      .replace(/मिली/gi, 'ml')
      .replace(/ग्राम/gi, 'gram')
      .replace(/छिड़काव करें/gi, 'spray karein')
      .replace(/स्प्रे करें/gi, 'spray karein')
      .replace(/फसल/gi, 'fasal')
      .replace(/बीमारी/gi, 'bimari')
      .replace(/पत्तियों/gi, 'pattiyon')
      .replace(/पौधे/gi, 'paudhe')
      .replace(/उपचार/gi, 'upchar')
      .replace(/दवाई/gi, 'dawai')
      .replace(/सुरक्षा/gi, 'suraksha')
      .replace(/बचाव/gi, 'bachav')
      .replace(/लक्षण/gi, 'lakshan')
      .replace(/जैविक/gi, 'jaivik')
      .replace(/रासायनिक/gi, 'chemical')
      .replace(/खुराक/gi, 'khurak');
  }

  return text;
}

function translateHeaderBadge(text: string, lang: 'hi' | 'en' | 'hinglish'): string {
  if (!text) return '';
  if (lang === 'en') {
    return text
      .replace(/गेहूं/g, 'Wheat')
      .replace(/धान/g, 'Paddy / Rice')
      .replace(/सरसों/g, 'Mustard')
      .replace(/कपास/g, 'Cotton')
      .replace(/आलू/g, 'Potato')
      .replace(/फसल/g, 'Crop')
      .replace(/बीमारी/g, 'Disease')
      .replace(/पीला रतुआ/g, 'Yellow Rust')
      .replace(/झुलसा/g, 'Blight')
      .replace(/पत्ती रोग/g, 'Foliar Pathology')
      .replace(/निदान/g, 'Diagnostic Assessment');
  } else if (lang === 'hi') {
    return text
      .replace(/Wheat/gi, 'गेहूं')
      .replace(/Paddy/gi, 'धान')
      .replace(/Mustard/gi, 'सरसों')
      .replace(/Cotton/gi, 'कपास')
      .replace(/Potato/gi, 'आलू')
      .replace(/Yellow Rust/gi, 'पीला रतुआ')
      .replace(/Blight/gi, 'झुलसा रोग')
      .replace(/Disease/gi, 'बीमारी');
  } else {
    return text
      .replace(/गेहूं/g, 'Gehun (Wheat)')
      .replace(/धान/g, 'Dhan (Paddy)')
      .replace(/सरसों/g, 'Sarson (Mustard)')
      .replace(/कपास/g, 'Kapas (Cotton)')
      .replace(/आलू/g, 'Aaloo (Potato)')
      .replace(/पीला रतुआ/g, 'Pila Ratua (Yellow Rust)')
      .replace(/झुलसा/g, 'Jhalsa Rog (Blight)');
  }
}

/**
 * Generates and downloads a clean, professional PDF prescription report for Kheti AI Doctor in Hindi, English, or Hinglish.
 */
export async function downloadPrescriptionPDF(data: PrescriptionReportData): Promise<void> {
  const lang = data.lang || 'hi';
  const labels = pdfLabels[lang] || pdfLabels.hi;

  const dateStr = data.date || new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const reportId = data.reportId || `KHETI-RX-${Math.floor(100000 + Math.random() * 900000)}`;

  const cropTitle = translateHeaderBadge(data.cropName || 'Crop Health Assessment', lang);
  const diseaseTitle = translateHeaderBadge(data.diseaseName || 'Crop Leaf Inspection', lang);

  // Create container div for report DOM node
  const reportContainer = document.createElement('div');
  reportContainer.id = 'kheti-pdf-report-temp';
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.top = '-9999px';
  reportContainer.style.width = '794px'; // A4 width in px at 96 DPI
  reportContainer.style.backgroundColor = '#ffffff';
  reportContainer.style.color = '#1c1917';
  reportContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  reportContainer.style.padding = '0';
  reportContainer.style.boxSizing = 'border-box';

  // Format content sections if rawContent is provided
  let formattedBodyHtml = '';
  if (data.rawContent) {
    const lines = data.rawContent.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const translatedLine = translateLineForLanguage(trimmed, lang);

      if (trimmed.startsWith('###') || trimmed.startsWith('##') || /^[🩺🌱🔬💊🛡️]/.test(trimmed)) {
        const cleanHeading = translatedLine.replace(/^#+\s*/, '').replace(/[\*\#]/g, '').trim();

        formattedBodyHtml += `
          <div style="margin-top: 14px; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 2px solid #059669; font-weight: 800; color: #065f46; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>${cleanHeading}</span>
          </div>
        `;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const cleanItem = translatedLine.replace(/^[-*•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedBodyHtml += `
          <div style="margin-left: 8px; margin-bottom: 4px; font-size: 12px; line-height: 1.5; color: #292524; display: flex; align-items: flex-start; gap: 6px;">
            <span style="color: #059669; font-weight: bold; margin-top: 1px;">•</span>
            <span>${cleanItem}</span>
          </div>
        `;
      } else {
        const cleanPara = translatedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedBodyHtml += `
          <p style="margin: 4px 0; font-size: 12px; line-height: 1.5; color: #292524;">${cleanPara}</p>
        `;
      }
    });
  }

  // Construct PDF layout HTML
  reportContainer.innerHTML = `
    <div style="padding: 24px; border: 8px solid #065f46; background: #ffffff;">
      
      <!-- Top Brand Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px dashed #d6d3d1;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #065f46; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fef08a; font-size: 24px; font-weight: 900;">
            🌾
          </div>
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">${labels.brandTitle}</h1>
            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 700; color: #92400e;">${labels.subtitle}</p>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; display: inline-block;">
            ${labels.verifiedBadge}
          </div>
          <div style="font-size: 10px; font-family: monospace; font-weight: 700; color: #78716c; margin-top: 4px;">
            Report ID: ${reportId}
          </div>
          <div style="font-size: 10px; color: #78716c;">
            Date: ${dateStr}
          </div>
        </div>
      </div>

      <!-- Patient / Crop Summary Banner -->
      <div style="margin-top: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 0.5px;">${labels.targetCropLabel}</span>
          <h2 style="margin: 2px 0 0 0; font-size: 16px; font-weight: 900; color: #064e3b;">
            ${cropTitle}
          </h2>
          ${data.speciesName ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #047857;">Botanical Species: <em>${data.speciesName}</em></p>` : ''}
        </div>

        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.5px;">${labels.diagnosedPathologyLabel}</span>
          <div style="font-size: 15px; font-weight: 900; color: #991b1b; margin-top: 2px;">
            ${diseaseTitle}
          </div>
          ${data.diseaseHindi ? `<div style="font-size: 11px; color: #991b1b; font-weight: 700;">(${translateHeaderBadge(data.diseaseHindi, lang)})</div>` : ''}
        </div>
      </div>

      <!-- User Image if attached -->
      ${data.userImage ? `
        <div style="margin-top: 14px; display: flex; gap: 14px; align-items: center;">
          <div style="width: 140px; height: 110px; border-radius: 8px; overflow: hidden; border: 2px solid #e7e5e4; flex-shrink: 0;">
            <img src="${data.userImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="Crop Specimen" />
          </div>
          <div style="flex: 1; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px; font-size: 11px; color: #78350f;">
            <strong>Specimen Analysis Note:</strong> ${labels.specimenNote}
          </div>
        </div>
      ` : ''}

      <!-- Detailed Clinical Findings & Prescription -->
      <div style="margin-top: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #1c1917; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #059669; padding-left: 8px;">
          ${labels.sectionTitle}
        </h3>

        ${formattedBodyHtml ? `
          <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px 14px;">
            ${formattedBodyHtml}
          </div>
        ` : ''}

        <!-- Explicit Treatments Table if passed -->
        ${(data.chemicalTreatment?.length || data.organicTreatment?.length) ? `
          <div style="margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${data.chemicalTreatment?.length ? `
              <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 10px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #9d174d;">${labels.chemicalLabel}</h4>
                <ul style="margin: 0; padding-left: 14px; font-size: 11px; color: #831843;">
                  ${data.chemicalTreatment.map(t => `<li style="margin-bottom: 3px;">${translateLineForLanguage(t, lang)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${data.organicTreatment?.length ? `
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #065f46;">${labels.organicLabel}</h4>
                <ul style="margin: 0; padding-left: 14px; font-size: 11px; color: #064e3b;">
                  ${data.organicTreatment.map(t => `<li style="margin-bottom: 3px;">${translateLineForLanguage(t, lang)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${data.preventativeMeasures?.length ? `
          <div style="margin-top: 12px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; font-size: 11px; color: #9a3412;">
            <strong>${labels.preventativeLabel}</strong> ${data.preventativeMeasures.map(m => translateLineForLanguage(m, lang)).join('; ')}
          </div>
        ` : ''}
      </div>

      <!-- Official Footer Stamp & Helpline -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e7e5e4; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 11px; font-weight: 800; color: #065f46;">
            ${labels.footerTag}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #78716c;">
            Helpline: 1800-KHETI-AI (1800-54384-24) | Web: https://kheti.ai
          </p>
        </div>

        <div style="text-align: right;">
          <div style="width: 64px; height: 64px; border: 3px double #059669; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #065f46; text-align: center; line-height: 1;">
            <span style="font-size: 8px; font-weight: 900; text-transform: uppercase;">${labels.sealHeader}</span>
            <span style="font-size: 10px; font-weight: 900; margin: 2px 0;">${labels.sealMain}</span>
            <span style="font-size: 7px; font-weight: 800;">${labels.sealSub}</span>
          </div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(reportContainer);

  try {
    const canvas = await html2canvas(reportContainer, {
      scale: 2, // High resolution for crisp PDF
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Save generated PDF
    const filename = `Kheti_AI_Doctor_Prescription_${lang.toUpperCase()}_${reportId}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('Failed to render PDF using canvas:', err);
    // Fallback: Trigger browser print preview formatted for PDF export
    const windowPrint = window.open('', '', 'width=800,height=900');
    if (windowPrint) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Kheti AI Prescription Report (${lang.toUpperCase()}) - ${reportId}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${reportContainer.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      windowPrint.document.close();
    }
  } finally {
    // Cleanup temporary element
    if (document.body.contains(reportContainer)) {
      document.body.removeChild(reportContainer);
    }
  }
}
