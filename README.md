# Kannada Alphabet Recognition using CNN

This project implements a complete pipeline to recognize 49 Kannada letters. It combines deep learning for classification with a modern web application stack. The CNN classifier is built using TensorFlow/Keras, while a FastAPI backend and Next.js (TypeScript) frontend provide a user-friendly interface where users can draw a letter and receive an instant prediction.

## Overview

The project has two main components:

1. **Model Training & Evaluation:**  
   A convolutional neural network (CNN) is trained on a dataset of 49 Kannada alphabets. The training process involves data loading, augmentation, network construction, training with callbacks, and model evaluation.

2. **Web Application:**  
   - **FastAPI Backend:** Serves the trained model for real-time inference via API endpoints.
   - **Next.js Frontend:** Provides a canvas for users to draw a letter. The drawn image is sent to the FastAPI backend, and the predicted output is displayed.

## Training Process

### Data Loading and Preprocessing

- **Dataset:**  
  The dataset can be obtained from here `https://ieee-dataport.org/documents/kannada-language-image-dataset`.

- **Image Configuration:**  
  Images are converted to grayscale and resized to 28x28 pixels.  
  The dataset is split into training (80%) and validation (20%) sets using `tf.keras.utils.image_dataset_from_directory`, with labels one-hot encoded.

### Data Augmentation

To improve the generalization of the model, data augmentation is applied **only on the training set**:
- **Random Rotation**
- **Random Zoom**
- **Random Translation**

This augmentation is implemented using a Keras `Sequential` model.

### CNN Architecture

The CNN model consists of three convolutional blocks:

- **Block 1:**
  - Two convolutional layers (32 filters, 3×3 kernel, ReLU activation) with batch normalization.
  - Max pooling layer and dropout (25%).

- **Block 2:**
  - Two convolutional layers (64 filters) with batch normalization.
  - Max pooling and dropout.

- **Block 3:**
  - Two convolutional layers (128 filters) with batch normalization.
  - Max pooling and dropout.

Following the convolutional layers, the network is flattened and fed through dense layers:
- A dense layer with 128 neurons (ReLU activation) with batch normalization and dropout (50%).
- A final dense layer with a softmax activation that outputs probabilities for the 49 classes.

### Compilation and Training

- **Compilation:**  
  The model is compiled with the Adam optimizer and categorical crossentropy loss.

- **Callbacks:**  
  - **EarlyStopping:** Monitors the validation loss and stops training if no improvement is seen for 5 epochs.
  - **ReduceLROnPlateau:** Reduces the learning rate when the validation loss plateaus.
  
- **Training:**  
  The model is set to train for up to 480 epochs; however, early stopping typically halts training sooner if the model converges.

- **Model Saving:**  
  Once training is complete, the model (both architecture and weights) is saved as `full_model.h5` for later use in inference.

## Inference and Evaluation

The trained model achieved 98% test accuracy.

## Setup and Installation

### Model Training

Model training can be found in Jupyter Notebook present in the backend folder.

### FastAPI Backend

1. **Navigate to the `backend` Directory:**

   ```bash
   cd backend
   ```

2. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the FastAPI Server:**

   ```bash
   uvicorn api.main:app --reload
   ```

### Next.js Frontend

1. **Navigate to the `frontend` Directory:**

   ```bash
   cd frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Start the Development Server:**

   ```bash
   npm run dev
   ```

4. **Open in Browser:**  
   Visit `http://localhost:3000` to interact with the application.