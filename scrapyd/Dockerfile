#
# Dockerfile for scrapyd-onbuild
#

FROM charlymarchiaro/scrapyd


#============================================
# Google chrome webdriver installation
# Adapted from: https://github.com/SeleniumHQ/docker-selenium/blob/master/NodeChrome/Dockerfile
#============================================

USER root

#============================================
# Google Chrome
#============================================
# can specify versions by CHROME_VERSION;
#  e.g. google-chrome-stable=53.0.2785.101-1
#       google-chrome-beta=53.0.2785.92-1
#       google-chrome-unstable=54.0.2840.14-1
#       latest (equivalent to google-chrome-stable)
#       google-chrome-beta  (pull latest beta)
#============================================
ARG CHROME_VERSION="google-chrome-stable"
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update -qqy \
    && apt-get -qqy install \
    ${CHROME_VERSION:-google-chrome-stable} \
    && rm /etc/apt/sources.list.d/google-chrome.list \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#=================================
# Chrome Launch Script Wrapper
#=================================
# COPY wrap_chrome_binary /opt/bin/wrap_chrome_binary
# RUN /opt/bin/wrap_chrome_binary

#============================================
# Chrome webdriver
#============================================
# can specify versions by CHROME_DRIVER_VERSION
# Latest released version will be used by default
#============================================
ARG CHROME_DRIVER_VERSION
RUN if [ -z "$CHROME_DRIVER_VERSION" ]; \
    then CHROME_MAJOR_VERSION=$(google-chrome --version | sed -E "s/.* ([0-9]+)(\.[0-9]+){3}.*/\1/") \
    && CHROME_DRIVER_VERSION=$(wget --no-verbose -O - "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAJOR_VERSION}"); \
    fi \
    && echo "Using chromedriver version: "$CHROME_DRIVER_VERSION \
    && wget --no-verbose -O /tmp/chromedriver_linux64.zip https://chromedriver.storage.googleapis.com/$CHROME_DRIVER_VERSION/chromedriver_linux64.zip \
    && rm -rf /opt/selenium/chromedriver \
    && unzip /tmp/chromedriver_linux64.zip -d /opt/selenium \
    && rm /tmp/chromedriver_linux64.zip \
    && mv /opt/selenium/chromedriver /opt/selenium/chromedriver-$CHROME_DRIVER_VERSION \
    && chmod 755 /opt/selenium/chromedriver-$CHROME_DRIVER_VERSION \
    && ln -fs /opt/selenium/chromedriver-$CHROME_DRIVER_VERSION /usr/bin/chromedriver


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

