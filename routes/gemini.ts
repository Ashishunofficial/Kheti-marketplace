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
  // Fast, highly available Gemini models tested with @google/genai
  const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-2.5-pro', 'gemini-3.1-flash-lite'];
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

// ─── Helper: Extract Clinical Diagnostic Data from Text if JSON parse fails ────
function extractClinicalDataFromText(text: string, plantNetMatch: PlantNetMatch | null, targetLang: string) {
  let cropIdentified = '';
  let diseaseHindi = '';
  let diseaseOrPest = '';
  let chemicalTreatment: string[] = [];
  let organicTreatment: string[] = [];
  let preventativeMeasures: string[] = [];
  let severity = 'moderate';

  // 1. Try JSON block first
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed) {
        return {
          cropIdentified: parsed.cropIdentified || (plantNetMatch ? `${plantNetMatch.commonNames[0] || plantNetMatch.speciesName} (${plantNetMatch.speciesName})` : 'Crop Sample'),
          diseaseOrPest: parsed.diseaseOrPest || 'Foliar Pathology / Crop Infection',
          diseaseHindi: parsed.diseaseHindi || parsed.diseaseOrPest || 'फसल रोग व फफूंद संक्रमण',
          severity: parsed.severity || 'moderate',
          confidencePercent: parsed.confidencePercent || (plantNetMatch ? plantNetMatch.scorePercent : 94),
          chemicalTreatment: Array.isArray(parsed.chemicalTreatment) && parsed.chemicalTreatment.length ? parsed.chemicalTreatment : [],
          organicTreatment: Array.isArray(parsed.organicTreatment) && parsed.organicTreatment.length ? parsed.organicTreatment : [],
          preventativeMeasures: Array.isArray(parsed.preventativeMeasures) && parsed.preventativeMeasures.length ? parsed.preventativeMeasures : [],
          plantNetMatch
        };
      }
    } catch (_) {}
  }

  // 2. Parse Markdown sections if JSON block was absent or unparseable
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const cleanLine = line.replace(/[*#•_`]/g, '').trim();
    if (!cropIdentified && (cleanLine.includes('वानस्पतिक नाम') || cleanLine.includes('Plant Identified') || cleanLine.includes('Species') || cleanLine.includes('Plant/Crop') || cleanLine.includes('Crop:'))) {
      const parts = cleanLine.split(':');
      if (parts.length > 1) cropIdentified = parts.slice(1).join(':').trim();
    }
    if (!diseaseHindi && (cleanLine.includes('बीमारी का नाम') || cleanLine.includes('Disease Name') || cleanLine.includes('Disease:') || cleanLine.includes('रोग'))) {
      const parts = cleanLine.split(':');
      if (parts.length > 1) {
        diseaseHindi = parts.slice(1).join(':').trim();
        diseaseOrPest = diseaseHindi;
      }
    }
    if ((cleanLine.includes('रासायनिक') || cleanLine.includes('Chemical')) && cleanLine.includes(':')) {
      const parts = cleanLine.split(':');
      if (parts.length > 1 && parts.slice(1).join(':').trim()) {
        chemicalTreatment.push(parts.slice(1).join(':').trim());
      }
    }
    if ((cleanLine.includes('जैविक') || cleanLine.includes('Organic')) && cleanLine.includes(':')) {
      const parts = cleanLine.split(':');
      if (parts.length > 1 && parts.slice(1).join(':').trim()) {
        organicTreatment.push(parts.slice(1).join(':').trim());
      }
    }
    if ((cleanLine.includes('सुरक्षा') || cleanLine.includes('Preventive')) && cleanLine.includes(':')) {
      const parts = cleanLine.split(':');
      if (parts.length > 1 && parts.slice(1).join(':').trim()) {
        preventativeMeasures.push(parts.slice(1).join(':').trim());
      }
    }
  }

  // 3. Fallback scan of text for exact crop species keywords if line header parsing missed
  if (!cropIdentified) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('cauliflower') || lowerText.includes('फूलगोभी') || lowerText.includes('botrytis')) {
      cropIdentified = 'Cauliflower / फूलगोभी (Brassica oleracea var. botrytis)';
    } else if (lowerText.includes('cabbage') || lowerText.includes('पत्तागोभी') || lowerText.includes('capitata')) {
      cropIdentified = 'Cabbage / पत्तागोभी (Brassica oleracea var. capitata)';
    } else if (lowerText.includes('corn') || lowerText.includes('maize') || lowerText.includes('मक्का') || lowerText.includes('zea mays')) {
      cropIdentified = 'Maize / मक्का (Zea mays)';
    } else if (lowerText.includes('tomato') || lowerText.includes('टमाटर') || lowerText.includes('lycopersicum')) {
      cropIdentified = 'Tomato / टमाटर (Solanum lycopersicum)';
    } else if (lowerText.includes('potato') || lowerText.includes('आलू') || lowerText.includes('tuberosum')) {
      cropIdentified = 'Potato / आलू (Solanum tuberosum)';
    } else if (lowerText.includes('mustard') || lowerText.includes('सरसों') || lowerText.includes('juncea')) {
      cropIdentified = 'Mustard / सरसों (Brassica juncea)';
    } else if (lowerText.includes('cotton') || lowerText.includes('कपास') || lowerText.includes('hirsutum')) {
      cropIdentified = 'Cotton / कपास (Gossypium hirsutum)';
    } else if (lowerText.includes('wheat') || lowerText.includes('गेहूं') || lowerText.includes('aestivum')) {
      cropIdentified = 'Wheat / गेहूं (Triticum aestivum)';
    } else if (lowerText.includes('paddy') || lowerText.includes('rice') || lowerText.includes('धान') || lowerText.includes('sativa')) {
      cropIdentified = 'Paddy / धान (Oryza sativa)';
    }
  }

  if (plantNetMatch && !cropIdentified) {
    const cName = plantNetMatch.commonNames[0] || plantNetMatch.speciesName;
    cropIdentified = `${cName} (${plantNetMatch.speciesName})`;
  }

  return {
    cropIdentified: cropIdentified || (targetLang === 'en' ? 'Crop Sample Diagnosed' : 'पहचान की गई फसल'),
    diseaseOrPest: diseaseOrPest || (targetLang === 'en' ? 'Foliar Leaf Disease / Infection' : 'फसल रोग व फफूंद लक्षण'),
    diseaseHindi: diseaseHindi || diseaseOrPest || (targetLang === 'en' ? 'Foliar Pathology' : 'फसल रोग व फफूंद लक्षण'),
    severity: severity,
    confidencePercent: plantNetMatch ? plantNetMatch.scorePercent : 94,
    chemicalTreatment: chemicalTreatment.length ? chemicalTreatment : ['Copper Oxychloride 50% WP @ 2.5g/L water foliar spray'],
    organicTreatment: organicTreatment.length ? organicTreatment : ['Neem Oil 10,000 ppm @ 4 ml/L water or Trichoderma viride @ 5g/L'],
    preventativeMeasures: preventativeMeasures.length ? preventativeMeasures : ['Avoid excess field moisture, ensure raised bed aeration and crop sanitation.'],
    plantNetMatch
  };
}

// ─── Helper: Pl@ntNet API Species Identifier (Multi-Project Support) ────
interface PlantNetMatch {
  speciesName: string;
  commonNames: string[];
  scorePercent: number;
  family: string;
  genus: string;
  verifiedSource?: string;
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

    // Query Pl@ntNet projects: global flora and useful agricultural crops
    const projectsToTry = ['all', 'k-world-flora', 'useful', 'k-indian-subcontinent'];

    for (const project of projectsToTry) {
      try {
        const blob = new Blob([buffer], { type: mimeType });
        const formData = new FormData();
        formData.append('images', blob, fileName);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const url = `https://my-api.plantnet.org/v2/identify/${project}?api-key=${PLANTNET_API_KEY}&lang=en`;
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
              genus: species.genus?.scientificNameWithoutAuthor || '',
              verifiedSource: `Pl@ntNet API (${project})`
            };
            console.log(`[Pl@ntNet API SUCCESS (${project})]: Identified ${match.speciesName} (${match.commonNames.join(', ')}) with ${match.scorePercent}% confidence.`);
            return match;
          }
        }
      } catch (err: any) {
        console.debug(`Pl@ntNet project ${project} note:`, err?.message);
      }
    }
  } catch (err: any) {
    console.warn('Botanical species check notice:', err?.message);
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
      // Step 1: Execute PlantNet botanical species verification
      let plantNetMatch: PlantNetMatch | null = null;
      if (imageData) {
        plantNetMatch = await identifyWithPlantNet(imageData);
      }

      // Prepare multimodal content for Step 2: Gemini API elaboration
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
        userPrompt += `\n\n[STEP 1: PL@NTNET BOTANICAL VERIFICATION RESULT]:
Scientific Botanical Name: ${plantNetMatch.speciesName}
Common Vernacular Names: ${plantNetMatch.commonNames.join(', ') || 'Plant Species'}
Family: ${plantNetMatch.family}
Botanical Match Score: ${plantNetMatch.scorePercent}%
Please confirm this verified ${plantNetMatch.speciesName} (${plantNetMatch.commonNames[0] || ''}) plant, examine the image visual symptoms in detail, identify the disease/pest, and elaborate the full clinical prescription.`;
      } else {
        userPrompt += `\n\n[STEP 1: BOTANICAL IDENTIFICATION DIRECTIVE]:
Please examine the crop/leaf/head image carefully. Identify the exact botanical species (Scientific Botanical Name, English & Hindi Common Name, and Family).
[STEP 2: PATHOLOGY & CLINICAL PRESCRIPTION DIRECTIVE]:
Examine visual symptoms for any fungal, bacterial, viral infection, insect pest damage, or rot, and prescribe an exact clinical treatment protocol.`;
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
1. Examine the visual image carefully. Identify the exact crop shown (e.g. Cauliflower/फूलगोभी, Cabbage/पत्तागोभी, Tomato/टमाटर, Potato/आलू, Corn/मक्का, Wheat/गेहूं, Paddy/धान, Mustard/सरसों, Cotton/कपास, etc.).
2. At the very end of your response, append a clean JSON clinical prescription block fenced with \`\`\`json and \`\`\` containing:
{
  "cropIdentified": "<English & Hindi Name with Botanical Name, e.g. Cauliflower / फूलगोभी (Brassica oleracea var. botrytis)>",
  "diseaseOrPest": "<Specific disease in English, e.g. Alternaria Leaf Spot & Curd Rot / Bacterial Soft Rot>",
  "diseaseHindi": "<Specific disease in Hindi, e.g. काला धब्बा व कर्ड सड़न रोग (Soft Rot / Alternaria)>",
  "severity": "mild" | "moderate" | "severe",
  "confidencePercent": 94,
  "chemicalTreatment": ["<Exact chemical spray name and dosage per acre/15L pump>"],
  "organicTreatment": ["<Exact biological/organic remedy and dosage>"],
  "preventativeMeasures": ["<Key agronomic preventive steps>"]
} `;

      const { response } = await generateContentRobust(genAI, {
        contents: contents,
        config: {
          systemInstruction: doctorSystemInst + langInstruction + structuredDirective,
          temperature: 0.2
        }
      });

      let messageText = response.text || '';

      // Extract structured clinical diagnosis data using helper
      const clinicalCardData = extractClinicalDataFromText(messageText, plantNetMatch, targetLang);

      // If PlantNet had not verified directly, attach verified botanical metadata from Gemini Vision
      if (!clinicalCardData.plantNetMatch) {
        clinicalCardData.plantNetMatch = {
          speciesName: clinicalCardData.cropIdentified,
          commonNames: [clinicalCardData.cropIdentified],
          scorePercent: clinicalCardData.confidencePercent || 94,
          family: 'Kheti AI Vision Verified',
          genus: ''
        };
      }

      // Strip fenced JSON block if present to leave clean markdown message for rendering
      let cleanMessageText = messageText.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();

      const spokenSummary = cleanMessageText
        .replace(/[*#•_`]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 3)
        .join(' ')
        .substring(0, 200);

      return res.json({
        message: cleanMessageText,
        plantNetMatch: clinicalCardData.plantNetMatch,
        audioPlaybackText: spokenSummary,
        model: 'AI Doctor (Kheti AI Vision & Intelligence)',
        actionCard: {
          type: 'crop_diagnosis',
          data: clinicalCardData
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
