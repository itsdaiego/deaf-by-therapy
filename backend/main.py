import asyncio
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
import httpx
import os
from pathlib import Path
from elevenlabs.client import ElevenLabs
from elevenlabs import Voice, VoiceSettings
from dotenv import load_dotenv

load_dotenv()

eleven_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_DIR = Path("media")
MEDIA_DIR.mkdir(exist_ok=True)
(MEDIA_DIR / "audio").mkdir(exist_ok=True)
(MEDIA_DIR / "video").mkdir(exist_ok=True)

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
8. Don't use any sort of language that attempts to express human emotions, for example: *clears throat*, *sighs*, *straightens glasses* ,  etc.
9. Don't use asterisks (*) or any other symbols to indicate actions or emotions
10. Keep it short, you should act like you're tweeting your responses

Example responses:
 - "Yeah sure, I'm sure Freud would have a field day with that one. Have you tried talking to your inner child?"
"""


CONVERSATION_HISTORY = [
    {
        "role": "assistant",
        "content": "Hello I am a therapist bot. How can I help you today?"
    },
]

@app.post("/api/chat")
async def chat(message: ChatMessageRequest):
    try:
        CONVERSATION_HISTORY.append({
            "role": "user",
            "content": message.message
        })

        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=150,
            temperature=0.9,
            system=SYSTEM_PROMPT,
            messages=CONVERSATION_HISTORY
        )

        CONVERSATION_HISTORY.append({
            "role": "assistant",
            "content": response.content[0].text
        })

        return {"response": response.content[0].text}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def generate_speech(text: str, talk_id: str) -> str:
    """Generate speech using ElevenLabs and save to file"""
    try:
        voice_id = os.getenv("ELEVENLABS_VOICE_ID", "LcfcDJNUP1GQjkzn1xUU")

        audio_stream = eleven_client.generate(
            text=text,
            voice=Voice(
                voice_id=voice_id,
                settings=VoiceSettings(stability=0.5, similarity_boost=0.75)
            ),
            model="eleven_monolingual_v1"
        )

        if not os.path.exists("media/audio/talk_sample.wav"):
            with open("media/audio/talk_sample.wav", "wb") as f:
                for chunk in audio_stream:
                    f.write(chunk)

        # with open("media/audio/talk_sample.wav", "rb") as f:
            #     audio_stream = [f.read()]


        audio_path = MEDIA_DIR / "audio" / f"{talk_id}.wav"

        audio_data = b''
        for chunk in audio_stream:
            audio_data += chunk

        with open(audio_path, 'wb') as f:
            f.write(audio_data)

        return str(audio_path)
    except Exception as e:
        print(f"Error generating speech: {str(e)}")
        raise

async def generate_video(audio_path: str, talk_id: str) -> str:
    """Generate lip-synced video using Wav2Lip"""
    try:
        input_image = MEDIA_DIR / "image/therapist.png"
        output_path = MEDIA_DIR / "video" / f"{talk_id}.mp4"

        output_path.parent.mkdir(parents=True, exist_ok=True)

        process = await asyncio.create_subprocess_exec(
            'python',
            'wav2lip/inference.py',
            '--checkpoint_path', 'wav2lip/checkpoints/wav2lip_gan.pth',
            '--face', str(input_image),
            '--audio', str(audio_path),
            '--outfile', str(output_path),
            '--nosmooth',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        print(f"Starting video generation for {talk_id}...")

        async def read_stream(stream, prefix):
            while True:
                line = await stream.readline()
                if not line:
                    break
                print(f"{prefix}: {line.decode().strip()}")

        await asyncio.gather(
            read_stream(process.stdout, "OUT"),
            read_stream(process.stderr, "ERR")
        )

        return_code = await process.wait()
        if return_code != 0:
            raise Exception("Failed to generate video")

        print(f"Video generation completed for {talk_id}")
        return str(output_path)
    except Exception as e:
        print(f"Error generating video: {str(e)}")
        raise



@app.post("/api/avatar/speak")
async def generate_avatar_speech(request: SpeechRequest):
    try:
        talk_id = f"talk_{os.urandom(8).hex()}"

        audio_path = await generate_speech(request.text, talk_id)

        asyncio.create_task(generate_video(audio_path, talk_id))

        return {"id": talk_id}
    except Exception as e:
        print(f"Error generating avatar speech: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/avatar/speak/{id}")
async def get_avatar_speech(id: str):
    try:
        video_path = MEDIA_DIR / "video" / f"{id}.mp4"
        print("Video path", video_path)
        if not os.path.exists(video_path):
            return {"status": "processing"}

        return {
            "status": "done",
            "video_url": f"/media/video/{id}.mp4"
        }
    except Exception as e:
        print(f"Error getting avatar speech: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.staticfiles import StaticFiles
app.mount("/media", StaticFiles(directory="media"), name="media")
