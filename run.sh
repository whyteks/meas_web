#!/bin/bash
tmpfile=`mktemp deleteme.XXXXXXXXXX`

/usr/bin/stdbuf -oL /home/fairwaves/meas_json > $tmpfile &
exec /usr/bin/websocketd --staticdir=. --port=8080 tail -F $tmpfile
#rm $tmpfile
