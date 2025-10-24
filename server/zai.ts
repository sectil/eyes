/**
 * Z.ai API Integration
 * AI-powered vision care assistant
 */

interface ZaiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ZaiResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_URL = "https://api.z.ai/api/paas/v4/chat/completions";

/**
 * Call Z.ai API for AI assistance
 */
export async function callZai(messages: ZaiMessage[], jsonMode = false): Promise<string> {
  if (!ZAI_API_KEY) {
    throw new Error("ZAI_API_KEY is not configured");
  }

  try {
    const response = await fetch(ZAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4.6",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        ...(jsonMode && { response_format: { type: "json_object" } }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Z.ai API error: ${response.status} - ${error}`);
    }

    const data: ZaiResponse = await response.json();
    return data.choices[0]?.message?.content || "AI yanıt alınamadı";
  } catch (error: any) {
    console.error("Z.ai API error:", error);
    throw new Error(`AI asistan hatası: ${error.message}`);
  }
}

/**
 * Analyze user profile and provide personalized recommendations
 */
export async function analyzeUserProfile(profile: {
  age: number;
  occupation: string;
  screenTime: number;
  hasGlasses: boolean;
  symptoms: string[];
}): Promise<string> {
  const messages: ZaiMessage[] = [
    {
      role: "system",
      content: `Sen bir göz sağlığı uzmanı AI asistanısın. Kullanıcının profilini analiz edip kişiselleştirilmiş öneriler sunuyorsun. Türkçe yanıt ver.`,
    },
    {
      role: "user",
      content: `Kullanıcı Profili:
- Yaş: ${profile.age}
- Meslek: ${profile.occupation}
- Günlük Ekran Süresi: ${profile.screenTime} saat
- Gözlük Kullanımı: ${profile.hasGlasses ? "Evet" : "Hayır"}
- Semptomlar: ${profile.symptoms.join(", ")}

Bu kullanıcı için:
1. Risk değerlendirmesi yap
2. Kişiselleştirilmiş egzersiz önerileri sun
3. Yaşam tarzı tavsiyeleri ver
4. Takip edilmesi gereken metrikler belirt

Yanıtını JSON formatında ver:
{
  "riskLevel": "düşük|orta|yüksek",
  "analysis": "detaylı analiz",
  "recommendations": ["öneri1", "öneri2", ...],
  "exerciseFrequency": "günde kaç kez",
  "warnings": ["uyarı1", "uyarı2", ...]
}`,
    },
  ];

  const response = await callZai(messages, true); // JSON mode enabled
  return response;
}

/**
 * Guide user through calibration process
 */
export async function guideCalibration(step: string, userFeedback?: string): Promise<string> {
  const messages: ZaiMessage[] = [
    {
      role: "system",
      content: `Sen göz takibi kalibrasyon sürecinde kullanıcıya rehberlik eden AI asistanısın. Adım adım talimatlar ver, sabırlı ve motive edici ol. Türkçe yanıt ver.`,
    },
    {
      role: "user",
      content: `Kalibrasyon Adımı: ${step}${userFeedback ? `\nKullanıcı Geri Bildirimi: ${userFeedback}` : ""}

Bu adım için kullanıcıya:
1. Ne yapması gerektiğini açıkla
2. İpuçları ver
3. Yaygın hataları uyar
4. Motive et

Kısa ve net bir yanıt ver (max 2-3 cümle).`,
    },
  ];

  const response = await callZai(messages);
  return response;
}

/**
 * Analyze test results and provide insights
 */
export async function analyzeTestResults(testData: {
  testType: string;
  score: number;
  duration: number;
  accuracy: number;
  previousScores?: number[];
}): Promise<string> {
  const messages: ZaiMessage[] = [
    {
      role: "system",
      content: `Sen göz sağlığı test sonuçlarını analiz eden AI uzmanısın. Sonuçları yorumla ve kullanıcıya anlaşılır geri bildirim ver. Türkçe yanıt ver.`,
    },
    {
      role: "user",
      content: `Test Sonuçları:
- Test Türü: ${testData.testType}
- Puan: ${testData.score}
- Süre: ${testData.duration} saniye
- Doğruluk: ${testData.accuracy}%
${testData.previousScores ? `- Önceki Puanlar: ${testData.previousScores.join(", ")}` : ""}

Bu sonuçlar için:
1. Performans değerlendirmesi yap
2. İlerleme analizi sun (varsa önceki sonuçlarla karşılaştır)
3. İyileştirme önerileri ver
4. Sonraki adımları belirt

JSON formatında yanıt ver:
{
  "performance": "zayıf|orta|iyi|mükemmel",
  "progress": "gerileme|sabit|ilerleme",
  "feedback": "detaylı geri bildirim",
  "suggestions": ["öneri1", "öneri2", ...],
  "nextSteps": ["adım1", "adım2", ...]
}`,
    },
  ];

  const response = await callZai(messages, true); // JSON mode enabled
  return response;
}

/**
 * Generate daily motivation message
 */
export async function getDailyMotivation(userData: {
  streak: number;
  completedExercises: number;
  lastScore: number;
}): Promise<string> {
  const messages: ZaiMessage[] = [
    {
      role: "system",
      content: `Sen kullanıcıları motive eden, pozitif ve destekleyici bir göz sağlığı koçusun. Türkçe yanıt ver.`,
    },
    {
      role: "user",
      content: `Kullanıcı İstatistikleri:
- Ardışık Gün Sayısı: ${userData.streak}
- Tamamlanan Egzersiz: ${userData.completedExercises}
- Son Puan: ${userData.lastScore}

Kullanıcıya kısa (1-2 cümle) motive edici bir mesaj yaz. Başarılarını kutla ve devam etmesi için cesaretlendir.`,
    },
  ];

  const response = await callZai(messages);
  return response;
}

/**
 * Answer user questions about eye health
 */
export async function answerQuestion(question: string, userContext?: string): Promise<string> {
  const messages: ZaiMessage[] = [
    {
      role: "system",
      content: `Sen göz sağlığı konusunda uzman bir AI asistanısın. Kullanıcı sorularını bilimsel temelli, anlaşılır ve yardımcı bir şekilde yanıtlıyorsun. Türkçe yanıt ver.`,
    },
    {
      role: "user",
      content: `${userContext ? `Kullanıcı Bağlamı: ${userContext}\n\n` : ""}Soru: ${question}

Bu soruya:
1. Bilimsel temelli yanıt ver
2. Anlaşılır dil kullan
3. Gerekirse örnek ver
4. Ek kaynaklar öner

Yanıtını kısa ve öz tut (max 4-5 cümle).`,
    },
  ];

  const response = await callZai(messages);
  return response;
}

