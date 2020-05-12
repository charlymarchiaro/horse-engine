#
# Dockerfile for scrapyd-onbuild
#

FROM charlymarchiaro/scrapyd


COPY ./*.txt /etc/scrapyd/

RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install \
    build-essential \
    libpq-dev \
    python-dev \
    unixodbc-dev \
    -y

RUN cd /etc/scrapyd \
    && [ -f requirements.txt ] \
    && pip install -r requirements.txt

COPY ./scrapyd.conf /etc/scrapyd/

COPY ./horse_scraper /etc/


ENV TZ="America/Argentina/Buenos_Aires"
RUN date

ADD start.sh /
RUN chmod +x /start.sh

CMD ["/start.sh"]

