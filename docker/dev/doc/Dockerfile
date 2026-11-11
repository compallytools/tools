FROM python:3.13-slim

RUN pip install --no-cache-dir zensical==0.0.74

WORKDIR /doc
EXPOSE 8000
CMD ["zensical", "serve", "--dev-addr", "0.0.0.0:8000"]
