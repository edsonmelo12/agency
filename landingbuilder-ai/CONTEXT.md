# 📄 LandingBuilder AI - Manual Técnico & Onboarding

## 🧠 Visão Geral do Sistema
O **LandingBuilder AI** é um ecossistema de geração de funis de vendas "Full-Stack". Ele utiliza modelos Gemini para transformar dados brutos de um expert e um produto em uma estrutura de vendas completa (Landing Page, E-book de Isca Digital, Roteiro de VSL e Criativos de Anúncios).

---

## 🏗️ Arquitetura de Dados (Data Flow)
1. **Expert (Producer)**: O ponto de entrada. Define autoridade, tom de voz e BrandKit.
2. **Produto (ProductInfo)**: Vinculado a um Expert. Contém a estratégia de oferta, persona (dores/desejos) e links de checkout.
3. **Ativos (Assets)**: Gerados a partir do contexto do Produto.
   - **Landing Page**: Estrutura HTML/Tailwind persistida como array de `Section`.
   - **BookBuilder**: Estrutura de e-book (capítulos) gerada com `thinkingBudget` para profundidade.
   - **VSL Studio**: Scripts de vídeo com suporte a Teleprompter e TTS (Text-to-Speech).
   - **Estúdio AI**: Geração de imagens contextuais com suporte a `googleSearch` para referências reais.

---

## 🤖 Padrões de Inteligência Artificial

### Modelos Utilizados
- **`gemini-3-pro-preview`**: Utilizado para tarefas de alta complexidade (Copywriting de Landing Pages, E-books e VSLs). 
  - *Dica*: Sempre utilize `thinkingConfig` com budget entre 2000-4000 para estas tarefas.
- **`gemini-3-flash-preview`**: Utilizado para extração rápida de dados, SEO, análise de URLs e geração de criativos simples.
- **`gemini-2.5-flash-image` & `gemini-3-pro-image-preview`**: Core do Estúdio Visual.
- **`gemini-2.5-flash-preview-tts`**: Geração de guias de voz.

### Resiliência de Saída (JSON Parsing)
As IAs podem retornar ruídos (Markdown code blocks ou pensamentos). 
- **Solução**: Sempre passar a resposta bruta pela função `cleanJsonResponse` antes do `JSON.parse()`.
- **Schema**: As chamadas devem sempre incluir `responseMimeType: "application/json"` e um `responseSchema` rigoroso.

---

## 📂 Mapa de Arquivos Críticos
- `App.tsx`: Orquestrador de estado e persistência (IndexedDB).
- `services/geminiService.ts`: Ponte de integração com o SDK `@google/genai`.
- `services/dbService.ts`: Camada de abstração do banco de dados local.
- `components/PreviewPanel.tsx`: Motor de renderização do Iframe com sincronização de edição em tempo real.
- `components/VslPanel.tsx`: Contém a lógica de decodificação de áudio PCM bruto (24kHz Mono).

---

## 🛠️ Guia de Debugging para IA
- **Erro de Foco no Editor**: Se o cursor pular ao digitar no Iframe, verifique a trava `lastReceivedHtml` no `PreviewPanel.tsx`.
- **Erro de Audio TTS**: O áudio Gemini não tem cabeçalho (wav/mp3). Se o áudio não tocar, verifique a função `decodeAudioData` que converte Int16 para Float32.
- **Falha no JSON**: Verifique se o prompt não está solicitando "explicações" fora do JSON. Use instruções de sistema rigorosas.

---

## 🚀 Próximos Passos de Implementação
- [ ] Implementar exportação direta de E-books para PDF (via jsPDF ou similar).
- [ ] Adicionar sistema de "Heatmap Simulado" via IA para prever zonas de atenção na LP.
- [ ] Integrar Webhooks para disparo automático de leads para CRMs.
