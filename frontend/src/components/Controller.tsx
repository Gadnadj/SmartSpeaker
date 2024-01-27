import { useState } from 'react';
import Title from './Title';
import axios from 'axios';
import RecordMessage from './RecordMessage';

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Jarvis');

  const availableVoices = [
    { id: 'Jarvis', name: 'Jarvis' },
    { id: 'shaun', name: 'Shaun' },
    { id: 'antoni', name: 'Antoni' },
    { id: 'sarah', name: 'Sarah' },
  ];

  const handleVoiceChange = (voiceID: string) => {
    console.log('Voice changed to:', voiceID);
    setSelectedVoice((prevVoice) => {
      console.log('Selected voice:', voiceID);
      return voiceID;
    });
  };

  function createBlobURL(data: any) {
    const blob = new Blob([data], { type: 'audio/mpeg' });
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    // Append recorded message to messages
    const myMessage = { sender: 'me', blobUrl };
    const messagesArr = [...messages, myMessage];

    // convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct audio to send file
        const formData = new FormData();
        formData.append('file', blob, 'myFile.wav');

        // send form data to api endpoint
        await axios
          .post('http://localhost:8000/post-audio', formData, {
            params: { voice: selectedVoice },
            headers: {
              'Content-Type': 'audio/mpeg',
            },
            responseType: 'arraybuffer', // Set the response type to handle binary data
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobURL(blob);

            // Append to audio
            const speakerMessage = {
              sender: selectedVoice,
              blobUrl: audio.src,
            };
            messagesArr.push(speakerMessage);
            setMessages(messagesArr);

            // Play audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err: any) => {
            console.error(err);
            setIsLoading(false);
          });
      });
  };

  return (
    <div className='h-screen overflow-y-hidden'>
      {/* Title */}
      <Title setMessages={setMessages} selectedVoice={selectedVoice} />

      {/* Button of selection voices */}
      <div className='text-center mt-3'>
        {availableVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleVoiceChange(voice.id)}
            className={`mx-2 px-4 py-2 ${
              selectedVoice === voice.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-black'
            }`}
          >
            {voice.name}
          </button>
        ))}
      </div>

      {/* Flex container */}
      <div className='flex flex-col justify-between h-full overflow-y-scroll pb-96'>
        {/* Conversation */}
        <div className='mt-5 px-5'>
          {messages?.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={`flex flex-col ${
                  audio.sender === 'Jarvis' ? 'flex items-end' : ''
                } ${audio.sender === 'antoni' ? 'flex items-end' : ''} ${
                  audio.sender === 'sarah' ? 'flex items-end' : ''
                } ${audio.sender === 'shaun' ? 'flex items-end' : ''}`}
              >
                {/* Sender */}
                <div className='mt-4 '>
                  <p
                    className={
                      audio.sender === 'Jarvis' ||
                      audio.sender === 'antoni' ||
                      audio.sender === 'sarah' ||
                      audio.sender === 'shaun'
                        ? 'text-right mr-2 italic text-green-500'
                        : 'ml-2 italic text-blue-500'
                    }
                  >
                    {audio.sender}
                  </p>

                  {/* Message */}
                  <audio
                    src={audio.blobUrl}
                    className='appearance-none'
                    controls
                  />
                </div>
              </div>
            );
          })}

          {messages.length === 0 && !isLoading && (
            <div className='text-center font-light italic mt-10'>
              Send {selectedVoice} a message...{' '}
              {/* Dynamically display selected voice */}
            </div>
          )}

          {isLoading && (
            <div className='text-center font-light italic mt-10 animate-pulse'>
              Wait a few seconds...
            </div>
          )}
        </div>

        {/* Recorder */}
        <div className='fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500'>
          <div className='flex justify-center items-center w-full'>
            <div>
              <RecordMessage
                handleStop={handleStop}
                selectedVoice={selectedVoice}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
