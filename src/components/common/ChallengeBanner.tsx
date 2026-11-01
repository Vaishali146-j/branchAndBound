import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface ChallengeBannerProps {
  challenge?: {
    nodeId: number;
    lowerBound?: number;
    upperBound?: number;
    bestCost?: number;
    bestValue?: number;
    correctAction: 'explore' | 'prune';
    explanation: string;
  };
  onAnswer?: (isCorrect: boolean) => void;
  isMinimization: boolean;
}

export const ChallengeBanner: React.FC<ChallengeBannerProps> = ({
  challenge,
  onAnswer,
  isMinimization,
}) => {
  const [userChoice, setUserChoice] = useState<'explore' | 'prune' | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  if (!challenge) {
    return (
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>
            <strong>Challenge Mode Active:</strong> Step through the algorithm. When a new branch is evaluated, test your intuition by predicting whether it should be explored or pruned!
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-200 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-600/40">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Score: {score.correct}/{score.total}</span>
        </div>
      </div>
    );
  }

  const boundValue = isMinimization ? challenge.lowerBound : challenge.upperBound;
  const incumbentValue = isMinimization ? challenge.bestCost : challenge.bestValue;
  const hasAnswered = userChoice !== null;
  const isCorrect = userChoice === challenge.correctAction;

  const handleSelect = (choice: 'explore' | 'prune') => {
    setUserChoice(choice);
    const correct = choice === challenge.correctAction;
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    if (onAnswer) onAnswer(correct);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/50 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 animate-bounce" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Interactive Prediction Challenge: Branch Decision
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-200 bg-amber-900/40 px-2.5 py-1 rounded-md border border-amber-600/40">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Quiz Score: {score.correct} / {score.total}</span>
        </div>
      </div>

      <p className="text-xs text-slate-200 mb-3">
        Node <strong>#{challenge.nodeId}</strong> has calculated {isMinimization ? 'Lower Bound' : 'Upper Bound'}:{' '}
        <span className="font-mono font-bold text-amber-300">{boundValue}</span>, while current Best Solution is{' '}
        <span className="font-mono font-bold text-emerald-400">
          {incumbentValue !== undefined && Number.isFinite(incumbentValue) ? incumbentValue : 'None'}
        </span>
        . Based on Branch &amp; Bound bounding rules, should the algorithm:
      </p>

      {/* Decision Buttons */}
      {!hasAnswered ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSelect('explore')}
            className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            Explore (Add to Frontier)
          </button>
          <button
            onClick={() => handleSelect('prune')}
            className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            Prune (Discard Branch)
          </button>
        </div>
      ) : (
        <div
          className={`rounded-lg p-3 text-xs border ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {isCorrect ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Correct! Excellent Algorithmic Reasoning!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Not quite — the correct action was to {challenge.correctAction.toUpperCase()}!</span>
              </>
            )}
          </div>
          <p className="text-[11px] opacity-90">{challenge.explanation}</p>
          <button
            onClick={() => setUserChoice(null)}
            className="mt-2 text-[10px] underline font-semibold text-slate-300 hover:text-white"
          >
            Reset question
          </button>
        </div>
      )}
    </div>
  );
};
