#!/bin/bash
tmpfile=`mktemp deleteme.XXXXXXXXXX`

/usr/bin/stdbuf -oL /usr/bin/meas_json > $tmpfile &
/usr/bin/websocketd --staticdir=. --port=8080 tail -F $tmpfile
rm $tmpfile
