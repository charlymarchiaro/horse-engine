#!/bin/bash

# start scrapyd in background
nohup scrapyd 2>&1 &

# deploy scrapy project
cd /etc/horse_scraper; scrapyd-client deploy

# kill scrapyd background process
cd /; kill `cat twistd.pid`

# start scrapyd
scrapyd