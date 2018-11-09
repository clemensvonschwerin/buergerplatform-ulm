#! /bin/bash

cp grafana-scripts/buergerplatform.js /usr/share/grafana/public/dashboards/
cp run_buergerplatform.service /lib/systemd/system/
systemctl daemon-reload
systemctl enable run_buergerplatform.service
systemctl restart run_buergerplatform.service