# Smart Speaker

# Installation
Clone the project from my GitHub account: https://github.com/Gadnadj/SmartSpeaker.git

Create a terminal and git clone the project by entering this line: 
git clone https://github.com/Gadnadj/SmartSpeaker.git

Navigate to the frontend and backend directories in two separate terminals:

Terminal 1
cd frontend
npm install

Terminal 2
cd backend
npm install

# API Keys Configuration
Visit the OpenAI website to generate an API key: https://platform.openai.com/api-keys

In the settings, retrieve the organization key (Organization ID).

Visit the Eleven Labs website and obtain the API key: https://elevenlabs.io/

Create a .env file at the root of the project with the following lines:

OPEN_AI_ORG=your_organization_key
OPEN_AI_API_KEY=your_openai_api_key
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key

# Running the Project
Go back to the backend terminal and activate the virtual environment:

source venv/bin/activate

Start the backend server with:

uvicorn main:app

In the frontend terminal, launch the development server with yarn:

yarn dev

Open your browser and go to http://localhost:5173/.

Experience the interactive Jarvis Smart Speaker on your local environment! 🚀

![All components of the speaker](https://hackster.imgix.net/uploads/attachments/981698/1_9Ovnzl7yNZJsbMgM7Q6tdA.jpeg?auto=compress%2Cformat&w=740&h=555&fit=max)






<video width="320" height="240" controls>
  <source src="jarvis-marvel-s-iron-man-3-second-screen-experience-trailer-480-ytshorts.savetube.me.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>



