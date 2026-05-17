FROM python:3.10

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

WORKDIR /app

# Tahap 1: Install dependencies (ini akan di-cache oleh HF)
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Tahap 2: Copy sisanya (model dan kode)
COPY --chown=user . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]