#!/bin/sh
exec 2>&1
/usr/bin/stdbuf -oL /usr/bin/meas_json
