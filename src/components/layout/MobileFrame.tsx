import React from 'react';
import { 
  Wifi, 
  Battery, 
  Signal 
} from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCloseMobileMode: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  onCloseMobileMode
}) => {
  return (
    <div className="min-h-screen bg-stone-900 py-6 px-4 flex flex-col items-center justify-center">
      {/* Device Mode Switch Bar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm px-2 text-xs text-stone-300">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span>Android App Preview (Jetpack Compose / React Native)</span>
        </div>
        <button
          onClick={onCloseMobileMode}
          className="text-stone-300 hover:text-white underline font-medium"
        >
          Switch to Desktop Web
        </button>
      </div>

      {/* Simulated Android Device */}
      <div className="w-full max-w-[400px] h-[840px] bg-stone-950 rounded-[44px] p-3 shadow-2xl border-4 border-stone-800 flex flex-col relative overflow-hidden">
        {/* Speaker & Front Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-full flex items-center justify-center z-50">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
        </div>

        {/* Screen Container */}
        <div className="w-full h-full bg-stone-50 rounded-[34px] overflow-hidden flex flex-col relative">
          {/* Android Status Bar */}
          <div className="h-7 bg-white px-5 pt-1.5 flex items-center justify-between text-[11px] font-mono text-stone-700 select-none shrink-0 z-40 border-b border-stone-100">
            <span>07:15 AM</span>
            <div className="flex items-center gap-1.5 text-stone-600">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Scrollable Mobile App Body */}
          <div className="flex-1 overflow-y-auto pb-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
