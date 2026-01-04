import React, { useState, useRef, useEffect } from 'react';
import { generateConsultationData } from './services/geminiService';
import { ConsultationData, AppState } from './types';
import RecordButton from './components/RecordButton';
import TranscriptView from './components/TranscriptView';
import SoapView from './components/SoapView';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<ConsultationData | null>(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleProcessing;

      mediaRecorder.start();
      setAppState(AppState.RECORDING);
      setError(null);
      
      // Reset and start timer
      setTimer(0);
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && appState === AppState.RECORDING) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setAppState(AppState.PROCESSING);
    }
  };

  const handleProcessing = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const result = await generateConsultationData(audioBlob);
      setData(result);
      setAppState(AppState.REVIEW);
    } catch (err: any) {
      console.error("Processing failed:", err);
      setError(err.message || "Failed to process audio. Please check your API key or connection.");
      setAppState(AppState.ERROR);
    }
  };

  const resetSession = () => {
    setAppState(AppState.IDLE);
    setData(null);
    setTimer(0);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-medical-600 text-white p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dr.AI</h1>
            <p className="text-xs text-gray-500">Intelligent Clinical Assistant (Powered by Gemini)</p>
          </div>
        </div>
        
        {appState === AppState.REVIEW && (
           <button 
             onClick={resetSession}
             className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
           >
             Start New Consultation
           </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* State: Idle or Recording */}
        {(appState === AppState.IDLE || appState === AppState.RECORDING) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
             <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
               <h2 className="text-2xl font-bold text-gray-800 mb-2">New Consultation</h2>
               <p className="text-gray-500 mb-8 text-center">Press the button below to start recording the doctor-patient conversation.</p>
               
               <RecordButton 
                 isRecording={appState === AppState.RECORDING} 
                 onClick={appState === AppState.IDLE ? startRecording : stopRecording}
                 timer={timer}
               />

               {error && (
                 <div className="mt-6 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 text-center w-full">
                   {error}
                 </div>
               )}
             </div>
          </div>
        )}

        {/* State: Processing Overlay */}
        {appState === AppState.PROCESSING && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-50">
             <div className="flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mb-4"></div>
               <h3 className="text-xl font-semibold text-gray-800">Analyzing Consultation...</h3>
               <p className="text-gray-500 mt-2">Transcribing audio and generating SOAP note</p>
             </div>
           </div>
        )}

        {/* State: Review / Result */}
        <div className={`h-full grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 p-0 lg:p-6 transition-opacity duration-500 ${appState === AppState.REVIEW ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
          <div className="h-full overflow-hidden">
            <TranscriptView segments={data?.transcript || []} />
          </div>
          <div className="h-full overflow-hidden">
             <SoapView soap={data?.soap || null} flags={data?.flags || []} />
          </div>
        </div>

        {appState === AppState.ERROR && (
           <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center">
             <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <div>
               <p className="font-bold">Error</p>
               <p className="text-sm">{error}</p>
               <button onClick={resetSession} className="mt-2 text-xs bg-white text-red-600 px-2 py-1 rounded font-bold uppercase hover:bg-gray-100">Try Again</button>
             </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;
