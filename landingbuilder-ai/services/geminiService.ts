
import { GoogleGenAI, Part, Type, Modality } from "@google/genai";
import { GenerationOptions, PageType, Section, Producer, ProductInfo, ImageAspectRatio, VisualStyle, Ebook, EbookChapter, VslScript, SeoSettings, AssetPreset, ImageExportFormat } from "../types";

/**
 * Limpa a resposta da IA, removendo blocos de código Markdown e ruídos de texto explicativo.
 * Crucial para manter a estabilidade do JSON.parse().
 */
const cleanJsonResponse = (text: string): string => {
  if (!text) return "[]";
  let cleaned = text.trim();
  
  // Remove blocos de código markdown (```json ... ```)
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  let start = -1; 
  let end = -1;
  
  if (firstBracket !== -1 && (firstBrace === -1 || (firstBracket < firstBrace && firstBracket !== -1))) { 
    start = firstBracket; 
    end = lastBracket; 
  } else if (firstBrace !== -1) { 
    start = firstBrace; 
    end = lastBrace; 
  }
  
  if (start !== -1 && end !== -1 && end > start) { 
    cleaned = cleaned.substring(start, end + 1); 
  }
  
  return cleaned;
};

/**
 * Remove metadados de texto que a IA às vezes inclui dentro de campos de string JSON.
 */
const stripJsonNoise = (text: string): string => {
  if (!text) return "";
  let s = text.trim();
  if (s.startsWith('{') || s.startsWith('"') || s.includes('":')) {
    try {
      const parsed = JSON.parse(s);
      if (typeof parsed === 'object') return parsed.introduction || parsed.conclusion || parsed.content || s;
    } catch (e) {
      return s.replace(/^[^{]*{[^}]*intro(duction)?":\s*"/i, '').replace(/"\s*,?\s*"chapters":.*$/is, '').replace(/^["\s]+|["\s]+$/g, '');
    }
  }
  return s;
};

/**
 * Injeta dados dinâmicos do Expert e Produto nos Placeholders do HTML gerado.
 */
const postProcessGeneratedHTML = (sections: Section[], producer: Producer, product: ProductInfo): Section[] => {
  const logo = producer?.brandKit?.logoUrl || '';
  const photo = producer?.brandKit?.photoUrl || '';
  const productImg = product?.imageUrl || '';
  const checkoutUrl = product?.isExternal && product?.externalUrl ? product.externalUrl : '#';
  
  return sections.map(section => {
    let content = section.content || '';
    content = content.replace(/__EXPERT_LOGO__/g, logo)
             .replace(/__EXPERT_PHOTO__/g, photo)
             .replace(/__PRODUCT_IMAGE__/g, productImg)
             .replace(/__CHECKOUT_URL__/g, checkoutUrl)
             .replace(/__PRODUCT_NAME__/g, product.name)
             .replace(/__PRODUCT_PRICE__/g, product.price)
             .replace(/__EXPERT_NAME__/g, producer.name);
    return { ...section, content };
  });
};

/**
 * GERAÇÃO DE LANDING PAGE
 * Utiliza o modelo Pro com thinkingBudget para criar copy persuasiva e estrutura HTML Tailwind.
 */
export const generateLandingPage = async (options: GenerationOptions, producer: Producer, product: ProductInfo): Promise<Section[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `Você é um Web Designer e Copywriter Brasileiro de Elite. 
  REQUISITO: Gere uma Landing Page profissional em Português do Brasil (PT-BR). 
  GRAMÁTICA: Use ortografia brasileira impecável. PROIBIDO o uso de palavras como "feature", "sales", "layout" ou qualquer termo em inglês no conteúdo final.
  PLACEHOLDERS: Use __PRODUCT_IMAGE__, __EXPERT_PHOTO__, __EXPERT_LOGO__, __CHECKOUT_URL__.
  RETORNO: Apenas o array JSON de seções {id, type, content}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crie uma LP de alta conversão para o produto "${product.name}". Contexto: ${options.prompt}. Tom: ${options.tone}.`,
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json", 
      responseSchema: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT, 
          properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, content: { type: Type.STRING } },
          required: ["id", "type", "content"]
        } 
      } 
    },
  });
  const raw = JSON.parse(cleanJsonResponse(response.text || "[]"));
  return postProcessGeneratedHTML(raw, producer, product);
};

/**
 * GERAÇÃO DE IMAGENS (ESTÚDIO)
 * Suporta referências reais (Inpainting/Image-to-Image) e prompts puros.
 */
export const generateStudioImage = async (
  base64: string | null,
  prompt: string,
  style: VisualStyle,
  ratio: ImageAspectRatio,
  quality: 'standard' | 'ultra',
  format: ImageExportFormat,
  qlt: number,
  preset: AssetPreset,
  adCopy?: string,
  adType?: string
): Promise<string> => {
  const isHighRes = quality === 'ultra';
  const model = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mapRatio = (r: string): string => {
    const supported = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    return supported.includes(r) ? r : "1:1";
  };

  const finalPrompt = base64 
    ? `Main subject: The product in the image. Style: Professional ${style}. Context: ${prompt}. Preset: ${preset}. ${adCopy ? `Concept: ${adCopy}` : ''}`
    : `Professional ${style} image. Subject: ${prompt}. Preset: ${preset}. Aspect Ratio: ${ratio}. High quality lighting.`;

  const contents: any = { parts: [{ text: finalPrompt }] };
  if (base64) {
    const mimeType = base64.split(';')[0].split(':')[1] || 'image/png';
    const data = base64.split(',')[1];
    contents.parts.unshift({ inlineData: { data, mimeType } });
  }

  // Fix: imageSize is only supported for gemini-3-pro-image-preview
  const imageConfig: any = { 
    aspectRatio: mapRatio(ratio) 
  };
  if (isHighRes) {
    imageConfig.imageSize = "2K";
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { imageConfig }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) return `data:${format};base64,${part.inlineData.data}`;
  throw new Error("Falha ao gerar imagem.");
};

/**
 * ANÁLISE DE PRODUTO EXTERNO
 * Usa Google Search para extrair inteligência de mercado de URLs de concorrentes.
 */
export const analyzeExternalProduct = async (url: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise as informações do produto nesta URL: ${url}. Extraia nome, descrição, preço e persona.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING },
          learningGoals: { type: Type.STRING },
          persona: {
            type: Type.OBJECT,
            properties: {
              niche: { type: Type.STRING },
              ageRange: { type: Type.STRING },
              gender: { type: Type.STRING },
              audience: { type: Type.STRING },
              pains: { type: Type.STRING },
              desires: { type: Type.STRING },
              objections: { type: Type.STRING }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

/**
 * GERAÇÃO DE PAUTA DE E-BOOK
 */
export const generateBookOutline = async (title: string, topic: string, author: string, product: ProductInfo): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crie um outline para um e-book chamado "${title}" sobre "${topic}". Autor: ${author}.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

/**
 * REDAÇÃO DE CAPÍTULO DE E-BOOK
 * Usa thinkingBudget para garantir que o conteúdo seja informativo e longo.
 */
export const generateChapterContent = async (bookTitle: string, chapter: any, expert: Producer, product: ProductInfo): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Escreva o conteúdo completo do capítulo "${chapter.title}" do e-book "${bookTitle}".`,
    config: { thinkingConfig: { thinkingBudget: 2500 } }
  });
  return stripJsonNoise(response.text);
};

/**
 * GERAÇÃO DE ROTEIRO VSL
 */
export const generateVslScript = async (model: string, duration: string, expert: Producer, product: ProductInfo): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Gere um roteiro de VSL usando o modelo ${model} para o produto ${product.name}.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

/**
 * SINTETIZAÇÃO DE VOZ (TTS)
 * Retorna dados PCM brutos (Raw PCM) que precisam de decodificação manual.
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const refineLandingPageContent = async (sections: Section[], instruction: string): Promise<Section[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Refine: "${instruction}" nas seções.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const injectAssetIntoPage = async (type: 'ebook' | 'vsl', asset: any, expert: Producer, product: ProductInfo): Promise<Section> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie seção HTML para promover ${type}: ${asset.title}.`,
    config: { responseMimeType: "application/json" }
  });
  const section = JSON.parse(cleanJsonResponse(response.text));
  return postProcessGeneratedHTML([section], expert, product)[0];
};

export const generateCreativeCampaign = async (sections: Section[], expert: Producer, product: ProductInfo): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crie 3 anúncios para este funil.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const generateABVariation = async (sections: Section[], hypothesis: string, expert: Producer, product: ProductInfo): Promise<Section[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Gere variação baseada na hipótese: "${hypothesis}".`,
    config: { responseMimeType: "application/json" }
  });
  return postProcessGeneratedHTML(JSON.parse(cleanJsonResponse(response.text)), expert, product);
};
