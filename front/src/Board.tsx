import styled from 'styled-components'

const dotSize = '25px'
const tileSize = '52px'
const dotColor = '#0f771d'
const boardColor1 = '#779556'
const boardColor2 = '#ebecd0'

type ReactMouseEvent = React.MouseEvent<HTMLDivElement, MouseEvent>

const identityFn = () => {}

export interface BoardEntity {
  x: number
  y: number
  sprite: string
  flipped?: boolean
  selected?: boolean
}
export interface BoardDot {
  x: number
  y: number
  color?: string
}

const BoardContainer = styled.div<{ width: number; height: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
`
const HorizontalBCtnr = styled.div<{}>`
  display: flex;
  flex-direction: row;
`

const RowCoords = styled.div<{}>`
  margin-left: ${tileSize};
  display: flex;
`
const ColCoords = styled.div<{}>``
const Coord = styled.div`
  width: ${tileSize};
  height: ${tileSize};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`

const arrayTo = (n: number) =>
  Array(n)
    .fill(0)
    .map((_, i) => i)

const Tile = styled.div<{ x: number; y: number; boardFlipped?: boolean }>`
  width: ${tileSize};
  height: ${tileSize};
  background-color: ${(opt) =>
    (opt.x + opt.y) % 2 === (opt.boardFlipped ? 1 : 0)
      ? boardColor1
      : boardColor2};
`

const Sprite = styled.img<{
  entity: BoardEntity
  boardFlipped?: boolean
  boardHeight: number
}>`
  position: absolute;
  width: ${tileSize};
  height: ${tileSize};
  transform: ${(opt) => (opt.entity.flipped ? 'scaleX(-1)' : null)};
  bottom: ${(opt) =>
    `calc(${
      !opt.boardFlipped ? opt.boardHeight - 1 - opt.entity.y : opt.entity.y
    } * ${tileSize} + ${opt.entity.selected ? '3px' : '0px'})`};
  left: ${(opt) => `calc(
    ${opt.entity.x} * ${tileSize} +
      ${opt.entity.selected ? '3px' : '0px'}
  )`};
  filter: ${(opt) =>
    opt.entity.selected ? 'drop-shadow(3px 3px 2px #7e7e7e)' : null};
  pointer-events: none;
`

const Dot = styled.div<{
  dot: BoardDot
  boardFlipped?: boolean
  boardHeight: number
}>`
  position: absolute;
  width: ${dotSize};
  height: ${dotSize};
  margin: calc((${tileSize} - ${dotSize}) / 2);
  background-color: ${(opt) => opt.dot.color || dotColor};
  border-radius: 100%;
  bottom: ${(opt) =>
    `calc(${
      !opt.boardFlipped ? opt.boardHeight - 1 - opt.dot.y : opt.dot.y
    } * ${tileSize})`};
  left: calc(${(opt) => opt.dot.x} * ${tileSize});
  pointer-events: none;
`

const RowNumToDisp = (v: number) => 'abcdefghijklmnopqrstuvwxyz'[v]
const ColNumToDisp = (v: number) => (v + 1).toString()

export function GameBoard({
  width,
  height,
  flipped,
  showCoords = false,
  entities,
  dots = [],
  onEntityClick = identityFn,
  onDotClick = identityFn,
}: {
  width: number
  height: number
  flipped?: boolean
  showCoords?: boolean
  entities: BoardEntity[]
  dots?: BoardDot[]
  onEntityClick?: (entity: BoardEntity, ev: ReactMouseEvent) => void
  onDotClick?: (dot: BoardDot, ev: ReactMouseEvent) => void
}) {
  const onClick = (x: number, y: number, ev: ReactMouseEvent) => {
    const dot = dots.find((dot) => dot.x === x && dot.y === y)
    if (dot) {
      onDotClick(dot, ev)
      return
    }
    const entity = entities.find((ent) => ent.x === x && ent.y === y)
    if (entity) onEntityClick(entity, ev)
  }

  return (
    <div>
      <HorizontalBCtnr>
        {showCoords ? (
          <ColCoords>
            {arrayTo(height).map((y) => (
              <Coord key={y}>
                {ColNumToDisp(!flipped ? y : height - y - 1)}
              </Coord>
            ))}
          </ColCoords>
        ) : null}
        <BoardContainer width={width} height={height}>
          {arrayTo(width).map((x) => (
            <div key={x}>
              {arrayTo(height).map((y) => (
                <Tile
                  key={y * width + x}
                  x={x}
                  y={y}
                  boardFlipped={flipped}
                  onClick={(ev) => onClick(x, y, ev)}
                />
              ))}
            </div>
          ))}
          {entities.map((e) => (
            <Sprite
              key={`e${e.x}-${e.y}`}
              src={e.sprite}
              entity={e}
              boardFlipped={flipped}
              boardHeight={height}
            ></Sprite>
          ))}
          {dots.map((dot) => (
            <Dot
              key={`dot${dot.x}-${dot.y}`}
              dot={dot}
              boardFlipped={flipped}
              boardHeight={height}
            ></Dot>
          ))}
        </BoardContainer>
      </HorizontalBCtnr>
      {showCoords ? (
        <RowCoords>
          {arrayTo(width).map((x) => (
            <Coord key={x}>{RowNumToDisp(x)}</Coord>
          ))}
        </RowCoords>
      ) : null}
    </div>
  )
}
