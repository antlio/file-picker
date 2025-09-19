/**
 * stack icon component with shimmer animation for loading states
 * simple opacity animation on white rectangles
 */

export default function Stack({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 26 28"
      fill="none"
      className={className}
      role="img"
      aria-label="Stack icon"
    >
      {/* Main stack structure */}
      <path
        fill="#1D1D1D"
        d="m25.187 14.74-5.247-3.15a.404.404 0 0 1-.196-.347V5.11c0-.426-.222-.822-.589-1.04l-5.069-3.04a2.146 2.146 0 0 0-2.197 0L6.82 4.072a1.22 1.22 0 0 0-.589 1.04v6.138a.411.411 0 0 1-.196.348L.786 14.74c-.487.29-.786.82-.786 1.388v5.929c0 .815.406 1.569 1.062 1.965l4.855 2.952a1.618 1.618 0 0 0 1.679 0l5.206-3.138a.405.405 0 0 1 .413.003l5.369 3.262c.387.235.874.235 1.261 0l5.065-3.08c.656-.398 1.063-1.15 1.063-1.964v-5.93c0-.567-.299-1.093-.786-1.387Z"
      />

      {/* White paper rectangles with opacity animation */}
      <path
        fill="#fff"
        d="M24.881 22.057c0 .436-.208.832-.536 1.033l-4.084 2.48c-.336.205-.737-.08-.737-.52v-4.836c0-.435.208-.832.536-1.032l4.084-2.482c.336-.203.737.08.737.52v4.837Z"
      >
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>

      <path
        fill="#fff"
        d="M18.679 11.26c0 .436-.208.832-.536 1.033l-4.084 2.48c-.336.205-.737-.08-.737-.52V9.417c0-.435.208-.832.536-1.032l4.084-2.482c.336-.203.737.08.737.52v4.837Z"
      >
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="1.5s"
          begin="0.2s"
          repeatCount="indefinite"
        />
      </path>

      <path
        fill="#fff"
        d="M12.42 22.057c0 .436-.207.832-.535 1.033L7.8 25.57c-.336.205-.737-.08-.737-.52v-4.836c0-.435.208-.832.536-1.032l4.084-2.482c.336-.203.737.08.737.52v4.837Z"
      >
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="1.5s"
          begin="0.4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}
