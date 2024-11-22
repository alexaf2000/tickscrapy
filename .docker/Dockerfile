FROM node:23.3.0-slim

WORKDIR /app

#USER node # non-root user that comes with `node` images.

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

RUN apt-get update && apt-get install chromium wget -y && \
  rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]