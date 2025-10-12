from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from ultralytics import YOLO
import tensorflow as tf
import numpy as np
from PIL import Image, ImageDraw
import os, io, shutil

# ==========================================================
# Paths
# ==========================================================
ENHANCER_PATH = "model.h5"   # your trained CycleGAN Generator
DETECTOR_PATH = "best.pt"             # your YOLO detection model
UPLOAD_FOLDER = "uploads"
ENHANCED_FOLDER = "enhanced"
RESULT_FOLDER = "results"

for folder in [UPLOAD_FOLDER, ENHANCED_FOLDER, RESULT_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# ==========================================================
# Load Models
# ==========================================================
print(" Loading models...")
enhancer = tf.keras.models.load_model(ENHANCER_PATH, compile=False)
detector = YOLO(DETECTOR_PATH)
print(" Models loaded successfully!")

# ==========================================================
# App
# ==========================================================
app = FastAPI(title="Image Enhancement + YOLOv8 Detection API")

# Image Preprocess / Postprocess
IMG_HEIGHT, IMG_WIDTH = 256, 256

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_WIDTH, IMG_HEIGHT))
    arr = np.array(img) / 127.5 - 1.0
    return np.expand_dims(arr, axis=0), img

def postprocess_image(pred):
    pred = (pred[0] + 1) / 2.0
    pred = np.clip(pred * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(pred)

@app.get("/")
def home():
    return {"message": "🚀 API is running! Upload an image to /predict"}

# ==========================================================
# Main Endpoint
# ==========================================================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Step 1: Save uploaded blurred image
        upload_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Step 2: Enhance image
        with open(upload_path, "rb") as f:
            image_bytes = f.read()
        inp_tensor, _ = preprocess_image(image_bytes)
        enhanced_pred = enhancer.predict(inp_tensor)
        enhanced_img = postprocess_image(enhanced_pred)

        # Save enhanced image
        enhanced_path = os.path.join(ENHANCED_FOLDER, f"enh_{file.filename}")
        enhanced_img.save(enhanced_path)

        # Step 3: Run YOLO Detection
        results = detector.predict(source=enhanced_path, conf=0.25, verbose=False)

        # Step 4: Draw detections
        img = Image.open(enhanced_path).convert("RGB")
        draw = ImageDraw.Draw(img)

        if len(results[0].boxes) == 0:
            return {"message": "No objects detected after enhancement"}

        for box in results[0].boxes.data.tolist():
            x1, y1, x2, y2, conf, cls = box
            label = detector.names[int(cls)]
            draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
            draw.text((x1, y1 - 10), f"{label} {conf:.2f}", fill="yellow")

        result_path = os.path.join(RESULT_FOLDER, f"result_{file.filename}")
        img.save(result_path)

        return FileResponse(result_path)

    except Exception as e:
        return JSONResponse(content={"error": str(e)})

