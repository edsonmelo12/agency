import { GenerationOptions, Producer, ProductInfo, Section, EbookConfig, SeoSettings } from "../types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "/api/genai";

const callProxy = async (action: string, args: any[]) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, args }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Erro ao chamar o proxy de IA");
  }
  return payload.result;
};

const ensureArgs = (args: any[]) => args.map((value) => value === undefined ? null : value);

export const generateLandingPage = async (options: GenerationOptions, producer: Producer, product: ProductInfo): Promise<Section[]> =>
  callProxy("generateLandingPage", ensureArgs([options, producer, product]));

export const hydrateSectionContent = async (content: string, producer: Producer, product: ProductInfo): Promise<string> =>
  callProxy("hydrateSectionContent", ensureArgs([content, producer, product]));

export const regenerateSectionWithCRO = async (
  sectionType: string,
  options: GenerationOptions,
  expert: Producer,
  product: ProductInfo,
  currentHtml: string = ""
): Promise<string> => callProxy("regenerateSectionWithCRO", ensureArgs([sectionType, options, expert, product, currentHtml]));

export const generateStudioImage = async (config: any): Promise<any> =>
  callProxy("generateStudioImage", ensureArgs([config]));

export const analyzeExternalProduct = async (url: string): Promise<any> =>
  callProxy("analyzeExternalProduct", ensureArgs([url]));

export const generateBookOutline = async (
  title: string,
  topic: string,
  author: string,
  product: ProductInfo,
  config?: EbookConfig
): Promise<any> => callProxy("generateBookOutline", ensureArgs([title, topic, author, product, config]));

export const generateChapterContent = async (
  bookTitle: string,
  chapter: any,
  expert: Producer,
  product: ProductInfo,
  config?: EbookConfig
): Promise<string> => callProxy("generateChapterContent", ensureArgs([bookTitle, chapter, expert, product, config]));

export const reviewChapterContent = async (
  chapter: any,
  expert: Producer,
  product: ProductInfo
): Promise<any> => callProxy("reviewChapterContent", ensureArgs([chapter, expert, product]));

export const generateVslScript = async (model: string, duration: string, expert: Producer, product: ProductInfo): Promise<any> =>
  callProxy("generateVslScript", ensureArgs([model, duration, expert, product]));

export const generateSpeech = async (text: string, voiceName: string = "Kore"): Promise<string> =>
  callProxy("generateSpeech", ensureArgs([text, voiceName]));

export const refineLandingPageContent = async (sections: Section[], instruction: string): Promise<Section[]> =>
  callProxy("refineLandingPageContent", ensureArgs([sections, instruction]));

export const injectAssetIntoPage = async (
  type: "ebook" | "vsl",
  asset: any,
  expert: Producer,
  product: ProductInfo
): Promise<Section> => callProxy("injectAssetIntoPage", ensureArgs([type, asset, expert, product]));

export const generateCreativeCampaign = async (sections: Section[], expert: Producer, product: ProductInfo): Promise<any[]> =>
  callProxy("generateCreativeCampaign", ensureArgs([sections, expert, product]));

export const generateMarketingIdeas = async (expert: Producer, product: ProductInfo): Promise<any[]> =>
  callProxy("generateMarketingIdeas", ensureArgs([expert, product]));

export const generatePaidAdsPlan = async (sections: Section[], expert: Producer, product: ProductInfo): Promise<any[]> =>
  callProxy("generatePaidAdsPlan", ensureArgs([sections, expert, product]));

export const generatePaidCampaignStrategy = async (sections: Section[], expert: Producer, product: ProductInfo): Promise<any[]> =>
  callProxy("generatePaidCampaignStrategy", ensureArgs([sections, expert, product]));

export const generateABVariation = async (sections: Section[], hypothesis: string, expert: Producer, product: ProductInfo): Promise<Section[]> =>
  callProxy("generateABVariation", ensureArgs([sections, hypothesis, expert, product]));

export const simulateHeatmap = async (sections: Section[]): Promise<Array<{ text: string; score: number; type: string }>> =>
  callProxy("simulateHeatmap", ensureArgs([sections]));

export const rewriteElementText = async (text: string, instruction: string): Promise<string> =>
  callProxy("rewriteElementText", ensureArgs([text, instruction]));

export const generateSeoFromSections = async (sections: Section[], product: ProductInfo): Promise<SeoSettings> =>
  callProxy("generateSeoFromSections", ensureArgs([sections, product]));

export type { ApiKeyLeakDetail } from "./geminiService";
