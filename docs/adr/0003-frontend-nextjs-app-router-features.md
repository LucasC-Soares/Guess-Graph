# ADR-0003: Frontend Next.js App Router organizado por features

- Status: Aceito
- Data: 2026-09-19

## Contexto

A interface tem fluxos diferentes para criar/entrar em sala e jogar. Componentes de UI genericos nao devem carregar regras especificas de uma feature.

## Decisao

Usar Next.js com App Router e organizar o codigo por responsabilidade:

- `app/` define rotas e paginas.
- `components/ui/` contem componentes genericos.
- `features/room/` contem criacao e entrada em salas.
- `features/game/` contem estado, perguntas, visualizacao e log da partida.
- `lib/`, `schemas/` e `types/` contem infraestrutura, validacao e contratos do frontend.

## Alternativas consideradas

- Organizar tudo por tipo (`components/`, `hooks/`, `api/`): espalharia cada feature por muitas pastas.
- Uma SPA sem App Router: perderia a convencao de rotas e composicao do Next.js adotada pelo projeto.

## Consequencias

- Codigo relacionado a uma jornada fica proximo.
- Componentes compartilhados podem ser extraidos sem criar dependencia de dominio.
- O estado de jogo continua dependente dos eventos do servidor, e nao de uma store global adicional no MVP.
