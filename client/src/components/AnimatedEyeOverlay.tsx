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
    // Smooth transition for eyelid
    setLidPosition(isOpen ? 0 : 50);
  }, [isOpen]);

  return (
    <div
      className="absolute transition-all duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%) scaleX(-1)",
      }}
    >
      {/* Eye container */}
      <div className="relative w-20 h-12 overflow-hidden">
        {/* Eye white background */}
        <div className="absolute inset-0 bg-green-500/10 rounded-full border-4 border-green-500" />
        
        {/* Pupil */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-lg z-10" />
        
        {/* Upper eyelid */}
        <div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full transition-all duration-300 ease-in-out"
          style={{
            height: `${lidPosition}%`,
            clipPath: "ellipse(50% 100% at 50% 0%)",
          }}
        />
        
        {/* Lower eyelid */}
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900 to-gray-700 rounded-full transition-all duration-300 ease-in-out"
          style={{
            height: `${lidPosition}%`,
            clipPath: "ellipse(50% 100% at 50% 100%)",
          }}
        />
        
        {/* Eyelashes effect (top) */}
        {isOpen && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gray-800 rounded-full opacity-50" />
        )}
        
        {/* Eyelashes effect (bottom) */}
        {isOpen && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-800 rounded-full opacity-50" />
        )}
      </div>
      
      {/* Status indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
        {side === "left" ? "Sol" : "Sağ"}: {isOpen ? "Açık ✓" : "Kapalı"}
      </div>
    </div>
  );
}

