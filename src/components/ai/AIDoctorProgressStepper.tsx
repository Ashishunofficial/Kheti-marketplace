import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Sparkles, 
  Stethoscope, 
  Leaf, 
  Microscope, 
  Pill, 
  FileText,
  Lightbulb
} from 'lucide-react';

interface AIDoctorProgressStepperProps {
  currentStep: number; // 0 to 4
  isImage?: boolean;
}

const AGRI_TIPS = [
  "💡 टिप: रोगग्रस्त पत्ती को खेत से निकालकर नष्ट करें ताकि फफूंद अन्य पौधों में न फैले।",
  "💡 जानकारी: Kheti AI Vision राष्ट्रीय कृषि डेटाबेस द्वारा सटीक प्रजाति पहचानता है।",
  "💡 सलाह: सुबह 6 से 9 बजे के बीच स्प्रे करने पर पत्तियों पर दवा का अवशोषण सबसे बेहतर होता है।",
  "💡 टिप: नीम तेल (Neem Oil 10,000 ppm) जैविक उपचार में कीटों के अंडे नष्ट करने में बहुत प्रभावी है।",
  "💡 सलाह: रासायनिक स्प्रे के बाद 14 दिनों तक फल या सब्जी की तुड़ाई न करें (Waiting Period)।"
];

export const AIDoctorProgressStepper: React.FC<AIDoctorProgressStepperProps> = ({ currentStep, isImage = true }) => {
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate helpful tips every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % AGRI_TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const imageSteps = [
    {
      id: 0,
      title: '1. Uploaded & Scanning Leaf',
      subtitle: 'फोटो स्कैन व पत्ती इमेज ऑप्टिमाइज़ेशन',
      percent: 20,
      icon: Leaf
    },
    {
      id: 1,
      title: '2. Kheti AI Vision Species Match',
      subtitle: 'खेती AI विज़न वनस्पति प्रजाति पहचान व मिलान',
      percent: 45,
      icon: Sparkles
    },
    {
      id: 2,
      title: '3. Analysing Disease & Symptoms',
      subtitle: 'खेती AI इंटेलिजेंस द्वारा फसल रोग व लक्षण विश्लेषण',
      percent: 70,
      icon: Microscope
    },
    {
      id: 3,
      title: '4. Prescribing Clinical Remedies',
      subtitle: 'रासायनिक खुराक व जैविक उपचार पर्चा निर्माण',
      percent: 90,
      icon: Pill
    },
    {
      id: 4,
      title: '5. Finalising Doctor Report',
      subtitle: 'अंतिम डॉक्टर रिपोर्ट व ऑडियो सलाह सहेजी जा रही है',
      percent: 98,
      icon: FileText
    }
  ];

  const textSteps = [
    {
      id: 0,
      title: '1. Receiving Query',
      subtitle: 'प्रश्न प्राप्त व भाषा प्रसंस्करण',
      percent: 25,
      icon: Leaf
    },
    {
      id: 1,
      title: '2. Context & Agmarknet Radar',
      subtitle: 'मंडी, मौसम व कृषि डेटाबेस विश्लेषण',
      percent: 50,
      icon: Sparkles
    },
    {
      id: 2,
      title: '3. Formulating Advisory',
      subtitle: 'विशेषज्ञ कृषि सलाह व समाधान निर्माण',
      percent: 80,
      icon: Stethoscope
    },
    {
      id: 3,
      title: '4. Finalising Voice Response',
      subtitle: 'उत्तर व भारतीय महिला आवाज़ ऑडियो तैयार',
      percent: 98,
      icon: FileText
    }
  ];

  const steps = isImage ? imageSteps : textSteps;
  const activeStepObj = steps[Math.min(currentStep, steps.length - 1)] || steps[0];
  const progressPercent = activeStepObj.percent;

  return (
    <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 my-3 text-stone-900 animate-fadeIn">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs animate-pulse">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-stone-900">
                AI Doctor & Crop Clinic (एआई डॉक्टर)
              </h3>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Loader2 className="w-3 h-3 text-amber-800 animate-spin" />
                <span>लाइव जांच जारी</span>
              </span>
            </div>
            <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
              {activeStepObj.subtitle}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-black font-mono text-emerald-900">
            {progressPercent}%
          </div>
          <div className="text-[10px] font-bold text-stone-500">
            ~2-3 सेकंड शेष
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-stone-100 border border-stone-200 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 rounded-full transition-all duration-700 ease-out shadow-xs relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold px-0.5">
          <span>शुरू (Start)</span>
          <span className="text-emerald-800">Kheti AI Vision + Kheti AI Intelligence</span>
          <span>पूर्ण (Complete)</span>
        </div>
      </div>

      {/* 5-Step Live Checklist */}
      <div className="grid grid-cols-1 gap-2 pt-1">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;
          const IconComponent = step.icon;

          return (
            <div 
              key={step.id}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs font-medium ${
                isActive 
                  ? 'bg-amber-50/90 border-amber-300 text-stone-900 shadow-2xs font-bold scale-[1.01]' 
                  : isCompleted 
                    ? 'bg-emerald-50/50 border-emerald-200 text-stone-800' 
                    : 'bg-stone-50/60 border-stone-200/80 text-stone-400 opacity-75'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-[10px] animate-bounce">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-stone-300 text-stone-400 flex items-center justify-center text-[10px] font-bold">
                      {step.id + 1}
                    </div>
                  )}
                </div>

                <div>
                  <div className={`text-xs ${isActive ? 'font-black text-amber-950' : isCompleted ? 'font-bold text-stone-900' : 'font-semibold text-stone-500'}`}>
                    {step.title}
                  </div>
                  <div className="text-[11px] text-stone-600 font-medium">
                    {step.subtitle}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isCompleted ? (
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ पूर्ण (Done)
                  </span>
                ) : isActive ? (
                  <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-300 animate-pulse flex items-center gap-1">
                    <IconComponent className="w-3 h-3 text-amber-800" />
                    <span>जांच जारी...</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> प्रतीक्षारत
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Cycling Agricultural Tip Box */}
      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2 shadow-2xs">
        <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 animate-bounce" />
        <div className="flex-1 font-semibold leading-relaxed transition-all duration-300">
          {AGRI_TIPS[tipIndex]}
        </div>
      </div>

    </div>
  );
};
