import requests
from decouple import config

ELEVEN_LABS_API_KEY = config("ELEVEN_LABS_API_KEY")


# 1ns94GwK9YDCJoL6Nglv Nicolas
# AmMsHJaCw4BtwV3KoUXF Sam
def convert_text_to_speech(message, selected_voice):
    body = {"text": message, "voice_settings": {"stability": 0, "similarity_boost": 0}}

    # Map the voice name to the corresponding ID
    voice_mapping = {
        "Shaun": "zr8KTOWwGVdfwNMcTtgs",
        "Jarvis": "1ns94GwK9YDCJoL6Nglv",
        "Antoni": "DZyyFMXNpavMudLSm7A9",
        "Sarah": "yi1Q6GP2jWKJk3kJ1uIS",
        # Add more voices as needed
    }

    # Get the corresponding ID for the selected voice
    selected_voice_id = voice_mapping.get(selected_voice)

    if not selected_voice_id:
        # Handle the case where the selected voice is not recognized
        return

    headers = {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json",
        "accept": "audio/mpeg",
    }
    print("selected_voice_id", selected_voice_id)
    shaun_number = voice_mapping.get("Shaun")
    print("Le numéro de Shaun est :", shaun_number)

    endpoint = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice_id}"

    try:
        response = requests.post(endpoint, json=body, headers=headers)
    except Exception as e:
        # Handle the exception
        return

    if response.status_code == 200:
        return response.content
    else:
        # Handle the case where the request to Eleven Labs API fails
        return
