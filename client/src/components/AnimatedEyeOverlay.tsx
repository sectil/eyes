import { useState, useEffect } from "react";

interface AnimatedEyeOverlayProps {
  x: number;
  y: number;
  isOpen: boolean;
  side: "left" | "right";
}

export default function AnimatedEyeOverlay({ x, y, isOpen, side }: AnimatedEyeOverlayProps) {
  const [lidPosition, setLidPosition] = useState(isOpen ? 0 : 50);

  useEffect(() => {
    setLidPosition(isOpen ? 0 : 50);
  }, [isOpen]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        transition: "left 0.05s ease-out, top 0.05s ease-out",
      }}
    >
      {/* Minimal eye design */}
      <div className="relative w-16 h-10">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full" />
        
        {/* Eye outline - simple circle */}
        <div className="absolute inset-0 border-2 border-emerald-400 rounded-full bg-white/90 shadow-lg overflow-hidden">
          {/* Iris - simple gradient circle */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-opacity duration-150"
            style={{
              background: "radial-gradient(circle at 30% 30%, #6ee7b7, #10b981, #059669)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            {/* Pupil - black dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full">
              {/* Light reflection - single white dot */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
            </div>
          </div>

          {/* Eyelids - simple overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-emerald-500 to-emerald-600 transition-all duration-150 ease-out"
            style={{
              clipPath: isOpen
                ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
                : "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-emerald-600 transition-all duration-150 ease-out"
            style={{
              clipPath: isOpen
                ? "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)"
                : "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
            }}
          />
        </div>
      </div>

      {/* Minimal status badge */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500/90 text-white text-[10px] font-medium rounded-full shadow-sm">
        {side === "left" ? "L" : "R"} {isOpen ? "✓" : "✗"}
      </div>
    </div>
  );
}

