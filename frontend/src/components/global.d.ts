// global.d.ts

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  var SpeechRecognition: typeof window.SpeechRecognition;
  var webkitSpeechRecognition: typeof window.webkitSpeechRecognition;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
export {};
