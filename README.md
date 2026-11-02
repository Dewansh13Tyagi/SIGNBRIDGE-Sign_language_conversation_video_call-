# SignBridge – AI-Powered Sign Language Conversation & Video Calling

**Breaking communication barriers through AI-powered sign language recognition and real-time video communication.**

SignBridge is an accessibility-focused application that combines a React-based video calling interface with a Python-powered sign language recognition system. It enables users to communicate through video calls, recognize sign language gestures in real time, display recognized words as live captions, and convert transcripts into speech.

The project integrates computer vision, deep learning, real-time communication, and web technologies to make digital communication more inclusive for people with hearing and speech impairments.

## Key Features

- **Real-Time Sign Language Recognition:** Detects and interprets hand gestures using MediaPipe and a trained deep learning model.
- **Video Calling:** Provides a React-based video conferencing interface.
- **Live Captions:** Displays recognized sign language words as real-time text.
- **Text-to-Speech:** Converts recognized transcripts into spoken language using browser-supported speech synthesis.
- **Deep Learning Model:** Uses a GRU-based sequence classification architecture with attention.
- **Webcam Testing:** Allows independent testing of sign recognition through a webcam.
- **REST API Integration:** Connects the React frontend with the Python FastAPI backend.
- **Cloud Deployment:** Supports frontend deployment on Vercel and backend deployment on Render.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Backend | Python, FastAPI |
| Machine Learning | TensorFlow, Keras |
| Computer Vision | OpenCV, MediaPipe |
| Deep Learning | GRU, Attention Mechanism |
| Communication | ZEGO Video Call SDK |
| API | REST APIs |
| Deployment | Vercel, Render, Docker |
| Version Control | Git, GitHub |

## Model Overview

SignBridge uses a word-level sign language recognition model trained on a custom gesture video dataset.

**Current Model Specifications:**

- 46 word classes
- 410 gesture videos
- Word-level gesture recognition
- MediaPipe hand landmark extraction
- Motion-aware sequence feature processing
- Data augmentation for improved generalization
- GRU-based sequence classification with an attention mechanism

**Model Workflow:**

1. Capture video frames through the webcam.
2. Extract hand landmarks using MediaPipe.
3. Process and normalize landmark sequences.
4. Extract motion-aware features.
5. Pass the sequence into the trained GRU + Attention model.
6. Predict the corresponding sign language word.
7. Display the recognized word as a caption.
8. Optionally convert the transcript into speech.

**Note:** The current model recognizes gestures from its trained vocabulary. It does not provide unrestricted sign language translation or alphabet-by-alphabet spelling.

## Project Architecture

```text
SIGNBRIDGE/
│
├── Code/
│   ├── sign_language_api.py
│   ├── sign_language_core.py
│   ├── sign_language_webcam.py
│   ├── train_sign_model.py
│   ├── collect_landmark.py
│   ├── final.py
│   ├── word_dataset.py
│   ├── sign_language_word_model.keras
│   └── requirements.txt
│
├── lang_video_call/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── render.yaml
└── README.md
```

## Installation and Local Setup

### Prerequisites

Make sure you have installed:

- Python 3.10 or a compatible version supported by the dependencies
- Node.js and npm
- Git
- VS Code (recommended)
- A working webcam

### 1. Clone the Repository

```bash
git clone https://github.com/Dewansh13Tyagi/SIGNBRIDGE-Sign_language_conversation_video_call-.git

cd SIGNBRIDGE-Sign_language_conversation_video_call-
```

### 2. Set Up the Python Backend

Navigate to the backend directory:

```bash
cd Code
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Upgrade pip and install dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
python sign_language_api.py
```

Backend URL:

```text
http://127.0.0.1:8000
```

Health Check:

```text
http://127.0.0.1:8000/api/health
```

### 3. Set Up the React Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd lang_video_call
```

Create your environment file using the example:

```bash
copy .env.example .env
```

Install the frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Environment Variables

### Frontend Configuration

Create `lang_video_call/.env`:

```env
VITE_SIGN_API_URL=http://127.0.0.1:8000
VITE_ZEGO_APP_ID=YOUR_ZEGO_APP_ID
```

Do not expose your ZEGO Server Secret through a `VITE_` environment variable. Vite exposes variables with this prefix to browser code.

For production, generate ZEGO authentication tokens on the backend and keep the Server Secret in private backend environment variables.

### Backend Configuration

Configure the backend environment:

```env
SIGN_API_HOST=0.0.0.0
SIGN_API_PORT=8000
SIGN_API_ORIGINS=http://localhost:5173
```

For deployment, add your actual Vercel domain to `SIGN_API_ORIGINS`.

## Webcam-Only Testing

You can test the sign language recognition model independently without starting the React application.

Navigate to:

```bash
cd Code
```

Run:

```bash
python sign_language_webcam.py
```

**Available Controls:**

| Key | Action |
|---|---|
| S | Speak the transcript |
| C | Clear the transcript |
| Q | Quit the application |

## Model Training

The repository includes a training pipeline for retraining the model using the gesture dataset.

To retrain the model:

```bash
cd Code
python final.py
```

The training pipeline performs the following operations:

1. Extracts hand landmarks from gesture videos.
2. Processes and prepares sequence features.
3. Creates training and testing datasets.
4. Applies data augmentation.
5. Trains the GRU + Attention classification model.
6. Evaluates the trained model.
7. Saves the resulting model as `sign_language_word_model.keras`.

**Dataset Note:** The original gesture dataset is not included in the GitHub repository. You must restore the required `gestures/` dataset locally before retraining. The included trained model can be used for inference without the original training dataset.

## Deployment Guide

SignBridge uses separate deployment platforms for the frontend and backend.

| Component | Platform |
|---|---|
| React Frontend | Vercel |
| Python FastAPI Backend | Render |
| Containerization | Docker |

### 1. Deploy Backend on Render

The repository includes:

- `render.yaml`
- `Code/Dockerfile`
- `Code/.dockerignore`

Steps:

1. Push the repository to GitHub.
2. Open [Render](https://render.com/).
3. Select **New Web Service**.
4. Connect your GitHub repository.
5. Configure the service using the included `render.yaml` or Docker configuration.
6. Add the backend environment variables.
7. Deploy the application.

Example backend URL:

```text
https://your-api-name.onrender.com
```

Verify deployment:

```text
https://your-api-name.onrender.com/api/health
```

### 2. Deploy Frontend on Vercel

Steps:

1. Open [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Set the Root Directory to:

```text
lang_video_call
```

4. Configure the required environment variables:

```env
VITE_SIGN_API_URL=https://your-api-name.onrender.com
VITE_ZEGO_APP_ID=YOUR_ZEGO_APP_ID
```

5. Configure the ZEGO token integration securely through the backend.
6. Click **Deploy**.

Example frontend URL:

```text
https://your-project-name.vercel.app
```

The included `vercel.json` handles client-side routing for paths such as `/room/:id`.

## Deployment Checklist

Before sharing the application publicly, verify:

- [ ] Python backend is deployed successfully.
- [ ] Backend health endpoint responds correctly.
- [ ] React frontend is deployed on Vercel.
- [ ] Frontend API URL points to the deployed backend.
- [ ] CORS settings include the frontend domain.
- [ ] ZEGO application credentials are configured securely.
- [ ] Camera and microphone permissions are enabled.
- [ ] Video calling works across different devices.
- [ ] Live sign recognition and captions work correctly.
- [ ] Text-to-speech functionality works.

## Limitations and Future Improvements

Although SignBridge provides a working demonstration of AI-powered sign language communication, several improvements can make it more reliable and scalable.

**Current Limitations:**

- Recognition is restricted to the 46 trained word classes.
- The training dataset contains 410 gesture videos, which limits generalization.
- Recognition accuracy can vary depending on lighting, camera quality, and hand positioning.
- The system does not currently support unrestricted conversational sign language translation.
- Speech quality depends on the voices available in the user's browser and device.

**Future Enhancements:**

- Expand the gesture vocabulary with larger and more diverse datasets.
- Improve recognition accuracy and real-time inference performance.
- Support continuous sentence-level sign language recognition.
- Introduce Indian Sign Language (ISL) and American Sign Language (ASL) datasets.
- Add multilingual text-to-speech support.
- Optimize the model for mobile devices using TensorFlow Lite.
- Implement secure server-side authentication and token generation.
- Improve accessibility through enhanced UI and user experience.

## Why This Project?

SignBridge explores how Artificial Intelligence, Deep Learning, Computer Vision, and Real-Time Communication can work together to address accessibility challenges.

By combining gesture recognition with video communication, live captions, and speech synthesis, the project aims to make digital interactions more inclusive and accessible.

## References

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TensorFlow Documentation](https://www.tensorflow.org/)
- [MediaPipe Documentation](https://ai.google.dev/edge/mediapipe/solutions/guide)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

---

**Project:** SignBridge – Sign Language Conversation & Video Call

**Repository:** [GitHub – SIGNBRIDGE](https://github.com/Dewansh13Tyagi/SIGNBRIDGE-Sign_language_conversation_video_call-)

**Built with:** React, Python, FastAPI, TensorFlow, MediaPipe, and Deep Learning.

*An AI-powered step toward more inclusive communication.*
