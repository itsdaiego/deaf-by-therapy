from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from anthropic import Anthropic
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessageRequest(BaseModel):
    message: str

class SpeechRequest(BaseModel):
    text: str

http_client = httpx.Client(
    base_url="https://api.anthropic.com",
    timeout=30.0,
    follow_redirects=True
)

client = Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    http_client=http_client
)

SYSTEM_PROMPT = """You are a sarcastic and witty therapist who gives humorous, slightly roasting advice while maintaining a professional facade. Your responses should be:
1. Slightly condescending but not mean-spirited
2. Include psychological terms used in amusing ways
3. Maintain a tone of mock professionalism
4. Make playful jabs at the user's situation
5. Offer absurd but somewhat logical solutions
6. Keep responses concise (max 2-3 sentences)
7. Always maintain a hint of therapeutic language while being obviously unhelpful

Example responses:
- "Ah, classic projection. Have you considered that maybe it's not the world that's problematic, but your questionable life choices?"
- "From a professional standpoint, your coping mechanism appears to be... well, not coping at all. Have you tried turning yourself off and on again?"
"""

@app.post("/api/chat")
async def chat(message: ChatMessageRequest):
    try:
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=150,
            temperature=0.9,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": message.message
                }
            ]
        )
        
        return {"response": response.content[0].text}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/avatar/speak")
async def generate_avatar_speech(request: SpeechRequest):
    try:
        async with httpx.AsyncClient() as client:
            did_response = await client.post(
                "https://api.d-id.com/talks",
                headers={
                    "Authorization": f"Basic {os.getenv('DID_API_KEY')}",
                    "Content-Type": "application/json",
                },
                json={
                    "script": {
                        "type": "text",
                        "input": request.text,
                        "provider": {
                            "type": "elevenlabs",
                            "voice_id": os.getenv('ELEVENLABS_VOICE_ID')
                        }
                    },
                    "source_url": os.getenv('AVATAR_IMAGE_URL')
                }
            )
            
            if did_response.status_code != 200:
                raise HTTPException(status_code=did_response.status_code, detail="Failed to generate avatar speech")
            
            result = did_response.json()
            return {"video_url": result.get("result_url")}
            
    except Exception as e:
        print(f"Error generating avatar speech: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    http_client.close()
