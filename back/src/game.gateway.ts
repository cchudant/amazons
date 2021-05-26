import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AppService, GameState } from './app.service'

@WebSocketGateway({ namespace: 'game' })
export class GameGateway {
  constructor(private appService: AppService) {}

  @WebSocketServer()
  private server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('WS Connect', { id: client.id })
  }

  @SubscribeMessage('newGame')
  newGame(
    @ConnectedSocket() client: Socket,
  ) {
    const ret = this.appService.createGameId()
    console.log('Emit', client.id, 'newGame', ret)
    client.emit('newGame', ret)
  }

  @SubscribeMessage('joinGame')
  joinGame(
    @MessageBody() gameId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(gameId)
    const ret = this.appService.joinGame(gameId)
    console.log('Emit', client.id, 'joinGame', ret)
    client.emit('joinGame',ret )
  }

  @SubscribeMessage('gameState')
  gameState(
    @MessageBody() data: { gameId: string, state: GameState },
  ) {
    this.appService.setState(data.gameId, data.state)
    console.log('Emit', data.gameId, 'gameState', data.state)
    this.server.to(data.gameId).emit('gameState', data.state)
  }
}
