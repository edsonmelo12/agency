---
name: 🧹 Validação & sanitização
about: Valide e sanitize os payloads enviados ao AI e ao preview.
title: Validação e sanitização dos inputs do Marketing/Preview
labels: quality, medium
assignees: []
---

## Contexto
Inputs vindos da IA (texto, HTML, URLs) alimentam o marketing e o preview. Precisamos validar e sanitizar antes de renderizar ou enviar para o provider.

## Checklist
- [ ] Aplicar esquemas (Zod/Yup) nos campos críticos do Marketing Module.
- [ ] Sanitizar o conteúdo renderizado com `dangerouslySetInnerHTML`.
- [ ] Incrementar testes que exercitam HTML malformado e entradas vazias.
- [ ] Documentar o fluxo de sanitização no briefing de auditoria.
