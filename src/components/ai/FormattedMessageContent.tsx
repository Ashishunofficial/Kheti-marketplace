import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Sprout, 
  Microscope, 
  Pill, 
  ShieldAlert, 
  ChevronRight,
  FileText,
  Download,
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react';
import { downloadPrescriptionPDF } from '../../utils/pdfReportGenerator';

interface FormattedMessageContentProps {
  content: string;
  isAssistant?: boolean;
}

export const FormattedMessageContent: React.FC<FormattedMessageContentProps> = ({ content, isAssistant }) => {
  const [displayedLength, setDisplayedLength] = useState<number>(() => {
    // If not assistant message, show full text immediately
    return isAssistant ? 0 : content ? content.length : 0;
  });
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(!isAssistant);
  const [isDownloading, setIsDownloading] = useState(false);

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!content) return;

    if (!isAssistant) {
      setDisplayedLength(content.length);
      setIsTypingComplete(true);
      return;
    }

    // Reset for new content
    setDisplayedLength(0);
    setIsTypingComplete(false);

    let current = 0;
    const total = content.length;
    
    // Smooth Typewriter Animation: ~5-7 characters per frame (~60fps)
    const step = () => {
      current += Math.max(3, Math.floor(total / 120)); // Scales smoothly based on text length
      if (current >= total) {
        setDisplayedLength(total);
        setIsTypingComplete(true);
      } else {
        setDisplayedLength(current);
        animRef.current = requestAnimationFrame(step);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [content, isAssistant]);

  // Skip animation on demand
  const handleSkipAnimation = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setDisplayedLength(content.length);
    setIsTypingComplete(true);
  };

  if (!content) return null;

  const currentTextToRender = content.substring(0, displayedLength);

  // Check if content is an AI Doctor Diagnostic Prescription Report
  const isPrescriptionReport = isAssistant && (
    content.includes('AI Doctor') || 
    content.includes('एआई डॉक्टर') || 
    content.includes('Diagnosis') || 
    content.includes('पर्चा') || 
    content.includes('निदान') ||
    content.includes('1.') ||
    content.includes('2.')
  );

  // Helper to trigger PDF download
  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      let cropName = 'Crop Health Assessment';
      let diseaseName = 'Disease Pathology & Diagnostic';

      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('फसल') || line.includes('Plant') || line.includes('Crop')) {
          const match = line.replace(/[*#•]/g, '').split(':')[1];
          if (match) cropName = match.trim();
        }
        if (line.includes('बीमारी') || line.includes('Disease') || line.includes('Pathogen')) {
          const match = line.replace(/[*#•]/g, '').split(':')[1];
          if (match) diseaseName = match.trim();
        }
      }

      await downloadPrescriptionPDF({
        cropName,
        diseaseName,
        rawContent: content
      });
    } catch (err) {
      console.error('PDF Download Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to parse bold (**text**) and italic (*text*) formatting cleanly
  const parseInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return null;

    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const clean = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-stone-900">
            {clean}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
        const clean = part.slice(1, -1);
        return (
          <em key={index} className="italic text-stone-800">
            {clean}
          </em>
        );
      }
      return part;
    });
  };

  // Split displayed content into lines
  const rawLines = currentTextToRender.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${renderedElements.length}`} className="space-y-1.5 my-2 pl-0.5">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
      inList = false;
    }
  };

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 1. Empty lines
    if (!trimmed) {
      flushList();
      return;
    }

    // 2. Horizontal Rule (---, ***, ___ )
    if (/^(---|---|___|\*\*\*)$/.test(trimmed)) {
      flushList();
      renderedElements.push(
        <hr key={`hr-${idx}`} className="my-3 border-stone-200/80" />
      );
      return;
    }

    // 3. Main AI Doctor Prescription Report Title Header
    if (
      (trimmed.includes('AI Doctor') || trimmed.includes('एआई डॉक्टर')) &&
      (trimmed.includes('Diagnosis') || trimmed.includes('पर्चा') || trimmed.includes('निदान') || trimmed.includes('Report') || trimmed.includes('Clinical'))
    ) {
      flushList();
      const cleanTitle = trimmed
        .replace(/^[#\s*•]+/, '')
        .replace(/\*\*/g, '')
        .replace(/^[🩺🌱🔬💊🛡️]\s*/, '')
        .trim();

      renderedElements.push(
        <div
          key={`header-${idx}`}
          className="my-2.5 p-3.5 bg-gradient-to-r from-emerald-850 via-teal-900 to-emerald-950 text-white rounded-xl shadow-xs border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold">
                Kheti AI Clinical Prescription
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                {cleanTitle || 'AI Doctor Crop Health & Disease Diagnosis'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-extrabold text-[11px] flex items-center gap-1.5 shadow-xs transition-transform cursor-pointer border border-amber-300"
              title="Download PDF Prescription Report"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
                  <span>डाउनलोड हो रहा है...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-stone-950" />
                  <span>PDF पर्चा डाउनलोड करें</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
      return;
    }

    // 4. Section Headings (e.g., 🌱 1. पहचान की गई फसल)
    if (
      /^[#\s*•]*[🩺🌱🔬💊🛡️]/.test(trimmed) ||
      /^#{1,4}\s/.test(trimmed) ||
      (/^(\*\*|\*)[0-9]\./.test(trimmed) && trimmed.includes('**'))
    ) {
      flushList();

      let sectionIcon = <FileText className="w-4 h-4 text-emerald-700" />;
      if (trimmed.includes('🌱') || trimmed.includes('1.') || trimmed.includes('फसल') || trimmed.includes('Plant Identified')) {
        sectionIcon = <Sprout className="w-4 h-4 text-emerald-700" />;
      } else if (trimmed.includes('🔬') || trimmed.includes('2.') || trimmed.includes('बीमारी') || trimmed.includes('Disease') || trimmed.includes('Pathology')) {
        sectionIcon = <Microscope className="w-4 h-4 text-amber-700" />;
      } else if (trimmed.includes('💊') || trimmed.includes('3.') || trimmed.includes('उपचार') || trimmed.includes('Treatment') || trimmed.includes('Protocol')) {
        sectionIcon = <Pill className="w-4 h-4 text-sky-700" />;
      } else if (trimmed.includes('🛡️') || trimmed.includes('4.') || trimmed.includes('सुरक्षा') || trimmed.includes('Preventive') || trimmed.includes('बचाव')) {
        sectionIcon = <ShieldAlert className="w-4 h-4 text-teal-700" />;
      }

      const cleanHeading = trimmed
        .replace(/^#{1,4}\s*/, '')
        .replace(/[\*\#]/g, '')
        .trim();

      renderedElements.push(
        <div
          key={`sec-${idx}`}
          className="mt-3 mb-2 pt-2 border-t border-stone-200/80 flex items-center gap-2 font-bold text-stone-900 text-xs sm:text-sm"
        >
          <span className="p-1 rounded-md bg-stone-100 border border-stone-200 shrink-0">
            {sectionIcon}
          </span>
          <span className="text-stone-900 font-extrabold">{cleanHeading}</span>
        </div>
      );
      return;
    }

    // 5. Bullet List Items
    if (/^[-*•]\s/.test(trimmed) || /^\s+[•*-]\s/.test(line)) {
      inList = true;
      const cleanItem = trimmed.replace(/^[-*•]\s*/, '');

      currentListItems.push(
        <li key={`li-${idx}`} className="flex items-start gap-2 text-stone-800 text-xs sm:text-sm leading-relaxed">
          <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            {parseInlineFormatting(cleanItem)}
          </div>
        </li>
      );
      return;
    }

    // 6. Numbered List Item
    if (/^[0-9]+\.\s/.test(trimmed)) {
      flushList();
      const numMatch = trimmed.match(/^([0-9]+)\.\s*(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const rest = numMatch[2];
        renderedElements.push(
          <div key={`num-${idx}`} className="flex items-start gap-2 my-1.5 text-xs sm:text-sm text-stone-800 leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <div className="flex-1 pt-0.5">
              {parseInlineFormatting(rest)}
            </div>
          </div>
        );
        return;
      }
    }

    // 7. Regular paragraph text line
    flushList();
    renderedElements.push(
      <p key={`p-${idx}`} className="my-1 text-xs sm:text-sm leading-relaxed text-stone-800">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  // Flush any remaining list items
  flushList();

  return (
    <div 
      onClick={!isTypingComplete ? handleSkipAnimation : undefined}
      className={`space-y-1 font-sans relative ${!isTypingComplete ? 'cursor-pointer' : ''}`}
      title={!isTypingComplete ? 'Click to show full text' : undefined}
    >
      {renderedElements}

      {/* Typing Cursor & Skip Controller */}
      {!isTypingComplete && (
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>AI Doctor Typing...</span>
          </span>
          <button
            onClick={handleSkipAnimation}
            className="flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300 transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
            <span>Skip / पूरा देखें</span>
          </button>
        </div>
      )}

      {/* Action Footer for Reports */}
      {isPrescriptionReport && isTypingComplete && (
        <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-stone-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kheti AI Clinical Prescriptions are official diagnostic records</span>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>PDF बन रहा है...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>📥 Report PDF डाउनलोड करें</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
