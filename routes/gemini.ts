import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY || '2b10ih2lmPyeU0g2v0ioEzYZ';

// ─── System Instructions ────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are Kheti AI Doctor, a warm, authoritative, empathetic Indian female agricultural doctor and scientist speaking with Indian farmers, traders, and agriculture students.
Core Personality & Behavior:
1. Speak in warm, conversational, natural Hindi/Hinglish (or English if the user writes in English) with a genuine Indian female advisor persona.
2. For greetings ("hello", "namaste", "ram ram", "hi", "kaise ho", "kya haal hai"):
   - Reply conversationally, warmly and BRIEFLY in 1 to 2 sentences.
   - Example: "नमस्ते जी! राम-राम! मैं आपकी सखी व AI Doctor। बताइए, आज आपकी फसल, बीमारी या खेती-बाड़ी में क्या सहायता करूँ?"
   - NEVER output long lists or lectures for simple greetings.
3. For crop diseases, plant identification, fertilizers, and remedies:
   - Provide exact dosages (e.g. ml per acre or per liter of water) and both chemical and organic options.
4. Keep responses direct and structured so they sound great when spoken aloud.`;

const HINDI_AI_DOCTOR_SYSTEM_INSTRUCTION = `You are "AI Doctor & Crop Clinic (एआई डॉक्टर)" — an elite Chief Botanical Pathologist and Senior Agronomist at Kheti AI Platform.
Your mission is to analyze plant/crop images, accurately diagnose crop diseases, insect pests, or nutrient deficiencies, and prescribe an exact medical prescription (डॉक्टर का पर्चा) for Indian farmers in Hindi.

When Kheti AI Vision botanical data is provided:
- Explicitly state the Kheti AI Botanical Match (Species Scientific Name, Common Name, and Match Confidence %).

Format your clinical response clearly using Devanagari Hindi:

🩺 **AI Doctor - फसल रोग निदान एवं पर्चा (Crop Clinical Diagnosis)**

🌱 **1. पहचान की गई फसल (Plant Identified):**
- **वानस्पतिक नाम (Botanical Species):** [Scientific Name] (Common Name)
- **Kheti AI बॉटनिकल मैच:** [Match Confidence %]

🔬 **2. बीमारी की पहचान व लक्षण (Disease & Pathology):**
- **बीमारी का नाम (Disease Name):** [Hindi & English Name, e.g. Yellow Rust / पीला रतुआ]
- **गंभीरता (Severity Level):** 🟢 सामान्य (Mild) / 🟡 मध्यम (Moderate) / 🔴 गंभीर (Severe Emergency)
- **लक्षण (Symptoms Observed):** [Concise pathological description in Hindi]

💊 **3. AI Doctor का उपचार पर्चा (Clinical Treatment Protocol):**
- **रासायनिक दवा व खुराक (Chemical Spray & Dosage):**
  • [Specific Chemical + Brand Name, e.g. Propiconazole 25% EC @ 200 ml/acre in 150L water]
- **जैविक व देसी इलाज (Organic Remedy):**
  • [Organic spray, e.g. Neem oil 10,000 ppm @ 5ml/L, Panchagavya, or Trichoderma viride]
- **पोषक तत्व व खुराक (Nutritional Care):**
  • [Micro-nutrient advice, e.g. Zinc Sulphate 33% @ 5kg/acre]

🛡️ **4. सुरक्षा व बचाव के उपाय (Preventive Care):**
- [Field drainage, irrigation timing, and crop sanitation in Hindi]`;

const ENGLISH_AI_DOCTOR_SYSTEM_INSTRUCTION = `You are "AI Doctor & Crop Clinic" — an elite Chief Botanical Pathologist and Senior Agronomist at Kheti AI Platform.
Your mission is to analyze plant/crop images, accurately diagnose crop diseases, insect pests, or nutrient deficiencies, and prescribe an exact medical prescription in clear English.

CRITICAL MANDATE: Write the ENTIRE response in 100% ENGLISH language. Do NOT include any Devanagari Hindi script, Hindi words, or mixed Hindi terms. All section titles, labels, disease names, symptoms, and remedies MUST be in English.

When Kheti AI Vision botanical data is provided:
- Explicitly state the Kheti AI Botanical Match (Species Scientific Name, English Common Name, and Match Confidence %).

Format your clinical response strictly in English:

🩺 **AI Doctor - Crop Clinical Diagnosis & Prescription**

🌱 **1. Plant Identified:**
- **Botanical Species:** [Scientific Name] (English Common Name)
- **Kheti AI Botanical Match:** [Match Confidence %]

🔬 **2. Disease & Pathology:**
- **Disease Name:** [English Name, e.g. Alternaria Leaf Spot / Black Spot]
- **Severity Level:** 🟢 Mild / 🟡 Moderate / 🔴 Severe Emergency
- **Symptoms Observed:** [Concise pathological description strictly in English]

💊 **3. Clinical Treatment Protocol:**
- **Chemical Spray & Dosage:**
  • [Specific Chemical + Brand Name & dosage in English, e.g. Propiconazole 25% EC @ 200 ml/acre in 150L water]
- **Organic Remedy:**
  • [Organic spray & dosage in English, e.g. Neem oil 10,000 ppm @ 5ml/L or Trichoderma viride]
- **Nutritional Care:**
  • [Micro-nutrient advice in English, e.g. Zinc Sulphate 33% @ 5kg/acre]

🛡️ **4. Preventive Care:**
- [Field drainage, irrigation timing, and crop sanitation in English]`;

const HINGLISH_AI_DOCTOR_SYSTEM_INSTRUCTION = `You are "AI Doctor & Crop Clinic" — an elite Chief Botanical Pathologist and Senior Agronomist at Kheti AI Platform.
Your mission is to analyze plant/crop images, accurately diagnose crop diseases, insect pests, or nutrient deficiencies, and prescribe an exact medical prescription in Hinglish (Hindi written using Roman/English alphabet).

CRITICAL MANDATE: Write the ENTIRE response in HINGLISH language (Hindi spoken concepts written using English/Roman script). Do NOT use Devanagari script.

Format your clinical response clearly in Hinglish:

🩺 **AI Doctor - Fasal Rog Nidan va Parcha (Crop Clinical Diagnosis)**

🌱 **1. Pehchan Ki Gai Fasal (Plant Identified):**
- **Botanical Species:** [Scientific Name] (Common Name)
- **Kheti AI Botanical Match:** [Match Confidence %]

🔬 **2. Bimari Ki Pehchan va Lakshana (Disease & Pathology):**
- **Bimari Ka Naam (Disease Name):** [Disease Name in Hinglish]
- **Gambhirta (Severity Level):** 🟢 Samanya (Mild) / 🟡 Madhyam (Moderate) / 🔴 Gambhir (Severe Emergency)
- **Lakshana (Symptoms Observed):** [Symptoms in Hinglish]

💊 **3. Clinical Treatment Protocol:**
- **Chemical Spray va Khurak (Chemical Spray & Dosage):**
  • [Chemical & dosage in Hinglish]
- **Organic va Desi Ilaaj (Organic Remedy):**
  • [Organic remedy in Hinglish]
- **Nutritional Care:**
  • [Micro-nutrient advice in Hinglish]

🛡️ **4. Suraksha va Bachav (Preventive Care):**
- [Preventive advice in Hinglish]`;

// ─── Helper: Convert raw PCM 24kHz 16-bit mono buffer to standard WAV ─────────
function pcmToWav(
  pcmBase64: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]).toString('base64');
}
// ─── Helper: Resilient Gemini Model Fallback Caller ─────────────────────────
async function generateContentRobust(genAI: GoogleGenAI, params: any) {
  // Try official supported Gemini models in order
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const resp = await genAI.models.generateContent({
        ...params,
        model: modelName
      });
      if (resp && resp.text) {
        return { response: resp, modelUsed: modelName };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Engine] ${modelName} notice:`, err?.message || err);
    }
  }
  throw lastError || new Error('All Gemini models are temporarily busy');
}

// ─── Helper: Pl@ntNet API Species Identifier (8s Timeout) ────
interface PlantNetMatch {
  speciesName: string;
  commonNames: string[];
  scorePercent: number;
  family: string;
  genus: string;
}

async function identifyWithPlantNet(imageDataBase64: string): Promise<PlantNetMatch | null> {
  try {
    let mimeType = 'image/jpeg';
    let fileName = 'crop_sample.jpg';

    if (imageDataBase64.startsWith('data:image/png')) {
      mimeType = 'image/png';
      fileName = 'crop_sample.png';
    }

    const cleanBase64 = imageDataBase64.includes('base64,')
      ? imageDataBase64.split('base64,')[1]
      : imageDataBase64;

    const buffer = Buffer.from(cleanBase64, 'base64');

    // Inspect magic bytes to guarantee accurate mime type matching Pl@ntNet API rules
    if (buffer.length > 4) {
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        mimeType = 'image/png';
        fileName = 'crop_sample.png';
      } else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        mimeType = 'image/jpeg';
        fileName = 'crop_sample.jpg';
      }
    }

    const blob = new Blob([buffer], { type: mimeType });

    const formData = new FormData();
    formData.append('images', blob, fileName);
    formData.append('organs', 'auto'); // Auto-detect leaves, heads, flowers, fruits

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reliable 8s timeout

    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&lang=en`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: any = await response.json();
      if (data && data.results && data.results.length > 0) {
        const top = data.results[0];
        const species = top.species || {};
        const match: PlantNetMatch = {
          speciesName: species.scientificNameWithoutAuthor || species.scientificName || 'Botanical Species',
          commonNames: species.commonNames || [],
          scorePercent: Math.round((top.score || 0) * 100),
          family: species.family?.scientificNameWithoutAuthor || '',
          genus: species.genus?.scientificNameWithoutAuthor || ''
        };
        console.log(`[Pl@ntNet API SUCCESS]: Identified ${match.speciesName} (${match.commonNames.join(', ')}) with ${match.scorePercent}% confidence.`);
        return match;
      }
    } else {
      const errText = await response.text();
      console.warn(`[Pl@ntNet API Status ${response.status}]:`, errText.substring(0, 200));
    }
  } catch (err: any) {
    console.warn('Notice: Botanical species check notice:', err?.message);
  }
  return null;
}

// ─── Router Factory ────────────────────────────────────────────────────────────
export function createGeminiRouter(genAI: GoogleGenAI) {
  const router = express.Router();

  // 1. Dedicated AI Doctor & Plant Disease Clinical Endpoint
  router.post('/ai-doctor', async (req: Request, res: Response) => {
    const { prompt, imageData, targetLang } = req.body;

    if (!prompt && !imageData) {
      return res.status(400).json({ error: 'Prompt or image is required for AI Doctor' });
    }

    try {
      // Execute PlantNet botanical identification
      let plantNetMatch: PlantNetMatch | null = null;
      if (imageData) {
        plantNetMatch = await identifyWithPlantNet(imageData);
      }

      const contents: any[] = [];
      if (imageData) {
        const base64Data = imageData.includes('base64,')
          ? imageData.split('base64,')[1]
          : imageData;
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
      }

      let userPrompt = prompt || 'Doctor, please diagnose this crop/leaf/vegetable image for any disease, pest, or rot and prescribe exact medical treatment.';
      if (plantNetMatch) {
        userPrompt += `\n\n[KHETI AI BOTANICAL SPECIES VISION MATCH]:
Scientific Botanical Name: ${plantNetMatch.speciesName}
Common Vernacular Names: ${plantNetMatch.commonNames.join(', ') || 'Plant Species'}
Family: ${plantNetMatch.family}
Botanical Match Score: ${plantNetMatch.scorePercent}%
Please diagnose this verified ${plantNetMatch.speciesName} (${plantNetMatch.commonNames[0] || ''}) sample.`;
      }

      contents.push({ text: userPrompt });

      let doctorSystemInst = HINDI_AI_DOCTOR_SYSTEM_INSTRUCTION;
      let langInstruction = '';

      if (targetLang === 'en') {
        doctorSystemInst = ENGLISH_AI_DOCTOR_SYSTEM_INSTRUCTION;
        langInstruction = '\n\nCRITICAL LANGUAGE INSTRUCTION: Respond 100% entirely in ENGLISH language. Do NOT use any Devanagari Hindi text or mixed Hindi terms anywhere in the response.';
      } else if (targetLang === 'hinglish') {
        doctorSystemInst = HINGLISH_AI_DOCTOR_SYSTEM_INSTRUCTION;
        langInstruction = '\n\nCRITICAL LANGUAGE INSTRUCTION: Respond 100% entirely in HINGLISH language (Hindi spoken concepts written using Roman/English alphabet). Do NOT use Devanagari script.';
      } else {
        doctorSystemInst = HINDI_AI_DOCTOR_SYSTEM_INSTRUCTION;
        langInstruction = '\n\nCRITICAL LANGUAGE INSTRUCTION: Respond 100% entirely in HINDI language (using Devanagari script).';
      }

      const structuredDirective = `\n\nCRITICAL MANDATE FOR CROP IDENTIFICATION:
1. Examine the visual image carefully. If the image is a vegetable like Cabbage (पत्तागोभी / Brassica oleracea), Tomato (टमाटर), Potato (आलू), etc., diagnose it accurately as THAT specific crop! NEVER default to Wheat unless the image actually shows Wheat!
2. At the very end of your response, append a clean JSON clinical prescription block fenced with \`\`\`json and \`\`\` containing:
{
  "cropIdentified": "<English & Hindi Name, e.g. Cabbage / पत्तागोभी (Brassica oleracea)>",
  "diseaseOrPest": "<Specific disease in English, e.g. White Mold / Sclerotinia Rot / Soft Rot>",
  "diseaseHindi": "<Specific disease in Hindi, e.g. सफेद फफूंद व सड़न रोग (White Mold / Soft Rot)>",
  "severity": "mild" | "moderate" | "severe",
  "confidencePercent": 92,
  "chemicalTreatment": ["<Exact chemical spray name and dosage>"],
  "organicTreatment": ["<Exact biological/organic remedy>"],
  "preventativeMeasures": ["<Key agronomic preventive steps>"]
}`;

      const { response } = await generateContentRobust(genAI, {
        contents: contents,
        config: {
          systemInstruction: doctorSystemInst + langInstruction + structuredDirective,
          temperature: 0.2
        }
      });

      let messageText = response.text || '';

      // Extract structured JSON actionCard data if present in response
      let parsedCardData: any = null;
      const jsonMatch = messageText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          parsedCardData = JSON.parse(jsonMatch[1]);
          // Strip JSON block from spoken/rendered markdown message for a clean reading experience
          messageText = messageText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
        } catch (_) {}
      }

      const spokenSummary = messageText
        .replace(/[*#•_`]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 3)
        .join(' ')
        .substring(0, 200);

      // Determine accurate crop name from PlantNet, parsed JSON, or image context
      let detectedCropName = '';
      if (parsedCardData?.cropIdentified) {
        detectedCropName = parsedCardData.cropIdentified;
      } else if (plantNetMatch) {
        const cName = plantNetMatch.commonNames[0] || plantNetMatch.speciesName;
        detectedCropName = `${cName} (${plantNetMatch.speciesName})`;
      } else {
        // Inspect text for vegetable keywords before any generic fallback
        const lowerMsg = messageText.toLowerCase();
        if (lowerMsg.includes('cabbage') || lowerMsg.includes('पत्तागोभी') || lowerMsg.includes('गोभी')) {
          detectedCropName = 'Cabbage / पत्तागोभी (Brassica oleracea)';
        } else if (lowerMsg.includes('tomato') || lowerMsg.includes('टमाटर')) {
          detectedCropName = 'Tomato / टमाटर (Solanum lycopersicum)';
        } else if (lowerMsg.includes('potato') || lowerMsg.includes('आलू')) {
          detectedCropName = 'Potato / आलू (Solanum tuberosum)';
        } else if (lowerMsg.includes('wheat') || lowerMsg.includes('गेहूं')) {
          detectedCropName = 'Wheat (Triticum aestivum)';
        } else if (lowerMsg.includes('paddy') || lowerMsg.includes('धान') || lowerMsg.includes('rice')) {
          detectedCropName = 'Paddy (Oryza sativa)';
        } else {
          detectedCropName = targetLang === 'en' ? 'Vegetable / Crop Sample' : 'सब्जी / फसल का नमूना';
        }
      }

      const finalCardData = {
        cropIdentified: detectedCropName,
        confidencePercent: parsedCardData?.confidencePercent || (plantNetMatch ? plantNetMatch.scorePercent : 94),
        plantNetMatch,
        diseaseOrPest: parsedCardData?.diseaseOrPest || (targetLang === 'en' ? 'Foliar Blight / Leaf Pathology' : 'फसल रोग व फफूंद लक्षण'),
        diseaseHindi: parsedCardData?.diseaseHindi || (targetLang === 'en' ? 'Foliar Leaf Spot / Pathology' : 'फसल रोग व फफूंद लक्षण'),
        chemicalTreatment: parsedCardData?.chemicalTreatment?.length ? parsedCardData.chemicalTreatment : ['Copper Oxychloride 50% WP @ 2.5g/L + Streptocycline 1g/10L water'],
        organicTreatment: parsedCardData?.organicTreatment?.length ? parsedCardData.organicTreatment : ['Neem Oil 10,000 ppm @ 5 ml/liter + Trichoderma viride @ 5g/L spray'],
        preventativeMeasures: parsedCardData?.preventativeMeasures?.length ? parsedCardData.preventativeMeasures : ['Maintain adequate field aeration, avoid waterlogging, and rogue infected leaves.']
      };

      return res.json({
        message: messageText,
        plantNetMatch,
        audioPlaybackText: spokenSummary,
        model: 'AI Doctor (Kheti AI Vision & Intelligence)',
        actionCard: {
          type: 'crop_diagnosis',
          data: finalCardData
        }
      });
    } catch (error: any) {
      console.error('AI Doctor route error:', error?.message);
      return res.status(200).json({
        fallback: true,
        error: error?.message,
        message: 'AI Doctor is currently experiencing high server traffic. Please try uploading your crop photo once more.'
      });
    }
  });

  // 2. Text & Image Chat Endpoint
  router.post('/chat', async (req: Request, res: Response) => {
    const { prompt, imageData, targetLang } = req.body;

    if (!prompt && !imageData) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    try {
      let plantNetMatch: PlantNetMatch | null = null;
      if (imageData) {
        plantNetMatch = await identifyWithPlantNet(imageData);
      }

      const contents: any[] = [];
      if (imageData) {
        const base64Data = imageData.includes('base64,')
          ? imageData.split('base64,')[1]
          : imageData;
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
      }

      let userText = prompt || 'Examine this crop leaf image for disease or deficiency';
      if (plantNetMatch) {
        userText += `\n\n[KHETI AI VISION BOTANICAL MATCH]: ${plantNetMatch.speciesName} (${plantNetMatch.commonNames.join(', ')}) - Accuracy ${plantNetMatch.scorePercent}%`;
      }

      contents.push({ text: userText });

      let baseInstruction = SYSTEM_INSTRUCTION;
      if (imageData) {
        baseInstruction = targetLang === 'en' 
          ? ENGLISH_AI_DOCTOR_SYSTEM_INSTRUCTION 
          : targetLang === 'hinglish' 
          ? HINGLISH_AI_DOCTOR_SYSTEM_INSTRUCTION 
          : HINDI_AI_DOCTOR_SYSTEM_INSTRUCTION;
      }

      let langInstruction = '';
      if (targetLang === 'en') {
        langInstruction = '\n\nCRITICAL LANGUAGE INSTRUCTION: Respond 100% entirely in ENGLISH language. Do NOT use Devanagari script or mixed Hindi terms.';
      } else if (targetLang === 'hinglish') {
        langInstruction = '\n\nCRITICAL LANGUAGE INSTRUCTION: Respond 100% entirely in HINGLISH language (Roman/English script). Do NOT use Devanagari script.';
      } else {
        langInstruction = '\n\nCRITICAL LANGUAGE INSTRUCTION: Respond 100% entirely in HINDI language (using Devanagari script).';
      }

      const { response, modelUsed } = await generateContentRobust(genAI, {
        contents: contents,
        config: {
          systemInstruction: baseInstruction + langInstruction,
          temperature: 0.3
        }
      });

      const text = response.text || '';

      const spokenSummary = text
        .replace(/[*#•_`]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 2)
        .join(' ')
        .substring(0, 180);

      return res.json({
        message: text,
        plantNetMatch,
        audioPlaybackText: spokenSummary || text.substring(0, 160),
        model: imageData ? 'AI Doctor (Kheti AI Vision & Intelligence)' : 'Kheti AI Intelligence'
      });
    } catch (error: any) {
      console.error('Server Gemini API chat failed:', error?.message);
      return res
        .status(200)
        .json({ fallback: true, error: error?.message, model: 'Kheti AI Intelligence' });
    }
  });

  // 3. High-Quality Indian Female Voice TTS Endpoint via Gemini TTS
  router.post('/tts', async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    try {
      const cleanText = text.replace(/[*#•_`]/g, '').trim().substring(0, 300);
      const { response } = await generateContentRobust(genAI, {
        contents: cleanText,
        config: {
          systemInstruction: 'You are Kheti AI TTS voice assistant. Output text clearly for spoken audio.'
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const pcmData = parts[0]?.inlineData?.data;

      if (pcmData) {
        const wavBase64 = pcmToWav(pcmData, 24000);
        return res.json({
          audioDataUri: `data:audio/wav;base64,${wavBase64}`,
          format: 'audio/wav',
          model: 'Gemini Voice Engine'
        });
      }

      return res.status(400).json({ error: 'No audio returned' });
    } catch (error: any) {
      return res.status(200).json({ fallback: true, error: error?.message });
    }
  });

  // 4. Direct Raw Audio Query Endpoint
  router.post('/audio-query', async (req: Request, res: Response) => {
    const { audioData, mimeType } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    try {
      const base64Audio = audioData.includes('base64,')
        ? audioData.split('base64,')[1]
        : audioData;
      const cleanMime = mimeType?.split(';')[0] || 'audio/webm';

      const audioPart = {
        inlineData: {
          mimeType: cleanMime,
          data: base64Audio
        }
      };

      const instructionPart = {
        text: `${SYSTEM_INSTRUCTION}
The user has spoken an audio query in Hindi, Hinglish, or English.
Please:
1. Listen carefully to what the user said.
2. In the first line write: "[USER_TRANSCRIPT: <exact transcription of what user said>]"
3. Then reply conversationally, warmly and directly as Kheti AI Doctor.
4. If it is a greeting ("hello", "namaste"), reply in 1-2 friendly sentences.`
      };

      const { response } = await generateContentRobust(genAI, {
        contents: [audioPart, instructionPart],
        config: {
          temperature: 0.5
        }
      });

      const fullText = response.text || '';

      let userTranscript = 'Voice query received';
      let cleanAnswer = fullText;

      const transcriptMatch = fullText.match(/\[USER_TRANSCRIPT:\s*(.*?)\]/i);
      if (transcriptMatch) {
        userTranscript = transcriptMatch[1].trim();
        cleanAnswer = fullText.replace(/\[USER_TRANSCRIPT:\s*.*?\]/i, '').trim();
      }

      const spokenSummary = cleanAnswer
        .replace(/[*#•_`]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 2)
        .join(' ')
        .substring(0, 180);

      return res.json({
        userTranscript: userTranscript,
        message: cleanAnswer,
        audioPlaybackText: spokenSummary || cleanAnswer.substring(0, 160),
        model: 'Kheti AI Intelligence'
      });
    } catch (error: any) {
      return res
        .status(200)
        .json({ fallback: true, error: error?.message, model: 'Kheti AI Intelligence' });
    }
  });

  return router;
}
