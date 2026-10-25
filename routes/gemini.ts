import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// ─── System Instruction ────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are Kheti AI, a warm, lively, empathetic Indian female agricultural advisor and scientist speaking with Indian farmers, traders, and agriculture students.
Core Personality & Behavior:
1. Speak in warm, conversational, natural Hindi/Hinglish (or English if the user writes in English) with a genuine Indian female advisor persona.
2. For greetings ("hello", "namaste", "ram ram", "hi", "kaise ho", "kya haal hai"):
   - Reply conversationally, warmly and BRIEFLY in 1 to 2 sentences.
   - Example: "नमस्ते जी! राम-राम! मैं आपकी सखी Kheti AI। बताइए, आज आपकी खेती-बाड़ी या मंडी भाव में क्या सहायता करूँ?"
   - NEVER output long lists, bullet points, or lectures for simple greetings.
3. For specific farming questions (mandi rates, crops, pest diseases, fertilizer dose, weather, government schemes):
   - Be practical, direct, and actionable with clear remedies and dosages.
4. Keep the response natural and conversational so it sounds great when spoken aloud.`;

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

// ─── Router Factory ────────────────────────────────────────────────────────────
export function createGeminiRouter(genAI: GoogleGenAI) {
  const router = express.Router();

  // 1. Text & Image Chat Endpoint powered by Gemini 1.5 Flash (Ultra-Fast)
  router.post('/chat', async (req: Request, res: Response) => {
    const { prompt, imageData } = req.body;

    if (!prompt && !imageData) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    try {
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

      contents.push({
        text: prompt || 'Examine this crop leaf image and identify disease or deficiency'
      });

      const response = await genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.6
        }
      });

      const text = response.text || '';

      // Generate clean concise spoken text for Indian female audio synthesis
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
        audioPlaybackText: spokenSummary || text.substring(0, 160),
        model: 'Gemini 1.5 Flash'
      });
    } catch (error: any) {
      console.error('Server Gemini API chat failed:', error?.message);
      return res
        .status(200)
        .json({ fallback: true, error: error?.message, model: 'Gemini 1.5 Flash' });
    }
  });

  // 2. High-Quality Indian Female Voice TTS Endpoint via Gemini TTS
  router.post('/tts', async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    try {
      const cleanText = text.replace(/[*#•_`]/g, '').trim().substring(0, 300);
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: cleanText,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore' // Warm, articulate female voice
              }
            }
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const pcmData = parts[0]?.inlineData?.data;

      if (pcmData) {
        const wavBase64 = pcmToWav(pcmData, 24000);
        return res.json({
          audioDataUri: `data:audio/wav;base64,${wavBase64}`,
          format: 'audio/wav',
          model: 'Gemini 1.5 Flash Voice Engine'
        });
      }

      return res.status(400).json({ error: 'No audio returned' });
    } catch (error: any) {
      return res.status(200).json({ fallback: true, error: error?.message });
    }
  });

  // 3. Direct Raw Audio Query Endpoint (Gemini 1.5 Flash Voice Processing)
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
3. Then reply conversationally, warmly and directly as Kheti AI.
4. If it is a greeting ("hello", "namaste"), reply in 1-2 friendly sentences.`
      };

      const response = await genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [audioPart, instructionPart],
        config: {
          temperature: 0.6
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
        model: 'Gemini 1.5 Flash'
      });
    } catch (error: any) {
      return res
        .status(200)
        .json({ fallback: true, error: error?.message, model: 'Gemini 1.5 Flash' });
    }
  });

  return router;
}
