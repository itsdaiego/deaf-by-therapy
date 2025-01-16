# Deaf by Therapy - The Roasting Therapist Chatbot

A humorous chatbot that plays a sarcastic therapist, providing not-so-helpful advice with style. Features a modern UI with an animated face and a chat interface.

## Features

- 🎭 Animated therapist face that reacts to the conversation
- 💬 Real-time chat interface
- 🌙 Dark mode UI
- 🔥 Sarcastic and roasting responses
- ⚡ Fast and responsive

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI
- UI Framework: Material-UI
- Animations: Framer Motion

## Setup

### Backend

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
cd backend
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Start chatting with your sarcastic therapist
3. Enjoy the not-so-helpful advice! 