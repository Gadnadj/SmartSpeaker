import React, { useState, useEffect } from 'react';
import RecordIcon from './RecordIcon';
import { useReactMediaRecorder } from 'react-media-recorder';

interface Props {
  handleStop: any;
}

/*Create a RecordMessage component to record a message with the user's microphone*/
const RecordMessage = ({ handleStop }: Props) => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
    });

  /*Add the localMediaBlobUrl state to store the mediaBlobUrl*/
  const [localMediaBlobUrl, setLocalMediaBlobUrl] = useState<string | null>(
    null
  );

  /*Set the localMediaBlobUrl to the mediaBlobUrl when the mediaBlobUrl is defined*/
  useEffect(() => {
    setLocalMediaBlobUrl(mediaBlobUrl !== undefined ? mediaBlobUrl : null);
  }, [mediaBlobUrl]);

  /*Add the isRecording and handleStopCalled states*/
  const [isRecording, setIsRecording] = useState(false);
  /*Add the handleStopCalled state to check if the handleStop function has been called*/
  const [handleStopCalled, setHandleStopCalled] = useState(false);

  useEffect(() => {
    if (
      localMediaBlobUrl &&
      mediaBlobUrl &&
      !isRecording &&
      !handleStopCalled
    ) {
      handleStop(localMediaBlobUrl);
      /*Reset the localMediaBlobUrl after traitment*/
      setLocalMediaBlobUrl(null);
    }
  }, [localMediaBlobUrl]);
/*Add SpeechRecogniton API to start and stop recording with voice commands*/
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API is not supported in this browser.');
      return;
    }

    /*Create a new instance of SpeechRecognition*/
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      console.log('Transcription: ', transcript);

      /*Add voice commands to start and stop recording*/
      if (transcript.toLowerCase() === 'hey rachel') {
        console.log('Commande détectée : hey rachel');
        startRecording();
        setIsRecording(true);
      } else if (transcript.toLowerCase() === 'stop') {
        console.log('Commande détectée : stop');
        stopRecording();
        setIsRecording(false);
      }
    };

    recognition.start();

    /*Restart the recognition every 30 seconds*/
    const restartRecognition = () => {
      console.log('Restarting speech recognition...');
      recognition.start();
    };

    setInterval(restartRecognition, 30000);

    /*Stop the recognition when the component is unmounted*/
    return () => {
      recognition.stop();
    };
  }, [startRecording, stopRecording]);

  /*Add the start and stop recording functions*/
  const handleMouseDown = () => {
    startRecording();
    setIsRecording(true);
  };

  const handleMouseUp = () => {
    stopRecording();
    setIsRecording(false);
  };

  /*Reset the handleStopCalled state when the recording is started*/
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
        className='bg-white p-4 rounded-full shadow-lg'
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
