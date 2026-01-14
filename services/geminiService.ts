
import { GoogleGenAI } from "@google/genai";
import { LookupResult, Language } from "../types";

const SYSTEM_INSTRUCTION = `
Bạn là "US Phone Timezone Lookup Bot". Nhiệm vụ của bạn là tra cứu thông tin dựa trên Area Code (3 chữ số) hoặc Tên Tiểu Bang (State Name) của Mỹ.
Khi nhận được yêu cầu:
1. Sử dụng công cụ Google Search để tìm thông tin chính xác về:
   - Bang (State).
   - 2-4 Thành phố lớn (Cities).
   - Múi giờ chính xác (ET, CT, MT, PT, AKT, HST).
   - Trạng thái DST (Giờ tiết kiệm ánh sáng).

2. Trả về DUY NHẤT một khối JSON theo cấu trúc sau (không kèm văn bản giải thích):
{
  "results": [
    {
      "query": "giá trị đầu vào",
      "state": "Tên bang",
      "cities": ["thành phố 1", "thành phố 2"],
      "timezoneName": "ET/CT/MT/PT/AKT/HST",
      "ianaTimezone": "America/New_York (hoặc tương ứng)",
      "isDST": true/false,
      "ambiguous": false,
      "reason": ""
    }
  ]
}

Lưu ý múi giờ IANA:
- ET: America/New_York
- CT: America/Chicago
- MT: America/Denver (Arizona dùng America/Phoenix nếu không có DST)
- PT: America/Los_Angeles
- AKT: America/Anchorage
- HST: Pacific/Honolulu
`;

function cleanJsonString(str: string): string {
  // Loại bỏ các khối code markdown nếu có
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

export const lookupQueries = async (queries: string[], lang: Language): Promise<LookupResult[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error(lang === 'vi' ? "Thiếu API Key." : "API Key is missing.");
  }

  // Khởi tạo instance mới để đảm bảo dùng key mới nhất
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Hãy tra cứu và trả về JSON cho các mục sau: ${queries.join(", ")}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      }
    });

    const rawText = response.text || '';
    const jsonText = cleanJsonString(rawText);
    
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", rawText);
      throw new Error(lang === 'vi' ? "Lỗi phân tích dữ liệu từ AI." : "AI data parsing error.");
    }

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web).filter(Boolean) || [];

    if (!data.results || !Array.isArray(data.results)) {
       throw new Error(lang === 'vi' ? "Không tìm thấy kết quả phù hợp." : "No results found.");
    }

    return data.results.map((item: any, index: number) => {
      const now = new Date();
      const tz = item.ianaTimezone || 'America/New_York';
      
      const vnTimeFormatter = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const usTimeFormatter = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Tính toán chênh lệch giờ
      const vnDateStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
      const usDateStr = now.toLocaleString('en-US', { timeZone: tz });
      const vnD = new Date(vnDateStr);
      const usD = new Date(usDateStr);
      const diffHours = Math.round((vnD.getTime() - usD.getTime()) / (1000 * 60 * 60));

      const diffText = lang === 'vi' 
        ? `VN nhanh hơn ${diffHours} giờ` 
        : `VN is ${diffHours} hours ahead`;

      const suggestions = [
        { vn: "20:00 – 22:00", us: "08:00 – 10:00" },
        { vn: "06:00 – 08:00", us: "18:00 – 20:00" }
      ];

      return {
        id: `${item.query}-${Date.now()}-${index}`,
        query: item.query || queries[index],
        state: item.state || "N/A",
        cities: item.cities || [],
        timezoneName: item.timezoneName || "N/A",
        ianaTimezone: tz,
        vnTime: vnTimeFormatter.format(now),
        usTime: usTimeFormatter.format(now),
        difference: diffText,
        suggestions: suggestions,
        isDST: !!item.isDST,
        sources: sources,
        error: item.ambiguous ? item.reason : undefined
      };
    });
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
