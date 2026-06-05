# SmartCourt AI — Backend image (Python 3.11 for ML wheel compatibility)
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /code

# System deps: ffmpeg for audio (Whisper), build tools for some wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        libpq-dev \
        gcc \
        curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# CUDA runtime libs for faster-whisper GPU (ctranslate2 needs cuDNN 9 + cuBLAS).
# Installed as pip wheels so we don't need a heavy CUDA base image.
RUN pip install nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*"

# Let the dynamic linker find the pip-installed CUDA .so files.
ENV LD_LIBRARY_PATH=/usr/local/lib/python3.11/site-packages/nvidia/cublas/lib:/usr/local/lib/python3.11/site-packages/nvidia/cudnn/lib:${LD_LIBRARY_PATH}

COPY . .

# Create storage dirs for uploads / generated files
RUN mkdir -p /code/storage/uploads /code/storage/audio /code/storage/exports

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
