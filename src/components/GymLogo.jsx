export default function GymLogo({ size = 120, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Background ── */}
      <circle cx="100" cy="100" r="99" fill="#0d0d0d" />

      {/* ── Rings ── */}
      <circle cx="100" cy="100" r="97" fill="none" stroke="#cc0000" strokeWidth="5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#cc0000" strokeWidth="1.5" />

      {/* ── Barbell (overhead) ── */}
      {/* Bar */}
      <rect x="44" y="20" width="112" height="6" rx="2" fill="#cc0000" />
      {/* Left weight plate */}
      <circle cx="49" cy="23" r="10" fill="#cc0000" />
      {/* Right weight plate */}
      <circle cx="151" cy="23" r="10" fill="#cc0000" />

      {/* ── Head ── */}
      <ellipse cx="100" cy="60" rx="9" ry="10" fill="#cc0000" />

      {/* ── Neck ── */}
      <polygon points="94,69 106,69 107,76 93,76" fill="#cc0000" />

      {/* ── Left arm (raised, gripping bar) ── */}
      {/* Left upper arm */}
      <polygon points="73,76 83,76 72,44 62,44" fill="#cc0000" />
      {/* Left bicep peak */}
      <ellipse cx="64" cy="50" rx="8" ry="6" transform="rotate(-70,64,50)" fill="#cc0000" />
      {/* Left forearm */}
      <polygon points="62,44 72,44 69,22 59,22" fill="#cc0000" />
      {/* Left fist */}
      <ellipse cx="64" cy="22" rx="6" ry="7" fill="#cc0000" />

      {/* ── Right arm (mirror) ── */}
      {/* Right upper arm */}
      <polygon points="117,76 127,76 138,44 128,44" fill="#cc0000" />
      {/* Right bicep peak */}
      <ellipse cx="136" cy="50" rx="8" ry="6" transform="rotate(70,136,50)" fill="#cc0000" />
      {/* Right forearm */}
      <polygon points="128,44 138,44 141,22 131,22" fill="#cc0000" />
      {/* Right fist */}
      <ellipse cx="136" cy="22" rx="6" ry="7" fill="#cc0000" />

      {/* ── Torso ── */}
      {/* Wide chest / shoulders */}
      <polygon points="75,76 125,76 120,96 80,96" fill="#cc0000" />
      {/* Upper torso */}
      <polygon points="80,96 120,96 116,113 84,113" fill="#cc0000" />
      {/* Waist */}
      <polygon points="84,113 116,113 113,124 87,124" fill="#cc0000" />
      {/* Hips */}
      <polygon points="87,124 113,124 115,136 85,136" fill="#cc0000" />

      {/* ── Legs ── */}
      {/* Left thigh */}
      <polygon points="85,136 100,136 97,161 82,161" fill="#cc0000" />
      {/* Right thigh */}
      <polygon points="100,136 115,136 118,161 103,161" fill="#cc0000" />
      {/* Left calf */}
      <polygon points="82,161 97,161 94,175 84,175" fill="#cc0000" />
      {/* Right calf */}
      <polygon points="103,161 118,161 116,175 108,175" fill="#cc0000" />
    </svg>
  );
}
