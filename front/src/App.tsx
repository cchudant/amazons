import { useEffect, useState } from 'react'

import { BoardDot, BoardEntity, GameBoard } from './Board'

import blackDragonSprite from './sprites/blackDragon.svg'
import whiteDragonSprite from './sprites/whiteDragon.svg'
import fireSprite from './sprites/point.svg'
import {
  Route,
  BrowserRouter as Router,
  useParams,
  useLocation,
  useHistory,
  Switch,
} from 'react-router-dom'
import {
  SocketIOProvider,
  useLastSocketMessage,
  useSocket,
} from './useSocketIo'

export enum Color {
  Black,
  White,
}

interface AmazonEntity {
  x: number
  y: number
  color: Color
}
interface Fire {
  x: number
  y: number
}

interface GameState {
  width: number
  height: number
  entities: AmazonEntity[]
  fires: Fire[]
  turn: Color
  players: number
  end: boolean
}

function AmazonsBoard({
  myColor,
  initialState,
  gameId,
}: {
  myColor: Color | null
  initialState: GameState
  gameId: string
}) {
  const [selectedPiece, setSelectedPiece] = useState<{
    x: number
    y: number
    moved?: boolean
  } | null>(null)
  const socket = useSocket()

  const gameState = useLastSocketMessage('gameState', initialState)

  const entities: BoardEntity[] = gameState.entities.map(ent => ({
    x: ent.x,
    y: ent.y,
    sprite: ent.color === Color.Black ? blackDragonSprite : whiteDragonSprite,
    flipped: ent.color === Color.White,
    selected:
      selectedPiece !== null &&
      ent.x === selectedPiece.x &&
      ent.y === selectedPiece.y,
  }))

  entities.push(
    ...gameState.fires.map(fire => ({
      x: fire.x,
      y: fire.y,
      sprite: fireSprite,
    }))
  )

  function moveCurrentPiece(loc: BoardDot) {
    const copyEntities = [...gameState.entities]
    const ind = gameState.entities.findIndex(
      e => e.x === selectedPiece?.x && e.y === selectedPiece?.y
    )
    copyEntities[ind] = { ...gameState.entities[ind], x: loc.x, y: loc.y }

    socket.emit('gameState', {
      gameId,
      state: {
        ...gameState,
        entities: copyEntities,
      },
    })
    setSelectedPiece({ x: loc.x, y: loc.y, moved: true })
  }

  function fireCurrentPiece(loc: BoardDot) {
    const turn = gameState.turn === Color.White ? Color.Black : Color.White

    const isValidPos = (x: number, y: number) => {
      if (x < 0 || x >= gameState.width || y < 0 || y >= gameState.height)
        return false
      if (x === loc.x && y === loc.y) return false
      if (entities.some(ent => ent.x === x && ent.y === y)) return false
      return true
    }

    const canMove = gameState.entities.some(ent => {
      if (ent.color !== turn) return false
      if (isValidPos(ent.x + 1, ent.y)) return true
      if (isValidPos(ent.x - 1, ent.y)) return true
      if (isValidPos(ent.x, ent.y + 1)) return true
      if (isValidPos(ent.x, ent.y - 1)) return true
      if (isValidPos(ent.x + 1, ent.y + 1)) return true
      if (isValidPos(ent.x - 1, ent.y + 1)) return true
      if (isValidPos(ent.x + 1, ent.y - 1)) return true
      if (isValidPos(ent.x - 1, ent.y - 1)) return true
      return false
    })

    socket.emit('gameState', {
      gameId,
      state: {
        ...gameState,
        fires: [...gameState.fires, { x: loc.x, y: loc.y }],
        turn: turn,
        end: !canMove,
      },
    })
    setSelectedPiece(null)
  }

  const dots: BoardDot[] = []
  if (selectedPiece) {
    const traceLine = (xyFromDelta: (delta: number) => [number, number]) => {
      for (let delta = 1; ; delta++) {
        const [x, y] = xyFromDelta(delta)
        if (
          x < 0 ||
          x >= gameState.width ||
          y < 0 ||
          y >= gameState.height ||
          entities.some(e => e.x === x && e.y === y)
        )
          break

        dots.push({
          x: x,
          y: y,
          color: selectedPiece?.moved ? 'red' : undefined,
        })
      }
    }
    traceLine(d => [selectedPiece.x + d, selectedPiece.y])
    traceLine(d => [selectedPiece.x - d, selectedPiece.y])
    traceLine(d => [selectedPiece.x, selectedPiece.y + d])
    traceLine(d => [selectedPiece.x, selectedPiece.y - d])
    traceLine(d => [selectedPiece.x + d, selectedPiece.y + d])
    traceLine(d => [selectedPiece.x - d, selectedPiece.y + d])
    traceLine(d => [selectedPiece.x + d, selectedPiece.y - d])
    traceLine(d => [selectedPiece.x - d, selectedPiece.y - d])
  }

  useEffect(() => {
    const handler = () => {
      if (!selectedPiece?.moved) setSelectedPiece(null)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  })

  return (
    <div>
      <GameBoard
        width={gameState.width}
        height={gameState.height}
        showCoords={true}
        entities={entities}
        dots={dots}
        onEntityClick={(entity, ev) => {
          ev.stopPropagation()
          if (gameState.turn !== myColor || gameState.end) return
          const ent = gameState.entities.find(
            ent => ent.x === entity.x && ent.y === entity.y
          )
          if (!ent || ent.color !== myColor || selectedPiece?.moved) return
          if (
            selectedPiece &&
            selectedPiece.x === entity.x &&
            selectedPiece.y === entity.y
          )
            setSelectedPiece(null)
          else setSelectedPiece({ x: entity.x, y: entity.y })
        }}
        onDotClick={(dot, ev) => {
          ev.stopPropagation()
          if (!selectedPiece?.moved) moveCurrentPiece(dot)
          else fireCurrentPiece(dot)
        }}
      />
      {!gameState.end ? (
        <div>
          Current turn : {gameState.turn === Color.White ? 'White' : 'Black'}
        </div>
      ) : (
        <div>
          End of the game! Winner :{' '}
          {gameState.turn !== Color.White ? 'White' : 'Black'}
        </div>
      )}
    </div>
  )
}

function Game() {
  const { gameId } = useParams<{ gameId: string }>()
  const state = useLastSocketMessage<{
    yourColor: Color | null
    state: GameState
  } | null>('joinGame', null)

  const socket = useSocket()
  useEffect(() => {
    socket.emit('joinGame', gameId)
  }, [gameId])

  let strColor = 'spectator'
  if (state?.yourColor === Color.White) strColor = 'White'
  else if (state?.yourColor === Color.Black) strColor = 'Black'

  return (
    <div>
      {state ? (
        <div>
          <AmazonsBoard
            myColor={state.yourColor}
            initialState={state.state}
            gameId={gameId}
          />
          You are : {strColor}
          <br />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

function CreateGame() {
  const socket = useSocket()
  const history = useHistory()
  const [creating, setCreating] = useState(false)

  const newGame = (mapN: number) => {
    if (creating) return
    setCreating(true)

    console.log(socket)
    socket.emit('newGame', mapN)
    socket.once('newGame', (gameId: string) => {
      history.push(`/${gameId}`)
    })
  }

  return (
    <div>
      <button disabled={creating} onClick={() => newGame(0)}>
        Map 1
      </button>
      <button disabled={creating} onClick={() => newGame(1)}>
        Map 2
      </button>
      <button disabled={creating} onClick={() => newGame(2)}>
        Map 3
      </button>
    </div>
  )
}

function App() {
  return (
    <SocketIOProvider
      url={`${process.env.REACT_APP_API_URL}/game`}
      opts={{
        transports: ['websocket'],
      }}
    >
      <Router>
        <Switch>
          <Route path="/:gameId" component={Game} />
          <Route path="/" component={CreateGame} />
        </Switch>
      </Router>
    </SocketIOProvider>
  )
}

export default App
