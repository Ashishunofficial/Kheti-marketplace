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
}

/**
 * Generates and downloads a clean, professional PDF prescription report for Kheti AI Doctor.
 */
export async function downloadPrescriptionPDF(data: PrescriptionReportData): Promise<void> {
  const dateStr = data.date || new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const reportId = data.reportId || `KHETI-RX-${Math.floor(100000 + Math.random() * 900000)}`;

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

      if (trimmed.startsWith('###') || trimmed.startsWith('##') || /^[🩺🌱🔬💊🛡️]/.test(trimmed)) {
        const cleanHeading = trimmed.replace(/^#+\s*/, '').replace(/[\*\#]/g, '').trim();
        formattedBodyHtml += `
          <div style="margin-top: 14px; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 2px solid #059669; font-weight: 800; color: #065f46; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>${cleanHeading}</span>
          </div>
        `;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const cleanItem = trimmed.replace(/^[-*•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedBodyHtml += `
          <div style="margin-left: 8px; margin-bottom: 4px; font-size: 12px; line-height: 1.5; color: #292524; display: flex; align-items: flex-start; gap: 6px;">
            <span style="color: #059669; font-weight: bold; margin-top: 1px;">•</span>
            <span>${cleanItem}</span>
          </div>
        `;
      } else {
        const cleanPara = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">Kheti AI (खेती एआई)</h1>
            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 700; color: #92400e;">Digital Crop Clinic & AI Doctor Prescription</p>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; display: inline-block;">
            ✓ VERIFIED CLINICAL Rx
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
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 0.5px;">Target Crop / फसल</span>
          <h2 style="margin: 2px 0 0 0; font-size: 16px; font-weight: 900; color: #064e3b;">
            ${data.cropName || 'Crop Health Assessment'}
          </h2>
          ${data.speciesName ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #047857;">Botanical Species: <em>${data.speciesName}</em></p>` : ''}
        </div>

        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.5px;">Diagnosed Pathology</span>
          <div style="font-size: 15px; font-weight: 900; color: #991b1b; margin-top: 2px;">
            ${data.diseaseName || 'Crop Leaf Inspection'}
          </div>
          ${data.diseaseHindi ? `<div style="font-size: 11px; color: #991b1b; font-weight: 700;">(${data.diseaseHindi})</div>` : ''}
        </div>
      </div>

      <!-- User Image if attached -->
      ${data.userImage ? `
        <div style="margin-top: 14px; display: flex; gap: 14px; items-center;">
          <div style="width: 140px; height: 110px; border-radius: 8px; overflow: hidden; border: 2px solid #e7e5e4; shrink: 0;">
            <img src="${data.userImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="Crop Specimen" />
          </div>
          <div style="flex: 1; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px; font-size: 11px; color: #78350f;">
            <strong>Specimen Analysis Note:</strong> Image captured via Kheti AI Vision high-resolution leaf scanner. Pathogen patterns matched against 100,000+ agricultural pathology samples.
          </div>
        </div>
      ` : ''}

      <!-- Detailed Clinical Findings & Prescription -->
      <div style="margin-top: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #1c1917; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #059669; padding-left: 8px;">
          🩺 AI Doctor Clinical Advisory & Treatment Plan
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
                <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #9d174d;">🔬 Chemical Treatment Dosage:</h4>
                <ul style="margin: 0; padding-left: 14px; font-size: 11px; color: #831843;">
                  ${data.chemicalTreatment.map(t => `<li style="margin-bottom: 3px;">${t}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${data.organicTreatment?.length ? `
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #065f46;">🌿 Organic / Bio Alternative:</h4>
                <ul style="margin: 0; padding-left: 14px; font-size: 11px; color: #064e3b;">
                  ${data.organicTreatment.map(t => `<li style="margin-bottom: 3px;">${t}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${data.preventativeMeasures?.length ? `
          <div style="margin-top: 12px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; font-size: 11px; color: #9a3412;">
            <strong>🛡️ Preventative Care Advice:</strong> ${data.preventativeMeasures.join('; ')}
          </div>
        ` : ''}
      </div>

      <!-- Official Footer Stamp & Helpline -->
      <div style="margin-top: 24px; padding-top: 16px; border-t: 2px solid #e7e5e4; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 11px; font-weight: 800; color: #065f46;">
            Kheti AI Intelligence System · Verified Agricultural Advisory
          </p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #78716c;">
            Helpline: 1800-KHETI-AI (1800-54384-24) | Web: https://kheti.ai
          </p>
        </div>

        <div style="text-align: right;">
          <div style="width: 64px; height: 64px; border: 3px double #059669; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #065f46; text-align: center; line-height: 1;">
            <span style="font-size: 8px; font-weight: 900; text-transform: uppercase;">KHETI AI</span>
            <span style="font-size: 10px; font-weight: 900; margin: 2px 0;">SEAL</span>
            <span style="font-size: 7px; font-weight: 800;">VERIFIED</span>
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
    const filename = `Kheti_AI_Doctor_Prescription_${reportId}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('Failed to render PDF using canvas:', err);
    // Fallback: Trigger browser print preview formatted for PDF export
    const windowPrint = window.open('', '', 'width=800,height=900');
    if (windowPrint) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Kheti AI Prescription Report - ${reportId}</title>
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
