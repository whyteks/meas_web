#!/bin/bash

N=0
while [ 1 ] ; do
N=$[$N+1]
U1=$(shuf -i47-110 -n1)
D1=$(shuf -i47-110 -n1)
U2=$(shuf -i47-110 -n1)
D2=$(shuf -i47-110 -n1)

N1=$(shuf -i50-60 -n1)
N2=$(shuf -i50-60 -n1)
N3=$(shuf -i50-60 -n1)

T=$(date +%s)

cat << EOF
{"time":$T, "imsi":"262420000000010", "name":"Phone 1", "scenario":"", "chan_info":{"lchan_type":"TCH_H", "pchan_type":"TCH/F_TCH/H_PDCH", "bts_nr":0, "trx_nr":0, "ts_nr":2, "ss_nr":0}, "meas_rep":{"NR":$N, "UL_MEAS":{"RXL-FULL":-$U1, "RXL-SUB":-53, "RXQ-FULL":0, "RXQ-SUB":0}, "BS_POWER":0, "MS_TO":0, "L1_MS_PWR":5, "L1_FPC":false, "L1_TA":0, "DL_MEAS":{"RXL-FULL":-$D1, "RXL-SUB":-83, "RXQ-FULL":0, "RXQ-SUB":0}, "NUM_NEIGH":3, "NEIGH":[{"IDX":1, "ARFCN":8, "BSIC":29, "POWER":-$N1}, {"IDX":0, "ARFCN":14, "BSIC":34, "POWER":-$N2}, {"IDX":3, "ARFCN":101, "BSIC":23, "POWER":-$N3}]}}
{"time":$T, "imsi":"262430000000020", "name":"Phone 2", "scenario":"", "chan_info":{"lchan_type":"TCH_H", "pchan_type":"TCH/F_TCH/H_PDCH", "bts_nr":0, "trx_nr":0, "ts_nr":2, "ss_nr":1}, "meas_rep":{"NR":$N, "UL_MEAS":{"RXL-FULL":-$U2, "RXL-SUB":-62, "RXQ-FULL":0, "RXQ-SUB":0}, "BS_POWER":0, "MS_TO":0, "L1_MS_PWR":5, "L1_FPC":false, "L1_TA":0, "DL_MEAS":{"RXL-FULL":-$D2, "RXL-SUB":-98, "RXQ-FULL":0, "RXQ-SUB":0}, "NUM_NEIGH":3, "NEIGH":[{"IDX":1, "ARFCN":8, "BSIC":29, "POWER":-$N1}, {"IDX":0, "ARFCN":14, "BSIC":34, "POWER":-$N2}, {"IDX":3, "ARFCN":101, "BSIC":50, "POWER":-$N3}]}}
EOF

sleep 1

done