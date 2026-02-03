## Planejamento: Arsenal de Criativos com Mais Variações

### Contexto
O painel já exibe o prompt visual gerado e permite enviar para o Estúdio AI, mas a origem dos criativos ainda é um serviço que retorna apenas duas variações quando a necessidade comercial exige ao menos 1 copy hero + 3–5 variantes e 3–4 visuais distintos. Precisamos documentar a intervenção necessária antes de implementar.

### Objetivo
Garantir que o módulo de criativos entregue sempre:

1. Uma copy principal alinhada ao stage ativo (hero creative).  
2. Entre 3 e 5 variações textuais com prompt e CTA diferenciados.  
3. Um conjunto mínimo de 3 visuais distintos por copy para compor testes de campanhas patrocinadas.

### Passos planejados (sem implementar ainda)

**1. Ajuste no serviço de criativos**
- Atualizar `generateCreativeCampaign` para incluir nos prompts instruções claras: “Retornar exatamente 5 ideias numeradas (1 hero + 4 variações) com `stage`, CTA, headline, corpo e prompt visual”.  
- Garantir que o JSON de resposta contenha payloads separados (hero, variants) com campo `visualPrompt`.  
- Armazenar cada variação no `creativeIdeas` com `stage` e metadata de teste (CTATag, awarenessLevel).

**2. UI e feedback visual**
- Display atual já mostra variações; documentação deve fixar o comportamento esperado: listagem das 4+ variantes com tag “Teste #1, #2…” e preview do prompt.  
- Incluir badge no Step 2 informando quando o payload ficou “completo” (5 variações) ou “incompleto” (menos que 3).  
- Botões adicionais: “Gerar mais variações” dispara nova chamada ao serviço fornecendo a `activeStrategy` + `missing variant count`.

**3. Prompt visual de alta qualidade**
- Associar cada variação ao prompt descrito no documento anterior (ex.: close-up com badge, artesã com estatísticas).  
- O Estúdio AI recebe o `visualPrompt` e o `qualityLevel` (Standard/High/Ultra) escolhido pelo usuário.  
- Documentar os templates de prompt (Fundo + Meio) para o time de copy gerar variações futuras.

**4. Operacionalização e métricas**
- Registrar no log de marketing quantas variações foram geradas por projeto e por stage.  
- Usar esse log como métrica para a camada de monetização (ex.: planos Growth têm X variações por mês).  
- Garantir que, quando o backend entregar menos de 3 variações, o UI mostre claramente “Gerar variações extras”.

### Próximos passos técnicos
1. Escrever as instruções para o prompt da IA (Hero + Variants + Visual prompts).  
2. Mapear o esquema de resposta e adaptar `App.tsx`/`MarketingWorkflowPanel` para consumir os arrays novos.  
3. Adicionar testes (mockados) que validem o mínimo de 5 entradas e a presença de `visualPrompt`.

Esse plano garante uma etapa intermediária entre o prompt atual e a geração completa de arsenal de criativos. Deseja que eu proponha um change log/texto para commit explicando o ajuste planeado?  
