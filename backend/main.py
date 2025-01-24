from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
8. Don't use any sort of language that attempts to express human emotions, for example: *clears throat*, *sighs*, etc.

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


LIVE_MODE = False

@app.post("/api/avatar/speak")
async def generate_avatar_speech(request: SpeechRequest):
    try:
        if LIVE_MODE:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.d-id.com/talks",
                        headers={
                            "Authorization": f"Basic {os.getenv('DID_API_KEY')}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "script": {
                                "type": "text",
                                "input": request.text,
                                # "provider": {
                                #     "type": "elevenlabs",
                                #     "voice_id": os.getenv('ELEVENLABS_VOICE_ID')
                                # }
                            },
                            "source_url": os.getenv('AVATAR_IMAGE_URL')
                        }
                    )

                response_json = response.json()

                if response.status_code != 201:
                    print(f"D-ID API Error: Status {response.status_code}")
                    print(f"Response body: {response_json}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"D-ID API Error: {response_json}"
                    )

                return {"video_url": response_json.get("result_url")}
            except httpx.HTTPError as e:
                print(f"HTTP Error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"HTTP Error: {str(e)}")

        mock_response = {
            "user": {
                "features": [
                    "stitch",
                    "clips:write",
                    "scene",
                    "premium-plus:skip-speaker-validation",
                ],
                "stripe_plan_group": "deid-trial",
                "authorizer": "basic",
                "owner_id": "google-oauth2|113759824665234992082",
                "id": "google-oauth2|113759824665234992082",
                "plan": "deid-trial",
                "email": "dyego9444@gmail.com"
            },
            "script": {
                "type": "text",
                "length": 339,
                "subtitles": False
            },
            "metadata": {
                "driver_url": "bank://natural/driver-4/original",
                "mouth_open": False,
                "num_faces": 1,
                "num_frames": 506,
                "processing_fps": 80.61672752486093,
                "resolution": [
                    512,
                    512
                ],
                "size_kib": 4815.6181640625
            },
            "audio_url": "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C113759824665234992082/tlk_W3vxWIxkPq1sliMY6aBfL/microsoft.wav?AWSAccessKeyId=AKIA5CUMPJBIK65W6FGA&Expires=1737768381&Signature=kHHuWIVth%2BjJv0XRumZaaO5RwPc%3D",
            "created_at": "2025-01-24T01:26:21.352Z",
            "face": {
                "mask_confidence": -1,
                "detection": [
                    435,
                    95,
                    620,
                    389
                ],
                "overlap": "no",
                "size": 407,
                "top_left": [
                    324,
                    39
                ],
                "face_id": 0,
                "detect_confidence": 0.999882698059082
            },
            "config": {
                "stitch": False,
                "pad_audio": 0,
                "align_driver": True,
                "sharpen": True,
                "reduce_noise": False,
                "auto_match": True,
                "normalization_factor": 1,
                "show_watermark": True,
                "motion_factor": 1,
                "result_format": ".mp4",
                "fluent": False,
                "align_expand_factor": 0.3
            },
            "source_url": "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C113759824665234992082/tlk_W3vxWIxkPq1sliMY6aBfL/source/675d715d0aab82b6b53bb153-HeadshotPro-1024x832.png?AWSAccessKeyId=AKIA5CUMPJBIK65W6FGA&Expires=1737768381&Signature=LGZlQnRFMW1dF08xh1Ffcj%2BEInk%3D",
            "created_by": "google-oauth2|113759824665234992082",
            "status": "done",
            "driver_url": "bank://natural/",
            "modified_at": "2025-01-24T01:26:29.781Z",
            "user_id": "google-oauth2|113759824665234992082",
            "subtitles": False,
            "id": "tlk_W3vxWIxkPq1sliMY6aBfL",
            "duration": 20.25,
            "started_at": "2025-01-24T01:26:21.407",
            "result_url": "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C113759824665234992082/tlk_W3vxWIxkPq1sliMY6aBfL/1737681981352.mp4?AWSAccessKeyId=AKIA5CUMPJBIK65W6FGA&Expires=1737768389&Signature=x2ZUixoL3YZgu%2BeKxTv%2F3t7jNEo%3D"
        }

        return {"video_url": mock_response.get("result_url")}


    except Exception as e:
        print(f"Error generating avatar speech: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/avatar/speak/{id}")
async def get_avatar_speech(id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.d-id.com/talks/{id}",
                headers={
                    "Authorization": f"Basic {os.getenv('DID_API_KEY')}"
                }
            )

            if response.status_code != 200:
                print(f"D-ID API Error: Status {response.status_code}")
                print(f"Response body: {response_json}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"D-ID API Error: {response_json}"
                )

            return {"video_url": response.json().get("result_url")}

    except httpx.HTTPError as e:
        print(f"HTTP Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"HTTP Error: {str(e)}")
    except Exception as e:
        print(f"Error getting avatar speech: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))
