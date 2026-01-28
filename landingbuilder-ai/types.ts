
/**
 * TIPAGEM GLOBAL DO LANDINGBUILDER AI
 * Essas interfaces definem o contrato de dados entre os serviços de IA e a interface do usuário.
 */

export enum PageType {
  SALES = 'SALES', // Foco em conversão direta
  INSTITUTIONAL = 'INSTITUTIONAL' // Foco em autoridade e informações
}

export type FontPair = 'Modern' | 'Elegant' | 'Tech' | 'Minimal';
export type BrandTone = 'Persuasive' | 'Professional' | 'Friendly' | 'Technical' | 'Urgent';

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3';
export type VisualStyle = 'Product Commercial' | 'Minimalist' | 'Luxury' | 'Nature' | 'Cyberpunk' | 'Lifestyle' | 'Photorealistic';
export type ImageExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

/**
 * Predefinições para tamanhos de ativos de marketing comuns.
 */
export type AssetPreset = 
  | 'Ebook Cover' 
  | 'Facebook Cover' 
  | 'Instagram Story' 
  | 'VSL Thumbnail' 
  | 'Google Display' 
  | 'LinkedIn Banner' 
  | 'Custom';

/**
 * Define o perfil psicológico e demográfico do cliente ideal.
 */
export interface Persona {
  niche: string;
  ageRange: string;
  gender: string;
  audience: string;
  pains: string; // Dores que motivam a compra
  desires: string; // Sonhos que o produto realiza
  objections: string; // Barreiras mentais do cliente
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
  email?: string;
}

export interface BrandKit {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string; // Logo da marca ou expert
  photoUrl?: string; // Foto profissional do expert
}

/**
 * Representa a autoridade por trás do produto.
 */
export interface Producer {
  id: string;
  name: string;
  authority: string; // Bio persuasiva
  tone: BrandTone;
  socialLinks: SocialLinks;
  brandKit: BrandKit;
  testimonials?: string[]; 
  createdAt: number;
}

/**
 * Informações estratégicas do produto para alimentação da IA.
 */
export interface ProductInfo {
  id: string;
  producerId: string;
  name: string;
  description: string; // Promessa única
  price: string;
  isExternal: boolean;
  externalUrl?: string;
  learningGoals: string; // O que o aluno aprende (Base para o E-book)
  imageUrl?: string;
  guaranteeDays?: number;
  bonusDescription?: string;
  testimonials?: string[];
  scarcityText?: string;
  faq?: { question: string; answer: string; }[];
  persona: Persona;
  orderBump: { active: boolean; name: string; price: string; description: string; };
  upsell: { active: boolean; name: string; price: string; description: string; };
  createdAt: number;
}

/**
 * Bloco individual de conteúdo da Landing Page.
 */
export interface Section {
  id: string;
  type: string; // Ex: hero, features, proof, faq
  content: string; // HTML puro com Tailwind
}

/**
 * Capítulo individual de um e-book gerado.
 */
export interface EbookChapter {
  id: string;
  title: string;
  notes: string; // Orientações da pauta
  content: string; // Conteúdo redigido
  imageUrl?: string;
  imagePrompt?: string;
  layout: 'standard' | 'visual-opener' | 'two-columns';
  status: 'pending' | 'generating' | 'completed';
}

/**
 * Estrutura completa de um ativo de isca digital.
 */
export interface Ebook {
  id: string;
  productId: string;
  title: string;
  author: string;
  introduction: string;
  conclusion: string;
  chapters: EbookChapter[];
  coverPrompt: string;
  coverImageUrl?: string;
  visualSettings: {
    fontFamily: 'sans' | 'serif' | 'mono' | 'display';
    theme: 'clean' | 'sepia' | 'dark' | 'soft-blue' | 'premium-black';
    accentColor: string;
  };
  updatedAt: number;
}

/**
 * Roteiro de vídeo para vendas.
 */
export interface VslScript {
  id: string;
  productId: string;
  title: string;
  content: string;
  model: string; // Framework de copy (PAS, AIDA, 12-Steps)
  duration: string;
  voiceName: string;
  thumbnailUrl?: string;
}

export interface StudioImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: ImageAspectRatio;
  style: VisualStyle;
  preset: AssetPreset;
  format: ImageExportFormat;
  quality: number;
  timestamp: number;
  adCopy?: string;
  adType?: string;
}

/**
 * Elemento selecionado no editor visual para modificação.
 */
export interface ActiveElement {
  sectionId: string;
  tagName: string;
  content?: string;
  src?: string;
  href?: string;
  backgroundColor?: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface Project {
  id: string;
  productId: string;
  name: string;
  sections: Section[];
  options: any;
  createdAt: number;
  updatedAt: number;
}

export interface MarketingSettings {
  metaPixelId?: string;
  googleAnalyticsId?: string;
  tiktokPixelId?: string;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
}

export interface PromptLibraryItem {
  category: 'Headline' | 'Copywriting' | 'Estrutura' | 'Anúncios' | 'E-books' | 'VSL';
  title: string;
  content: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'Sales' | 'Institutional';
  thumbnailColor: string;
  sections: Section[];
}

/**
 * Preferências do usuário para a geração da página.
 */
export interface GenerationOptions {
  pageType: PageType;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: 'light' | 'dark' | 'neutral';
  fontPair: FontPair;
  tone: BrandTone;
  prompt: string;
  referenceUrl: string;
  extractionFlags: {
    structure: boolean;
    copy: boolean;
    colors: boolean;
  };
}
