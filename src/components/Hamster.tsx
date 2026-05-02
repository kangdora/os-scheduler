interface HamsterProps {
  bg: string;
  border: string;
  size?: number;
  variant?: "idle" | "run" | "sleep";
}

export default function Hamster({ bg, border, size = 36, variant = "idle" }: HamsterProps) {
  const className = `hamster hamster--${variant}`;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
    >
      <ellipse cx="20" cy="24" rx="14" ry="13" fill={bg} stroke={border} strokeWidth="1.2" />
      <circle cx="9" cy="13" r="4" fill={bg} stroke={border} strokeWidth="1.2" />
      <circle cx="31" cy="13" r="4" fill={bg} stroke={border} strokeWidth="1.2" />
      <circle cx="9" cy="13" r="2" fill={border} />
      <circle cx="31" cy="13" r="2" fill={border} />
      <circle cx="14" cy="22" r="1.6" fill="#3a2210" />
      <circle cx="26" cy="22" r="1.6" fill="#3a2210" />
      <ellipse cx="20" cy="27" rx="2.2" ry="1.4" fill="#e98695" />
      <ellipse cx="13" cy="26" rx="2.2" ry="1.6" fill="#fbcbd1" opacity="0.7" />
      <ellipse cx="27" cy="26" rx="2.2" ry="1.6" fill="#fbcbd1" opacity="0.7" />
      {variant === "sleep" && (
        <g>
          <ellipse cx="20" cy="33" rx="3" ry="1.2" fill="#7a4a26" />
          <ellipse cx="22" cy="32" rx="0.8" ry="1.4" fill="#5b3517" />
        </g>
      )}
    </svg>
  );
}
