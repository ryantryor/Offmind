FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_ENDPOINT=https://hf-mirror.com

WORKDIR /app

# System deps for PyMuPDF + sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
COPY wheels/ ./wheels/
# PyPI index. Default is the official registry so overseas builds just work.
# Inside China, override with --build-arg PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
# Actian SDK is installed from the local wheel (proprietary, not on PyPI).
ARG PIP_INDEX_URL=https://pypi.org/simple
RUN pip install --upgrade pip \
    && pip install -r requirements.txt -i ${PIP_INDEX_URL} \
    && pip install ./wheels/actian_vectorai-*.whl -i ${PIP_INDEX_URL}

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
