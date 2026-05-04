import hamsterImg from '../asset/Hamster.png';
import hamsterEatImg from '../asset/HamsterEat.png';
import hamsterFatImg from '../asset/HamsterFat.png';

interface HamsterProps {
  bg: string;
  border: string;
  size?: number;
  variant?: "idle" | "run" | "sleep" | "fat";
}

export default function Hamster({ bg, border, size = 28, variant = "idle" }: HamsterProps) {
  const className = `hamster hamster--${variant}`;
  let imgSrc = hamsterImg;
  if (variant === "sleep") imgSrc = hamsterEatImg;
  else if (variant === "fat") imgSrc = hamsterFatImg;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        border: `1.5px solid ${border}`,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      aria-hidden
    >
      <img
        src={imgSrc}
        alt=""
        style={{
          width: "120%",
          height: "120%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
