# ADR-0003: Frontend Next.js App Router organizado por features

- Status: Aceito
- Data: 2026-09-19

## Contexto

A interface tem fluxos diferentes para criar/entrar em sala e jogar. Componentes de UI genéricos não devem carregar regras específicas de uma feature.

## Decisao

Usar Next.js com App Router e organizar o código por responsabilidade:

- `app/` define rotas e paginas.
- `app/room/[code]` representa a rota de uma sala e delega a experiência da partida para a feature de jogo.
- `components/ui/` contem componentes genericos.
- `features/room/` contém criação e entrada em salas.
- `features/game/` contém estado, perguntas, visualização e log da partida.
- `lib/`, `schemas/` e `types/` contêm infraestrutura, validação e contratos do frontend.
- Componentes que usam hooks, Socket.IO ou contexto sao marcados como Client Components; o layout raiz apenas compoe os providers.
- O estado de servidor da sala e da partida fica no cache do React Query, atualizado pelos eventos do Socket.IO, sem introduzir uma store global de dominio.

## Alternativas consideradas

- Organizar tudo por tipo (`components/`, `hooks/`, `api/`): espalharia cada feature por muitas pastas.
- Uma SPA sem App Router: perderia a convencao de rotas e composicao do Next.js adotada pelo projeto.

## Consequencias

- Codigo relacionado a uma jornada fica proximo.
- Componentes compartilhados podem ser extraídos sem criar dependência de domínio.
- O estado de jogo continua dependente dos eventos do servidor, mas o cache do React Query oferece uma fonte local única para renderização e mutações.
- A separação entre Server Components e Client Components fica explícita nos limites de rota, providers e hooks.
