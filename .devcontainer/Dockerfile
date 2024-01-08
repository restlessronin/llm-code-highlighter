FROM node:18.19.0-bookworm

RUN apt-get update && apt-get install -y git

RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash &&\
    apt-get install -y git-lfs &&\
    git lfs install

RUN npm install -g jest typescript

WORKDIR /workspace

COPY . .
