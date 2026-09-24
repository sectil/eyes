// 5×5 ızgaralı tumbling E. unit: bir ızgara biriminin CSS piksel boyutu.
// Varsayılan yön: sağa bakan E (açık tarafı sağda).
const ROTATION = { right: 0, down: 90, left: 180, up: 270 }

export default function TumblingE({ unit, direction }) {
  const size = unit * 5
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 5 5"
      shapeRendering="crispEdges"
      style={{ transform: `rotate(${ROTATION[direction]}deg)`, display: 'block' }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="1" height="5" fill="#000" />
      <rect x="0" y="0" width="5" height="1" fill="#000" />
      <rect x="0" y="2" width="5" height="1" fill="#000" />
      <rect x="0" y="4" width="5" height="1" fill="#000" />
    </svg>
  )
}
