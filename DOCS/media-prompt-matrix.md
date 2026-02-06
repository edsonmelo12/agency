## Matriz de Prompts Visuais por Copy

### Contexto
Já temos um arsenal textual (hero + 3–5 variantes) alinhado por estágio e objetivo. O próximo salto é sistematizar pelo menos dois prompts de mídia distintos para cada copy, permitindo comparar como o visual reforça o benefício (tipo “engenharia visual”).

### Diretriz fundamentada pela skill `marketing-ideas`
- Use os gatilhos de “Short Form Video” e “Cross-Platform Retargeting” para criar variações que combinem:
  1. *Storytelling editorial* (autoridade, comparação) – cenário organizado com autoridade/depósito de provas.
  2. *Promoção direta* (urgência, prova social) – close-up clean, selo de garantia, preço destacado.
  3. *Experiência sensorial* (lifestyle, curiosidade) – mãos em ação, textura, luz dramática.

### Estrutura proposta
Para cada copy (hero ou variante):
1. **Prompt A – “Cenário editorial com prova”**
   * Elementos: artesã + certificado, frase de prova social no tablet, selo “Sara 5 anos”.
   * Ambiente: estúdio luminoso, fundo desfocado com prateleiras e ferramentas.
2. **Prompt B – “Close com CTA/garantia”**
   * Elementos: Baby Yoda em primeiro plano, badge translúcido “Garantia 7 dias / Acesso Vitalício”, CTA em overlay.
   * Ambiente: fundo neutro clean; iluminação dourada.
3. **Prompt C (opcional) – “Lifestyle + textura”**
   * Elementos: mãos trabalhando o produto, bola de lã colorida, conforto de ateliê.
   * Ambiente: luz natural, cenário “atelier caseiro”, texturas que contrastam.

Cada prompt deve mencionar o `qualityLevel` escolhido (Standard/High/Ultra) e o `angle` (engajamento/autoridade/conversão) para manter coerência com a copy que o originou.

### Organização da Matriz
| Copy | Stage | Prompts sugeridos | Gatilho | Observação |
|------|-------|-------------------|---------|------------|
| Hero principal | Fundo | A. Badge garantia + tablet<br/>B. Close com CTA | Conversão | Montar como arte principal do anúncio |
| Variante “Autoridade” | Meio | A. Mesa de comparação + provas<br/>B. Artesã premium + certificado | Autoridade | Usar para retargeting e reels |
| Variante “Engajamento” | Topo | A. Lifestyle + curiosidade<br/>B. Hands-on + manual visual | Engajamento | Ideal para awareness e carrossel |

### Próximos passos (sem implementar ainda)
1. Validar com o time de Estúdio AI se cada prompt pode ser salvo e reusado em dropdown dentro do painel de criativos.
2. Mapear no backend/IA a lógica que, ao gerar um creative, devolve array `[promptA, promptB, (promptC?)]` por copy.
3. Registrar essa matriz no painel como “Kits visuais recomendados” para facilitar testes A/B.

Essa matriz serve de base para evoluir as variações visuais sem precisar mexer no código agora. Deseja que eu transforme isso em um checklist de QA para o Estúdio AI?  
