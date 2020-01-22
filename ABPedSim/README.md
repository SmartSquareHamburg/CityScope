# SmartSquare-CityScope-ABPedSim

Description of Agent-based Pedestrian Simulation (ABPedSim) in SmartSquare-Project

## What to run first?
Run <smsq_abPedestrians.py> and start simulation via Web-Front-End. This will collect and filter data about your current 
AOI, the one that you're looking at on the web map, and start the ABM software TARGET (especially from TU Dresden) that 
simulates pedestrian movement based on the social-force-modell (see Helbing et al. 2005 for more info about that).

## Getting Started

This document provides you to add ABM to SmartSquare-CityScope on your machines, your CityScope, your Hardware.

### Prerequisites

The following files contain almost plain Python 3 code. You'll need the following modules to run SmartSquare-CityScope properly on your machine:

```
autobahn, crossbar, GDAL, Twisted
```

and you will need to install a Java SDK to run the .jar-File.

### Installing

You will need to install some Java-packages, especially <geotools>. This is to be done e. g. with Eclipse that will install 
all needed packages after importing the two provided folders as <Maven> project.

You will need to install Python 3 with the modules named above.

## Running the tests

Try to run <java -jar abpedsim.jar boundaries.shp gateways.shp missions.csv network.shp> with shapefiles that come without
coordinate-reference-system (crs) definition. 
If that opens a java application and sends output to your console window, you should be able to start with Python as 
mentioned above.

### Break down into end to end tests

### And coding style tests

## Deployment

## Built With

* Python 3
* GDAL (ogr, osr)
* GeoServer
* WebSockets (autobahn, Twisted)
* OpenLayers

## Contributing

## Versioning

V2 after prototype coming from martin.knura@hcu-hamburg

## Authors

* **Thomas Mensing** - thomas.mensing@hcu-hamburg.de, Twitter: @thmensing

See also the list of [contributors](https://www.hcu-hamburg.de/research/csl/team/leitung/) who participated in this project.

## License

No license yet

## Acknowledgments

* Thanks to M. Sc. Martin Knura and his effort and enthusiasm for ABM
* Thanks to all the inspiring students and researchers at HafenCity University Hamburg

