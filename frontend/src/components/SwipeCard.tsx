import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { Quiz } from '../types';

interface SwipeCardProps {
  quiz: Quiz;
  onSwipe: (answer: boolean) => void;
}

const SwipeCard = ({ quiz, onSwipe }: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      const answer = info.offset.x < 0; // Left = True, Right = False
      setTimeout(() => onSwipe(answer), 100);
    }
  };
  
  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full military-card-light rounded-3xl border-4 border-black/20 p-8 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Swipe indicators */}
        <motion.div
          className="absolute top-8 left-8 text-6xl font-black text-white bg-army-900 px-6 py-3 rounded-xl rotate-[-20deg] border-4 border-white shadow-2xl"
          style={{ opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]) }}
        >
          TRUE
        </motion.div>
        
        <motion.div
          className="absolute top-8 right-8 text-6xl font-black text-army-900 bg-white px-6 py-3 rounded-xl rotate-[20deg] border-4 border-army-900 shadow-2xl"
          style={{ opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]) }}
        >
          FALSE
        </motion.div>
        
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
          
          <div className="flex items-center justify-center gap-2 bg-army-900 text-white px-6 py-3 rounded-lg border-2 border-white">
            <span className="text-xl font-black uppercase tracking-wider">+{quiz.points} Points</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
