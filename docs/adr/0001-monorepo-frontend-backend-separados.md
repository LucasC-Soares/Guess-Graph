# ADR-0001: Monorepo com frontend e backend separados

- Status: Aceito
- Data: 2026-09-19

## Contexto

O jogo possui uma interface web e um servidor autoritativo para salas e regras. O frontend e o backend têm ciclos de build, dependências e responsabilidades diferentes, mas precisam evoluir juntos durante o MVP.

## Decisão

Manter frontend e backend no mesmo repositório, em diretórios separados: `frontend/` e `backend/`.

O frontend usa Next.js e o backend usa NestJS. Cada aplicação conserva seu próprio `package.json`, configuração TypeScript e comandos de desenvolvimento.

## Alternativas consideradas

- Repositórios separados: aumentariam o custo de sincronizar contratos e mudanças durante o MVP.
- Uma única aplicação full-stack: misturaria responsabilidades de UI, transporte e regras de jogo.

## Consequências

- O projeto tem uma fonte de contexto única e mudanças coordenadas.
- Dependências e pipelines continuam isolados por aplicação.
- Deploy independente é possível, mas exige configurar os dois projetos separadamente.
