import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Camera, 
  Volume2, 
  Sparkles, 
  CheckCircle, 
  Cpu,
  ChevronRight,
  X,
  Square,
  Globe,
  MapPin,
  MessageSquareText,
  VolumeX,
  RefreshCw,
  HelpCircle,
  Menu,
  Bell,
  Sprout
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { processUserMessage, fetchGeminiTTSAudio } from '../../services/aiAdvisorService';
import { ServiceCards } from './ServiceCards';
import { LiveVoiceAgentHUD, AgentState } from './LiveVoiceAgentHUD';

interface ExtendedChatMessage extends ChatMessage {
  audioDataUri?: string;
  isAudioLoading?: boolean;
}

interface AIAdvisorProps {
  onNavigateTab?: (tab: string, filter?: string) => void;
  onOpenNegotiation?: (listing: any) => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ onNavigateTab, onOpenNegotiation }) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content: `नमस्ते जी! राम-राम! 🙏 मैं आपकी डिजिटल कृषि सहायक **Kheti AI** (Powered by Gemini 1.5 Flash) हूँ।\n\nआप मुझसे बिना किसी झिझक के सीधे बोलकर या लिखकर पूछ सकते हैं:\n• आज का ताजा मंडी भाव (गेहूँ, धान, सरसों, कपास, आलू)\n• अपने जिले का मौसम पूर्वानुमान व कृषि सलाह\n• फसल रोग की पहचान व जैविक/रासायनिक उपचार\n• सरकारी योजनाएँ (PM-KISAN 19वीं किश्त, फसल बीमा)\n• अपने खेत, मिट्टी और फसल की व्यक्तिगत सलाह`,
      timestamp: 'Just now',
      toolCallsExecuted: ['Gemini 1.5 Flash']
    }
  ]);

  const [inputText, setInputText] = useState('');
  
  // Explicit Agent States: 'idle' | 'listening' | 'processing' | 'replying'
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeToolName, setActiveToolName] = useState<string | null>(null);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [leafImagePreview, setLeafImagePreview] = useState<string | null>(null);
  const [conversationId] = useState(`conv_${Date.now().toString(36)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardware audio references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);


  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentState]);

  // Stop active audio playbacks
  const stopAllAudio = useCallback(() => {
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current.currentTime = 0;
      activeAudioElementRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    activeUtteranceRef.current = null;
    setCurrentSpeakingText(null);
    setCurrentlySpeakingMsgId(null);
    setAgentState('idle');
  }, []);

  // Indian female voice synthesis
  const speakIndianFemaleVoice = useCallback((text: string, msgId?: string, audioDataUri?: string) => {
    if (isAudioMuted) {
      setAgentState('idle');
      return;
    }

    if (audioDataUri) {
      try {
        stopAllAudio();
        const audio = new Audio(audioDataUri);
        activeAudioElementRef.current = audio;
        setCurrentSpeakingText(text);
        if (msgId) setCurrentlySpeakingMsgId(msgId);
        setAgentState('replying');

        audio.onended = () => {
          activeAudioElementRef.current = null;
          setCurrentSpeakingText(null);
          setCurrentlySpeakingMsgId(null);
          setAgentState('idle');
        };

        audio.onerror = () => {
          activeAudioElementRef.current = null;
          speakWithBrowserSynth(text, msgId);
        };

        audio.play().catch(() => speakWithBrowserSynth(text, msgId));
        return;
      } catch (err) {
        console.debug('Audio element note:', err);
      }
    }

    speakWithBrowserSynth(text, msgId);
  }, [isAudioMuted, stopAllAudio]);

  const speakWithBrowserSynth = useCallback((text: string, msgId?: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) {
      setAgentState('idle');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#•_`]/g, '').trim();
      if (!cleanText) {
        setAgentState('idle');
        return;
      }

      setCurrentSpeakingText(cleanText);
      if (msgId) setCurrentlySpeakingMsgId(msgId);
      setAgentState('replying');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      activeUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => 
        (v.lang.startsWith('hi') || v.lang.includes('IN')) && 
        (v.name.toLowerCase().includes('female') || v.name.includes('Swara') || v.name.includes('Lekha') || v.name.includes('Google हिन्दी'))
      ) || voices.find(v => v.lang.startsWith('hi')) || null;

      if (indianVoice) utterance.voice = indianVoice;
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.15;

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setCurrentSpeakingText(null);
        setCurrentlySpeakingMsgId(null);
        setAgentState('idle');
      };

      utterance.onerror = () => {
        activeUtteranceRef.current = null;
        setCurrentSpeakingText(null);
        setCurrentlySpeakingMsgId(null);
        setAgentState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.debug('Speech synth fallback note:', e);
      setAgentState('idle');
    }
  }, [isAudioMuted]);

  // Execute AI query
  const executeQuery = useCallback(async (queryText: string, imagePayload?: string | null) => {
    const trimmed = queryText.trim();
    if (!trimmed && !imagePayload) return;

    stopAllAudio();
    setAgentState('processing');
    setInterimTranscript('');
    setActiveToolName('Gemini 1.5 Flash Advisor');

    const userMsg: ExtendedChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: trimmed || 'Examine this crop leaf image for disease or deficiency',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCard: imagePayload ? { type: 'crop_diagnosis', data: { image: imagePayload } } : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLeafImagePreview(null);

    try {
      const response = await processUserMessage(trimmed, conversationId, imagePayload || undefined);
      setActiveToolName(response.detectedToolName || 'Gemini 1.5 Flash');

      const asstMsgId = `asst_${Date.now()}`;
      const speechToPlay = response.audioPlaybackText || response.message.substring(0, 180);

      const assistantMsg: ExtendedChatMessage = {
        id: asstMsgId,
        sender: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: response.actionCard,
        toolCallsExecuted: ['Gemini 1.5 Flash']
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak response immediately
      speakIndianFemaleVoice(speechToPlay, asstMsgId);

      // Fetch Gemini TTS audio in background
      fetchGeminiTTSAudio(speechToPlay).then((wavDataUri) => {
        if (wavDataUri) {
          setMessages((prev) =>
            prev.map((m) => (m.id === asstMsgId ? { ...m, audioDataUri: wavDataUri } : m))
          );
        }
      });

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst_err_${Date.now()}`,
          sender: 'assistant',
          content: 'किसान भाई, जानकारी प्राप्त करने में क्षणिक बाधा आई। कृपया पुनः प्रयास करें।',
          timestamp: 'Just now',
          toolCallsExecuted: ['Gemini 1.5 Flash']
        }
      ]);
      setAgentState('idle');
    }
  }, [conversationId, speakIndianFemaleVoice, stopAllAudio]);

  // Clean up all hardware streams
  const cleanupAudioHardware = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Real Hardware Microphone Recording
  const startVoiceRecording = async () => {
    stopAllAudio();
    cleanupAudioHardware();
    setInterimTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (interimTranscript.trim()) {
          executeQuery(interimTranscript);
        } else {
          setAgentState('idle');
        }
        cleanupAudioHardware();
      };

      mediaRecorder.start(250);
      setAgentState('listening');

      // Speech Recognition for live text feedback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN';
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
          let currentWords = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentWords += event.results[i][0].transcript;
          }
          if (currentWords) {
            setInterimTranscript(currentWords);
          }
        };

        recognition.start();
      }
    } catch (e) {
      console.warn('Microphone permission required:', e);
      alert('कृपया माइक एक्सेस की अनुमति दें।');
      setAgentState('idle');
      cleanupAudioHardware();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudioHardware();
      setAgentState('idle');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLeafImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      
      {/* ========================================================================= */}
      {/* 💻 DESKTOP FULL-WIDTH VIEW (>= md) — Rich Spacious Workspace Layout       */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col space-y-4 max-w-7xl mx-auto">
        
        {/* Top Live Voice HUD Toolbar */}
        <LiveVoiceAgentHUD
          agentState={agentState}
          interimTranscript={interimTranscript}
          activeToolName={activeToolName}
          currentSpeakingText={currentSpeakingText}
          audioLevel={audioLevel}
          onStartListening={startVoiceRecording}
          onStopListening={stopVoiceRecording}
          onSubmitTranscript={(text) => executeQuery(text)}
          onStopSpeaking={stopAllAudio}
          onReplaySpeaking={() => {
            const lastMsg = [...messages].reverse().find(m => m.sender === 'assistant');
            if (lastMsg) speakIndianFemaleVoice(lastMsg.content, lastMsg.id, lastMsg.audioDataUri);
          }}
          isHandsFree={isHandsFree}
          onToggleHandsFree={() => setIsHandsFree(!isHandsFree)}
          isAudioMuted={isAudioMuted}
          onToggleMute={() => {
            stopAllAudio();
            setIsAudioMuted(!isAudioMuted);
          }}
          voiceLang={voiceLang}
          onChangeVoiceLang={(l) => setVoiceLang(l as 'hi-IN' | 'en-IN')}
        />

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-12 gap-5 items-start">
          
          {/* Left Column (8 cols): Main Chat Stream */}
          <div className="col-span-8 bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-[650px] justify-between">
            
            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                const isSpeakingThis = currentlySpeakingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-emerald-800 text-white rounded-br-none ml-auto'
                          : 'bg-stone-50/80 border border-stone-200 text-stone-900 rounded-bl-none'
                      }`}
                    >
                      {/* Assistant Header Badge */}
                      {isAssistant && (
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                            <Cpu className="w-3.5 h-3.5 text-amber-700" />
                            <span>Gemini 1.5 Flash</span>
                          </div>

                          <span className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified
                          </span>
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="whitespace-pre-wrap font-medium leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Leaf Image Upload Preview */}
                      {msg.actionCard?.data?.image && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 max-w-sm">
                          <img src={msg.actionCard.data.image} alt="Crop Leaf" className="w-full h-44 object-cover" />
                        </div>
                      )}

                      {/* Action Cards */}
                      {msg.actionCard && (
                        <ServiceCards
                          cardType={msg.actionCard.type}
                          data={msg.actionCard.data}
                          onNavigate={onNavigateTab}
                          onAction={(_action, payload) => {
                            if (onOpenNegotiation) onOpenNegotiation(payload);
                          }}
                        />
                      )}

                      {/* Audio Button */}
                      {isAssistant && (
                        <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between">
                          <button
                            onClick={() => {
                              if (isSpeakingThis) stopAllAudio();
                              else speakIndianFemaleVoice(msg.content, msg.id, msg.audioDataUri);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                              isSpeakingThis
                                ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {isSpeakingThis ? (
                              <>
                                <Square className="w-3.5 h-3.5 fill-current text-rose-700" />
                                <span>बोलना रोकें</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>🔊 भारतीय महिला आवाज़ में सुनें (Listen Voice)</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] font-mono text-stone-400">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Processing Loader */}
              {agentState === 'processing' && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-xs text-amber-950 font-bold shadow-2xs max-w-md">
                  <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
                  <span>Kheti AI (Gemini 1.5 Flash) उत्तर तैयार कर रहा है...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Desktop Composer Bar */}
            <div className="p-3 bg-stone-50 border-t border-stone-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeQuery(inputText, leafImagePreview);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-700 shrink-0 transition-colors"
                  title="Scan Crop Leaf Photo"
                >
                  <Camera className="w-5 h-5 text-stone-700" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (agentState === 'listening') stopVoiceRecording();
                    else startVoiceRecording();
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    agentState === 'listening'
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                  }`}
                  title="Speak Live Voice"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="फसल, भाव, मौसम या सरकारी योजनाओं के बारे में पूछें..."
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 focus:outline-none focus:border-amber-600 transition-colors"
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !leafImagePreview) || agentState === 'processing'}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                >
                  <span>भेजें</span>
                  <Send className="w-4 h-4 text-stone-950 fill-stone-950" />
                </button>
              </form>
            </div>

          </div>

          {/* Right Column (4 cols): Quick Hero Banner & Suggested Prompts */}
          <div className="col-span-4 space-y-4">
            
            {/* Desktop Hero Assistant Banner */}
            <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5 fill-amber-300" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 leading-none">
                    Kheti AI सहायता
                  </h2>
                  <p className="text-[11px] font-bold text-amber-900 leading-none mt-1">
                    आपका डिजिटल कृषि सलाहकार
                  </p>
                </div>
              </div>

              {/* Large Voice Button for Desktop */}
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="font-extrabold text-stone-900 block">वॉइस सलाहकार</span>
                  <span className="text-[11px] text-stone-600 font-medium">हिंदी में बोलकर सवाल पूछें</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (agentState === 'listening') stopVoiceRecording();
                    else startVoiceRecording();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-xs ${
                    agentState === 'listening' ? 'bg-rose-600 animate-pulse' : 'bg-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{agentState === 'listening' ? 'सुन रहा है...' : 'बोलकर पूछें'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW (< md) — Strictly Matching Reference Mockup Image          */}
      {/* ========================================================================= */}
      <div className="md:hidden max-w-md mx-auto min-h-screen bg-stone-50 pb-20 flex flex-col justify-between">
        
        <div className="space-y-3.5 p-3 sm:p-4">

          {/* 1. TOP HERO ASSISTANT BANNER CARD */}
          <div className="relative bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/90 shadow-2xs space-y-3 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80')` }} />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5 fill-amber-300" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 leading-none">
                    Kheti AI सहायता
                  </h2>
                  <p className="text-[11px] font-bold text-amber-900 leading-none mt-1">
                    आपका डिजिटल कृषि सलाहकार
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-12 gap-2 items-center">
              <div className="col-span-8 bg-white border border-amber-200 rounded-full px-3.5 py-2.5 shadow-2xs flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-amber-700 shrink-0" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      executeQuery(inputText, leafImagePreview);
                    }
                  }}
                  placeholder="आज मैं आपकी कैसे मदद करूँ?"
                  className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-500"
                />
              </div>

              <div className="col-span-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (agentState === 'listening') stopVoiceRecording();
                    else startVoiceRecording();
                  }}
                  className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-md transition-transform active:scale-95 border-2 border-white ${
                    agentState === 'listening'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  }`}
                  title="बोलकर पूछें (Voice Assistant)"
                >
                  <Mic className="w-7 h-7 text-white" />
                </button>
                <span className="text-[10px] font-extrabold text-stone-800 block mt-1">
                  {agentState === 'listening' ? 'सुन रहा है...' : 'बोलकर पूछें'}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <button
                onClick={() => executeQuery('आज का मंडी भाव बताओँ')}
                className="bg-white/90 hover:bg-white border border-amber-200 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-2xs transition-colors"
              >
                आज का मंडी भाव बताओँ
              </button>
              <button
                onClick={() => executeQuery('मेरी फसल में यह रोग क्यों है?')}
                className="bg-white/90 hover:bg-white border border-amber-200 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-2xs transition-colors"
              >
                मेरी फसल में यह रोग क्यों है?
              </button>
              <button
                onClick={() => executeQuery('सरकारी योजना कौन सी हैं?')}
                className="bg-white/90 hover:bg-white border border-amber-200 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-2xs transition-colors"
              >
                सरकारी योजना कौन सी हैं?
              </button>
            </div>
          </div>

          {/* 2. MODEL STATUS BAR */}
          <div className="flex items-center justify-between px-1 text-xs font-semibold">
            <div className="flex items-center gap-2 text-stone-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-bold text-stone-800">
                Indian Female Voice Advisor Active · Ready to listen
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-300 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-amber-700" />
              <span>Gemini 1.5 Flash</span>
            </div>
          </div>

          {/* 3. CHAT MESSAGES STREAM */}
          <div className="space-y-3">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const isSpeakingThis = currentlySpeakingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-full w-full rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-800 text-white rounded-br-none ml-auto max-w-[85%]'
                        : 'bg-white border border-stone-200 text-stone-900 rounded-bl-none'
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex items-center justify-between pb-2 border-b border-stone-150">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                          <Cpu className="w-3.5 h-3.5 text-amber-700" />
                          <span>Gemini 1.5 Flash</span>
                        </div>

                        <span className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified
                        </span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap font-medium leading-relaxed">
                      {msg.content}
                    </div>

                    {msg.actionCard?.data?.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 max-w-xs">
                        <img src={msg.actionCard.data.image} alt="Crop Leaf" className="w-full h-36 object-cover" />
                      </div>
                    )}

                    {msg.actionCard && (
                      <ServiceCards
                        cardType={msg.actionCard.type}
                        data={msg.actionCard.data}
                        onNavigate={onNavigateTab}
                        onAction={(_action, payload) => {
                          if (onOpenNegotiation) onOpenNegotiation(payload);
                        }}
                      />
                    )}

                    {isAssistant && (
                      <div className="pt-2 border-t border-stone-150 flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (isSpeakingThis) stopAllAudio();
                            else speakIndianFemaleVoice(msg.content, msg.id, msg.audioDataUri);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            isSpeakingThis
                              ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isSpeakingThis ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current text-rose-700" />
                              <span>बोलना रोकें</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>भारतीय महिला आवाज़ में सुनें (Listen Voice)</span>
                            </>
                          )}
                        </button>

                        <span className="text-[10px] font-mono text-stone-400">{msg.timestamp}</span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {agentState === 'processing' && (
              <div className="p-3 bg-white border border-amber-300 rounded-2xl flex items-center gap-2.5 text-xs text-amber-950 font-bold shadow-2xs">
                <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
                <span>Kheti AI (Gemini 1.5 Flash) उत्तर तैयार कर रहा है...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {leafImagePreview && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={leafImagePreview} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-amber-300" />
                <span className="text-xs font-bold text-amber-950">फसल पत्ती फोटो अपलोड हो गई है</span>
              </div>
              <button onClick={() => setLeafImagePreview(null)} className="p-1 hover:bg-amber-100 rounded">
                <X className="w-4 h-4 text-stone-600" />
              </button>
            </div>
          )}

        </div>

        {/* ─── STICKY BOTTOM INPUT COMPOSER BAR ─── */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeQuery(inputText, leafImagePreview);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0 transition-colors"
              title="Scan Crop Leaf Photo"
            >
              <Camera className="w-5 h-5 text-stone-700" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (agentState === 'listening') stopVoiceRecording();
                else startVoiceRecording();
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                agentState === 'listening'
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
              title="Speak Live Voice"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="फसल, भाव, मौसम या योजनाओं के बारे में पूछें..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white transition-colors placeholder:text-stone-400"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !leafImagePreview) || agentState === 'processing'}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 flex items-center justify-center shrink-0 shadow-xs transition-colors"
              title="Send Query"
            >
              <Send className="w-4 h-4 text-stone-950 fill-stone-950" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
