import { useState, useEffect } from "react";

interface AnimatedEyeOverlayProps {
  x: number;
  y: number;
  isOpen: boolean;
  side: "left" | "right";
}

export default function AnimatedEyeOverlay({ x, y, isOpen, side }: AnimatedEyeOverlayProps) {
  const [lidPosition, setLidPosition] = useState(isOpen ? 0 : 50);
  const eyeSize = 90; // Larger, more realistic
  const irisSize = 32;
  const pupilSize = 16;

  useEffect(() => {
    // Smooth and fast transition for eyelid
    setLidPosition(isOpen ? 0 : 50);
  }, [isOpen]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        transition: "left 0.05s ease-out, top 0.05s ease-out", // Much faster, smoother tracking
      }}
    >
      {/* Eye container */}
      <div className="relative" style={{ width: eyeSize, height: eyeSize * 0.65 }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White of the eye (sclera) */}
          <ellipse
            cx="50"
            cy="32.5"
            rx="48"
            ry="30"
            fill="white"
            opacity={isOpen ? 0.95 : 0}
            className="transition-opacity duration-150"
          />

          {/* Eye outline - almond shape */}
          <path
            d="M 2 32.5 Q 2 10, 50 10 Q 98 10, 98 32.5 Q 98 55, 50 55 Q 2 55, 2 32.5"
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            opacity={isOpen ? 1 : 0.4}
            className="transition-opacity duration-150"
          />

          {/* Iris - colored part with gradient */}
          <defs>
            <radialGradient id={`irisGradient-${side}`}>
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="30%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <radialGradient id={`pupilGradient-${side}`}>
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>
          
          <circle
            cx="50"
            cy="32.5"
            r={irisSize / 2}
            fill={`url(#irisGradient-${side})`}
            opacity={isOpen ? 1 : 0}
            className="transition-opacity duration-150"
          />

          {/* Iris texture lines */}
          {isOpen && (
            <>
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="32.5"
                  x2={50 + (irisSize / 2) * Math.cos((i * 30 * Math.PI) / 180)}
                  y2={32.5 + (irisSize / 2) * Math.sin((i * 30 * Math.PI) / 180)}
                  stroke="#059669"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}
            </>
          )}

          {/* Pupil - black center */}
          <circle
            cx="50"
            cy="32.5"
            r={pupilSize / 2}
            fill={`url(#pupilGradient-${side})`}
            opacity={isOpen ? 1 : 0}
            className="transition-opacity duration-150"
          />

          {/* Light reflection on pupil - makes it look alive */}
          <circle
            cx="47"
            cy="29"
            r="3.5"
            fill="white"
            opacity={isOpen ? 0.9 : 0}
            className="transition-opacity duration-150"
          />
          <circle
            cx="53"
            cy="35"
            r="1.5"
            fill="white"
            opacity={isOpen ? 0.5 : 0}
            className="transition-opacity duration-150"
          />

          {/* Blood vessels (subtle) */}
          {isOpen && (
            <>
              <path
                d="M 15 25 Q 20 20, 30 22"
                stroke="#ef4444"
                strokeWidth="0.5"
                opacity="0.15"
                fill="none"
              />
              <path
                d="M 70 22 Q 80 20, 85 25"
                stroke="#ef4444"
                strokeWidth="0.5"
                opacity="0.15"
                fill="none"
              />
            </>
          )}
        </svg>

        {/* Upper eyelid - smooth gradient */}
        <div
          className="absolute inset-0 transition-all duration-150 ease-out"
          style={{
            background: "linear-gradient(to bottom, rgba(16, 185, 129, 0.5) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)",
            clipPath: isOpen
              ? "polygon(0 0, 100% 0, 100% 0, 0 0)" // Fully open
              : "polygon(0 0, 100% 0, 100% 55%, 0 55%)", // Closed
          }}
        />

        {/* Lower eyelid - smooth gradient */}
        <div
          className="absolute inset-0 transition-all duration-150 ease-out"
          style={{
            background: "linear-gradient(to top, rgba(16, 185, 129, 0.5) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)",
            clipPath: isOpen
              ? "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" // Fully open
              : "polygon(0 45%, 100% 45%, 100% 100%, 0 100%)", // Closed
          }}
        />

        {/* Eyelashes (top) - more realistic */}
        {isOpen && (
          <div className="absolute -top-2 left-0 right-0 flex justify-around">
            {[...Array(10)].map((_, i) => (
              <div
                key={`top-${i}`}
                className="w-0.5 h-3 bg-emerald-800 rounded-full opacity-70"
                style={{
                  transform: `rotate(${(i - 5) * 7}deg)`,
                  transformOrigin: "bottom center",
                }}
              />
            ))}
          </div>
        )}

        {/* Eyelashes (bottom) - more realistic */}
        {isOpen && (
          <div className="absolute -bottom-1 left-0 right-0 flex justify-around">
            {[...Array(8)].map((_, i) => (
              <div
                key={`bottom-${i}`}
                className="w-0.5 h-2 bg-emerald-800 rounded-full opacity-50"
                style={{
                  transform: `rotate(${(i - 4) * 6}deg)`,
                  transformOrigin: "top center",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status indicator - smaller and less intrusive */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[10px] font-semibold text-emerald-500 bg-black/70 px-2 py-0.5 rounded-full whitespace-nowrap border border-emerald-500/30">
        {side === "left" ? "Sol" : "Sağ"}: {isOpen ? "✓" : "✗"}
      </div>
    </div>
  );
}

