# ADR-0002: Backend modular com NestJS

- Status: Aceito
- Data: 2026-09-19

## Contexto

As regras do jogo envolvem grafos, perguntas e salas. O transporte WebSocket precisa acessar essas regras sem concentrar toda a lógica em um único gateway.

## Decisão

Usar NestJS como runtime do backend e separar o domínio em módulos `graphs`, `questions` e `rooms`.

- `graphs` contém geração, tipos e cálculo de propriedades.
- `questions` define o catálogo e o árbitro das perguntas.
- `rooms` possui estado da partida e gateway Socket.IO.

Servicos NestJS sao injetados no gateway em vez de o gateway construir dependencias manualmente.

## Alternativas consideradas

- Um servidor Socket.IO sem modularização: teria menor estrutura inicial, mas acoplaria transporte e regras.
- Colocar todas as regras em `RoomsGateway`: dificultaria testes e futuras mudanças de transporte.

## Consequências

- Regras puras podem ser testadas sem socket real.
- Módulos possuem limites claros e podem crescer independentemente.
- O backend assume as convenções e o ciclo de vida do NestJS.
