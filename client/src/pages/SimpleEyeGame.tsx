import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SimpleEyeGame() {
  const [gameActive, setGameActive] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<{ x: number; y: number } | null>(null);
  const [targetsCompleted, setTargetsCompleted] = useState(0);
  const [lookDuration, setLookDuration] = useState(0);
  const [isLookingAtTarget, setIsLookingAtTarget] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const TOTAL_TARGETS = 10;
  const LOOK_DURATION_REQUIRED = 2; // seconds

  // Track mouse position
  useEffect(() => {
    if (!gameActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameActive]);

  // Spawn new target
  useEffect(() => {
    if (!gameActive || targetsCompleted >= TOTAL_TARGETS) return;
    
    if (!currentTarget) {
      const newTarget = {
        x: Math.random() * 70 + 15,
        y: Math.random() * 60 + 15,
      };
      console.log('🎯 Yeni hedef:', newTarget);
      setCurrentTarget(newTarget);
      setLookDuration(0);
      setIsLookingAtTarget(false);
    }
  }, [gameActive, currentTarget, targetsCompleted]);

  // Check if mouse is near target
  useEffect(() => {
    if (!gameActive || !currentTarget || !gameAreaRef.current) return;

    const interval = setInterval(() => {
      const rect = gameAreaRef.current!.getBoundingClientRect();
      const targetX = (currentTarget.x / 100) * rect.width;
      const targetY = (currentTarget.y / 100) * rect.height;

      const distance = Math.sqrt(
        Math.pow(mousePos.x - targetX, 2) + Math.pow(mousePos.y - targetY, 2)
      );

      const isNear = distance < 60;
      setIsLookingAtTarget(isNear);
      
      console.log('📏 Mesafe:', distance.toFixed(0), 'px', isNear ? '✅' : '❌');
    }, 100);

    return () => clearInterval(interval);
  }, [gameActive, currentTarget, mousePos]);

  // Track look duration
  useEffect(() => {
    if (!gameActive || !isLookingAtTarget) return;

    const interval = setInterval(() => {
      setLookDuration(prev => {
        const newDuration = prev + 0.1;
        
        if (newDuration >= LOOK_DURATION_REQUIRED) {
          console.log('✅ Hedef tamamlandı!');
          setTargetsCompleted(prev => prev + 1);
          setCurrentTarget(null);
          return 0;
        }
        
        return newDuration;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameActive, isLookingAtTarget]);

  // Game complete
  useEffect(() => {
    if (targetsCompleted >= TOTAL_TARGETS && gameActive) {
      console.log('🎉 Oyun tamamlandı!');
      setGameActive(false);
    }
  }, [targetsCompleted, gameActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">🎯 Fare Kontrollü Test Oyunu</h1>
          <p className="text-muted-foreground mb-6">
            Fareyi hedefe götürün ve 2 saniye bekleyin. Bu oyun çalışırsa, göz tracking ekleyeceğiz!
          </p>

          {!gameActive ? (
            <div className="text-center space-y-4">
              <Button
                size="lg"
                onClick={() => {
                  console.log('🎮 Oyun başladı!');
                  setGameActive(true);
                  setTargetsCompleted(0);
                  setCurrentTarget(null);
                }}
              >
                🎮 Oyunu Başlat
              </Button>
              
              {targetsCompleted > 0 && (
                <div className="text-2xl font-bold text-green-600">
                  🎉 {targetsCompleted}/{TOTAL_TARGETS} hedef tamamlandı!
                </div>
              )}
            </div>
          ) : (
            <div
              ref={gameAreaRef}
              className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden"
            >
              {/* Mouse cursor indicator */}
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none"
                style={{
                  left: mousePos.x - 8,
                  top: mousePos.y - 8,
                }}
              />

              {/* Target */}
              {currentTarget && (
                <div
                  className="absolute"
                  style={{
                    left: `${currentTarget.x}%`,
                    top: `${currentTarget.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative w-16 h-16">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke={isLookingAtTarget ? "#10b981" : "#3b82f6"}
                        strokeWidth="4"
                        strokeDasharray={`${(lookDuration / LOOK_DURATION_REQUIRED) * 175.93} 175.93`}
                        className="transition-all duration-100"
                      />
                    </svg>
                    <div className={`absolute inset-0 m-3 rounded-full transition-all duration-200 ${
                      isLookingAtTarget ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                    } flex items-center justify-center`}>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                🎯 {targetsCompleted}/{TOTAL_TARGETS}
              </div>

              <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full font-medium shadow-lg">
                {isLookingAtTarget ? '✅ Bakıyor' : '❌ Bakmıyor'}
              </div>

              {lookDuration > 0 && (
                <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  ⏱️ {lookDuration.toFixed(1)}s / {LOOK_DURATION_REQUIRED}s
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

