#!/bin/bash
tmpfile=`mktemp deleteme.XXXXXXXXXX`

while :; do ./slowcat meas_reports.json > $tmpfile; done &
websocketd --loglevel=debug --staticdir=. --port=8080 tail -F $tmpfile
rm $tmpfile
