const ODirection = {
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom',
}

const getReverse = (direction) => {
  switch (direction) {
    case ODirection.TOP:
      return ODirection.BOTTOM
    case ODirection.BOTTOM:
      return ODirection.TOP
    case ODirection.RIGHT:
      return ODirection.LEFT
    case ODirection.LEFT:
      return ODirection.RIGHT
  }
}
ODirection.getReverse = getReverse

export const Direction = { ...ODirection }
