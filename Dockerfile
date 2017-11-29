FROM debian:jessie
RUN apt update
RUN apt install -y git
RUN apt install -y nano
RUN apt install -y nodejs
RUN apt install -y npm