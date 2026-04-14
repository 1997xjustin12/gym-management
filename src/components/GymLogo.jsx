export default function GymLogo({ size = 120, className = '' }) {
  // unique id so multiple instances on the same page don't conflict
  const arcId = `powerArc_${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Arc path for curved POWER text along the top of the circle */}
        <path id={arcId} d="M 16,100 A 84,84 0 0,1 184,100" />
      </defs>

      {/* ── Background ── */}
      <circle cx="100" cy="100" r="99" fill="#0d0d0d" />

      {/* ── Rings ── */}
      <circle cx="100" cy="100" r="97" fill="none" stroke="#cc0000" strokeWidth="5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#cc0000" strokeWidth="1.5" />

      {/* ── ·P·O·W·E·R· curved at top ── */}
      <text
        fontFamily="'Arial Black', Impact, 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="17"
        fill="#cc0000"
        letterSpacing="4"
      >
        <textPath href={`#${arcId}`} startOffset="11%">
          ·P·O·W·E·R·
        </textPath>
      </text>

      {/* ════════════════════════════════
          BODYBUILDER SILHOUETTE
          Classic double-bicep front pose
          ════════════════════════════════ */}

      {/* Head */}
      <ellipse cx="100" cy="43" rx="10" ry="11" fill="#cc0000" />

      {/* Neck */}
      <polygon points="94,53 106,53 107,62 93,62" fill="#cc0000" />

      {/* ── Left arm (raised, bicep flex) ── */}
      {/* Left upper arm – diagonal toward upper-left */}
      <polygon points="76,65 86,62 73,44 63,48" fill="#cc0000" />
      {/* Left bicep peak */}
      <ellipse cx="65" cy="50" rx="9" ry="7" transform="rotate(-40,65,50)" fill="#cc0000" />
      {/* Left forearm – angled upward */}
      <polygon points="56,52 70,46 65,28 51,34" fill="#cc0000" />
      {/* Left fist */}
      <ellipse cx="58" cy="25" rx="8" ry="7" fill="#cc0000" />

      {/* ── Right arm (mirror) ── */}
      {/* Right upper arm */}
      <polygon points="124,65 114,62 127,44 137,48" fill="#cc0000" />
      {/* Right bicep peak */}
      <ellipse cx="135" cy="50" rx="9" ry="7" transform="rotate(40,135,50)" fill="#cc0000" />
      {/* Right forearm */}
      <polygon points="144,52 130,46 135,28 149,34" fill="#cc0000" />
      {/* Right fist */}
      <ellipse cx="142" cy="25" rx="8" ry="7" fill="#cc0000" />

      {/* ── Torso ── */}
      {/* Wide chest / shoulders */}
      <polygon points="63,63 137,63 128,82 72,82" fill="#cc0000" />
      {/* Upper torso */}
      <polygon points="72,82 128,82 122,108 78,108" fill="#cc0000" />
      {/* Waist */}
      <polygon points="78,108 122,108 118,118 82,118" fill="#cc0000" />
      {/* Hips */}
      <polygon points="82,118 118,118 120,130 80,130" fill="#cc0000" />

      {/* ── Legs ── */}
      {/* Left thigh */}
      <polygon points="80,130 100,130 97,155 79,155" fill="#cc0000" />
      {/* Right thigh */}
      <polygon points="100,130 120,130 121,155 103,155" fill="#cc0000" />
      {/* Left calf */}
      <polygon points="79,155 97,155 94,170 81,170" fill="#cc0000" />
      {/* Right calf */}
      <polygon points="103,155 121,155 119,170 107,170" fill="#cc0000" />

      {/* ── GYM ── */}
      <text
        x="100"
        y="188"
        textAnchor="middle"
        fontFamily="'Arial Black', Impact, 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="28"
        fill="#cc0000"
        letterSpacing="5"
      >
        GYM
      </text>

      {/* ── Toril, Davao City ── */}
      <text
        x="100"
        y="198"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="7.5"
        fill="#ffffff"
        letterSpacing="1.2"
      >
        TORIL, DAVAO CITY
      </text>
    </svg>
  );
}
