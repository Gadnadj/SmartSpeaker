import { useState } from 'react';
import Title from './Title';
import axios from 'axios';
import RecordMessage from './RecordMessage';
import Select from 'react-select'; // Assurez-vous d'avoir installé react-select
import { SingleValue, ActionMeta } from 'react-select';

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Jarvis');
  const [selectedGame, setSelectedGame] = useState(null); // Ajout pour gérer le jeu sélectionné

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
    { value: 'game3', label: 'Collaborative Storytelling' },
    { value: 'game3', label: 'Hangman' },
    { value: 'game3', label: 'Find the Synonym or Antonym' },
    { value: 'game3', label: 'Word Games' },
    { value: 'game3', label: 'Charades' },
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
    console.log(selectedVoice);

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
        'http://localhost:8000/post-text',
        { text, voice },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      const audioUrl = createBlobURL(response.data);

      // Créer un nouvel objet de message contenant l'URL de l'audio
      const audioMessage = { sender: 'Jarvis', blobUrl: audioUrl };

      // Ajouter le nouvel objet de message à la liste des messages
      setMessages((prevMessages) => [...prevMessages, audioMessage]);

      // Lancer automatiquement la lecture de l'audio
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la sélection du jeu :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen overflow-y-hidden'>
      {/* Title */}
      <Title setMessages={setMessages} selectedVoice={selectedVoice} />

      {/* Liste déroulante pour la sélection des jeux, positionnée en haut à droite */}
      <div className='absolute top-0 right-12 m-2'>
        <Select
          options={availableGames}
          onChange={handleGameSelection}
          value={selectedGame}
          placeholder='Choose a game'
          className='w-64' // Largeur fixe, ajustez selon vos besoins
        />
      </div>

      {/* Button of selection voices */}
      <div className='text-center mt-3'>
        {availableVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleVoiceChange(voice.id)}
            /*Personalize theme for voices */
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

      {/* Flex container */}
      <div className='flex flex-col justify-between h-full overflow-y-scroll pb-96'>
        {/* Conversation */}
        <div className='mt-5 px-5'>
          {messages?.map((audio, index) => (
            <div
              key={index + audio.sender}
              className={`flex flex-col ${
                audio.sender === 'Jarvis' ? 'items-end' : ''
              } ${audio.sender === 'Antoni' ? 'items-end' : ''} ${
                audio.sender === 'Sarah' ? 'items-end' : ''
              } ${audio.sender === 'Shaun' ? 'items-end' : ''}`}
            >
              {/* Sender */}
              <div className='mt-4'>
                <p
                  className={
                    audio.sender === 'Jarvis' ||
                    audio.sender === 'Antoni' ||
                    audio.sender === 'Sarah' ||
                    audio.sender === 'Shaun'
                      ? 'text-right mr-2 italic text-pink-500'
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

        {/* Recorder */}
        <div className='fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-indigo-500'>
          <div className='flex justify-center items-center w-full '>
            <div>
              <RecordMessage
                handleStop={handleStop}
                //selectedVoice={selectedVoice}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
