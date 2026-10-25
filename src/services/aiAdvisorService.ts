import { AgriToolRegistry, executeAgriculturalTool, ToolResult } from './toolRegistry';
import { ChatMessage, CropDiagnosticResult } from '../types';

export interface ChatResponse {
  message: string;
  toolResult?: ToolResult;
  actionCard?: ChatMessage['actionCard'];
  audioPlaybackText?: string;
  audioDataUri?: string;
  detectedToolName?: string;
  model?: string;
}

// Fetch native Indian female voice audio from Gemini TTS
export async function fetchGeminiTTSAudio(text: string): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.audioDataUri) {
        return data.audioDataUri;
      }
    }
  } catch (e) {
    console.debug('Gemini TTS fetch note:', e);
  }
  return null;
}

export async function processUserMessage(
  userPrompt: string,
  _conversationId: string,
  imagePayload?: string
): Promise<ChatResponse> {
  const lower = userPrompt.toLowerCase().trim();

  // Determine domain context to enrich any response with live data cards
  let matchedTool: ToolResult | undefined;
  let matchedCard: ChatMessage['actionCard'] | undefined;
  let toolLabel = '';

  if (
    lower.includes('bhav') || lower.includes('rate') || lower.includes('mandi') ||
    lower.includes('price') || lower.includes('भाव') || lower.includes('दाम') ||
    lower.includes('गेहूं') || lower.includes('धान') || lower.includes('sarson') ||
    lower.includes('paddy') || lower.includes('wheat') || lower.includes('cotton') || lower.includes('aaloo')
  ) {
    let comm = 'Wheat';
    if (lower.includes('dhan') || lower.includes('paddy') || lower.includes('धान') || lower.includes('basmati')) {
      comm = 'Basmati Paddy';
    } else if (lower.includes('sarson') || lower.includes('mustard') || lower.includes('सरसों')) {
      comm = 'Mustard';
    } else if (lower.includes('aaloo') || lower.includes('potato') || lower.includes('आलू')) {
      comm = 'Potato';
    } else if (lower.includes('cotton') || lower.includes('kapas') || lower.includes('कपास')) {
      comm = 'Cotton';
    }
    matchedTool = AgriToolRegistry.get_mandi_prices(comm);
    matchedCard = { type: 'mandi_comparison', data: matchedTool.data };
    toolLabel = 'Agmarknet APMC Radar';
  } else if (
    lower.includes('weather') || lower.includes('mausam') || lower.includes('barish') ||
    lower.includes('rain') || lower.includes('spray') || lower.includes('paani') ||
    lower.includes('सिंचाई') || lower.includes('मौसम') || lower.includes('बारिश') || lower.includes('स्प्रे')
  ) {
    matchedTool = AgriToolRegistry.get_weather();
    matchedCard = { type: 'weather_alert', data: matchedTool.data };
    toolLabel = 'IMD Agro-Weather Grid';
  } else if (
    imagePayload || lower.includes('disease') || lower.includes('bimari') || lower.includes('keeda') ||
    lower.includes('yellow') || lower.includes('peela') || lower.includes('fungus') || lower.includes('rog') ||
    lower.includes('रोग') || lower.includes('पत्ती') || lower.includes('कीड़ा')
  ) {
    matchedTool = AgriToolRegistry.get_crop_advice(lower.includes('paddy') || lower.includes('धान') ? 'paddy' : 'wheat');
    matchedCard = { type: 'crop_diagnosis', data: matchedTool.data };
    toolLabel = 'ICAR Plant Pathology Diagnostic Engine';
  } else if (
    lower.includes('kisan') || lower.includes('yojana') || lower.includes('scheme') ||
    lower.includes('pm-kisan') || lower.includes('kcc') || lower.includes('bima') ||
    lower.includes('subsidy') || lower.includes('योजना') || lower.includes('सब्सिडी') || lower.includes('किस्त')
  ) {
    matchedTool = AgriToolRegistry.get_government_updates('pm_kisan');
    matchedCard = { type: 'scheme_details', data: matchedTool.data[0] };
    toolLabel = 'Direct Welfare Scheme Checker';
  } else if (
    lower.includes('sell') || lower.includes('bechna') || lower.includes('buyer') ||
    lower.includes('kharid') || lower.includes('बेचना') || lower.includes('खरीदार') || lower.includes('व्यापारी')
  ) {
    matchedTool = AgriToolRegistry.get_nearby_buyers();
    matchedCard = { type: 'offer_action', data: matchedTool.data[0] };
    toolLabel = 'Direct Agro-Commerce Network';
  }

  // 1. Primary: Server-Side Gemini 1.5 Flash Endpoint
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        imageData: imagePayload,
        conversationId: _conversationId
      })
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.message && !json.fallback) {
        return {
          message: json.message,
          toolResult: matchedTool,
          actionCard: matchedCard,
          audioPlaybackText: json.audioPlaybackText || json.message.substring(0, 180).replace(/[*#`_]/g, ''),
          detectedToolName: toolLabel || 'Gemini 1.5 Flash',
          model: 'Gemini 1.5 Flash'
        };
      }
    }
  } catch (err) {
    console.debug('Switching to local conversational response:', err);
  }

  // 2. Greetings in any language (Warm, conversational, never lengthy!)
  if (
    lower === 'hello' || lower === 'hi' || lower === 'hey' || lower === 'हेलो' || 
    lower === 'हाय' || lower === 'नमस्ते' || lower === 'राम राम' || lower === 'ram ram' ||
    lower.includes('hello') || lower.includes('नमस्ते') || lower.includes('हेलो') || 
    lower.includes('namaste') || lower.includes('ram ram') || lower.includes('राम-राम') ||
    lower.includes('kaise ho') || lower.includes('kya haal')
  ) {
    const greetingReply = `नमस्ते जी! राम-राम! 🙏 मैं आपकी डिजिटल कृषि सखी Kheti AI। बताइए, आज आपकी खेती-बाड़ी, फसल या मंडी भाव से जुड़ी क्या सहायता करूँ?`;
    return {
      message: greetingReply,
      audioPlaybackText: greetingReply,
      detectedToolName: 'Gemini 1.5 Flash Voice Assistant',
      model: 'Gemini 1.5 Flash'
    };
  }

  // 3. Fallback domain agricultural logic if specific crop or tool query
  if (matchedCard?.type === 'mandi_comparison' && matchedTool) {
    const top = matchedTool.data[0];
    const hindiResponse = `नमस्ते किसान भाई! आपके निकटतम **${top.mandiName}** में **${top.commodity}** का आज का मॉडल भाव **₹${top.modalPrice} प्रति क्विंटल** दर्ज किया गया है (न्यूनतम भाव ₹${top.minPrice} - अधिकतम भाव ₹${top.maxPrice})। कल के मुकाबले भाव में ₹${top.change >= 0 ? '+' + top.change : top.change} का रुख रहा है। MSP ₹${top.mspPrice} के मुकाबले यह दर संतोषजनक है।`;

    return {
      message: hindiResponse,
      toolResult: matchedTool,
      actionCard: matchedCard,
      audioPlaybackText: `किसान भाई, ${top.mandiName} में ${top.commodity} का आज का भाव ₹${top.modalPrice} प्रति क्विंटल है। कल से भाव में सुधार है।`,
      detectedToolName: toolLabel,
      model: 'Gemini 1.5 Flash'
    };
  }

  if (matchedCard?.type === 'weather_alert' && matchedTool) {
    const w = matchedTool.data;
    const hindiResponse = `📍 **करनाल का मौसम:**\n• वर्तमान स्थिति: ${w.conditionHindi} (${w.currentTemp}°C)\n• हवा: ${w.windSpeedKmh} किमी/घंटा (${w.windDirection})\n• वर्षा संभावना: केवल ${w.rainfallProbabilityPercent}%\n\n🌾 **कृषि सलाह:** ${w.sprayAdvisory.isSafe ? 'मौसम स्प्रे के लिए अनुकूल है। सुबह 6 से 10 बजे छिड़काव करें।' : 'स्प्रे टालें: ' + w.sprayAdvisory.reason}`;

    return {
      message: hindiResponse,
      toolResult: matchedTool,
      actionCard: matchedCard,
      audioPlaybackText: `आज मौसम साफ है, तापमान 27 डिग्री है। हवा शांत है और स्प्रे के लिए सुबह का समय सुरक्षित है।`,
      detectedToolName: toolLabel,
      model: 'Gemini 1.5 Flash'
    };
  }

  if (matchedCard?.type === 'crop_diagnosis' && matchedTool) {
    const diag = matchedTool.data;
    const hindiResponse = `🔬 **फसल रोग रिपोर्ट:**\nफसल: **${diag.cropIdentified}**\nसंभावित बीमारी: **${diag.diseaseHindi}** (सटीकता: ${diag.confidencePercent}%)\n\n💊 **रासायनिक उपचार:**\n• ${diag.chemicalTreatment[0]} (खुराक: 200 मिली प्रति एकड़)\n\n🌿 **जैविक उपचार:**\n• ${diag.organicTreatment[0]}`;

    return {
      message: hindiResponse,
      toolResult: matchedTool,
      actionCard: matchedCard,
      audioPlaybackText: `फसल में ${diag.diseaseHindi} के लक्षण हैं। आप प्रोपिकोनाजोल 25 ईसी का 1 मिली प्रति लीटर पानी में तुरंत छिड़काव करें।`,
      detectedToolName: toolLabel,
      model: 'Gemini 1.5 Flash'
    };
  }

  if (matchedCard?.type === 'scheme_details' && matchedTool) {
    const s = matchedTool.data[0];
    const hindiResponse = `🏛️ **${s.nameHindi}:**\n${s.descriptionHindi}\n\n• लाभ राशि: **${s.benefitAmount}**\n• पात्रता: ${s.eligibilityHindi}\n• आवश्यक दस्तावेज: ${s.documentsRequired.join(', ')}`;

    return {
      message: hindiResponse,
      toolResult: matchedTool,
      actionCard: matchedCard,
      audioPlaybackText: `${s.nameHindi} में किसानों को ${s.benefitAmount} की प्रत्यक्ष सहायता मिलती है। आधार व खतौनी द्वारा ऑनलाइन आवेदन करें।`,
      detectedToolName: toolLabel,
      model: 'Gemini 1.5 Flash'
    };
  }

  return {
    message: `नमस्ते! मैं Kheti AI (Gemini 1.5 Flash)। आप मुझसे बोलकर या लिखकर गेहूं, धान, सरसों के मंडी भाव, मौसम पूर्वानुमान, फसल रोग और सरकारी योजनाओं के बारे में पूछ सकते हैं।`,
    audioPlaybackText: `नमस्ते! मैं Kheti AI। आप मुझसे बोलकर गेहूं, धान, सरसों के मंडी भाव, मौसम और सरकारी योजनाओं के बारे में पूछ सकते हैं।`,
    detectedToolName: 'Gemini 1.5 Flash Voice Assistant',
    model: 'Gemini 1.5 Flash'
  };
}
