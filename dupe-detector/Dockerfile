FROM python:3.9-buster

RUN set -xe \
    && pip install git+https://github.com/python-pillow/Pillow.git

RUN apt-get update && \
    apt-get install -y apt-transport-https && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install msodbcsql17 unixodbc-dev -y


COPY ./*.txt /etc/dupe-detector/

RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install \
    build-essential \
    libpq-dev \
    python-dev \
    unixodbc-dev \
    -y

RUN cd /etc/dupe-detector \
    && [ -f requirements.txt ] \
    && pip install -r requirements.txt

ENV TZ="America/Argentina/Buenos_Aires"
RUN date

COPY *.sh .
COPY ./src /etc/dupe-detector/src

CMD exec /bin/bash process_articles.sh