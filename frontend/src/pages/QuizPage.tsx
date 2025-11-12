import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../lib/api';
import SwipeCard from '../components/SwipeCard';
import { ArrowLeft, Trophy } from '../components/icons';
import type { Quiz, QuizResult } from '../types';

const QuizPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const { data: quizData, isLoading, refetch } = useQuery({
    queryKey: ['quiz'],
    queryFn: async () => {
      const response = await quizApi.getRandomQuiz();
      const quiz = response.data.data;
      setCurrentQuiz(quiz);
      return quiz;
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: ({ quizId, answer }: { quizId: string; answer: boolean }) =>
      quizApi.submitAnswer(quizId, answer),
    onSuccess: (response) => {
      setResult(response.data.data);
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      
      setTimeout(() => {
        setShowResult(false);
        setResult(null);
        refetch();
      }, 3000);
    },
  });
  
  const handleSwipe = (answer: boolean) => {
    if (currentQuiz) {
      submitMutation.mutate({ quizId: currentQuiz.id, answer });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-army-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold uppercase tracking-wider">Loading Mission...</p>
        </div>
      </div>
    );
  }
  
  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-army-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md military-card rounded-2xl p-8 border-2 border-white/20">
          <Trophy className="w-20 h-20 text-white mx-auto mb-4 animate-pulse" strokeWidth={2.5} />
          <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-wider">Mission Complete!</h2>
          <p className="text-white/70 mb-6 font-semibold uppercase tracking-wide">All objectives achieved. Return for more missions!</p>
          <button
            onClick={() => navigate('/')}
            className="military-button w-full px-6 py-4 rounded-lg"
          >
            Return to Base
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-army-900">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-3 military-card-light rounded-lg border-2 border-black/20 hover:border-black/40 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-army-900" strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white text-glow">Mission Active</h1>
          <div className="w-14"></div>
        </div>
        
        {/* Quiz Card Container */}
        <div className="relative h-[500px] mb-8">
          {!showResult && currentQuiz && (
            <SwipeCard quiz={currentQuiz} onSwipe={handleSwipe} />
          )}
        </div>
        
        {/* Result Modal */}
        {showResult && result && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-8 max-w-sm w-full text-center border-4 ${
              result.isCorrect ? 'military-card-light border-white' : 'military-card border-white/30'
            }`}>
              <div className="text-7xl mb-4">
                {result.isCorrect ? '✓' : '✗'}
              </div>
              <h2 className={`text-4xl font-black mb-3 uppercase tracking-wider ${
                result.isCorrect ? 'text-army-900' : 'text-white'
              }`}>
                {result.isCorrect ? 'Success!' : 'Failed!'}
              </h2>
              <p className={`mb-6 font-bold uppercase tracking-wide ${
                result.isCorrect ? 'text-army-600' : 'text-white/70'
              }`}>
                {result.isCorrect 
                  ? `+${result.pointsEarned} Points Earned` 
                  : `${Math.abs(result.pointsEarned)} Points Lost`
                }
              </p>
              <div className={`rounded-lg p-5 border-2 ${
                result.isCorrect ? 'bg-army-900 border-white' : 'bg-white border-army-900'
              }`}>
                <p className={`text-xs mb-2 font-bold uppercase tracking-wider ${
                  result.isCorrect ? 'text-white/70' : 'text-army-600'
                }`}>Balance Change</p>
                <p className={`text-3xl font-black mb-3 ${
                  result.isCorrect ? 'text-white' : 'text-army-900'
                }`}>
                  {result.balanceChange >= 0 ? '+' : ''}{result.balanceChange.toFixed(2)} BIRR
                </p>
                <p className={`text-sm font-bold uppercase tracking-wide ${
                  result.isCorrect ? 'text-white/70' : 'text-army-600'
                }`}>
                  New: {result.newBalance.toFixed(2)} Birr
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="military-card-light rounded-xl p-5 border-2 border-black/20">
          <h3 className="font-black text-army-900 mb-3 uppercase tracking-wider">Mission Brief</h3>
          <ul className="space-y-2 text-sm text-army-700 font-bold">
            <li className="flex items-center gap-2"><span className="text-army-900">←</span> SWIPE LEFT = TRUE</li>
            <li className="flex items-center gap-2"><span className="text-army-900">→</span> SWIPE RIGHT = FALSE</li>
            <li className="flex items-center gap-2"><span className="text-army-900">✓</span> CORRECT = EARN REWARDS</li>
            <li className="flex items-center gap-2"><span className="text-army-900">✗</span> WRONG = LOSE POINTS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
