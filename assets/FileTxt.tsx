/**
 * TXT file icon component
 */

export default function FileTxt({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="TXT file icon"
    >
      <path
        stroke="#D2D2D2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4 16.917V4a2 2 0 0 1 2-2h9l5 5v9.917M14 2v4a2 2 0 0 0 2 2h4"
      />
      <path
        fill="#BD7E0C"
        d="M5.713 19.315v-.76h3.584v.76H7.96v3.603h-.912v-3.603H5.713ZM10.752 18.555l.88 1.487h.034l.884-1.487h1.042l-1.331 2.181 1.361 2.182h-1.06l-.896-1.489h-.034l-.895 1.49H9.68l1.366-2.183-1.34-2.181h1.046ZM14.01 19.315v-.76h3.584v.76h-1.336v3.603h-.912v-3.603H14.01Z"
      />
    </svg>
  )
}
