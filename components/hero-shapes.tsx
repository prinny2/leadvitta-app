const SHAPES = [
  {
    className: "left-[-8%] top-[18%]",
    width: 580,
    height: 130,
    rotate: 12,
    gradientColor: "rgba(201,160,96,0.13)",
  },
  {
    className: "right-[-4%] bottom-[12%]",
    width: 460,
    height: 110,
    rotate: -15,
    gradientColor: "rgba(212,196,160,0.11)",
  },
  {
    className: "left-[8%] bottom-[8%]",
    width: 280,
    height: 72,
    rotate: -8,
    gradientColor: "rgba(146,97,10,0.14)",
  },
  {
    className: "right-[18%] top-[12%]",
    width: 190,
    height: 54,
    rotate: 20,
    gradientColor: "rgba(201,160,96,0.10)",
  },
  {
    className: "left-[22%] top-[6%]",
    width: 140,
    height: 38,
    rotate: -25,
    gradientColor: "rgba(90,122,154,0.10)",
  },
];

export function HeroShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {SHAPES.map((shape) => (
        <div
          key={`${shape.className}-${shape.width}`}
          className={`absolute ${shape.className}`}
          style={{
            width: shape.width,
            height: shape.height,
            transform: `rotate(${shape.rotate}deg)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, ${shape.gradientColor}, transparent)`,
              border: "1.5px solid rgba(201,160,96,0.12)",
              boxShadow: "0 8px 32px rgba(201,160,96,0.08)",
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(201,160,96,0.12), transparent 70%)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
