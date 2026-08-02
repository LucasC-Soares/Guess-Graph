import { Injectable } from '@nestjs/common';
import { Room } from './interfaces/room.interface';

/**
 * Estado do jogo em memória — suficiente pro MVP (uma instância do servidor).
 * TODO: se precisar escalar horizontalmente no futuro, migrar esse Map pra
 * Redis (não é necessário agora, e adicionaria complexidade sem necessidade).
 */
@Injectable()
export class RoomsService {
  private rooms = new Map<string, Room>();

  /** Gera um código curto e fácil de compartilhar (ex: 4-6 letras maiúsculas). */
  generateRoomCode(): string {
    // TODO: gerar código aleatório (ex: 4 letras de A-Z) e garantir que não
    // colide com uma sala já existente (checar this.rooms.has(code)).
    throw new Error('não implementado');
  }

  // TODO: createRoom(hostUsername, hostSocketId): cria Room com status WAITING_FOR_PLAYER,
  //   player1 preenchido, player2 = null. Salva no Map e retorna o código.

  // TODO: joinRoom(code, guestUsername, guestSocketId): preenche player2,
  //   muda status pra IN_PROGRESS. Retornar erro se a sala não existir,
  //   já estiver cheia, ou já estiver em andamento.

  // TODO: getRoom(code): busca simples no Map (throw se não existir)

  // TODO: assignHands(code, player1Graphs, player2Graphs): popular `hand` de cada jogador
  //   com os grafos gerados (ver GraphGeneratorService + GraphPropertiesService)

  // TODO: recordQuestion(code, entry: QuestionLogEntry): adiciona ao questionLog
  //   e alterna currentTurn

  // TODO: removeRoom(code) / cleanup: chamado quando os dois jogadores desconectam
  //   (evita vazamento de memória com salas abandonadas — considerar TTL simples).
}
