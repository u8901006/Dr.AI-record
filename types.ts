export interface TranscriptSegment {
  speaker: 'Doctor' | 'Patient' | 'Other';
  timestamp: string; // Format "MM:SS"
  text: string;
  confidence: number;
}

export interface ContentFlag {
  field: string;
  type: 'contradiction' | 'low_confidence' | 'missing_info';
  content: string;
  reason: string;
}

export interface SoapNote {
  chief_complaint: string;
  hpi: string;
  ros: string;
  pmh: string;
  medications: string;
  allergies: string;
  physical_exam: string; // Often empty, to be filled by doctor
  assessment: string;
  plan: string;
}

export interface ConsultationData {
  transcript: TranscriptSegment[];
  soap: SoapNote;
  flags: ContentFlag[];
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  ERROR = 'ERROR'
}
