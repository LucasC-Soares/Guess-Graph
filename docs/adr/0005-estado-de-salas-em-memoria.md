# ADR-0005: Estado de salas em memoria no MVP

- Status: Aceito
- Data: 2026-09-19

## Contexto

O MVP precisa armazenar salas, jogadores, maos, turno, perguntas e pontuacao. Ainda existe uma unica instancia do backend e nao ha requisito de persistencia apos reinicio.

## Decisao

Manter o estado em memoria no `RoomsService`, usando `Map<string, Room>`. O codigo da sala e a chave, e o ciclo de vida inclui remocao de jogadores desconectados e limpeza da sala quando ambos saem.

Persistencia externa e escalabilidade horizontal ficam fora do MVP.

## Alternativas consideradas

- Redis: resolveria compartilhamento entre instancias, mas adicionaria infraestrutura e complexidade antes de existir essa necessidade.
- Banco de dados: seria adequado para historico ou partidas persistentes, mas nao e necessario para o estado efemero atual.

## Consequencias

- Implementacao simples e baixa latencia.
- Reiniciar o processo perde as salas ativas.
- Escalar horizontalmente exige migrar o estado e provavelmente adaptar a presenca dos sockets para Redis.
- A limpeza no disconnect e necessaria para evitar vazamento de memoria.
