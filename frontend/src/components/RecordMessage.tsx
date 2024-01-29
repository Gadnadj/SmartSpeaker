import React, { useState, useEffect } from 'react';
import RecordIcon from './RecordIcon';
import { useReactMediaRecorder } from 'react-media-recorder';

type Props = {
  handleStop: any;
  selectedVoice: string;
};

const RecordMessage = ({ handleStop }: Props) => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
    });
  const [localMediaBlobUrl, setLocalMediaBlobUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    setLocalMediaBlobUrl(mediaBlobUrl !== undefined ? mediaBlobUrl : null);
  }, [mediaBlobUrl]);

  const [isRecording, setIsRecording] = useState(false);
  const [handleStopCalled, setHandleStopCalled] = useState(false);

  useEffect(() => {
    if (
      localMediaBlobUrl &&
      mediaBlobUrl &&
      !isRecording &&
      !handleStopCalled
    ) {
      handleStop(localMediaBlobUrl);
      // Réinitialiser localMediaBlobUrl à null après le traitement
      setLocalMediaBlobUrl(null);
    }
  }, [localMediaBlobUrl]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      console.log('Transcription: ', transcript);

      if (transcript.toLowerCase() === 'hey rachel') {
        console.log('hey dude im working perfectly');
        startRecording();
        setIsRecording(true);
      } else if (transcript.toLowerCase() === 'stop') {
        console.log('stop dude im working perfectly');
        stopRecording();
        setIsRecording(false);
      }
    };

    recognition.start();
  }, [isRecording, startRecording, stopRecording]);

  const handleMouseDown = () => {
    startRecording();
    setIsRecording(true);
  };

  const handleMouseUp = () => {
    stopRecording();
    setIsRecording(false);
  };

  /*useEffect(() => {
    if (mediaBlobUrl && !isRecording && !handleStopCalled) {
      handleStop(mediaBlobUrl);
      setHandleStopCalled(true);
    }
  }, [mediaBlobUrl, isRecording, handleStopCalled, handleStop]);*/

  useEffect(() => {
    if (isRecording) {
      setHandleStopCalled(false);
    }
  }, [isRecording]);

  return (
    <div className='mt-2'>
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className='bg-white p-4 rounded-full'
      >
        <RecordIcon
          classText={
            status === 'recording'
              ? 'animate-pulse text-red-500'
              : 'text-sky-500'
          }
        />
      </button>
      <p className='mt-2 text-white font-light'>{status}</p>
    </div>
  );
};

export default RecordMessage;
