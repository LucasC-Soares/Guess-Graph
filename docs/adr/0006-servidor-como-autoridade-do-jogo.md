# ADR-0006: Servidor como autoridade do jogo

- Status: Aceito
- Data: 2026-09-19

## Contexto

As perguntas dependem de propriedades estruturais dos grafos e o cliente não pode ser considerado confiável para calcular respostas, turnos ou pontuação.

## Decisão

O backend gera as mãos, calcula `GraphProperties`, valida o jogador da vez, responde perguntas e atualiza pontuação e status da partida. O cliente envia somente a intenção da ação e renderiza os eventos recebidos.

As propriedades internas não são enviadas no payload da mão adversária; o gateway envia apenas o DTO público do grafo.

## Alternativas consideradas

- Calcular respostas no frontend: reduziria trabalho do servidor, mas permitiria adulteração e revelaria a implementação da regra.
- Confiar no cliente para turno e score: reduziria validações, mas permitiria jogar fora de ordem ou fabricar vitórias.

## Consequências

- Regras ficam consistentes para os dois jogadores.
- O backend precisa manter as propriedades calculadas durante a partida.
- O frontend deve tratar eventos como a fonte de verdade do estado visível.
