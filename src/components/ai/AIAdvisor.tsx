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
  Sprout,
  PanelLeftClose,
  PanelLeft,
  Stethoscope,
  PlusCircle,
  Trash2,
  ShieldCheck,
  Maximize2,
  Minimize2,
  UploadCloud
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { processUserMessage, fetchGeminiTTSAudio } from '../../services/aiAdvisorService';
import { ServiceCards } from './ServiceCards';
import { LiveVoiceAgentHUD, AgentState } from './LiveVoiceAgentHUD';
import { AIDoctorProgressStepper } from './AIDoctorProgressStepper';
import { FormattedMessageContent } from './FormattedMessageContent';

interface ExtendedChatMessage extends ChatMessage {
  audioDataUri?: string;
  isAudioLoading?: boolean;
  userImage?: string;
}

interface AIAdvisorProps {
  onNavigateTab?: (tab: string, filter?: string) => void;
  onOpenNegotiation?: (listing: any) => void;
}

const getWelcomeMessage = (lang: 'hi' | 'en' | 'hinglish') => {
  if (lang === 'en') {
    return `Hello! Welcome! 🙏 I am your **AI Doctor & Crop Clinic** (Powered by Kheti AI Vision & Kheti AI Intelligence).\n\n🩺 **Kheti AI Vision + Kheti AI Intelligence Crop Pathology Clinic:**\n• Scan or upload a photo of any crop leaf — **Kheti AI Vision** instantly identifies the exact botanical species\n• **Kheti AI Intelligence** diagnoses diseases or insect pests and provides a scientific Doctor Prescription (chemical spray dosage & organic remedy)\n• Ask about today's Mandi Rates, weather forecast, or government schemes via voice or text`;
  }
  if (lang === 'hinglish') {
    return `Namaste ji! Ram-ram! 🙏 Main aapki **AI Doctor & Crop Clinic** (Powered by Kheti AI Vision & Kheti AI Intelligence) hoon.\n\n🩺 **Kheti AI Vision + Kheti AI Intelligence Crop Clinic:**\n• Apni kisi bhi fasal/patti ki photo scan ya upload karein — **Kheti AI Vision** turant botanical species pehchanege\n• **Kheti AI Intelligence** bimari/keede ki pehchan karke scientific doctor prescription (chemical dosage & organic remedy) dega\n• Aaj ka mandi bhav, mausam aur govt schemes ke bare mein bolkar ya likhkar salah lein`;
  }
  return `नमस्ते जी! राम-राम! 🙏 मैं आपकी **AI Doctor & Crop Clinic (एआई डॉक्टर)** हूँ (Powered by Kheti AI Vision & Kheti AI Intelligence).\n\n🩺 **Kheti AI Vision + Kheti AI Intelligence** द्वारा संचालित फसल रोग क्लीनिक:\n• अपनी किसी भी फसल/पत्ती की फोटो स्कैन या अपलोड करें — **Kheti AI Vision** तुरंत सटीक प्रजाति (Botanical Species) पहचानेगा\n• **Kheti AI Intelligence** रोग/कीट की पहचान कर वैज्ञानिक डॉक्टर का पर्चा (Prescription), रासायनिक खुराक व जैविक उपचार देगा\n• आज का मंडी भाव, मौसम व सरकारी योजनाओं के बारे में बोलकर या लिखकर सलाह लें`;
};

const QUICK_PROMPTS = [
  {
    category: 'रोग व पत्ती जांच (Pathology)',
    items: [
      { label: 'धान में भूरा धब्बा व शीथ ब्लाइट', prompt: 'धान (Paddy) की फसल में पत्तियों पर भूरे धब्बे और तने पर शीथ ब्लाइट के लक्षण हैं। सटीक रासायनिक खुराक व जैविक उपचार बताएं।' },
      { label: 'गेहूं में पीला रतुआ (Yellow Rust)', prompt: 'गेहूं की फसल में पत्तियों पर पीली धारियां/रतुआ (Yellow Rust) दिख रहा है। रोकथाम व अनुशंसित फफूंदनाशक स्प्रे बताएं।' },
      { label: 'टमाटर में पत्ती मरोड़ (Leaf Curl)', prompt: 'टमाटर के पौधे की पत्तियां ऊपर की तरफ मुड़ रही हैं (Leaf Curl Virus)। सफेद मक्खी नियंत्रण व जैविक दवा बताएं।' },
      { label: 'कपास में गुलाबी सुंडी नियंत्रण', prompt: 'कपास (Cotton) की फसल में गुलाबी सुंडी (Pink Bollworm) की रोकथाम हेतु फेरोमोन ट्रैप व कीटनाशक स्प्रे बताएं।' }
    ]
  },
  {
    category: 'मंडी भाव व मौसम (Market & Weather)',
    items: [
      { label: 'आज का गेहूं व धान का मंडी भाव', prompt: 'आज उत्तर भारत की प्रमुख मंडियों में गेहूं और बासमती धान के मॉडल भाव और आवक स्थिति क्या है?' },
      { label: 'आगामी 3 दिन वर्षा व स्प्रे विंडो', prompt: 'अगले 3 दिनों में मेरे क्षेत्र में वर्षा और हवा की क्या स्थिति रहेगी? क्या आज कीटनाशक या फफूंदनाशक स्प्रे करना सुरक्षित है?' },
      { label: 'सरसों में माहू (Aphids) कीट नियंत्रण', prompt: 'सरसों की फसल में माहू (Aphids / चेपा) का प्रकोप हो रहा है। रासायनिक व नीम तेल स्प्रे की सटीक मात्रा बताएं।' }
    ]
  },
  {
    category: 'सरकारी योजनाएं व सब्सिडी (Schemes)',
    items: [
      { label: 'पीएम कुसुम सोलर पंप 90% सब्सिडी', prompt: 'पीएम कुसुम योजना (PM-KUSUM) के तहत कृषि सोलर पंप पर 90% सब्सिडी के लिए पात्रता, आवश्यक दस्तावेज व आवेदन प्रक्रिया बताएं।' },
      { label: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)', prompt: 'बेमौसम बारिश या ओलावृष्टि से फसल नुकसान पर प्रधानमंत्री फसल बीमा योजना (PMFBY) क्लेम प्रक्रिया व हेल्पलाइन नंबर क्या है?' }
    ]
  }
];

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ onNavigateTab, onOpenNegotiation }) => {
  const [chatLanguage, setChatLanguage] = useState<'hi' | 'en' | 'hinglish'>('hi');
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content: getWelcomeMessage('hi'),
      timestamp: 'Just now',
      toolCallsExecuted: ['Kheti AI Vision', 'Kheti AI Intelligence']
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const handleNewChat = () => {
    stopAllAudio();
    clearStepTimers();
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'assistant',
        content: getWelcomeMessage(chatLanguage),
        timestamp: 'Just now',
        toolCallsExecuted: ['Kheti AI Vision', 'Kheti AI Intelligence']
      }
    ]);
    setInputText('');
    setLeafImagePreview(null);
  };

  const handleSetChatLanguage = (lang: 'hi' | 'en' | 'hinglish') => {
    setChatLanguage(lang);
    setVoiceLang(lang === 'en' ? 'en-IN' : 'hi-IN');
    setMessages(prev =>
      prev.map(msg => (msg.id === 'msg_welcome' ? { ...msg, content: getWelcomeMessage(lang) } : msg))
    );
  };

  const [processingStep, setProcessingStep] = useState<number>(0);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

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
  const stepTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearStepTimers = useCallback(() => {
    stepTimersRef.current.forEach((t) => clearTimeout(t));
    stepTimersRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stepTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

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

  // Execute AI query with realistic staged progress transitions
  const executeQuery = useCallback(async (queryText: string, imagePayload?: string | null) => {
    const trimmed = queryText.trim();
    if (!trimmed && !imagePayload) return;

    stopAllAudio();
    clearStepTimers();

    const hasImage = !!imagePayload;
    setIsProcessingImage(hasImage);
    setProcessingStep(0);
    setAgentState('processing');
    setInterimTranscript('');
    setActiveToolName(hasImage ? 'AI Doctor (Kheti AI Vision & Intelligence)' : 'AI Doctor Assistant');

    // Smooth, realistic sequential pacing:
    // Step 0: Image Upload & Preprocessing (0 to 2000ms)
    // Step 1: Kheti AI Vision Botanical Verification (2000ms to 4800ms)
    // Step 2: Kheti AI Intelligence Pathology Diagnosis (4800ms to 8000ms)
    // Step 3: Clinical Prescription & Dosages (8000ms to 11200ms)
    // Step 4: Official Prescription & Audio Ready (11200ms+)
    if (hasImage) {
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(1), 2000));
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(2), 4800));
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(3), 8000));
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(4), 11200));
    } else {
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(1), 1600));
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(2), 3400));
      stepTimersRef.current.push(setTimeout(() => setProcessingStep(3), 5600));
    }

    const userMsg: ExtendedChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: trimmed || 'Doctor, please examine this crop leaf photo for disease or deficiency',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userImage: imagePayload || undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLeafImagePreview(null);

    try {
      const response = await processUserMessage(trimmed, conversationId, imagePayload || undefined, chatLanguage);
      
      // Clear ongoing timers and smoothly display 100% complete state
      clearStepTimers();
      setProcessingStep(hasImage ? 5 : 4); // Step index >= length marks all 5 steps complete (✓ पूर्ण)
      await new Promise((resolve) => setTimeout(resolve, 400));

      setActiveToolName(response.detectedToolName || 'AI Doctor (Kheti AI Vision & Intelligence)');

      const asstMsgId = `asst_${Date.now()}`;
      const speechToPlay = response.audioPlaybackText || response.message.substring(0, 180);

      const assistantMsg: ExtendedChatMessage = {
        id: asstMsgId,
        sender: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: response.actionCard,
        toolCallsExecuted: ['Kheti AI Vision', 'Kheti AI Intelligence']
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setAgentState('idle');

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
      clearStepTimers();
      setMessages((prev) => [
        ...prev,
        {
          id: `asst_err_${Date.now()}`,
          sender: 'assistant',
          content: 'किसान भाई, जानकारी प्राप्त करने में क्षणिक बाधा आई। कृपया पुनः प्रयास करें।',
          timestamp: 'Just now',
          toolCallsExecuted: ['Kheti AI Intelligence']
        }
      ]);
      setAgentState('idle');
    }
  }, [conversationId, speakIndianFemaleVoice, stopAllAudio, clearStepTimers, chatLanguage]);

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
        const rawUrl = event.target?.result as string;
        if (!rawUrl) return;

        // Normalize all image formats (WebP, AVIF, PNG, BMP) to standard JPEG via HTML5 Canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setLeafImagePreview(jpegDataUrl);
          } else {
            setLeafImagePreview(rawUrl);
          }
        };
        img.onerror = () => {
          setLeafImagePreview(rawUrl);
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-1">
      
      {/* ========================================================================= */}
      {/* 💻 DESKTOP FULL-SCREEN WORKSPACE (>= md) — Edge-to-Edge Modern PC Layout   */}
      {/* ========================================================================= */}
      <div className={`hidden md:flex flex-row w-full ${isFullscreenMode ? 'fixed inset-0 z-50 bg-stone-100' : 'flex-1 h-full min-h-0'} overflow-hidden border-t border-stone-200`}>
        
        {/* ─── LEFT COLLAPSIBLE CLINIC & QUICK ACTION SIDEBAR ─── */}
        {isSidebarOpen && (
          <aside className="w-72 lg:w-80 shrink-0 bg-white border-r border-stone-200 flex flex-col h-full shadow-2xs z-10 transition-all duration-200">
            {/* Sidebar Top: Header & New Consultation */}
            <div className="p-3.5 border-b border-stone-200 bg-stone-50/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                    <Stethoscope className="w-4 h-4 text-emerald-100" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-stone-900 leading-tight">AI Crop Clinic</h3>
                    <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Vision 2.0 Active</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Start New Chat Button */}
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full py-2 px-3 bg-white hover:bg-emerald-50 border border-emerald-600/30 hover:border-emerald-600 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700 group-hover:rotate-90 transition-transform" />
                <span>+ नया परामर्श (New Consultation)</span>
              </button>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
              
              {/* Quick Leaf Photo Diagnostics Zone */}
              <div className="bg-emerald-900/5 border border-emerald-600/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] text-emerald-950 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>पत्ती फोटो जांच (Vision Scan)</span>
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                    AI Doctor
                  </span>
                </div>

                {leafImagePreview ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500 h-28 bg-black">
                      <img src={leafImagePreview} alt="Selected Leaf" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setLeafImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 p-1 bg-stone-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => executeQuery(inputText || 'Doctor, please diagnose this crop leaf photo', leafImagePreview)}
                      disabled={agentState === 'processing'}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>तुरंत रोग जांचें (Diagnose)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 px-2 border-2 border-dashed border-emerald-600/30 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-stone-600 hover:text-emerald-900 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="font-bold text-[11px] text-stone-800">फसल पत्ती की फोटो चुनें</span>
                    <span className="text-[10px] text-stone-500 text-center">क्लिक करें या फाइल ड्रैग करें</span>
                  </button>
                )}
              </div>

              {/* Popular Agricultural Diagnostic Inquiries */}
              <div className="space-y-3">
                <div className="font-bold text-[11px] text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>त्वरित प्रश्न (Quick Questions)</span>
                </div>

                {QUICK_PROMPTS.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <div className="text-[10px] font-bold text-emerald-900/80 bg-emerald-50 px-2 py-0.5 rounded">
                      {group.category}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          type="button"
                          onClick={() => executeQuery(item.prompt)}
                          disabled={agentState === 'processing'}
                          className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-emerald-50 hover:text-emerald-950 border border-stone-200/80 hover:border-emerald-300 text-[11px] font-medium text-stone-700 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate pr-1">{item.label}</span>
                          <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Sidebar Footer Trust Badges */}
            <div className="p-3 border-t border-stone-200 bg-stone-50/80 space-y-1 text-[10px] text-stone-600">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>ICAR / KVK प्रमाणित रोग निदान प्रोटोकॉल</span>
              </div>
              <div className="text-stone-500 leading-tight">
                किसान कॉल सेंटर हेल्पलाइन: <a href="tel:18001801551" className="font-bold text-emerald-800 underline">1800-180-1551</a>
              </div>
            </div>
          </aside>
        )}

        {/* ─── MAIN CHAT CANVAS (Fills Remaining Screen Width & Height) ─── */}
        <div className="flex-1 flex flex-col h-full bg-stone-50/70 overflow-hidden min-w-0">
          
          {/* Main Top Header Strip */}
          <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-300 shrink-0 cursor-pointer"
                  title="Open sidebar"
                >
                  <PanelLeft className="w-4 h-4 text-emerald-800" />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm text-stone-900 tracking-tight truncate flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>AI Doctor & Crop Clinic</span>
                  </h2>
                  <span className="hidden sm:inline-flex bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold items-center gap-1 shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified Clinical Diagnostic
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 truncate hidden sm:block">
                  Powered by Kheti AI Vision & Intelligence • Audio Voice & Official PDF Prescription
                </div>
              </div>
            </div>

            {/* Right Header Controls: Voice HUD Compact, Language Switcher, Fullscreen Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Voice HUD Compact */}
              <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (agentState === 'listening') stopVoiceRecording();
                    else startVoiceRecording();
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    agentState === 'listening'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-stone-200'
                  }`}
                  title="Voice consultation"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{agentState === 'listening' ? 'सुन रहा है...' : 'बोलकर पूछें'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    setIsAudioMuted(!isAudioMuted);
                  }}
                  className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isAudioMuted
                      ? 'bg-rose-100 text-rose-800'
                      : 'hover:bg-stone-200 text-stone-600'
                  }`}
                  title={isAudioMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSetChatLanguage('hi')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    chatLanguage === 'hi' ? 'bg-amber-400 text-stone-950 font-black shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => handleSetChatLanguage('en')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    chatLanguage === 'en' ? 'bg-amber-400 text-stone-950 font-black shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleSetChatLanguage('hinglish')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    chatLanguage === 'hinglish' ? 'bg-amber-400 text-stone-950 font-black shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hinglish
                </button>
              </div>

              {/* Fullscreen Expand Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenMode(!isFullscreenMode)}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                title={isFullscreenMode ? 'Exit Fullscreen' : 'Fullscreen Desktop Workspace'}
              >
                {isFullscreenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Clear Chat Button */}
              <button
                type="button"
                onClick={handleNewChat}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Agent HUD Bar (When speaking or listening) */}
          {(agentState === 'listening' || agentState === 'replying' || isHandsFree) && (
            <div className="px-4 py-2 bg-emerald-950 border-b border-emerald-900 shrink-0">
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
            </div>
          )}

          {/* Messages Stream: Takes all available height, scrolls internally */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-5">
            <div className="max-w-4xl mx-auto w-full space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                const isSpeakingThis = currentlySpeakingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] lg:max-w-[85%] rounded-2xl p-4 lg:p-5 text-xs sm:text-sm leading-relaxed shadow-2xs space-y-3 ${
                        msg.sender === 'user'
                          ? 'bg-emerald-800 text-white rounded-br-none ml-auto'
                          : 'bg-white border border-stone-200/90 text-stone-900 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {/* Assistant Header Badge */}
                      {isAssistant && (
                        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-xs">
                            <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-900 flex items-center justify-center">
                              <Cpu className="w-3.5 h-3.5 text-amber-800" />
                            </div>
                            <span>AI Doctor (Kheti AI Vision & Intelligence)</span>
                          </div>

                          <span className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                            <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified Diagnostic
                          </span>
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="font-medium leading-relaxed">
                        <FormattedMessageContent content={msg.content} isAssistant={isAssistant} chatLanguage={chatLanguage} />
                      </div>

                      {/* Leaf Image Upload Preview */}
                      {(msg.userImage || msg.actionCard?.data?.image) && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 max-w-sm shadow-xs">
                          <img src={msg.userImage || msg.actionCard?.data?.image} alt="Crop Leaf" className="w-full h-48 object-cover" />
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
                        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSpeakingThis) stopAllAudio();
                              else speakIndianFemaleVoice(msg.content, msg.id, msg.audioDataUri);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isSpeakingThis
                                ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                            }`}
                          >
                            {isSpeakingThis ? (
                              <>
                                <Square className="w-3.5 h-3.5 fill-current text-rose-700" />
                                <span>बोलना रोकें (Stop)</span>
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

              {/* Interactive Step-by-Step Clinical Analysis Stepper */}
              {agentState === 'processing' && (
                <AIDoctorProgressStepper
                  currentStep={processingStep}
                  isImage={isProcessingImage}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Docked Composer Bar */}
          <div className="p-3.5 lg:p-4 bg-white border-t border-stone-200 shrink-0 shadow-sm">
            <div className="max-w-4xl mx-auto w-full space-y-2.5">
              
              {/* Selected Image Preview Badge */}
              {leafImagePreview && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-emerald-500 shrink-0 shadow-xs">
                      <img src={leafImagePreview} alt="Selected Crop Specimen" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-950">
                        <Camera className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>📸 फसल पत्ती फोटो चुनी गई है (Photo Uploaded)</span>
                      </div>
                      <p className="text-[11px] text-stone-600 truncate font-medium">
                        AI Doctor रोग व कीट जांच हेतु तैयार है। 'भेजें' बटन दबाएं।
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLeafImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 hover:bg-emerald-200/60 rounded-lg text-emerald-950 transition-colors shrink-0 cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeQuery(inputText, leafImagePreview);
                }}
                className="flex items-center gap-2 bg-stone-50 border border-stone-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-2xl p-1.5 transition-all shadow-xs"
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
                  className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 flex items-center justify-center text-stone-700 hover:text-emerald-900 shrink-0 transition-colors shadow-2xs cursor-pointer group"
                  title="Scan Crop Leaf Photo (फसल पत्ती फोटो अपलोड करें)"
                >
                  <Camera className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (agentState === 'listening') stopVoiceRecording();
                    else startVoiceRecording();
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                    agentState === 'listening'
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200 shadow-2xs'
                  }`}
                  title="Speak Live Voice (बोलकर पूछें)"
                >
                  <Mic className="w-5 h-5 text-stone-700" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="फसल, भाव, मौसम या सरकारी योजनाओं के बारे में पूछें (जैसे: धान में भूरा धब्बा, गेहूं का भाव)..."
                  className="flex-1 bg-transparent border-none px-3 py-2 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !leafImagePreview) || agentState === 'processing'}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer hover:shadow-sm"
                >
                  <span>भेजें</span>
                  <Send className="w-4 h-4 text-stone-950 fill-stone-950" />
                </button>
              </form>

              {/* Micro Disclaimer */}
              <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
                <span>Kheti AI Vision व Intelligence द्वारा स्वचालित रोग जांच • आधिकारिक डॉक्टर पर्चा (PDF) डाउनलोड करें</span>
                <span className="hidden sm:inline">आपातकालीन किसान कॉल सेंटर: 1800-180-1551</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW (< md) — Clean Streamlined Layout                          */}
      {/* ========================================================================= */}
      <div className="md:hidden max-w-md mx-auto min-h-screen bg-stone-50 pb-20 flex flex-col justify-between">
        
        <div className="space-y-3.5 p-3 sm:p-4">

          {/* 2. CHAT & REPORT LANGUAGE SELECTOR STRIP (MOBILE) */}
          <div className="bg-emerald-950 text-white rounded-xl p-2.5 border border-emerald-800 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200">
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Doctor Language (भाषा का चयन करें):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSetChatLanguage('hi')}
                className={`py-1 rounded-lg text-xs font-extrabold border text-center transition-all cursor-pointer ${
                  chatLanguage === 'hi'
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs'
                    : 'bg-emerald-900 text-emerald-100 border-emerald-800'
                }`}
              >
                🇮🇳 हिंदी
              </button>
              <button
                type="button"
                onClick={() => handleSetChatLanguage('en')}
                className={`py-1 rounded-lg text-xs font-extrabold border text-center transition-all cursor-pointer ${
                  chatLanguage === 'en'
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs'
                    : 'bg-emerald-900 text-emerald-100 border-emerald-800'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => handleSetChatLanguage('hinglish')}
                className={`py-1 rounded-lg text-xs font-extrabold border text-center transition-all cursor-pointer ${
                  chatLanguage === 'hinglish'
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs'
                    : 'bg-emerald-900 text-emerald-100 border-emerald-800'
                }`}
              >
                🌾 Hinglish
              </button>
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
                          <span>AI Doctor (Kheti AI Vision & Intelligence)</span>
                        </div>

                        <span className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified Doctor
                        </span>
                      </div>
                    )}

                    <div className="font-medium leading-relaxed">
                      <FormattedMessageContent content={msg.content} isAssistant={isAssistant} chatLanguage={chatLanguage} />
                    </div>

                    {(msg.userImage || msg.actionCard?.data?.image) && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 max-w-xs">
                        <img src={msg.userImage || msg.actionCard?.data?.image} alt="Crop Leaf" className="w-full h-36 object-cover" />
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
              <AIDoctorProgressStepper
                currentStep={processingStep}
                isImage={isProcessingImage}
              />
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
          {/* Mobile Image Selected Preview Badge */}
          {leafImagePreview && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-emerald-500 shrink-0">
                  <img src={leafImagePreview} alt="Selected Specimen" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-950">
                    <Camera className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>📸 फोटो अपलोड हो गई है</span>
                  </div>
                  <p className="text-[10px] text-stone-600 truncate font-medium">
                    'भेजें' बटन दबाएं — AI Doctor जांच करेगा
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeafImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 hover:bg-emerald-200/60 rounded-lg text-stone-700 transition-colors shrink-0"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
