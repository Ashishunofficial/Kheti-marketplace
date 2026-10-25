import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Square, 
  Send, 
  Radio, 
  Cpu, 
  Headphones, 
  Activity,
  CheckCircle2
} from 'lucide-react';

export type AgentState = 'idle' | 'listening' | 'processing' | 'replying';

interface LiveVoiceAgentHUDProps {
  agentState: AgentState;
  interimTranscript: string;
  activeToolName?: string | null;
  currentSpeakingText?: string | null;
  audioLevel?: number; // Real 0 to 100 audio volume from Web Audio API
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitTranscript: (text: string) => void;
  onStopSpeaking: () => void;
  onReplaySpeaking: () => void;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  voiceLang: string;
  onChangeVoiceLang: (lang: string) => void;
}

export const LiveVoiceAgentHUD: React.FC<LiveVoiceAgentHUDProps> = ({
  agentState,
  interimTranscript,
  activeToolName,
  currentSpeakingText,
  audioLevel = 0,
  onStartListening,
  onStopListening,
  onSubmitTranscript,
  onStopSpeaking,
  onReplaySpeaking,
  isHandsFree,
  onToggleHandsFree,
  isAudioMuted,
  onToggleMute,
  voiceLang,
  onChangeVoiceLang
}) => {
  // Wave bar animation simulator when speaking
  const [synthWaveHeights, setSynthWaveHeights] = useState<number[]>([30, 60, 80, 50, 70, 90, 60, 40]);

  useEffect(() => {
    if (agentState === 'replying') {
      const interval = setInterval(() => {
        setSynthWaveHeights(prev => 
          prev.map(() => Math.floor(Math.random() * 65) + 25)
        );
      }, 120);
      return () => clearInterval(interval);
    }
  }, [agentState]);

  // Scaled height for real microphone audio wave bars
  const normalizedLevel = Math.min(100, Math.max(12, audioLevel * 1.8));

  return (
    <div className="bg-white border-b border-stone-200 transition-all duration-300">
      {/* 1. STATE-SPECIFIC BANNER NOTIFIER with smooth transitions */}
      <AnimatePresence mode="wait">
        {agentState === 'listening' && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-4 py-3 shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Status & Mic Pulse */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-800 flex items-center justify-center font-bold shadow-md">
                  <Mic className="w-5 h-5 text-emerald-700 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded text-white">
                    🔴 AI IS LISTENING · मैं सुन रही हूँ
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-100 bg-emerald-900/40 px-2 py-0.5 rounded">
                    Mic Signal: {Math.round(audioLevel)}%
                  </span>
                </div>
                <div className="text-xs text-white font-medium mt-0.5">
                  बोलिए किसान भाई! (मौसम, आज का मंडी भाव, फसल रोग या सरकारी योजना पूछें)
                </div>
              </div>
            </div>

            {/* Real Audio Reactive Waveform */}
            <div className="flex items-center gap-1.5 h-8 px-3.5 bg-black/25 rounded-full">
              {[0.6, 0.9, 1.2, 0.8, 1.1, 1.3, 0.7, 1.0].map((multiplier, idx) => {
                const heightVal = Math.min(100, Math.max(15, normalizedLevel * multiplier));
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightVal}%` }}
                    className="w-1.5 bg-emerald-200 rounded-full transition-all duration-75"
                  />
                );
              })}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {interimTranscript && (
                <button
                  onClick={() => onSubmitTranscript(interimTranscript)}
                  className="px-3 py-1.5 bg-white text-emerald-900 font-bold text-xs rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Send</span>
                </button>
              )}
              <button
                onClick={onStopListening}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Done Speaking</span>
              </button>
            </div>
          </div>

          {/* Real-time Streaming Transcript preview */}
          <div className="max-w-5xl mx-auto mt-2.5 pt-2 border-t border-white/20 flex items-center gap-2 text-xs">
            <span className="text-emerald-200 font-bold shrink-0">Live Voice Stream:</span>
            <div className="flex-1 font-medium bg-black/20 px-3 py-1 rounded-md text-amber-100 italic truncate">
              {interimTranscript || (audioLevel > 15 ? 'Listening to voice...' : 'Waiting for words... (बोलना शुरू करें, जैसे: "आज करनाल में गेहूं का क्या भाव है?")')}
            </div>
          </div>
          </motion.div>
        )}

        {agentState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-3 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-amber-800 flex items-center justify-center font-bold shadow-md animate-spin">
                  <Cpu className="w-5 h-5 text-amber-700" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded text-white">
                    ⚡ AI IS PROCESSING · विश्लेषण जारी है
                  </span>
                  <span className="text-[11px] font-mono bg-black/25 px-2 py-0.5 rounded text-amber-100 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-amber-300" />
                    <span>{activeToolName || 'Gemini 1.5 Flash + Live Agmarknet Grounding'}</span>
                  </span>
                </div>
                <div className="text-xs text-amber-100 font-medium mt-0.5">
                  Consulting live weather radar, Agmarknet wholesale mandis, and ICAR agricultural database with Gemini 1.5 Flash...
                </div>
              </div>
            </div>

            {/* Animated Loading Dots */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="hidden sm:inline ml-1 text-white">Reasoning...</span>
            </div>
          </div>
          </motion.div>
        )}

        {agentState === 'replying' && (
          <motion.div
            key="replying"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white px-4 py-3 shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-800 flex items-center justify-center font-bold shadow-md">
                <Volume2 className="w-5 h-5 text-indigo-700 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded text-white">
                    🔊 AI IS REPLYING · उत्तर दे रही हूँ
                  </span>
                  <span className="text-[11px] text-indigo-200 hidden md:inline font-semibold">
                    Indian Female Voice Advisor · Powered by Gemini 1.5 Flash
                  </span>
                </div>
                <div className="text-xs text-indigo-100 font-medium mt-0.5 line-clamp-1 max-w-md">
                  {currentSpeakingText || 'Speaking verified agricultural response (Gemini 1.5 Flash)...'}
                </div>
              </div>
            </div>

            {/* Speaking equalizer & controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 h-6 px-2.5 bg-black/20 rounded-full mr-1">
                {synthWaveHeights.slice(0, 5).map((h, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${h * 0.8}%` }}
                    className="w-1 bg-white rounded-full transition-all duration-100"
                  />
                ))}
              </div>

              <button
                onClick={onReplaySpeaking}
                className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                title="Replay Voice Audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Replay</span>
              </button>

              <button
                onClick={onStopSpeaking}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Voice</span>
              </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. STANDBY CONTROLS & ERGONOMIC HUD STRIP (When Idle) */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Quick Status & Voice Capability */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={agentState === 'listening' ? onStopListening : onStartListening}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              agentState === 'listening'
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-102'
            }`}
          >
            {agentState === 'listening' ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>Stop Mic</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-amber-200" />
                <span>Start Live Voice (बोलकर पूछें)</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold text-[11px] text-stone-800">
              {agentState === 'idle' && 'Indian Female Voice Advisor Active · Ready to listen'}
              {agentState === 'listening' && 'Capturing Microphone Audio (Low Latency)...'}
              {agentState === 'processing' && 'Processing data & tools...'}
              {agentState === 'replying' && 'Voice response playing...'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
              <Cpu className="w-2.5 h-2.5 text-amber-700" />
              Gemini 1.5 Flash
            </span>
          </div>
        </div>

        {/* Right: Controls (Language Selector, Hands-Free Auto Mode, Mute) */}
        <div className="flex items-center gap-2 text-[11px]">
          {/* Hands-Free Mode Toggle */}
          <button
            onClick={onToggleHandsFree}
            className={`px-2.5 py-1 rounded-md font-semibold border transition-colors flex items-center gap-1.5 ${
              isHandsFree
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
            }`}
            title="Automatically resumes listening after AI finishes answering"
          >
            <Radio className={`w-3.5 h-3.5 ${isHandsFree ? 'text-amber-700 animate-pulse' : 'text-stone-400'}`} />
            <span>Hands-Free {isHandsFree ? 'ON' : 'OFF'}</span>
          </button>

          {/* Voice Language Selector */}
          <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-stone-50">
            <button
              onClick={() => onChangeVoiceLang('hi-IN')}
              className={`px-2 py-0.5 font-bold transition-colors ${
                voiceLang === 'hi-IN' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onChangeVoiceLang('en-IN')}
              className={`px-2 py-0.5 font-bold border-l border-stone-200 transition-colors ${
                voiceLang === 'en-IN' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Voice Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Voice Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>
        </div>
      </div>
    </div>
  );
};
