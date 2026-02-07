# Prompt de Início Instantâneo

Cole este texto no início de cada conversa com o modelo para ativar o fluxo completo de contexto, planejamento e execução:

```
Baseado no Context Brief (conductor/context-brief.md), descreva o próximo passo, cite quais artefatos (product.md, tech-stack.md, workflow.md e o track atual em conductor/tracks/<id>/plan.md) precisam ser lidos ou atualizados e confirme que o checklist (scripts/context-checklist.sh) foi considerado. Liste quaisquer dúvidas antes de alterar arquivos."
```

Opcional: abra `conductor/context-brief.md` para relembrar detalhes e colar o prompt acima. Assim você mantém o início tão simples quanto colar um único trecho.
