export default function FolderOpen() {
  // Generate unique IDs for this instance to avoid conflicts when multiple icons are rendered
  const uid = Math.random().toString(36).substring(2, 11)

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
      <g filter={`url(#b-${uid})`}>
        <path
          fill="#E7E7E7"
          d="M1.573 4.922h12.875l-1.53 5.574H3.022l-1.45-5.574Z"
        />
      </g>
      <g filter={`url(#c-${uid})`}>
        <path
          fill="#F6F6F6"
          d="M.962 5.566h14.097l-1.675 6.104H2.549L.962 5.566Z"
        />
      </g>
      <path
        stroke="#FF905D"
        strokeWidth=".175"
        d="m2.57 5.91.035.288a.15.15 0 0 0 .297-.036l-.064-.517a.312.312 0 0 0-.619.075l.097.794"
      />
      <g filter={`url(#d-${uid})`}>
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
      <path
        stroke={`url(#h-${uid})`}
        strokeDasharray="0.22 0.22"
        strokeWidth=".112"
        d="M14.945 7.828v.056h.11c.038 0 .075.004.11.012l.011-.054a.553.553 0 0 1 .22.102l-.033.045a.506.506 0 0 1 .14.168l.048-.025a.55.55 0 0 1 .06.235h.002l-.056.002a.505.505 0 0 1-.009.11l-.02.107.055.01-.04.215-.055-.01-.04.215.054.01-.04.214-.054-.01-.041.214.054.011-.04.214-.055-.01-.04.214.054.01-.04.216-.055-.011-.04.215.055.01-.04.214-.056-.01-.04.214.055.011-.04.214-.056-.01-.40.215.055.01-.40.215-.055-.011-.40.215.054.01-.40.215-.055-.01-.40.214.054.01-.40.215-.055-.01-.040.214.055.01-.041.215-.055-.10-.02.107a1.06 1.06 0 0 1-.03.119l.052.015c-.026.084-.06.162-.103.236l-.047-.029c-.042.071-.092.137-.148.196l.04.037c-.06.062-.126.117-.198.164l-.03-.046c-.067.044-.14.08-.218.108l.018.052a1.11 1.11 0 0 1-.25.059l-.005-.054c-.04.005-.081.007-.122.007h-.11v.056h-.22v-.056h-.218v.056h-.22v-.056h-.219v.056h-.22v-.056h-.218v.056h-.22v-.056h-.219v.056h-.22v-.056h-.218v.056h-.22v-.056h-.219v.056h-.22v-.056h-.218v.056h-.22v-.056h-.22v.056h-.218v-.056h-.22v.056h-.219v.056h-.22v.056h-.218v-.056h-.22v.056h-.219v-.056h-.22v.056h-.218v-.056h-.22v.056H7.67v-.056h-.22v.056h-.218v-.056h-.22v.056h-.219v-.056h-.22v.056h-.218v-.056h-.22v.056h-.219v-.056h-.22v.056h-.218v-.056h-.22v.056h-.219v-.056h-.22v.056H4.6v-.056H4.38v.056h-.22v-.056h-.218v.056h-.22v-.056h-.219v.056h-.22v-.056h-.218v.056h-.22v-.056h-.219v.056h-.22v-.056h-.109c-.041 0-.082-.002-.122-.007l-.007.054c-.086-.01-.17-.03-.25-.059l.02-.052a1.057 1.057 0 0 1-.219-.108l-.03.046a1.12 1.12 0 0 1-.198-.164l.04-.037a1.064 1.064 0 0 1-.147-.196l-.049.029a1.108 1.108 0 0 1-.102-.236l.053-.015a1.071 1.071 0 0 1-.03-.12l-.02-.106-.056.01-.041-.215.056-.01-.04-.215-.056.011-.04-.215.056-.01-.041-.214-.056.01-.04-.214.056-.011-.041-.215-.055.01-.041-.214.056-.01-.04-.215-.056.011-.04-.216.054-.10-.40-.213-.055.10-.40-.216.055-.10-.40-.214-.055.10-.041-.214.055-.011-.40-.214-.055.009-.40-.214.054-.10-.40-.215-.055.010-.40-.215.054-.008-.40-.215-.055.10-.40-.215.054-.10-.02-.107-.008-.11-.056-.002a.553.553 0 0 1 .60-.235l.50.025a.507.507 0 0 1 .14-.168L.6 7.944a.553.553 0 0 1 .22-.102l.012.054a.508.508 0 0 1 .11-.012h.11v-.056h.22v.056h.22v-.056h.221v.056h.221v-.056h.22v.056h.221v-.056h.221v.056h.22v-.056h.22v.056h.221v-.056h.22v.056h.222v-.056h.22v.056h.22v-.056h.22v.056h.221v-.056H4.8v.056h.22v-.056h.222v.056h.22v-.056h.22v.056h.22v-.056h.221v.056h.221v-.056h.22v.056h.22v-.056h.221v.056h.221v-.056h.22v.056h.221v-.056h.221v.056h.22v-.056h.20v.056h.221v-.056h.20v.056h.222v.056h.20v-.056h.20v-.056h.20v.056h.221v-.056h.221v.056h.20v-.056h.221v.056h.20v-.056h.221v.056h.20v-.056h.221v.056h.221v-.056h.20v.056h.20v-.056h.221v.056h.20v-.056h.222v.056h.20v-.056h.221v.056h.20v-.056h.20v.056h.221v-.056h.20v-.056h.222v.056h.20v-.056h.221v.056h.20Z"
      />
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
