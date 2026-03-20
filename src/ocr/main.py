from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import cv2
import numpy as np
import io

app = FastAPI()

# Enable CORS for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR (English)
reader = easyocr.Reader(['en'])

@app.post("/extract-id-data")
async def extract_data(file: UploadFile = File(...)):
    try:
        # Read and Decode Image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Basic Image Pre-processing (Grayscale for better OCR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # OCR Processing
        results = reader.readtext(gray, detail=0)
        
        extracted = {
            "last_name": "",
            "first_name": "",
            "middle_name": "",
            "suffix": ""
        }

        # Enhanced Parsing Logic for PhilID / Philippine Driver's License
        for i, text in enumerate(results):
            text_upper = text.upper()
            
            # Look for Surname / Last Name
            if "SURNAME" in text_upper or "LAST NAME" in text_upper:
                if i + 1 < len(results):
                    extracted["last_name"] = results[i+1].strip()

            # Look for Given Names / First Name
            if "GIVEN NAME" in text_upper or "FIRST NAME" in text_upper:
                if i + 1 < len(results):
                    extracted["first_name"] = results[i+1].strip()

            # Look for Middle Name
            if "MIDDLE NAME" in text_upper:
                if i + 1 < len(results):
                    extracted["middle_name"] = results[i+1].strip()

        return extracted

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)