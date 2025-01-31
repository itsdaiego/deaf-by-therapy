# Deaf by Therapy

A therapy session that might kill you wielding the power of sarcasm.

![image](https://github.com/user-attachments/assets/81df5e98-3574-4f5f-b103-284f223f20dc)

Voice: [Elevenlabs](https://elevenlabs.io/)
Video: [Wav2Lip](https://elevenlabs.io/)
Text:  [Anthropic](https://www.anthropic.com/api)


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

3. When running wav2lip

you'll need to download the model and set it all up yourself to run locally or on a server :) 
