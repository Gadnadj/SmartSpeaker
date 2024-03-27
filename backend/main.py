# source venv/bin/activate
# uvicorn main:app
# uvicorn main:app --reload

# Main imports
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
from pydantic import BaseModel  # Assurez-vous d'ajouter cette ligne
import openai
import logging

logging.basicConfig(level=logging.DEBUG)


# Custom function imports
from functions.text_to_speech import convert_text_to_speech
from functions.openai_requests import convert_audio_to_text, get_chat_response
from functions.database import store_messages, reset_messages


# Get Environment Vars
openai.organization = config("OPEN_AI_ORG")
openai.api_key = config("OPEN_AI_API_KEY")


# Initiate App
app = FastAPI()


# CORS - Origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
]


# CORS - Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str
    voice: str



# Check health
@app.get("/health")
async def check_health():
    return {"response": "healthy"}


# Reset Conversation
@app.get("/reset")
async def reset_conversation():
    reset_messages()
    return {"response": "conversation reset"}


import logging

@app.post("/post-text/")
async def post_text(request: TextRequest):
    try:
        # Log the received text
        logging.info(f"Received text: {request.text}")

        # Get chat response
        chat_response = get_chat_response(request.text)
        
        # Log the chat response
        logging.info(f"Chat response: {chat_response}")

        # Store messages
        store_messages(request.text, chat_response)
        
        # Convert chat response to audio
        audio_output = convert_text_to_speech(chat_response, selected_voice=request.voice)
        
        # Guard: Ensure chat response and audio output
        if not chat_response:
            raise HTTPException(status_code=400, detail="Failed chat response")
        if not audio_output:
            raise HTTPException(status_code=400, detail="Failed audio output")

        # Create a generator that yields chunks of data
        def iterfile():
            yield audio_output
        
        # Return output audio
        return StreamingResponse(iterfile(), media_type="application/octet-stream")
    except Exception as e:
        # Log any exceptions that occur
        logging.error(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# Post bot response
# Note: Not playing back in browser when using post request.
@app.post("/post-audio/")
async def post_audio(file: UploadFile = File(...), voice: str = "Jarvis"):
    # Convert audio to text - production
    # Save the file temporarily
    with open(file.filename, "wb") as buffer:
        buffer.write(file.file.read())
    audio_input = open(file.filename, "rb")

    # Decode audio
    message_decoded = convert_audio_to_text(audio_input)

    # Guard: Ensure output
    if not message_decoded:
        raise HTTPException(status_code=400, detail="Failed to decode audio")

    # Get chat response
    chat_response = get_chat_response(message_decoded)

    # Store messages
    store_messages(message_decoded, chat_response)

    # Guard: Ensure output
    if not chat_response:
        raise HTTPException(status_code=400, detail="Failed chat response")

    # Convert chat response to audio
    logging.debug(f"Converting text to speech with voice: {voice}")
    audio_output = convert_text_to_speech(chat_response, selected_voice=voice)
    print(voice)
    print(voice)
    print(voice)
    # ("audio output {}".format(audio_output))


    # Guard: Ensure output
    if not audio_output:
        print("Failed audio output {}".format(audio_output))
        logging.error("Failed audio output")
        raise HTTPException(status_code=400, detail="Failed audio output")

    # Create a generator that yields chunks of data
    def iterfile():
        yield audio_output

    # Use for Post: Return output audio
    return StreamingResponse(iterfile(), media_type="application/octet-stream")
