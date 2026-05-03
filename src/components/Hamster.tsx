import hamsterImg from '../asset/Hamster.png';
import hamsterEatImg from '../asset/HamsterEat.png';

interface HamsterProps {
  bg: string;
  border: string;
  size?: number;
  variant?: "idle" | "run" | "sleep";
}

export default function Hamster({ bg, border, size = 36, variant = "idle" }: HamsterProps) {
  const className = `hamster hamster--${variant}`;
  const imgSrc = variant === "sleep" ? hamsterEatImg : hamsterImg;

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
          width: "145%",
          height: "145%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
