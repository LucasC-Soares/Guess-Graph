# ADR-0005: Estado de salas em memória no MVP

- Status: Substituído por ADR-0010
- Data: 2026-09-19

## Contexto

O MVP precisa armazenar salas, jogadores, mãos, turno, perguntas e pontuação. Ainda existe uma única instância do backend e não há requisito de persistência após reinício.

## Decisao

Manter o estado em memória no `RoomsService`, usando `Map<string, Room>`. Esta decisão foi substituída pela ADR-0010.

Persistencia externa e escalabilidade horizontal ficam fora do MVP.

## Alternativas consideradas

- Redis: resolveria compartilhamento entre instancias, mas adicionaria infraestrutura e complexidade antes de existir essa necessidade.
- Banco de dados: seria adequado para histórico ou partidas persistentes, mas não é necessário para o estado efêmero atual.

## Consequencias

- Implementacao simples e baixa latencia.
- Reiniciar o processo perde as salas ativas.
- Escalar horizontalmente exige migrar o estado e provavelmente adaptar a presença dos sockets para Redis.
- A limpeza no disconnect é necessária para evitar vazamento de memória.
