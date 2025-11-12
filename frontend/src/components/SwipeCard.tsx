import { useState, useRef, useEffect } from 'react';
import type { Quiz } from '../types';

interface SwipeCardProps {
  quiz: Quiz;
  onSwipe: (answer: boolean) => void;
}

const SwipeCard = ({ quiz, onSwipe }: SwipeCardProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX.current;
    setDragX(Math.max(-200, Math.min(200, deltaX)));
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX.current;
    setDragX(Math.max(-200, Math.min(200, deltaX)));
  };
  
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragX) > 100) {
      setIsExiting(true);
      const answer = dragX < 0; // Left = True, Right = False
      setTimeout(() => onSwipe(answer), 300);
    } else {
      setDragX(0);
    }
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dragX]);
  
  const rotation = (dragX / 200) * 25;
  const opacity = isExiting ? 0 : Math.max(0, 1 - Math.abs(dragX) / 200);
  const trueOpacity = Math.max(0, Math.min(1, (-dragX + 50) / 150));
  const falseOpacity = Math.max(0, Math.min(1, (dragX + 50) / 150));
  
  return (
    <div
      ref={cardRef}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        opacity: opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-full h-full military-card-light rounded-3xl border-4 border-black/20 p-8 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Swipe indicators */}
        <div
          className="absolute top-8 left-8 text-6xl font-black text-white bg-army-900 px-6 py-3 rounded-xl rotate-[-20deg] border-4 border-white shadow-2xl"
          style={{ opacity: trueOpacity }}
        >
          TRUE
        </div>
        
        <div
          className="absolute top-8 right-8 text-6xl font-black text-army-900 bg-white px-6 py-3 rounded-xl rotate-[20deg] border-4 border-army-900 shadow-2xl"
          style={{ opacity: falseOpacity }}
        >
          FALSE
        </div>
        
        {/* Question */}
        <div className="text-center">
          <div className="mb-6">
            <span className={`inline-block px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wider border-2 ${
              quiz.difficulty === 'easy' ? 'bg-army-900 text-white border-white' :
              quiz.difficulty === 'medium' ? 'bg-white text-army-900 border-army-900' :
              'bg-army-900 text-white border-white'
            }`}>
              {quiz.difficulty}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-army-900 mb-6 uppercase tracking-wide leading-tight">
            {quiz.question}
          </h2>
          
          <p className="text-army-600 mb-8 font-bold uppercase tracking-wide text-sm">
            ← TRUE | FALSE →
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => onSwipe(true)}
              className="bg-army-900 text-white px-8 py-3 rounded-lg border-2 border-white font-black uppercase tracking-wider hover:bg-army-800 transition-colors"
            >
              TRUE
            </button>
            <button
              onClick={() => onSwipe(false)}
              className="bg-white text-army-900 px-8 py-3 rounded-lg border-2 border-army-900 font-black uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              FALSE
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-army-900 text-white px-6 py-3 rounded-lg border-2 border-white">
            <span className="text-xl font-black uppercase tracking-wider">+{quiz.points} Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
