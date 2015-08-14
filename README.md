# Web version of meas_vis utility

![Screenshot](meas_json_gui.png?raw=true)

## Installation

1. install websocketd (https://github.com/joewalnes/websocketd/releases)
2. specify correct path to `meas_json` in `run.sh` file
3. add to /etc/osmocom/openbsc.cfg file
```
mncc-int
 meas-feed destination 127.0.0.1 8888
```
4. run `./run.sh`
5. open http://bs.host.name:8080/index.html in your browser
6. Add sv/* to runit configuration
7. Add
```
n1
s1000000
```
to /var/log/meas/config 
