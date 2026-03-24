cd src
cd ocr
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn easyocr opencv-python-headless numpy python-multipart
uvicorn main:app --reload --port 8000

env.local

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dems

# NextAuth
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=http://localhost:3000

NODE_ENV=development