#
# Dockerfile for scrapyd-onbuild
#

FROM charlymarchiaro/scrapyd


#============================================
# Firefox chrome webdriver installation
# Adapted from: https://github.com/SeleniumHQ/docker-selenium/blob/master/NodeFirefox/Dockerfile
#============================================

USER root

#=========
# Firefox
#=========
ARG FIREFOX_VERSION=latest
RUN FIREFOX_DOWNLOAD_URL=$(if [ $FIREFOX_VERSION = "latest" ] || [ $FIREFOX_VERSION = "nightly-latest" ] || [ $FIREFOX_VERSION = "devedition-latest" ]; then echo "https://download.mozilla.org/?product=firefox-$FIREFOX_VERSION-ssl&os=linux64&lang=en-US"; else echo "https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-US/firefox-$FIREFOX_VERSION.tar.bz2"; fi) \
    && apt-get update -qqy \
    && apt-get -qqy --no-install-recommends install firefox-esr libavcodec-extra \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
    && wget --no-verbose -O /tmp/firefox.tar.bz2 $FIREFOX_DOWNLOAD_URL \
    && apt-get -y purge firefox-esr \
    && rm -rf /opt/firefox \
    && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
    && rm /tmp/firefox.tar.bz2 \
    && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
    && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox

#============
# GeckoDriver
#============
ARG GECKODRIVER_VERSION=latest
RUN GK_VERSION=$(if [ ${GECKODRIVER_VERSION:-latest} = "latest" ]; then echo "0.26.0"; else echo $GECKODRIVER_VERSION; fi) \
    && echo "Using GeckoDriver version: "$GK_VERSION \
    && wget --no-verbose -O /tmp/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v$GK_VERSION/geckodriver-v$GK_VERSION-linux64.tar.gz \
    && rm -rf /opt/geckodriver \
    && tar -C /opt -zxf /tmp/geckodriver.tar.gz \
    && rm /tmp/geckodriver.tar.gz \
    && mv /opt/geckodriver /opt/geckodriver-$GK_VERSION \
    && chmod 755 /opt/geckodriver-$GK_VERSION \
    && ln -fs /opt/geckodriver-$GK_VERSION /usr/bin/geckodriver


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

