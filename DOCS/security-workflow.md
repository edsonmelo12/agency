# Segurança centralizada (hook + git-summary)

## Objetivo
Manter todos os projetos da pasta `Local Sites` livres de chaves/segredos expostos sem mudanças manuais no fluxo que você já usa (`git-summary.js`).

## Passos para cada máquina
1. Clone o repositório e, na raiz do projeto (`agency`), execute:
   ```bash
   bash scripts/install-security-hook.sh
   ```
   Esse script cria um `pre-commit` local que roda o `scripts/check-secrets.sh` antes de cada commit. Ele é idempotente e pode ser reexecutado sempre que o hook for perdido.
2. Assegure-se de **não versionar** `.env` ou `.env.local` e de manter o `.env.local` atualizado com as chaves válidas apenas no ambiente local/CI.

## Como o git-summary protege tudo
- O `git-summary.js` já integra a verificação de segredos (função `ensureCleanSecrets`): antes de `git add`/`git commit`, ele garante que nem `.env*` está rastreado e que nenhum padrão `sk-` ou `AIza` aparece nos arquivos monitorados.
- Isso significa que você pode continuar executando `git-summary.js` como sempre. O hook instalado localmente e o `git-summary` convergem para o mesmo mecanismo de defesa.

## Checklist rápido antes do deploy
1. Rode `git status` e confirme que não há `.env*` rastreados.
2. Se precisar diagnosticar, execute manualmente `bash scripts/check-secrets.sh`.
3. Chaves novas devem ser geradas (Google AI + OpenRouter) e copiadas apenas para `.env.local`.
4. `git-summary.js` pode continuar lançando o menu/resumo/exportação normalmente; ele fará o commit/push só depois que a verificação de segredos passar.

Mantenha esse arquivo atualizado se novos scripts de segurança forem adicionados aos projetos futuros.
