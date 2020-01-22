start "scanner" /d "../cs_scanner" py -m scanner.scanner -M
timeout /t 8
start "publisher" /d "../cs_scanner" py -m processing.publisher

timeout /t 5

start "cityscope" /d "CityScopePy" py "smsq_cshandler.py"
timeout /t 2
start "gtfs" /d "CityScopePy" py "smsq_gtfsanim.py"
timeout /t 2
start "trx" /d "CityScopePy" py "smsq_trxanim_launcher.py"
timeout /t 2
start "abm" /d "ABPedSim" py "smsq_abPedestrians.py"
timeout /t 2

start firefox -new-window "csl.local.hcuhh.de/smsq/en/control.html?bento"
start firefox -new-window "csl.local.hcuhh.de/smsq/map1.html?bento"
start firefox -new-window "csl.local.hcuhh.de/smsq/dashb_init1.html"
