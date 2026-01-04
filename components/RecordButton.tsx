import React from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  timer?: number;
}

const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onClick, timer = 0 }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {isRecording && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
        )}
        <button
          onClick={onClick}
          className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-medical-600 hover:bg-medical-500 focus:ring-medical-500'
          }`}
        >
          {isRecording ? (
            <div className="w-8 h-8 bg-white rounded-sm" />
          ) : (
            <svg
              className="w-10 h-10 text-white translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
      </div>
      
      <div className={`text-2xl font-mono font-medium ${isRecording ? 'text-red-600' : 'text-gray-400'}`}>
        {isRecording ? formatTime(timer) : 'Ready to Record'}
      </div>
      
      {isRecording && (
        <div className="text-sm text-gray-500 animate-pulse">
          Recording Audio...
        </div>
      )}
    </div>
  );
};

export default RecordButton;
