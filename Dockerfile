FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    g++ \
    libboost-all-dev \
    libasio-dev \
    git \
    cmake \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/CrowCpp/Crow.git /crow

WORKDIR /gitApp

COPY git_ui.cpp .
COPY git.h .

RUN g++ -I/crow/include git_ui.cpp -o serve -lpthread

EXPOSE 8080

CMD ["./serve"]
