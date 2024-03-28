import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from './Title';
import axios from 'axios';
import RecordMessage from './RecordMessage';
import Select, { SingleValue } from 'react-select';
import { ActionMeta } from 'react-select';

const Deaf = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Jarvis');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isDisabilityMenuOpen, setIsDisabilityMenuOpen] = useState(false);
  const disabilityMenuRef = useRef<HTMLDivElement>(null);

  const availableVoices = [
    { id: 'Jarvis', name: 'Jarvis' },
    { id: 'Shaun', name: 'Shaun' },
    { id: 'Antoni', name: 'Antoni' },
    { id: 'Sarah', name: 'Sarah' },
  ];

  const availableGames = [
    { value: 'game1', label: 'Riddles and Puzzles' },
    { value: 'game2', label: '20 Questions' },
    { value: 'game3', label: 'Quiz' },
    { value: 'game4', label: 'Collaborative Storytelling' },
    { value: 'game5', label: 'Hangman' },
    { value: 'game6', label: 'Find the Synonym or Antonym' },
    { value: 'game7', label: 'Word Games' },
    { value: 'game8', label: 'Charades' },
  ];

  const handleVoiceChange = (voiceID: string) => {
    setSelectedVoice(voiceID);
  };

  const handleGameSelection = async (
    newValue: SingleValue<{ value: string; label: string } | null>,
    actionMeta: ActionMeta<{ value: string; label: string } | null>
  ) => {
    if (!newValue) return;

    setIsLoading(true);
    try {
      const text = `let's play ${newValue.label} together`;
      const voice = selectedVoice;

      const response = await axios.post(
        'http://localhost:8000/post-text-game/',
        { text, voice },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'text', // Change responseType to 'text'
        }
      );

      // Assuming response.data contains the text response from the server
      const textResponse = response.data;
      const textMessage = { sender: 'Jarvis', content: textResponse }; // Use content instead of blobUrl for text messages
      setMessages((prevMessages) => [...prevMessages, textMessage]);
    } catch (error) {
      console.error('Error occurred during game selection post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);
    const myMessage = { sender: 'me', blobUrl };
    const messagesArr = [...messages, myMessage];

    // Fetch the audio blob
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Create a FormData object and append the audio blob
        const formData = new FormData();
        formData.append('file', blob, 'myFile.wav');

        try {
          // Send the audio file to the backend for processing
          const response = await axios.post(
            'http://localhost:8000/post-text-text',
            formData,
            {
              params: { voice: selectedVoice },
              headers: {
                'Content-Type': 'audio/mpeg',
              },
            }
          );

          // Extract the transcribed text from the response
          const transcribedText = response.data;

          // Add the transcribed text to messages
          const speakerMessage = {
            sender: 'Jarvis', // Assuming the response is from the Jarvis AI
            content: transcribedText,
          };
          messagesArr.push(speakerMessage);
          setMessages(messagesArr);

          setIsLoading(false);
        } catch (error) {
          console.error('Error occurred while processing audio:', error);
          setIsLoading(false);
        }
      });
  };

  function createBlobURL(data: any) {
    const blob = new Blob([data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  const toggleDisabilityMenu = () => {
    setIsDisabilityMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      disabilityMenuRef.current &&
      !disabilityMenuRef.current.contains(event.target as Node)
    ) {
      setIsDisabilityMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleDisabilityOption = (option: string) => {
    console.log('Selected disability option:', option);
  };

  const handleSourdMalentendantOption = () => {
    navigate('/deaf');
  };

  return (
    <div className='h-screen overflow-y-hidden'>
      <Title setMessages={setMessages} selectedVoice={selectedVoice} />
      <p className='font-bold text-gray-800 text-center text-3xl'>
        Deaf and Hard of Hearing
      </p>

      <div className='absolute top-0 right-12 m-2'>
        <Select
          options={availableGames}
          onChange={handleGameSelection}
          value={selectedGame}
          placeholder='Choose a game'
          className='w-64'
        />
      </div>

      <div className='text-center mt-3'>
        {availableVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleVoiceChange(voice.id)}
            className={`mx-2 px-4 py-2 transition duration-300 ease-in-out ${
              selectedVoice === voice.id
                ? voice.name === 'Sarah'
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                : voice.name === 'Sarah'
                ? 'bg-gray-300 hover:bg-pink-300 text-black '
                : 'bg-gray-300 text-black hover:bg-sky-300'
            }`}
          >
            {voice.name}
          </button>
        ))}
      </div>

      <div className='flex flex-col justify-between h-full overflow-y-scroll pb-96'>
        <div className='mt-5 px-5'>
          {messages?.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                message.sender === 'Jarvis' ? 'items-end' : ''
              }`}
            >
              <div className='mt-4'>
                {message.sender === 'Jarvis' ? (
                  <div className='text-right mr-2 italic text-pink-500'>
                    {message.sender}
                  </div>
                ) : (
                  <div className='ml-2 italic text-blue-500'>
                    {message.sender}
                  </div>
                )}
                {message.blobUrl ? (
                  <audio controls className='ml-2'>
                    <source src={message.blobUrl} type='audio/mpeg' />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className='ml-2'>{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {messages.length === 0 && !isLoading && (
            <div className='text-center font-light italic mt-10'>
              Send {selectedVoice} a message...
            </div>
          )}

          {isLoading && (
            <div className='text-center font-light italic mt-10 animate-pulse'>
              Wait a few seconds...
            </div>
          )}
        </div>

        <div className='fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-indigo-500'>
          <div className='flex justify-center items-center w-full'>
            <div>
              <RecordMessage handleStop={handleStop} />
            </div>
          </div>
        </div>
        <div
          className='fixed left-0 top-1/2 transform -translate-y-1/2 ml-2'
          ref={disabilityMenuRef}
        >
          <button
            onClick={toggleDisabilityMenu}
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50'
          >
            <img
              src='https://media.istockphoto.com/id/1459736320/vector/disabled-sign-and-symbol-vector-illustration-handicap-parking-sign.jpg?s=612x612&w=0&k=20&c=dCoZ5kX3837N1I2HvkJtkmLs4S7fenTh0ZzpsLzzjI4='
              alt='Handicap'
              className='w-6 h-6 rounded-full mr-2'
            />
          </button>
          {isDisabilityMenuOpen && (
            <div className='absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-white p-2 rounded-lg shadow-md'>
              <button
                onClick={handleSourdMalentendantOption}
                className='block w-full text-left px-4 py-2 hover:bg-gray-100'
              >
                <img
                  src='https://stickair.com/38341-large_default/sourds-et-malentendants.jpg'
                  alt='Sourds et malentendants'
                  className='w-12 h-12 rounded-full mr-2'
                />
                Sourds
              </button>
              <button
                onClick={() =>
                  handleDisabilityOption('Pour les personnes muettes')
                }
                className='block w-full text-left px-4 py-2 hover:bg-gray-100'
              >
                <img
                  src='https://www.virages.com/Images/Categorie_A8/27819-500.gif'
                  alt='Personnes muettes'
                  className='w-12 h-12 rounded-full mr-2'
                />
                Muets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deaf;
