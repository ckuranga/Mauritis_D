

export function Crest({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Gold Shield Border */}
      <path
        d="M50 4L92 18V54C92 81.5 73.5 101.5 50 111C26.5 101.5 8 81.5 8 54V18L50 4Z"
        fill="#0B192C"
        stroke="#D4AF37"
        strokeWidth="3.5"
      />
      {/* Inner Filigree Shield */}
      <path
        d="M50 10L86 22V53.5C86 77.5 69.5 95 50 104C30.5 95 14 77.5 14 53.5V22L50 10Z"
        fill="#1E3E62"
        stroke="#D4AF37"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      {/* Quartered Cross in Imperial Gold */}
      <path d="M50 10V104" stroke="#D4AF37" strokeWidth="2.5" />
      <path d="M14 52H86" stroke="#D4AF37" strokeWidth="2.5" />

      {/* Open Book of Veritas in Top Center */}
      <path
        d="M36 25C41 23 47 24 50 27C53 24 59 23 64 25V41C59 39 53 40 50 43C47 40 41 39 36 41V25Z"
        fill="#FAF8F5"
        stroke="#D4AF37"
        strokeWidth="1.8"
      />
      <path d="M50 27V43" stroke="#0B192C" strokeWidth="1.4" />

      {/* Bottom Left Laurel Star */}
      <circle cx="34" cy="70" r="6" fill="#D4AF37" />
      {/* Bottom Right Torch / Crown Motif */}
      <path
        d="M61 75L66 63L71 75H61Z"
        fill="#D4AF37"
      />
      {/* Center Escutcheon Medallion */}
      <circle
        cx="50"
        cy="52"
        r="9"
        fill="#0B192C"
        stroke="#D4AF37"
        strokeWidth="2.2"
      />
      <text
        x="50"
        y="55.5"
        textAnchor="middle"
        fill="#D4AF37"
        fontSize="10"
        fontWeight="bold"
        fontFamily="Georgia, serif"
      >
        W
      </text>
    </svg>
  );
}

