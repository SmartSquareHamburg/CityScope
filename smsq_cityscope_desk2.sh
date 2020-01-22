echo "<SmartSquare> is launching..."
echo "This window will close when application is ready. Have a good time."

cd ~csl/python/SmartSquare/old && xfce4-terminal -x python3 grid_to_changes.py # /old
sleep 5
cd ~csl/python/SmartSquare/CityScopePy && xfce4-terminal -x python3 smsq_cshandler.py
sleep 5
cd ~csl/python/SmartSquare/CityScopePy && xfce4-terminal -x python3 smsq_gtfsanim.py
sleep 5
cd ~csl/python/SmartSquare/CityScopePy && xfce4-terminal -x python3 smsq_trxanim_launcher.py
sleep 5
cd ~csl/python/SmartSquare/ABPedSim && xfce4-terminal -x python3 smsq_abPedestrians.py
sleep 5

firefox --new-window csl.local.hcuhh.de/smsq