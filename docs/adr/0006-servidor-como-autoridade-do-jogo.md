# ADR-0006: Servidor como autoridade do jogo

- Status: Aceito
- Data: 2026-09-19

## Contexto

As perguntas dependem de propriedades estruturais dos grafos e o cliente nao pode ser considerado confiavel para calcular respostas, turnos ou pontuacao.

## Decisao

O backend gera as maos, calcula `GraphProperties`, valida o jogador da vez, responde perguntas e atualiza pontuacao e status da partida. O cliente envia somente a intencao da acao e renderiza os eventos recebidos.

As propriedades internas nao sao enviadas no payload da mao adversaria; o gateway envia apenas o DTO publico do grafo.

## Alternativas consideradas

- Calcular respostas no frontend: reduziria trabalho do servidor, mas permitiria adulteracao e revelaria a implementacao da regra.
- Confiar no cliente para turno e score: reduziria validacoes, mas permitiria jogar fora de ordem ou fabricar vitorias.

## Consequencias

- Regras ficam consistentes para os dois jogadores.
- O backend precisa manter as propriedades calculadas durante a partida.
- O frontend deve tratar eventos como a fonte de verdade do estado visivel.
