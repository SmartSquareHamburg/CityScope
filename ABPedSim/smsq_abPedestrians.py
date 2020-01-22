import subprocess
import time
import random
import csv

from osgeo import ogr, osr

from os import environ

from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

from csl import load_config

import json

# END
###

# Layer zur Uebergabe in die Simulation
###

# boundaries = "data/boundaries.shp" # TODO: naming-conv to buildings
# walls = "data/walls.shp"

# END
### # TODO: add walls and whatever more as barriers

network = "network.shp"

# gencrowd = "pedestrians.shp"
boundaries_cut = "boundaries_cut.shp"
network_cut = "network_cut.shp"

# Layer mit OEPNV-Haltestellen
# bahn = "../ABPedSim/data/subahn.shp"
# bus = "../ABPedSim/data/bus.shp"
# rad = "../ABPedSim/data/stadtrad.shp"
# park = "../ABPedSim/data/parkhaus.shp"
gateways = "gateways.shp"

csv_name = "pedMission.csv"

merge = "merge.shp"

# TODO: fix static bbox
# Globale Default-Variablen
bbox_minx = float(565900.000)
bbox_miny = float(5933766.750)
bbox_maxx = float(566173.405)
bbox_maxy = float(5933998.937)
# peds = 30
target = 0

parameterSet = False

# copy from smsq_cshandler.py
def rc_to_xy(row: int, column: int, bbox: tuple, gridsize: int) -> tuple:
    """
    Transform u, v coordinates of the table to "real-world" coordinates
    # TODO what about the margins between the grid cells on the table?

    Assumptions: xy - Origin is at bottom left
                 uv - Origin is at top left
                 area is small enough that we can consider it a plane

    :param u: u coordinate
    :param v: v coordinate
    :param bbox: (left,bottom,right,top) of the real world bbox coordinates
    :param gridsize: number of uv cells of the (square) table
    :return: x, y
    """

    # rounding down to meters
    digits = 0 # TODO in csl.ini

    x_min = bbox[0]
    y_min = bbox[1]
    x_max = bbox[2]
    y_max = bbox[3]

    # calculate and round the lengths of the sides
    x_range = x_max - x_min
    #x_range = round(x_range, digits)
    y_range = y_max - y_min
    #y_range = round(y_range, digits)

    assert x_range > 0
    assert y_range > 0
    # I originally assumed our real world bbox would be square
    # but of course that is not the case if the map in the browser
    # is square in a different CRS than the bbox we output from it
    # right now we use a map in 3857/900913 but a 25832 BBOX
    # assert x_range == y_range

    cell_width = x_range / gridsize
    cell_height = y_range / gridsize

    # start at the minima
    # add half a cell as we want to get the cell centers
    # add u/v cell widths/heights
    x = x_min + cell_width / 2 + (cell_width * column)
    y = y_max - cell_height / 2 - (cell_height * row)  # minus because uv is topleft, xy is topright

    #    if debug:
    #        print("u, v -> x, y: {u} {v} -> {x} {y}".format(u=u, v=v, x=x, y=y))

    return x, y


def coordinateTransformation(geometry, source, target):  # only on geometries, not on layers
    # Coordinate Transformation Params
    source_proj = osr.SpatialReference()
    source_proj.ImportFromEPSG(source)
    target_proj = osr.SpatialReference()
    target_proj.ImportFromEPSG(target)

    transform = osr.CoordinateTransformation(source_proj, target_proj)

    geometry.Transform(transform)

    return geometry


def createESRIShapefile(data, shp_name, geomtype, epsg):
    # Parse a delimited text file of volcano data and create a shapefile
    # https://pcjericks.github.io/py-gdalogr-cookbook/vector_layers.html#create-a-new-shapefile-and-add-data

    print('createESRIShapefile()')

    # set up the shapefile driver
    driver = ogr.GetDriverByName("ESRI Shapefile")

    # create the data source
    data_source = driver.CreateDataSource(shp_name)  # string

    # create the spatial reference, WGS84
    srs = osr.SpatialReference()
    # but don't define crs here...
    # srs.ImportFromEPSG(epsg)  # int

    # create the layer
    if geomtype == 'POLYGON':
        layer = data_source.CreateLayer(shp_name, srs, ogr.wkbPolygon)
    elif geomtype == 'LINESTRING':
        layer = data_source.CreateLayer(shp_name, srs, ogr.wkbLineString)
    elif geomtype == 'POINT':
        layer = data_source.CreateLayer(shp_name, srs, ogr.wkbPoint)

    # Add the fields we're interested in
    layer.CreateField(ogr.FieldDefn("id", ogr.OFTInteger))

    # Process the text file and add the attributes and features to the shapefile
    i = 0
    for feat in data:
        # create the feature
        feature = ogr.Feature(layer.GetLayerDefn())
        # Set the attributes using the values from the delimited text file
        feature.SetField("id", i)
        if epsg > 0:  # transform
            feature.SetGeometry(coordinateTransformation(feat.GetGeometryRef(), 3857, epsg))
        else:  # don't transform
            feature.SetGeometry(feat.GetGeometryRef())
        # Create the feature in the layer (shapefile)
        layer.CreateFeature(feature)
        # Dereference the feature
        feature = None

        i += 1

    data.ResetReading()  # super-important!

    # Save and close the data source
    data_source = None


def defineStartVariables(bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, peds, target):
    print('defineStartVariables()')

    ###

    # define bbox as geometry
    # https://pcjericks.github.io/py-gdalogr-cookbook/geometry.html#create-a-polygon
    # Create ring
    ring = ogr.Geometry(ogr.wkbLinearRing)
    ring.AddPoint(bbox_minx, bbox_miny)
    ring.AddPoint(bbox_minx, bbox_maxy)
    ring.AddPoint(bbox_maxx, bbox_maxy)
    ring.AddPoint(bbox_maxx, bbox_miny)
    ring.AddPoint(bbox_minx, bbox_miny)
    # Create polygon
    bbox = ogr.Geometry(ogr.wkbPolygon)
    bbox.AddGeometry(ring)

    print('bbox:')
    print(bbox)

    # get barriers that people can't walk on

    # load geodata
    driver = ogr.GetDriverByName("WFS")
    wfs = driver.Open(wfs_url, update=1)  # 1 means writable

    buildings = wfs.GetLayerByName('csl:altstadt_gebaeudeflaechengeschosse')
    print('buildings:')
    print(buildings.GetFeatureCount())

    # filter geodata (what's inside b-box?) and write to file
    # file will be input arguments for java-exe (third party)
    # https://pcjericks.github.io/py-gdalogr-cookbook/vector_layers.html#create-a-new-shapefile-and-add-data
    buildings.SetSpatialFilter(bbox)

    print('filter:')
    print(buildings.GetFeatureCount())

    # write to file
    createESRIShapefile(buildings, boundaries_cut, 'POLYGON', -1)  # (data, shp_name, geomtype, epsg)

    # TODO: do the same thing with other barriers and merge them to one ESRI Shapefile

    # get the network that people walk on (routing)

    # load geodata
    net = wfs.GetLayerByName('csl:smsq_abPeds_network')
    print('net:')
    print(net.GetFeatureCount())

    # filter geodata (what's inside b-box?) and write to file
    # file will be input arguments for java-exe (third party)
    # https://pcjericks.github.io/py-gdalogr-cookbook/vector_layers.html#create-a-new-shapefile-and-add-data
    net.SetSpatialFilter(bbox)

    print('filter:')
    print(net.GetFeatureCount())

    # write to file
    createESRIShapefile(net, network_cut, 'LINESTRING', -1)  # (data, shp_name, geomtype, epsg)


    # get gateways where people become pedestrians

    # load geodata
    gateways_points = wfs.GetLayerByName('csl:abpeds_gateways')
    print('gateways:')
    print(gateways_points.GetFeatureCount())

    # filter geodata (what's inside b-box?) and write to file
    # file will be input arguments for java-exe (third party)
    # https://pcjericks.github.io/py-gdalogr-cookbook/vector_layers.html#create-a-new-shapefile-and-add-data
    gateways_points.SetSpatialFilter(bbox)
    print('filter:')
    print(gateways_points.GetFeatureCount())

    # write to file
    createESRIShapefile(gateways_points, gateways, 'POINT', -1)  # (data, shp_name, geomtype, epsg)

    # TODO: is this really needed to create list[] and points[] to access geometries?
    # to list
    list = []
    for feature in gateways_points:
        list.append(feature)

    # only geometries
    points = []
    for point in list:
        points.append(
            point.GetGeometryRef()
        )

    # compute "Missions" for these people and write them to csv
    npoints = len(points)

    with open(csv_name, "w") as output:
        writer = csv.writer(output, lineterminator='\n')

        # write header
        writer.writerow(['startWKT', 'mentalModel', 'wktWayPoints'])

        # write data
        for i in range(0, peds):
            if target == 0:
                # random destinations
                generatedMission = '[' + \
                                   points[random.randint(0, npoints-1)].ExportToWkt() + ', ' + \
                                   points[random.randint(0, npoints-1)].ExportToWkt() + \
                                   ']'
            else:
                # every agent's following the same goal/ same destination
                generatedMission = '[' + \
                                   target.ExportToWkt() + \
                                    ']'

            writer.writerow([
                # TODO: randomize startpoints, e. g. random 30 (default) of <npoints> that don't double itself...
                # TODO: ... because that would throw errors
                points[i].ExportToWkt(),
                'FollowWayPointsMentalModel',
                generatedMission
            ])

    print("Mission's clear.")

class Component(ApplicationSession):
    bbox = {}  # self.bbox
    changesRaw = None  # self.changesRaw

    @inlineCallbacks
    def onJoin(self, details):
        print("session ready")

        try:
            yield self.subscribe(self.getBbox, 'hcu.csl.smsq.desk1.bbox')
            print('subscribed to topic: hcu.csl.smsq.desk1.bbox')
        except Exception as e:
            print('could not subscribe to topic: {0}'.format(e))

        try:
            yield self.subscribe(self.getTarget, u'hcu.csl.changes.bento')
            print("subscribed to topic: hcu.csl.changes.bento")
        except Exception as e:
            print("could not subscribe to topic: {0}".format(e))

        try:
            yield self.subscribe(self.startSimulation, u'hcu.csl.smsq.desk1.ABPedSimStart')
            print("subscribed to topic: hcu.csl.smsq.desk1.ABPedSimStart")
        except Exception as e:
            print("could not subscribe to topic: {0}".format(e))



    def getBbox(self, x0, y0, x1, y1):
        print('INFO: Got bbox: {}'.format((x0, y0, x1, y1)))
        self.bbox = (x0, y0, x1, y1)

    def getTarget(self, msg):
        print('INFO: Got target: {}'.format(msg))

        if msg[2] != 0: # value needs to be != 0
            self.changesRaw = msg


    @inlineCallbacks
    def startSimulation(self, extent, peds, type):
        """
            Processing CityScope data. If global variable parameterSet is true, start simulation.
        """

        print('startSimulationTarget()')

        print(extent)  # debug

        if not self.bbox:
            print("WARNING: Ignoring changes, we don't know the BBOX yet!")
            return None

        # define target position from lego
        if self.changesRaw != None:
            changes = json.loads(self.changesRaw)
            print(changes)  # debug

            row = changes[0]
            col = changes[1]
            val = changes[2]
            grid = changes[3]

            x, y = rc_to_xy(row, col, self.bbox, grid)
            print(x)
            print(y)

            point = ogr.CreateGeometryFromWkt("Point ({x} {y})".format(x=x, y=y))

            transformedPoint = coordinateTransformation(point, 3857, 25832)
            print(transformedPoint)

        if type == 0:
            defineStartVariables(bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, peds, type)
        else:
            defineStartVariables(bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, peds, transformedPoint)

        # TODO: shp-files are currently accepted with epsg:25832 coordinates but w/o crs definition
        startARGS = " " + boundaries_cut + " " + \
                    " " + gateways + " " + \
                    " " + csv_name + " " + \
                    " " + network_cut
        command = "java -jar abpedsim.jar" + startARGS

        print('Start TARGET-Software...')

        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding='utf8')

        timeStart = time.time()
        # Poll process for new output until finished
        while True:
            nextline = process.stdout.readline()
            if nextline == '' and process.poll() is not None:
                break

            # print(nextline)
            # Erstes Zeichen L
            if nextline != '' and nextline[0] == "L":
                lineStringJSON = nextline[1:]

                print('publishing simulated agents as lines...')
                yield self.publish(u'hcu.csl.smsq.desk1.ABPedSimLineString', str(lineStringJSON))
                yield sleep(0.001)

            else:
                if (((time.time() - timeStart) % 0.25) <= 0.01):
                    print('publishing simulated agents...')
                    yield self.publish(u'hcu.csl.smsq.desk1.ABPedSimWalk', str(nextline))
                    yield sleep(0.001)


if __name__ == "__main__":
    config = load_config()
    realm = config["realm"]
    router = config["router"]
    ws_server = config["ws_server"]
    connstring = config["dbconnstring"]

    global wfs_url
    wfs_url = config["ows_url"]
    debug = config["debug"]

    runner = ApplicationRunner(
        environ.get(router, ws_server),  # TODO why environ.get?
        realm
    )
    runner.run(Component)
