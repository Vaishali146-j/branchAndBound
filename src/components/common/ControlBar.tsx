import React from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FastForward,
  SkipBack,
} from 'lucide-react';

interface ControlBarProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onScrub: (stepIndex: number) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  onJumpToStart,
  onJumpToEnd,
  playbackSpeed,
  onSpeedChange,
  onScrub,
}) => {
  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep >= totalSteps - 1;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Step Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Jump to Start */}
          <button
            onClick={onJumpToStart}
            disabled={isAtStart || isPlaying}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors"
            title="First Step"
            aria-label="First Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Previous Step */}
          <button
            onClick={onPrev}
            disabled={isAtStart || isPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Step</span>
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={onPlayPause}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
            title={isPlaying ? 'Pause Auto-play' : 'Auto Play Step-by-Step'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isAtEnd ? 'Replay' : 'Auto-Play'}</span>
              </>
            )}
          </button>

          {/* Next Step Primary Action */}
          <button
            onClick={onNext}
            disabled={isAtEnd || isPlaying}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
            title="Next Step (Spacebar)"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to End */}
          <button
            onClick={onJumpToEnd}
            disabled={isAtEnd || isPlaying}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors"
            title="Fast Forward to Complete Solution"
            aria-label="Fast Forward to Complete Solution"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700 ml-1"
            title="Reset Search Tree"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Step Scrubber Slider */}
        <div className="flex-1 max-w-md flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-slate-400 whitespace-nowrap">
            Step <span className="text-white font-bold">{currentStep + 1}</span> of {Math.max(1, totalSteps)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            aria-label="Step Scrubber"
          />
        </div>

        {/* Playback Speed Controls */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1 hidden sm:inline">Speed:</span>
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                playbackSpeed === speed
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
