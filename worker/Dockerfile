FROM python:3.10

WORKDIR /app

# ✅ Install certificates
RUN apt-get update && apt-get install -y ca-certificates

# ✅ Upgrade cert store
RUN update-ca-certificates

# ✅ TEMP FIX (disable SSL verification for pip)
ENV PIP_NO_VERIFY_CERTS=1
ENV PYTHONHTTPSVERIFY=0

COPY requirements.txt .

# ✅ Install with trusted hosts (CRITICAL)
RUN pip install --no-cache-dir \
    --trusted-host pypi.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt

COPY . .

EXPOSE 4001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4001"]