
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
export type VisualPreset = 'standard' | 'agency-premium';
export type VisualScale = 'compact' | 'balanced' | 'large';

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3' | '1.91:1';
export type VisualStyle =
  | 'Product Commercial'
  | 'Minimalist'
  | 'Luxury'
  | 'Nature'
  | 'Cyberpunk'
  | 'Lifestyle'
  | 'Photorealistic'
  | 'Social Editorial'
  | 'Social Impact'
  | 'Social Tech';
export type ImageExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export type EbookType = 'lead_magnet' | 'principal';
export type EbookDepth = 'short' | 'medium' | 'deep';
export type EbookCtaStyle = 'soft' | 'direct';

export interface EbookConfig {
  type: EbookType;
  depth: EbookDepth;
  ctaStyle: EbookCtaStyle;
  introMaxPages: 1;
  exerciseFrequency: 'every_2' | 'every_1';
  funnelAlignment: true;
}

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
  | 'IG Feed'
  | 'IG Portrait'
  | 'IG Story'
  | 'Reels Cover'
  | 'TikTok 9:16'
  | 'YouTube Thumbnail'
  | 'LinkedIn Post'
  | 'Facebook Post'
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
  anchorPrice?: string; // Preço cheio para ancoragem
  anchorSavings?: string; // Economia percebida
  isExternal: boolean;
  externalUrl?: string;
  learningGoals: string; // O que o aluno aprende (Base para o E-book)
  imageUrl?: string;
  guaranteeDays?: number;
  bonusDescription?: string;
  uniqueMechanism?: string; // Por que isso funciona (mecanismo único)
  testimonials?: string[];
  proofStats?: string; // Provas concretas (números/selos/casos)
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
  exerciseRequired?: boolean;
  imageUrl?: string;
  imagePrompt?: string;
  layout: 'standard' | 'visual-opener' | 'two-columns';
  status: 'pending' | 'generating' | 'completed';
  reviewedAt?: number;
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
  config?: EbookConfig;
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
  modelUsed?: string;
  usedReference?: boolean;
  fallbackUsed?: boolean;
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
  color?: string;
  fontSize?: string;
  lineHeight?: string;
  textAlign?: string;
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
  versionName?: string;
  tags?: string[];
  isPrimary?: boolean;
  sections: Section[];
  options: any;
  createdAt: number;
  updatedAt: number;
}

export interface PaidCampaignInput {
  objective: string;
  ticket: string;
  segment: string;
  pain: string;
  mechanism?: string;
  promise?: string;
  channel: string;
  assets: {
    hasPv: boolean;
    hasEbook: boolean;
    hasProof: boolean;
  };
  tone: string;
  budget?: string;
}

export interface PaidCampaignPlan {
  summary: string;
  funnel: {
    top: string;
    middle: string;
    bottom: string;
  };
  angles: string[];
  creatives: Array<{ format: string; goal: string; notes: string }>;
  copy: { headline: string; body: string; cta: string };
  checklist: string[];
  nextSteps: string[];
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  event: 'lead' | 'purchase' | 'page_view';
  active: boolean;
}

export interface MarketingSettings {
  metaPixelId?: string;
  googleAnalyticsId?: string;
  tiktokPixelId?: string;
  webhooks?: WebhookConfig[];
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

export type DesignSystemStrength = 'light' | 'medium' | 'strong';

export interface DesignSystemConfig {
  segment: string;
  style: string;
  strength: DesignSystemStrength;
  globalRules: string;
  segmentSystem: string;
  projectOverride: string;
  sectionOverrides: Record<string, string>;
  nichePreset?: 'auto' | 'artesanato' | 'saude-mental';
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
  visualPreset: VisualPreset;
  visualScale: VisualScale;
  prompt: string;
  referenceUrl: string;
  regenMode?: 'full' | 'copy' | 'layout' | 'style';
  creativeFreedom?: 'low' | 'medium' | 'high';
  authorLayoutMode?: 'fixed' | 'free';
  designSystem?: DesignSystemConfig;
  extractionFlags: {
    structure: boolean;
    copy: boolean;
    colors: boolean;
  };
}
