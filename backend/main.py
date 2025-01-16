from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

# Sarcastic/roasting responses
THERAPIST_RESPONSES = [
    "Wow, that's... interesting. Have you tried just not doing that?",
    "Sounds like a you problem. Have you considered becoming someone else?",
    "In my professional opinion, you need more drama in your life.",
    "Have you tried turning yourself off and on again?",
    "That's rough buddy. Maybe try watching cat videos?",
    "Fascinating. Let's explore why you think that's my problem.",
    "Sounds like you need a vacation... from yourself.",
    "Have you considered that maybe, just maybe, you're overthinking this?",
    "That's a perfectly normal reaction... for an alien trying to understand human emotions.",
    "Let me write that down in my 'things I pretend to care about' notebook.",
]

@app.post("/api/chat")
async def chat(message: ChatMessage):
    # For now, just return a random roasting response
    response = random.choice(THERAPIST_RESPONSES)
    return {"response": response}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Service is running"} 