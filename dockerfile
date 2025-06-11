# syntax=docker/dockerfile:1
FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=main.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production

EXPOSE 80

CMD ["flask", "run", "--host=0.0.0.0", "--port=80"]

