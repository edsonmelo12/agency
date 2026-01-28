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
- `components/PreviewPanel.tsx`: Motor de renderização do Iframe + editor visual (menu contextual de edição).
- `components/VslPanel.tsx`: Contém a lógica de decodificação de áudio PCM bruto (24kHz Mono).
- `components/sidebar/AnalyticsModule.tsx`: SEO/pixels com ação “IA Otimizar”.

---

## 🛠️ Guia de Debugging para IA
- **Erro de Foco no Editor**: Se o cursor pular ao digitar no Iframe, verifique a trava `lastReceivedHtml` no `PreviewPanel.tsx`.
- **Salvamento excessivo no Editor**: O editor visual envia alterações com debounce; se salvar a cada tecla, ajuste o delay do `scheduleNotify` no `PreviewPanel.tsx`.
- **Edição de Imagens no Editor**: Os controles aparecem ao selecionar um `<img>`; em casos de wrappers/overlays, a seleção por ponto (hit-test) do `PreviewPanel.tsx` deve garantir a imagem ativa. Se não aparecer, verifique se a imagem é `background-image`.
- **Edição de Links**: Clique em botões/links no preview não deve navegar; o iframe intercepta `<a>` para permitir edição de `href`.
- **Editor Visual sem CSS**: O Iframe usa Tailwind CDN e precisa de `tailwind.refresh()` após injeção de HTML.
- **Erro de Audio TTS**: O áudio Gemini não tem cabeçalho (wav/mp3). Se o áudio não tocar, verifique a função `decodeAudioData` que converte Int16 para Float32.
- **Falha no JSON**: Verifique se o prompt não está solicitando "explicações" fora do JSON. Use instruções de sistema rigorosas.

---

## 📘 Regra de Negócio — E-book (Isca x Principal)
- **Tipo**: `lead_magnet` (Isca) ou `principal` (Produto principal).
- **Introdução**: no máximo 1 página.
- **Exercícios**: Isca = a cada 2 capítulos; Principal = em todos os capítulos.
- **CTA**: Isca = soft; Principal = direto.
- **Consistência**: método/ promessa da PV deve existir no e-book.
- **Formato editorial**: evite itálico/asteriscos/underline e blockquotes; prefira blocos Gatilho/Reação/Comportamento no lugar de tabelas.
- **Renderização**: tabelas de Gatilho/Reação/Comportamento são convertidas automaticamente na visualização.

---

## 🧩 Skills por Módulo (Referência)
Consulte `DOCS/skills.md` para entender as skills utilizadas nos projetos em cada módulo.

## 🚀 Próximos Passos de Implementação
- [ ] Implementar exportação direta de E-books para PDF (via jsPDF ou similar).
- [ ] Adicionar sistema de "Heatmap Simulado" via IA para prever zonas de atenção na LP.
- [ ] Integrar Webhooks para disparo automático de leads para CRMs.
- [ ] Evoluir o menu contextual para painel lateral de propriedades (editor avançado).
- [ ] Implementar histórico de versões de LP + rollback.
- [ ] Otimizações de performance (cache de IA, lazy-load de imagens).
