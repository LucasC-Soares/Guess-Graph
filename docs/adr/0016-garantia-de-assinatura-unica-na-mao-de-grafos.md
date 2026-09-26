# ADR-0016: Garantia de assinatura única na mão de grafos

- Status: Aceito
- Data: 2026-09-26

## Contexto

Um jogador tenta adivinhar o grafo escolhido pelo oponente dentro de uma mão de 12 grafos, eliminando candidatos através de perguntas do tipo sim/não sobre propriedades: `isConnected`, `isBipartite`, `hasCycle`, `isTree`, `hasBridge` e "o grau máximo é maior que k?", com k variando de 0 a 10. O grau mínimo (`minDegree`) é calculado mas não é perguntado.

Como `isTree` é totalmente derivado de `isConnected && !hasCycle`, e as perguntas de grau máximo cobrem qualquer valor entre 0 e 9 (o máximo possível dado o tamanho das mãos), o conjunto de perguntas disponíveis define, na prática, uma assinatura por grafo: `(isConnected, isBipartite, hasCycle, hasBridge, maxDegree)`.

Se dois grafos da mesma mão tiverem assinaturas idênticas, nenhuma sequência de perguntas consegue diferenciá-los — a partida fica sem solução determinística para esse par, mesmo com o jogador jogando perfeitamente.

## Decisão

`GraphGeneratorService.generateHand` passa a calcular a assinatura de cada grafo gerado (via `GraphPropertiesService`) e regenerar o candidato enquanto a assinatura colidir com alguma já presente na mão, até um limite de 200 tentativas por carta — limite alto o suficiente para o espaço de assinaturas disponível (até 16 combinações booleanas × 10 valores de grau), mas que evita loop infinito em cenários degenerados. Se o limite for atingido, o serviço lança um erro explícito em vez de entregar uma mão ambígua.

Isso exige que `GraphGeneratorService` receba `GraphPropertiesService` por injeção de dependência no construtor.

`generateBatch`, usado para geração avulsa fora do contexto de mão, não recebe essa garantia — a unicidade de assinatura só faz sentido dentro de uma mesma mão.

## Alternativas consideradas

- Ignorar a colisão e tratar no jogo (ex.: sinalizar rodada como "impossível de fechar"): empurra o problema para a UX e ainda permite que a partida trave sem resposta correta.
- Apenas aumentar a variedade dos grafos gerados (mais vértices, probabilidades diferentes) sem checagem explícita: reduz a chance de colisão, mas não garante unicidade.
- Adicionar `minDegree` como pergunta disponível no jogo para aumentar o poder de distinção: alteraria as regras do jogo (quais perguntas existem), o que está fora do escopo desta decisão.

## Consequências

- `GraphGeneratorService` agora depende de `GraphPropertiesService`; os dois precisam estar registrados no mesmo module do Nest.
- Geração de mão pode custar algumas tentativas extras por carta até achar uma assinatura única, mas o custo é desprezível frente ao tamanho do espaço de assinaturas.
- Em caso extremo de esgotamento do espaço de assinaturas, o serviço falha de forma explícita em vez de servir uma mão com grafos indistinguíveis.
- Qualquer mudança futura nas perguntas disponíveis do jogo (adicionar, remover ou alterar o intervalo de "grau máximo > k") precisa atualizar `computeSignature` para continuar refletindo exatamente o que é perguntável.