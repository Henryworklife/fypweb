"""
Combined Flask API for YOLOv11 Object Detection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import os
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for React frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load environment variables
load_dotenv()

# Configuration
MODEL_PATH = os.getenv('MODEL_PATH', '/Users/lauwaihin/Downloads/best-3.pt')  # Path to trained model
CONFIDENCE_THRESHOLD = 0.3  # Minimum confidence score

# Global model instance
model = None

def load_model():
    """Load YOLO model with proper error handling"""
    global model
    try:
        print(f"🔍 Attempting to load model from: {MODEL_PATH}")
        
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
            
        # Load model using Ultralytics interface
        model = YOLO(MODEL_PATH)
        print("✅ Model loaded successfully")
        print(f"📦 Model class names: {model.names}")  # Verify class mapping
        
    except Exception as e:
        print(f"❌ Critical error loading model: {str(e)}")
        model = None

# Load model at startup
load_model()

@app.route('/detect', methods=['POST'])
def detect_components():
    """Handle image detection requests"""
    if not model:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500

    try:
        # Validate image upload
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image uploaded'}), 400
            
        # Read and preprocess image
        image_file = request.files['image']
        image_bytes = image_file.read()
        img = Image.open(io.BytesIO(image_bytes))
        
        # Perform inference
        results = model.predict(img)
        
        # Process detections
        component_counts = {}
        for result in results:
            for box in result.boxes:
                if box.conf.item() > CONFIDENCE_THRESHOLD:
                    class_id = int(box.cls.item())
                    class_name = model.names.get(class_id, f"Unknown_{class_id}")
                    
                    # Update component counts
                    component_counts[class_name] = component_counts.get(class_name, 0) + 1

        # Convert to list for frontend and maintain consistent key name
        detections = [
            {'name': name, 'quantity': count}
            for name, count in component_counts.items()
        ]
        
        print(f"Detected components: {detections}")
            
        return jsonify({
            'success': True,
            'detections': detections  # Keep consistent key name with frontend
        })
        
    except Exception as e:
        print(f"🚨 Detection error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Service health endpoint"""
    return jsonify({
        'status': 'ok' if model else 'unhealthy',
        'model_loaded': bool(model)
    })

if __name__ == '__main__':
    # Start development server
    print(f"🚀 Starting server with model status: {'loaded' if model else 'not loaded'}")
    app.run(host='0.0.0.0', port=5001, debug=False)