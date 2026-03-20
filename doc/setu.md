cd src
cd ocr
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn easyocr opencv-python-headless numpy python-multipart
uvicorn main:app --reload --port 8000