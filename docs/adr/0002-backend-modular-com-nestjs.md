# ADR-0002: Backend modular com NestJS

- Status: Aceito
- Data: 2026-09-19

## Contexto

As regras do jogo envolvem grafos, perguntas e salas. O transporte WebSocket precisa acessar essas regras sem concentrar toda a logica em um unico gateway.

## Decisao

Usar NestJS como runtime do backend e separar o dominio em modulos `graphs`, `questions` e `rooms`.

- `graphs` contem geracao, tipos e calculo de propriedades.
- `questions` define o catalogo e o arbitro das perguntas.
- `rooms` possui estado da partida e gateway Socket.IO.

Servicos NestJS sao injetados no gateway em vez de o gateway construir dependencias manualmente.

## Alternativas consideradas

- Um servidor Socket.IO sem modularizacao: teria menor estrutura inicial, mas acoplaria transporte e regras.
- Colocar todas as regras em `RoomsGateway`: dificultaria testes e futuras mudancas de transporte.

## Consequencias

- Regras puras podem ser testadas sem socket real.
- Modulos possuem limites claros e podem crescer independentemente.
- O backend assume as convencoes e o ciclo de vida do NestJS.
