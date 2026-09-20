# ADR-0011: Filtragem de grafos e fim da partida

- Status: Aceito
- Data: 2026-09-20

## Contexto

O jogador precisa visualizar os grafos do adversario para formular perguntas. A estrutura publica do grafo, como vertices e arestas, pode ser enviada, mas as propriedades calculadas pelo servidor devem permanecer privadas. O protocolo tambem precisa informar quais candidatos foram descartados por uma pergunta; retornar apenas `answer` deixa o cliente sem como atualizar o tabuleiro.

## Decisao

Enviar em `room:opponent-joined` a mao publica do adversario, sem `properties`. Para cada jogador, o Redis mantem o grafo secreto e `remainingOpponentGraphIds`, inicialmente contendo todos os grafos do adversario.

Uma pergunta contem somente `question`. O servidor resolve a sala e o jogador pelo socket, calcula a resposta contra o grafo secreto e remove dos candidatos os grafos cuja propriedade nao corresponde a resposta. A resposta inclui `eliminatedGraphIds`, `remainingGraphIds`, `remainingCount` e `finished`.

Uma pergunta que deixa um ou mais candidatos não encerra a partida. Todo `make-guess` válido encerra imediatamente a partida: um palpite correto dá a vitória ao jogador que chutou; um palpite incorreto dá a vitória ao oponente.

## Alternativas consideradas

- Enviar somente `answer`: nao permite ao cliente atualizar quais grafos foram descartados.
- Enviar propriedades dos grafos: facilitaria a deducao sem perguntas e revelaria informacao privada do arbitro.
- Manter uma referencia de grafo no payload da pergunta: acopla o cliente ao alvo interno e nao e necessario, pois o socket ja identifica sala e jogador.
- Manter a partida após um palpite incorreto: não representa a regra do jogo, em que um chute errado concede a vitória ao oponente.

## Consequencias

- O cliente consegue renderizar os grafos e marcar descartes sem receber propriedades privadas.
- O Redis passa a armazenar tambem o conjunto de candidatos restante por jogador.
- O servidor continua autoridade sobre resposta, filtragem e encerramento.
- O protocolo de pergunta permanece pequeno: apenas a pergunta e seus parametros.