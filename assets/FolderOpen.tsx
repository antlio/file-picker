interface FolderOpenProps {
  mousePosition?: { x: number; y: number } | null
  containerBounds?: { width: number; height: number } | null
  isHovered?: boolean
}

export default function FolderOpen({
  mousePosition,
  containerBounds,
  isHovered = false,
}: FolderOpenProps = {}) {
  // Generate unique IDs for this instance to avoid conflicts when multiple icons are rendered
  const uid = Math.random().toString(36).substring(2, 11)

  // Calculate unstacking transforms for each layer
  const getLayerTransform = (layerType: 'b' | 'c' | 'd') => {
    if (!isHovered) {
      // layer 'd' as the reference position
      const targetY = 6.426

      switch (layerType) {
        case 'b': {
          const bOriginalY = 4.922
          return `translateY(${targetY - bOriginalY}px)`
        }
        case 'c': {
          const cOriginalY = 5.566
          return `translateY(${targetY - cOriginalY}px)`
        }
        case 'd':
          return 'translateY(0px)'
        default:
          return 'translateY(0px)'
      }
    } else {
      // When hovered, return to natural positions (unstacked)
      return 'translateY(0px)'
    }
  }

  // position for the orange stroke element based on mouse position
  const getStrokePosition = () => {
    let baseY = 5.91

    // adjust Y position based on stacking state - follow layer 'c'
    if (!isHovered) {
      const cOriginalY = 5.566
      const targetY = 6.426
      baseY = 5.91 + (targetY - cOriginalY)
    }

    if (!mousePosition || !containerBounds) {
      return { x: 2.57, y: baseY }
    }

    const folderContentWidth = 13
    const folderStartX = 1

    // mouse position to folder content area
    const normalizedX = Math.max(
      0,
      Math.min(1, mousePosition.x / containerBounds.width),
    )

    // svg coordinates within the folder content area
    const strokeX = folderStartX + normalizedX * folderContentWidth

    return { x: strokeX, y: baseY }
  }

  // rotation based on position
  const getStrokeRotation = () => {
    if (!mousePosition || !containerBounds) {
      return 0
    }

    // normalize position (0 = left, 1 = right)
    const normalizedX = Math.max(
      0,
      Math.min(1, mousePosition.x / containerBounds.width),
    )

    const maxRotation = 20
    const rotation = (normalizedX - 0.5) * 2 * maxRotation

    return rotation
  }

  const strokePos = getStrokePosition()
  const strokeRotation = getStrokeRotation()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 16 16"
      fill="none"
      role="img"
      aria-label="Open folder icon"
      style={{ overflow: 'hidden' }}
    >
      <g filter={`url(#a-${uid})`}>
        <path
          fill="#D9D9D9"
          d="M1.002 3.334c0-.644.522-1.166 1.167-1.166h4.14c.242 0 .478.075.676.215l.712.506c.197.14.433.216.675.216h5.46c.644 0 1.166.522 1.166 1.166v3.843c0 .644-.522 1.166-1.166 1.166H2.168a1.166 1.166 0 0 1-1.167-1.166v-4.78Z"
        />
      </g>
      <g
        filter={`url(#b-${uid})`}
        style={{
          transform: getLayerTransform('b'),
          transition: 'transform 0.2s ease-out 0.05s',
        }}
      >
        <path
          fill="#E7E7E7"
          d="M1.573 4.922h12.875l-1.53 5.574H3.022l-1.45-5.574Z"
        />
      </g>
      <g
        filter={`url(#c-${uid})`}
        style={{
          transform: getLayerTransform('c'),
          transition: 'transform 0.20s ease-out',
        }}
      >
        <path
          fill="#F6F6F6"
          d="M.962 5.566h14.097l-1.675 6.104H2.549L.962 5.566Z"
        />
      </g>
      <path
        stroke="#FF905D"
        strokeWidth=".175"
        d={`m${strokePos.x} ${strokePos.y}.035.288a.15.15 0 0 0 .297-.036l-.064-.517a.312.312 0 0 0-.619.075l.097.794`}
        style={{
          transform: `rotate(${strokeRotation}deg)`,
          transformOrigin: `${strokePos.x}px ${strokePos.y}px`,
          transition: 'all 0.15s ease-out',
        }}
      />
      <g
        filter={`url(#d-${uid})`}
        style={{
          transform: getLayerTransform('d'),
          transition: 'transform 0.25s ease-out',
        }}
      >
        <path
          fill="#fff"
          d="M.624 6.426h14.773l-1.755 6.396H2.287L.624 6.426Z"
        />
      </g>
      <g filter={`url(#e-${uid})`}>
        <path
          fill="#EEE"
          d="M.307 8.062a.558.558 0 0 1 .55-.656h14.287c.347 0 .61.314.549.656l-.836 4.708c-.095.532-.558.92-1.098.92H2.24c-.54 0-1.003-.388-1.098-.92L.307 8.062Z"
        />
      </g>
      <path
        stroke={`url(#f-${uid})`}
        strokeWidth=".112"
        d="M.857 7.462h14.286c.312 0 .55.282.495.59l-.836 4.708a1.06 1.06 0 0 1-1.044.875H2.242a1.06 1.06 0 0 1-1.044-.875L.362 8.052a.503.503 0 0 1 .495-.59Z"
      />
      <g filter={`url(#g-${uid})`}>
        <path
          fill="#EEE"
          d="M.392 8.49a.558.558 0 0 1 .549-.662h14.114c.35 0 .613.318.549.661l-.809 4.291c-.1.527-.56.91-1.096.91H2.297c-.536 0-.997-.383-1.096-.91L.392 8.49Z"
        />
      </g>
      <defs>
        <filter
          id={`a-${uid}`}
          width="13.995"
          height="8.28"
          x="1.002"
          y="1.002"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-5.831" />
          <feGaussianBlur stdDeviation=".583" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1985_4844" />
        </filter>
        <filter
          id={`b-${uid}`}
          width="12.875"
          height="6.71"
          x="1.573"
          y="3.786"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-1.135" />
          <feGaussianBlur stdDeviation="1.135" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1985_4844" />
        </filter>
        <filter
          id={`c-${uid}`}
          width="14.097"
          height="7.237"
          x=".962"
          y="4.431"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-1.135" />
          <feGaussianBlur stdDeviation="1.135" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1985_4844" />
        </filter>
        <filter
          id={`d-${uid}`}
          width="14.773"
          height="8.665"
          x=".624"
          y="4.155"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-3.406" />
          <feGaussianBlur stdDeviation="1.135" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1985_4844" />
        </filter>
        <filter
          id={`e-${uid}`}
          width="15.403"
          height="7.401"
          x=".299"
          y="6.291"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-1.116" />
          <feGaussianBlur stdDeviation="1.116" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1985_4844" />
        </filter>
        <filter
          id={`g-${uid}`}
          width="15.231"
          height="6.975"
          x=".383"
          y="6.713"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="-1.116" />
          <feGaussianBlur stdDeviation="1.116" />
          <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1985_4844" />
        </filter>
        <linearGradient
          id={`f-${uid}`}
          x1="8"
          x2="8"
          y1="7.406"
          y2="13.69"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D7D7D7" />
          <stop offset=".279" stopColor="#DBDBDB" />
        </linearGradient>
        <linearGradient
          id={`h-${uid}`}
          x1="7.998"
          x2="7.998"
          y1="7.828"
          y2="13.689"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D7D7D7" />
          <stop offset=".279" stopColor="#D6D6D6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
