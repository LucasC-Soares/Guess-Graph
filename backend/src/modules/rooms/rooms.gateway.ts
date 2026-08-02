import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { GraphGeneratorService } from '../graphs/graph-generator.service';
import { GraphPropertiesService } from '../graphs/graph-properties.service';
import { Question } from '../questions/question-catalog';

/**
 * Um evento por ação do jogo. Mantenha os payloads pequenos e nomeados
 * de forma consistente entre cliente e servidor — copie esses nomes
 * literalmente no frontend (entities/room/api) pra evitar bugs de digitação
 * em strings soltas.
 */
const EVENTS = {
  CREATE_ROOM: 'room:create',
  JOIN_ROOM: 'room:join',
  ASK_QUESTION: 'game:ask-question',
  MAKE_GUESS: 'game:make-guess',
  // Eventos emitidos pelo servidor (broadcast):
  ROOM_UPDATED: 'room:updated',
  OPPONENT_JOINED: 'room:opponent-joined',
  QUESTION_ANSWERED: 'game:question-answered',
  GAME_OVER: 'game:over',
} as const;

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' } })
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly graphGenerator: GraphGeneratorService,
    private readonly graphProperties: GraphPropertiesService,
  ) {}

  @SubscribeMessage(EVENTS.CREATE_ROOM)
  handleCreateRoom(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket) {
    // TODO 1: this.roomsService.createRoom(data.username, client.id) -> pega o código
    // TODO 2: client.join(code) -- entra na "room" do socket.io (mesmo nome do código)
    // TODO 3: emitir de volta pro criador o código da sala (ack, não broadcast:
    //   return { code } como retorno direto do handler, socket.io suporta isso)
    throw new Error('não implementado');
  }

  @SubscribeMessage(EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() data: { code: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    // TODO 1: this.roomsService.joinRoom(data.code, data.username, client.id)
    // TODO 2: client.join(data.code)
    // TODO 3: gerar as mãos dos dois jogadores AQUI (é o momento em que a
    //   sala fica completa e o jogo pode começar):
    //   const graphsP1 = this.graphGenerator.generateBatch(N, vertexCount);
    //   const graphsP2 = this.graphGenerator.generateBatch(N, vertexCount);
    //   computar GraphProperties de cada um (this.graphProperties.computeAll)
    //   this.roomsService.assignHands(data.code, ...)
    // TODO 4: this.server.to(data.code).emit(EVENTS.OPPONENT_JOINED, ...)
    //   -- avisa os DOIS clientes que o jogo começou, mandando pra cada um
    //   APENAS os grafos do oponente (nunca os seus próprios, senão o
    //   jogador vê a resposta e o jogo perde a graça)
    throw new Error('não implementado');
  }

  @SubscribeMessage(EVENTS.ASK_QUESTION)
  handleAskQuestion(
    @MessageBody() data: { code: string; question: Question },
    @ConnectedSocket() client: Socket,
  ) {
    // TODO 1: buscar a sala, achar QUAL jogador é o `client` e qual é o oponente
    // TODO 2: validar que é a vez desse jogador (currentTurn) -- senão, ignorar/erro
    // TODO 3: a pergunta é sobre o grafo do OPONENTE: pegar a hand do oponente,
    //   decidir A QUAL grafo da mão a pergunta se refere (provavelmente o
    //   payload já inclui um graphId escondido — repensar o contrato se preciso)
    // TODO 4: answerQuestion(properties, data.question) -> resposta booleana
    // TODO 5: this.roomsService.recordQuestion(...) -- salva no log e alterna turno
    // TODO 6: this.server.to(data.code).emit(EVENTS.QUESTION_ANSWERED, { ... })
    //   -- manda a pergunta E a resposta pros dois (transparência: os dois veem
    //   o histórico de perguntas, só não veem os grafos crus do oponente)
    throw new Error('não implementado');
  }

  @SubscribeMessage(EVENTS.MAKE_GUESS)
  handleMakeGuess(
    @MessageBody() data: { code: string; graphId: string; guessedGraphId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // TODO: comparar o chute com o grafo real (por id), atualizar score,
    //   checar condição de vitória (ex: acertou todos os grafos do oponente),
    //   emitir EVENTS.GAME_OVER se acabou, senão emitir atualização de estado.
    throw new Error('não implementado');
  }

  // TODO: handleDisconnect(client): @SubscribeMessage não cobre isso -- use o
  //   ciclo de vida do gateway (implements OnGatewayDisconnect) pra limpar
  //   salas quando os dois jogadores saem.
}
