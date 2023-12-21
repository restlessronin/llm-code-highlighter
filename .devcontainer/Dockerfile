FROM node:18.19.0-bookworm

RUN apt-get update && apt-get install -y git
RUN npm install -g pnpm jest typescript

WORKDIR /workspace

COPY . .
