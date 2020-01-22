# SmartSquare-CityScope

## This is...

The description of the SmartSquare (BMBF 2017-2020) application on LEGO-CityScopes. The code explains the backend object-detection as well as the HTML/JS frontend and messaging protocol (WebSockets) to run on your server or locally, e. g. on your BentoScope machine. 

## What to run first?

### **On localhost**, e. g. BentoScope on travel:
#### Pre-instructions:
* Run a local WebSocket instance (if not prepared on server). Therefore you'll need to set pub- & priv keys once (to set realm, etc.). To start the instance run: 
```
crossbar start --cbdir <yourpath/>crossbar
```

* Start a local GeoServer instance. The installation provides a **startup.bat**.

* Set up a simple HTTP server for your local html-files (to avoid CORS issues on localhost) within the JSVis folder: 
```
python -m http.server [<portNo>]
```

* You may need to edit your web browsers config to avoid CORS issues on localhost. For Firefox open **about:config** and set **security.fileuri.strict_origin_policy** to **false**.

* Then proceed with the explanation for server infrastructures ...

### **On server infrastructure**, e. g. VM where crossbar, GeoServer, and database is provided:

#### Backend:

All files rely on an **.ini**-file, e. g. [csl.ini](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/CityScopePy/csl.ini) where you've to define your server structure or filepaths. Set that first, e. g. **localhost** infrastructure!

###### Object detection:
* Run [singlecamera.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/CityScopePy/singlecamera.py) with arguments several times depending on how many cameras you have (default: 4)
* Run [multicam.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/CityScopePy/multicam.py) to merge *singlecamera.py*'s results
* Then run [grid-to-changes.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/) `not included so far` to send single changes made in format:
```python
Array[row, column, color-value]
```

`UPDATE (2019):`

We've started to use [CityScope_Scanner_Python_HH](https://git.csl-intern.local.hcu-hamburg.de/andre.landwehr/cityscope_scanner_python_hh/tree/develop) for object detection. You may use this instead. It works fine and interfaces are almost set. You'll just need to edit the **.ini**-file there...

`UPDATE over`

* The info about changes will be processed in [smsq_cshandler.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/CityScopePy/smsq_cshandler.py). By now it works as a pointer tool where you ask about semantic data on geographies, e. g. polygons. Place a LEGO brick, if the frontend tells you.
* Good luck. **TODO: readme is tbc**


###### Data visualization:
* Run [[CityScopePy]/smsq_gtfsanim.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/CityScopePy/smsq_gtfsanim.py) and activate **GTFS** on the control-page to animate public transport schedule data. 
* Run [[CityScopePy]/smsq_trxanim_launcher.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/CityScopePy/smsq_trxanim_launcher.py), set parameters on the control-page then activate **Run!** to animate observed movement data
* Run [[ABPedSim]/smsq_abPedestrians.py](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/ABPedSim/smsq_abPedestrians.py) to simulate "Agents" that will cross SmartSquare (simulation is using jCrowdSimulator that was developed by TU Dresden/ Fraunhofer IVI that was applied to CityScope by a student's master's thesis)

## Getting Started

#### Frontend:

The following files, especially the control-page is designed to be as intuitive as possible. Within that you're able to control the CityScope's appearance, especially add or remove map layers and open the corresponding map legends and dashboards.

###### To run the SmartSquare application on two CityScope tables as prepared in CityScienceLab@HCU

Open the three following pages on the non-interactive table in your hosted environment:
* [[JSVis]/en/control.html?desk2](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/en/control.html)
* [[JSVis]/dashb_init2.html](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/dashb_init2.html)
* [[JSVis]/map2.html](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/map2.html) 

and proceed with the following three pages on the interactive CityScope table:
* [[JSVis]/en/control.html?desk1](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/de/control.html)
* [[JSVis]/dashb_init1.html](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/dashb_init1.html)
* [[JSVis]/map1.html](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/map1.html)

All these pages refer to a config-file [[JSVis]/ini.js](https://git.csl-intern.local.hcu-hamburg.de/smartsquare/smsq-cityscope/blob/master/JSVis/ini.js) where you define your personal server infrastructure references (WebSocket server, OWS server, File server).
Distort your map corresponding to your hardware setup, e. g. with location-search map1.html **?left** and map1.html **?right** for a two Beamer setting.
Fullscreen every single webpage you've opened.

Now click through the **control.html** page and you'll see how the appearance is changing.

###### To run the application on single CityScope table like BentoScope 

Only run the pages containing < 1 >, i. e. control.html **?desk1**, **dashb_init1**.html, **map1**.html)
Distort map with map1.html **?bento** or find your own distortion matrix ([Link](http://hannes.enjoys.it/stuff/projection/css%20matrix3d.html))

### Prerequisites

The following (backend) files contain almost plain Python 3 code. You'll need the following modules to run SmartSquare-CityScope properly on your machine:

```
autobahn, crossbar, GDAL, numpy, opencv-python, psycopg2, scipy, Twisted
```

JavaScript libraries used are:
```
Bootstrap, JQuery, OpenLayers, proj4.js and autobahn
```
`TODO: really? Bootstrap and proj4?`

## Installing

### At least if you create/ or copy a new setup ...:

#### Python

* Install **Python 3** on your machine (including **Visual Studio 2017** for Desktop C++ and Web/ Cloud Python) and upgrade **pip** to latest.

* With pip:
```
pip install <module>
```

install following modules:
```
setuptools, pypiwin32, imutils, crossbar, opencv-python, psycopg2
```
`UPDATE (2020):`

When you run in to an issue with crossbar here, then run pip install --upgrade setuptools (optional) and install python-snappy from **wheel** (from **Gohlke**'s, see following link) first before trying again with crossbar...

`UPDATE over`

* From [Gohlke's "Python Paradise For Windows Users"](https://www.lfd.uci.edu/~gohlke/pythonlibs/):

Load **wheel**-file for following modules:
```
Twisted, numpy+mkl, scipy, GDAL
```

and install with:
```
pip install <filename>.whl
```

#### Software
* Install a [PostgreSQL database](https://www.postgresql.org/) with [PostGIS extension](https://postgis.net/) (e. g. with Windows installer and *StackBuilder*).

* Install a _Java JDK_ (e. g. _Java 8_) to get **GeoServer** running and set a **JAVA_HOME** environment variable.

* Install [GeoServer](http://geoserver.org/) (e. g. with Windows installer) and set the **GEOSERVER_HOME** and **GEOSERVER_DATA_DIR** environment variables.
Edit GeoServer's **webapps\geoserver\WEB-INFweb.xml** and un-comment the **ENABLE_JSONP=true** passage and set your **DATA_DIR** filepath.

* Install a [Crossbar.IO "WAMP-over-WebSocket transport endpoint"](https://crossbar.io/).
Set a crossbar (Python module) environment variable too ease the process.

## Running the tests

At least on Windows machines the SmartSquare application should work fine using **Python v3.6.5** and **Firefox**.  

### Break down into end to end tests

XXX

### And coding style tests

XXX

## Deployment

XXX

## Built With

* Languages:
```
Python 3 and HTML/CSS/JavaScript
```

* Software and Stuff:
```
PostgreSQL/PostGIS, GeoServer, OpenLayers, WebSockets
```

* Other:
```
Python modules autobahn, crossbar, GDAL, numpy, opencv-python, psycopg2, scipy, Twisted
```

## Contributing

XXX

## Versioning

See this as v1.0

## Authors

[CityScienceLab](https://www.hcu-hamburg.de/research/csl/team/leitung/)

## License

XXX

## Acknowledgments

* This Code is based on cartocalypse's initial WebGIS-CityScope that was used in 2016's FindingPlaces project at CityScienceLab@HCU
* Thanks to all the inspiring students and researchers at HafenCity University Hamburg
* Thanks to all the inspiring students and researchers at MIT Media Lab, especially City Science Group

