# ADR-0009: Testes por camadas, independentes de Socket.IO real

- Status: Aceito
- Data: 2026-09-19

## Contexto

Falhas nas regras de grafo e nas transições de sala são diferentes de falhas de transporte. Testar tudo por um servidor Socket.IO real deixaria a suíte lenta e dificultaria localizar a causa.

## Decisao

Testar por camadas:

- algoritmos de propriedades com grafos pequenos e oráculos conhecidos;
- `RoomsService` diretamente, cobrindo criação, entrada, mãos, turno e cleanup;
- `RoomsGateway` com servicos reais ou dublados e sockets/server falsos, cobrindo payloads e broadcasts.

O Jest usa `ts-jest` para executar os testes TypeScript no backend.

## Alternativas consideradas

- Somente testes end-to-end: cobririam o fluxo, mas teriam diagnostico e cobertura de invariantes piores.
- Somente testes unitários: deixariam o contrato dos eventos sem verificação.

## Consequencias

- Feedback rapido e falhas localizadas.
- A suite nao depende de portas ou conexoes WebSocket reais para validar regras.
- Ainda será necessário adicionar testes end-to-end quando o frontend e o deploy forem integrados.
