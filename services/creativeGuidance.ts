import type { CreativeMode } from "../types";

export interface CreativeGuidance {
  reference: string;
  fallback: string;
  caption: string;
  integrationInstruction: string;
}

export const creativeGuidance: Record<CreativeMode, CreativeGuidance> = {
  organic: {
    reference:
      "Use a referência real como âncora, compondo um estúdio artesanal iluminado, com madeira, fios e pequenos sinais de comunidade (bilhetes, certificados) ao fundo.",
    fallback:
      "Imagine um atelier iluminado ao amanhecer. Coloque o produto no centro de uma mesa com bolas de lã, ferramentas e plantas, com tecidos e luz dourada, e adicione provas sutis como manuscritos e medalhas.",
    caption: "Conte a história do artesão através de texturas, luz e comunidade.",
    integrationInstruction:
      "Integre o produto à cena como um único plano: evite colagens, adicione sombras suaves e elementos compostos ao redor, fazendo parecer que tudo foi fotografado de uma só vez e redesenhe o produto no novo ambiente em vez de colar o recorte."
  },
  paid: {
    reference:
      "Destaque o produto com selo 'Garantia 30 dias', iluminação precisa e elementos de prova (troféus, certificados, carimbos) no fundo.",
    fallback:
      "Crie um retrato clean de estúdio com o produto central, selo 'Garantia 30 dias', objetos que sugerem resultados e tipografia discreta com CTA.",
    caption: "Reforce autoridade e confiança com iluminação controlada.",
    integrationInstruction:
      "Faça o produto e o fundo viverem no mesmo espaço; inclua reflexos, sombras e fundos suaves em vez de sobrepor a imagem, redesenhando o produto com a nova iluminação em vez de apenas colar o recorte para dar a sensação de um único clique editorial."
  },
  generic: {
    reference:
      "Monte um moodboard com o produto entre objetos de lifestyle (xícaras, cadernos, plantas) e texturas da paleta da marca.",
    fallback:
      "Gere uma composição abstrata com o produto flutuando sobre superfícies texturizadas (tinta, papel artesanal) e grafismos minimalistas como 'companheiro de criação'.",
    caption: "Estimule o sentimento de rotina criativa sem vender diretamente.",
    integrationInstruction:
      "Trate o produto como um elemento integrado: use gradientes, camadas translúcidas e grafismos para fundir o objeto à composição, evitando bordas duras e redesenhando o produto para que pareça parte do novo ambiente."
  }
};

export const getCreativeGuidance = (mode: CreativeMode): CreativeGuidance =>
  creativeGuidance[mode] || creativeGuidance.organic;

export const getCreativeFallbackPrompt = (mode: CreativeMode): string =>
  getCreativeGuidance(mode).fallback;
