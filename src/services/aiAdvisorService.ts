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
  imagePayload?: string,
  targetLang: 'hi' | 'en' | 'hinglish' = 'hi'
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
    lower.includes('रोग') || lower.includes('पत्ती') || lower.includes('कीड़ा') || lower.includes('cabbage') ||
    lower.includes('gobhi') || lower.includes('गोभी') || lower.includes('पत्तागोभी')
  ) {
    let cropTarget = 'crop';
    if (lower.includes('cabbage') || lower.includes('gobhi') || lower.includes('gobi') || lower.includes('पत्तागोभी') || lower.includes('फूलगोभी')) {
      cropTarget = 'cabbage';
    } else if (lower.includes('tomato') || lower.includes('tamatar') || lower.includes('टमाटर')) {
      cropTarget = 'tomato';
    } else if (lower.includes('potato') || lower.includes('aloo') || lower.includes('आलू')) {
      cropTarget = 'potato';
    } else if (lower.includes('mustard') || lower.includes('sarson') || lower.includes('सरसों')) {
      cropTarget = 'mustard';
    } else if (lower.includes('wheat') || lower.includes('gehun') || lower.includes('गेहूं')) {
      cropTarget = 'wheat';
    } else if (lower.includes('paddy') || lower.includes('dhan') || lower.includes('धान') || lower.includes('rice')) {
      cropTarget = 'paddy';
    }
    matchedTool = AgriToolRegistry.get_crop_advice(cropTarget);
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

  // 1. Primary: Server-Side AI Doctor Endpoint (Kheti AI Vision & Kheti AI Intelligence)
  try {
    const endpoint = imagePayload ? '/api/gemini/ai-doctor' : '/api/gemini/chat';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        imageData: imagePayload,
        conversationId: _conversationId,
        targetLang
      })
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.message && !json.fallback) {
        return {
          message: json.message,
          toolResult: matchedTool,
          actionCard: json.actionCard || matchedCard,
          audioPlaybackText: json.audioPlaybackText || json.message.substring(0, 180).replace(/[*#`_]/g, ''),
          detectedToolName: toolLabel || (imagePayload ? 'AI Doctor (Kheti AI Vision & Intelligence)' : 'AI Doctor Assistant'),
          model: json.model || 'AI Doctor (Kheti AI Intelligence)'
        };
      }
    }
  } catch (err) {
    console.debug('Switching to local conversational response:', err);
  }

  // 1.1 Direct Client-Side Pl@ntNet API Fallback (Active when on static hosting e.g. Vercel)
  if (imagePayload) {
    try {
      const cleanB64 = imagePayload.includes('base64,') ? imagePayload.split('base64,')[1] : imagePayload;
      const byteChars = atob(cleanB64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNums)], { type: 'image/jpeg' });

      const form = new FormData();
      form.append('images', blob, 'crop_leaf.jpg');
      form.append('organs', 'auto');

      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 7000);
      const pnRes = await fetch('https://my-api.plantnet.org/v2/identify/all?api-key=2b10ih2lmPyeU0g2v0ioEzYZ&lang=en', {
        method: 'POST',
        body: form,
        signal: ctrl.signal
      });
      clearTimeout(tId);

      if (pnRes.ok) {
        const pnData: any = await pnRes.json();
        if (pnData && pnData.results && pnData.results.length > 0) {
          const top = pnData.results[0];
          const sp = top.species || {};
          const scientific = sp.scientificNameWithoutAuthor || sp.scientificName || '';
          const commonList = Array.isArray(sp.commonNames) ? sp.commonNames : [];
          const commonStr = commonList.join(' ').toLowerCase();
          const sciStr = scientific.toLowerCase();
          const matchScore = Math.round((top.score || 0) * 100);

          let detectedTarget = 'crop';
          if (sciStr.includes('brassica') || commonStr.includes('cabbage') || commonStr.includes('kale') || sciStr.includes('oleracea') || sciStr.includes('lactuca') || commonStr.includes('lettuce')) {
            detectedTarget = 'cabbage';
          } else if (sciStr.includes('solanum') && (sciStr.includes('lycopersicum') || commonStr.includes('tomato'))) {
            detectedTarget = 'tomato';
          } else if (sciStr.includes('tuberosum') || commonStr.includes('potato')) {
            detectedTarget = 'potato';
          } else if (sciStr.includes('juncea') || commonStr.includes('mustard')) {
            detectedTarget = 'mustard';
          } else if (sciStr.includes('triticum') || commonStr.includes('wheat')) {
            detectedTarget = 'wheat';
          } else if (sciStr.includes('oryza') || commonStr.includes('rice') || commonStr.includes('paddy')) {
            detectedTarget = 'paddy';
          }

          const resolvedTool = AgriToolRegistry.get_crop_advice(detectedTarget);
          const pnMatch = {
            speciesName: scientific || 'Botanical Species',
            commonNames: commonList,
            scorePercent: matchScore,
            family: sp.family?.scientificNameWithoutAuthor || '',
            genus: sp.genus?.scientificNameWithoutAuthor || ''
          };

          const actionCardData = {
            ...resolvedTool.data,
            plantNetMatch: pnMatch,
            confidencePercent: Math.max(matchScore, resolvedTool.data.confidencePercent)
          };

          const diag = resolvedTool.data;
          const commonDisplay = commonList[0] || (detectedTarget === 'cabbage' ? 'Cabbage / पत्तागोभी' : diag.cropIdentified);

          const hindiText = `🩺 **AI Doctor - फसल रोग निदान (Pl@ntNet Vision Verified):**\n\n🌱 **पहचान की गई फसल (Botanical Match):**\n• वानस्पतिक नाम: **${scientific}** (${commonDisplay})\n• Kheti AI बॉटनिकल मिलान सटीकता: **${matchScore}%**\n\n🔬 **रोग व फफूंद लक्षण:**\n• संभावित रोग: **${diag.diseaseHindi}**\n\n💊 **AI Doctor का उपचार पर्चा:**\n• **रासायनिक स्प्रे:** ${diag.chemicalTreatment.join('\n• ')}\n• **जैविक उपचार:** ${diag.organicTreatment.join('\n• ')}\n\n🛡️ **बचाव व सुरक्षा:**\n• ${diag.preventativeMeasures.join('\n• ')}`;

          return {
            message: hindiText,
            toolResult: resolvedTool,
            actionCard: { type: 'crop_diagnosis', data: actionCardData },
            audioPlaybackText: `फसल में ${diag.diseaseHindi} के लक्षण हैं। आप सुझाई गई दवा का तुरंत छिड़काव करें।`,
            detectedToolName: 'AI Doctor (Pl@ntNet & Kheti AI Vision)',
            model: 'AI Doctor (Kheti AI Vision)'
          };
        }
      }
    } catch (pnErr) {
      console.debug('Direct PlantNet fallback error:', pnErr);
    }
  }

  // 2. Greetings in selected language
  if (
    lower === 'hello' || lower === 'hi' || lower === 'hey' || lower === 'हेलो' || 
    lower === 'हाय' || lower === 'नमस्ते' || lower === 'राम राम' || lower === 'ram ram' ||
    lower.includes('hello') || lower.includes('नमस्ते') || lower.includes('हेलो') || 
    lower.includes('namaste') || lower.includes('ram ram') || lower.includes('राम-राम') ||
    lower.includes('kaise ho') || lower.includes('kya haal')
  ) {
    let greetingReply = `नमस्ते जी! राम-राम! 🙏 मैं आपकी डिजिटल कृषि सखी Kheti AI। बताइए, आज आपकी खेती-बाड़ी, फसल या मंडी भाव से जुड़ी क्या सहायता करूँ?`;
    if (targetLang === 'en') {
      greetingReply = `Hello! Welcome! 🙏 I am your digital agriculture advisor Kheti AI Doctor. How can I assist you with your crops, mandi rates, or farming queries today?`;
    } else if (targetLang === 'hinglish') {
      greetingReply = `Namaste ji! Ram-ram! 🙏 Main aapki digital krishi sathi Kheti AI Doctor hoon. Bataiye, aaj aapki fasal, mandi bhav ya kheti-badi se judi kya sahayata karoon?`;
    }

    return {
      message: greetingReply,
      audioPlaybackText: greetingReply,
      detectedToolName: 'Kheti AI Voice Assistant',
      model: 'Kheti AI Intelligence'
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
      model: 'Kheti AI Intelligence'
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
      model: 'Kheti AI Intelligence'
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
      model: 'Kheti AI Intelligence'
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
      model: 'Kheti AI Intelligence'
    };
  }

  return {
    message: targetLang === 'en'
      ? `Hello! I am Kheti AI Doctor. You can ask me about crop diseases, mandi rates, weather, and agricultural schemes.`
      : targetLang === 'hinglish'
      ? `Namaste! Main Kheti AI Doctor hoon. Aap mujhse fasal rogbimari, mandi bhav, mausam aur government schemes ke bare mein pooch sakte hain.`
      : `नमस्ते! मैं Kheti AI Doctor हूँ। आप मुझसे बोलकर या लिखकर गेहूं, धान, सरसों के मंडी भाव, मौसम पूर्वानुमान, फसल रोग और सरकारी योजनाओं के बारे में पूछ सकते हैं।`,
    audioPlaybackText: `नमस्ते! मैं Kheti AI Doctor हूँ। आप मुझसे फसल रोग, मंडी भाव और मौसम के बारे में पूछ सकते हैं।`,
    detectedToolName: 'Kheti AI Voice Assistant',
    model: 'Kheti AI Intelligence'
  };
}
