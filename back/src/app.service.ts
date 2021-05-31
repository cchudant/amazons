import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'

export enum Color {
  Black,
  White,
}

export interface AmazonEntity {
  x: number
  y: number
  color: Color
}
export interface Fire {
  x: number
  y: number
}

export interface GameState {
  width: number
  height: number
  entities: AmazonEntity[]
  fires: Fire[]
  turn: Color
  players: number
}

const defaultStarts: Array<() => GameState> = [
  () => ({
    width: 6,
    height: 6,
    entities: [
      { color: Color.Black, x: 3, y: 0 },
      { color: Color.White, x: 0, y: 2 },
      { color: Color.Black, x: 2, y: 5 },
      { color: Color.White, x: 5, y: 3 },
    ],
    fires: [],
    turn: Math.random() < 0.5 ? Color.White : Color.Black,
    players: 0,
    end: false,
  }),
  () => ({
    width: 8,
    height: 8,
    entities: [
      { color: Color.Black, x: 2, y: 0 },
      { color: Color.Black, x: 5, y: 0 },
      { color: Color.Black, x: 2, y: 7 },
      { color: Color.Black, x: 5, y: 7 },
      { color: Color.White, x: 0, y: 2 },
      { color: Color.White, x: 0, y: 5 },
      { color: Color.White, x: 7, y: 2 },
      { color: Color.White, x: 7, y: 5 },
    ],
    fires: [],
    turn: Math.random() < 0.5 ? Color.White : Color.Black,
    players: 0,
    end: false,
  }),
  () => ({
    width: 8,
    height: 8,
    entities: [
      { color: Color.Black, x: 2, y: 0 },
      { color: Color.Black, x: 5, y: 0 },
      { color: Color.Black, x: 2, y: 7 },
      { color: Color.Black, x: 5, y: 7 },
      { color: Color.White, x: 0, y: 2 },
      { color: Color.White, x: 0, y: 5 },
      { color: Color.White, x: 7, y: 2 },
      { color: Color.White, x: 7, y: 5 },
      { color: Color.Black, x: 3, y: 3 },
      { color: Color.White, x: 4, y: 3 },
      { color: Color.White, x: 3, y: 4 },
      { color: Color.Black, x: 4, y: 4 },
    ],
    fires: [],
    turn: Math.random() < 0.5 ? Color.White : Color.Black,
    players: 0,
    end: false,
  })
]

@Injectable()
export class AppService {
  private games = new Map<string, GameState>()

  public createGameId(map: number): string {
    const gameId = randomBytes(8).toString('hex')
    const state = this.games.set(gameId, defaultStarts[map]())
    return gameId
  }

  public joinGame(gameId: string): {
    yourColor: Color | null
    state: GameState
  } {
    const game = this.games.get(gameId)
    if (!game) throw new Error('game does not exist')

    let yourColor = null
    if (game.players === 0) {
      yourColor = Color.White
    } else if (game.players === 1) {
      yourColor = Color.Black
    }

    game.players++

    return {
      yourColor,
      state: game,
    }
  }

  public setState(gameId: string, state: GameState) {
    this.games.set(gameId, state)
  }
}
