import React from 'react';
import { TranscriptSegment } from '../types';

interface TranscriptViewProps {
  segments: TranscriptSegment[];
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ segments }) => {
  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Consultation Transcript
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No transcript available.</p>
          </div>
        ) : (
          segments.map((seg, idx) => (
            <div key={idx} className="flex flex-col animate-fadeIn">
              <div className="flex items-center mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${
                  seg.speaker === 'Doctor' 
                    ? 'bg-blue-100 text-blue-800' 
                    : seg.speaker === 'Patient' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {seg.speaker === 'Doctor' ? '👨‍⚕️ Doctor' : seg.speaker === 'Patient' ? '👤 Patient' : seg.speaker}
                </span>
                <span className="text-xs text-gray-400 font-mono">{seg.timestamp}</span>
              </div>
              <div className="pl-2 border-l-2 border-gray-100 hover:border-blue-200 transition-colors">
                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{seg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptView;
