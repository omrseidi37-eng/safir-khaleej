
import { GoogleGenAI, Modality } from "@google/genai";

// Helper for decoding base64
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function speakProductDescription(text: string, audioContext: AudioContext) {
  // إنشاء نسخة جديدة دائماً لضمان استخدام أحدث مفتاح API من البيئة
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `بصفتك سفير المتجر "منصور"، تحدث بنبرة رجل وقور، رزين، ومحترم جداً. 
  استخدم لهجة خليجية بيضاء هادئة توحي بالثقة والخبرة. قدم هذا المنتج وكأنك تقديم نصيحة صادقة لمشتري يقدر الجودة: "${text}". 
  في نهاية حديثك، أكد للعميل بوقار أن جميع منتجاتنا مشمولة بالضمان الذهبي وسياسة الاسترجاع الميسرة لضمان طمأنينتهم الكاملة.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1,
    );

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    return source;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    // إلقاء الخطأ للأعلى ليتم التعامل معه في الواجهة
    throw error;
  }
}
