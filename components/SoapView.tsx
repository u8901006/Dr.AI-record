import React, { useState } from 'react';
import { SoapNote, ContentFlag } from '../types';

interface SoapViewProps {
  soap: SoapNote | null;
  flags: ContentFlag[];
}

const SoapView: React.FC<SoapViewProps> = ({ soap, flags }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!soap) return;
    
    const text = `
S:
CC: ${soap.chief_complaint}
HPI: ${soap.hpi}
ROS: ${soap.ros}
PMH/Meds/Allergies: ${soap.pmh}, ${soap.medications}, ${soap.allergies}

O:
${soap.physical_exam || "None"}

A:
${soap.assessment}

P:
${soap.plan}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!soap) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">SOAP Note</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
          <p>Complete a recording to generate the clinical note.</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'S', title: 'Subjective', color: 'bg-blue-50 text-blue-800', content: [
      { label: 'Chief Complaint', value: soap.chief_complaint },
      { label: 'History of Present Illness', value: soap.hpi },
      { label: 'Review of Systems', value: soap.ros },
      { label: 'Medical History / Meds', value: `${soap.pmh}\n${soap.medications}\n${soap.allergies}` },
    ]},
    { id: 'O', title: 'Objective', color: 'bg-purple-50 text-purple-800', content: [
      { label: 'Physical Exam', value: soap.physical_exam || '(To be filled by physician)' },
    ]},
    { id: 'A', title: 'Assessment', color: 'bg-amber-50 text-amber-800', content: [
      { label: 'Assessment', value: soap.assessment },
    ]},
    { id: 'P', title: 'Plan', color: 'bg-green-50 text-green-800', content: [
      { label: 'Plan', value: soap.plan },
    ]},
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 relative">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          SOAP Note (Generated)
        </h2>
        <button
          onClick={handleCopy}
          className={`text-sm px-3 py-1.5 rounded-md transition-colors flex items-center ${
            copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              Copy to HIS
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Flags / Alerts */}
        {flags.length > 0 && (
          <div className="mb-6 space-y-2">
            {flags.map((flag, idx) => (
              <div key={idx} className={`p-3 rounded-md text-sm border-l-4 flex items-start ${
                flag.type === 'contradiction' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-yellow-50 border-yellow-500 text-yellow-800'
              }`}>
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <span className="font-bold uppercase text-xs block mb-1">{flag.type.replace('_', ' ')} in {flag.field}</span>
                  <p>{flag.reason}: <span className="italic">"{flag.content}"</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOAP Content */}
        {sections.map(section => (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className={`px-4 py-2 font-bold text-sm uppercase tracking-wide border-b border-gray-200 ${section.color}`}>
              {section.id} - {section.title}
            </div>
            <div className="p-4 space-y-4">
              {section.content.map((item, idx) => (
                <div key={idx}>
                  <dt className="text-xs font-semibold text-gray-500 uppercase mb-1">{item.label}</dt>
                  <dd className="text-gray-900 whitespace-pre-wrap leading-relaxed">{item.value || "—"}</dd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoapView;
