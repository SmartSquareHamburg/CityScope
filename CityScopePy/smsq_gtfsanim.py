"""
	IMPORTS
"""
from os import environ
import json
import time # sleep

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from datetime import datetime
from datetime import date
import calendar
# from datetime import timedelta

from csl import load_config

from osgeo import ogr, osr

"""
	VARIABLES
"""

# dest = 'desk2.' # publish-names
# lsinfodata = [] # sendLinestringInfo()

dow = calendar.day_name[date.today().weekday()] # day of week
weekday = 'calendar.' + str.lower(dow)

"""
	FUNCTIONS
"""

# Altstadt extent (4326):
# "MULTIPOLYGON(
#	(
#		(
#			9.97871075493048 53.5408432592769,
#			9.97911638289964 53.5584191617816,
#			10.0114812964991 53.5581498372942,
#			10.011062265885 53.5405741065481,
#			9.97871075493048 53.5408432592769
#		)
#	)
# )"

def getFutureTripsWithShape(dow):
    with psycopg2.connect(connstring, cursor_factory=RealDictCursor) as dbconn:
        dbconn.autocommit=True # HK@g2lab: "so we do not need to conn.commit() every time"
        with dbconn.cursor() as cursor:
            cursor.execute(
                sql.SQL(
                    "SELECT " +
                    "ARRAY_AGG ("
                    "round( sqrt( pow( abs( shapes.shape_pt_lat - sq.stop_lat) ,2) + " +
                    "pow( abs( shapes.shape_pt_lon - sq.stop_lon), 2)), 6)" +
                    ") AS delta, " +
                    "shapes.shape_id, " +
                    "ARRAY_AGG(shapes.shape_pt_lat) AS shape_pt_lat, " +
                    "sq.stop_lat, " +
                    "ARRAY_AGG(shapes.shape_pt_lon) AS shape_pt_lon, " +
                    "sq.stop_lon, " +
                    "ARRAY_AGG(shapes.shape_pt_sequence) AS shape_pt_sequence, " +
                    "sq.route_short_name, " +
                    "sq.departure_time, " +
                    "sq.stop_sequence, " +
                    "sq.trip_id, " +
                    "sq.direction_id " +
                    "FROM " +
                    "( SELECT " +
                    "DISTINCT trips.trip_id, " +
                    "trips.direction_id, " +
                    "routes.route_id, " +
                    "routes.route_short_name, " +
                    "times.departure_time, " +
                    "times.stop_sequence, " +
                    "stops.stop_id, " +
                    "stops.stop_lat, " +
                    "stops.stop_lon, " +
                    "stops.parent_station, " +
                    "shapes.shape_id " +
                    "FROM " +
                    "hvv_trips AS trips, " +
                    "hvv_routes AS routes, " +
                    "hvv_stop_times AS times, " +
                    "hvv_stops AS stops, " +
                    "hvv_shapes AS shapes, " +
                    "hvv_calendar AS calendar, " +
                    "hvv_routeids " +
                    "WHERE " +
                    "trips.route_id = routes.route_id AND " +
                    "times.trip_id = trips.trip_id AND " +
                    "times.stop_id = stops.stop_id AND " +
                    "trips.shape_id = shapes.shape_id AND " +
                    "trips.service_id = calendar.service_id AND " +
                    "routes.route_id = hvv_routeids.route_id AND " +
                    "{} = 1 AND " +  # placeholder (day of week)
                    "times.departure_time BETWEEN LOCALTIME AND LOCALTIME+'00:00:30' AND " +
                    "stops.parent_station IS NOT NULL AND " +
                    "stops.stop_lat BETWEEN 53.5405741065481 AND 53.5584191617816 AND " +
                    "stops.stop_lon BETWEEN 9.97871075493048 AND 10.0114812964991 " +
                    "ORDER BY " +
                    "times.departure_time ASC" +
                    ") AS sq, " +
                    "hvv_shapes AS shapes " +  # still at <from>

                    "WHERE " +
                    "shapes.shape_id = sq.shape_id AND " +
                    "shape_pt_lon BETWEEN sq.stop_lon-0.0003 AND sq.stop_lon+0.0003 AND " +
                    "shape_pt_lat BETWEEN sq.stop_lat-0.0003 AND sq.stop_lat+0.0003 " +
                    "GROUP BY " +
                    "shapes.shape_id, " +
                    "sq.stop_lat, " +
                    "sq.stop_lon, " +
                    "sq.route_short_name, " +
                    "sq.departure_time, " +
                    "sq.direction_id, " +
                    "sq.stop_sequence, " +
                    "sq.trip_id "
                    "ORDER BY " +
                    "shape_id"

                ).format(sql.Identifier(str.lower(dow)))  # day of week = 1 # true
            )
            result = cursor.fetchall()
        return result

def getRouteShapes(sid, sps, len, tid, sqs):
    with psycopg2.connect(connstring, cursor_factory=RealDictCursor) as dbconn:
        dbconn.autocommit=True # HK@g2lab: "so we do not need to conn.commit() every time"
        with dbconn.cursor() as cursor:
            cursor.execute(
                # "SELECT " +
                #     "DISTINCT shapes.*, " +
                #     "CASE WHEN stops.stop_id IS NOT null THEN true ELSE false END AS stop " +
                # "FROM " +
                #     "hvv_shapes AS shapes " +
                # "LEFT JOIN " +
                #     "hvv_stops AS stops " +
                # "ON " +
                #    "shape_pt_lon BETWEEN stop_lon-0.0003 AND stop_lon+0.0003 AND " +
                #     "shape_pt_lat BETWEEN stop_lat-0.0003 AND stop_lat+0.0003 " +
                # "WHERE " +
                #     "shape_id = %s AND " +  # <sid>
                #     "shape_pt_sequence BETWEEN %s AND %s " +  # <sps+1>, <sps+len>
                # "ORDER BY " +
                #     "shape_pt_sequence ASC", (sid, sps+1, sps+len)

                "SELECT " +
                "sq1.shape_id, " +
                "shape_pt_lat, " +
                "shape_pt_lon, " +
                "shape_pt_sequence, " +
                "stop, " +
                "stop_sqs, " +  # as array[2], from/to
                "arr_times, " +  # as array[2], from/to
                "dep_times " +  # as array[2], from/to

                "FROM "
                "( SELECT " +
                "DISTINCT shapes.*, " +
                "CASE WHEN stops.stop_id IS NOT null THEN true ELSE false END AS stop " +
                "FROM " +
                "hvv_shapes AS shapes " +
                "LEFT JOIN " +
                "hvv_stops AS stops " +
                "ON " +
                "shape_pt_lon BETWEEN stop_lon-0.0003 AND stop_lon+0.0003 AND " +
                "shape_pt_lat BETWEEN stop_lat-0.0003 AND stop_lat+0.0003 " +
                "WHERE " +
                "shape_id = %s AND " +  # <sid>
                "shape_pt_sequence BETWEEN %s AND %s " +  # <sps+1>, <sps+len>
                ") AS sq1 " +

                "LEFT JOIN " +
                "( SELECT " +
                "shape_id, " +
                "ARRAY_AGG(times.stop_sequence) AS stop_sqs, " +
                "ARRAY_AGG(times.arrival_time) AS arr_times, " +
                "ARRAY_AGG(times.departure_time) AS dep_times " +
                "FROM " +
                "hvv_trips AS trips " +
                "LEFT JOIN " +
                "hvv_stop_times AS times " +
                "ON " +
                "trips.trip_id = times.trip_id " +
                "WHERE " +
                "trips.trip_id = %s AND " +  # <tid>
                "times.stop_sequence BETWEEN %s AND %s " +  # <sqs>
                "GROUP BY " +
                "shape_id " +
                ") AS sq2 " +

                "ON " +
                "sq1.shape_id = sq2.shape_id " +

                "ORDER BY " +
                "shape_pt_sequence ASC", (sid, sps+1, sps+len, tid, sqs, sqs+1)
            )
            result = cursor.fetchall()
        return result

"""
	EXECUTION
"""

class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        print("session attached")

        # TODO: executing method copied?
        yield self.subscribe(self.gtfsAnimation02bDesk1, 'hcu.csl.smsq.desk1.gtfsAnimate01')
        print('Subscribed to hcu.csl.smsq.desk1.gtfsAnimate01')
        yield self.subscribe(self.gtfsAnimation02bDesk2, 'hcu.csl.smsq.desk2.gtfsAnimate01')
        print('Subscribed to hcu.csl.smsq.desk2.gtfsAnimate01')

    def gtfsAnimation02bDesk1(self, string):
        # 'string' isn't used. just for sending anything...

        print('receiving values...')

        # 0. get important ol.layers for animation
        # driver = ogr.GetDriverByName("WFS")
        # wfs = driver.Open(wfs_url, 0) # 0 means read-only. 1 means writeable.

        # stops = wfs.GetLayerByName('csl:hvv_stops')
        # shapes = wfs.GetLayerByName('csl:hvv_shapes')
        # shapez = wfs.GetLayerByName('csl:hvv_shapes')

        print('Start gtfsAnimation# 01 of 02...')

        # (!)
        # trips = getNextTrips(dow) # sql
        trips = getFutureTripsWithShape(dow) # sql
        print(len(trips))

        if len(trips)>0:
            print(trips[0]['departure_time'])
            print(datetime.now().time())

            # transform vars
            source = osr.SpatialReference()
            source.ImportFromEPSG(4326) # lon, lat
            target = osr.SpatialReference()
            # target.ImportFromEPSG(25832) # Hamburg
            target.ImportFromEPSG(3857) # Web Mercator
            transform = osr.CoordinateTransformation(source, target)

            temp_a = 0
            temp_b = 0

            log = []

            traveltime = 0
            pausetime = 0

            for i in range(0,len(trips)):
                sf = []
                # atempfeat = []

                # dumb ways:
                # #1: OGR-SetSpatialFilter/-SetAttributeFilter
                # #2: for-loops (several times) w/ OGR-ResetReading()(!)

                sf_lon = float(trips[i]['stop_lon'])
                sf_lat = float(trips[i]['stop_lat'])

                sfpoint = ogr.Geometry(ogr.wkbPoint)
                sfpoint.AddPoint(sf_lon, sf_lat)
                sfpoint.Transform(transform)

                sf.append([sfpoint.GetX(), sfpoint.GetY()]) # !

                # #3: with ARRAY_AGGs(distance deltas)
                index = 0
                delta = trips[i]['delta'][0]

                # sql-aggr_arrays don't stick to their indices, but don't lose relation...
                if len(trips[i]['delta']) > 1:
                    for m in range(1,len(trips[i]['delta'])):
                        if trips[i]['delta'][m] < delta:
                            index = m
                            delta = trips[i]['delta'][index]

                # (!)
                # atempfeat = getSFeatEquiv(trips[i]['shape_id'], sf_lon, sf_lat) # sql
                # assert len(atempfeat) = 1 (?)

                # if len(atempfeat) > 0:
                temp_a += 1

                # a-lternative s-tart f-eature
                asf_sid = trips[i]['shape_id']
                asf_sps = trips[i]['shape_pt_sequence'][index]

                tid = trips[i]['trip_id']  # trips.trip_id
                sqs = trips[i]['stop_sequence']  # times.stop_sequence

                # (!)
                bpoints = getRouteShapes(asf_sid, asf_sps, 50, tid, sqs) # sql
                # print(bpoints) // sind sortiert <sequence ASC>

                if len(bpoints) > 0:
                    temp_b += 1

                    # transform datetime to array as datetime is not json serializable
                    # TODO trips[i]['departure_time'] == bpoints[0][dep_times]
                    if len(bpoints[0]['dep_times']) == 2 and len(bpoints[0]['arr_times']) == 2:
                        traveltime_departure = bpoints[0]['dep_times'][0].minute
                        traveltime_arrival = bpoints[0]['arr_times'][1].minute

                        pausetime_departure = bpoints[0]['dep_times'][1].minute

                        # check times running over :59 (negative values)
                        if traveltime_departure > traveltime_arrival:
                            traveltime = ((traveltime_arrival+60) - traveltime_departure)
                        else:
                            traveltime = (traveltime_arrival - traveltime_departure)

                        if (traveltime_arrival > pausetime_departure):
                            pausetime = ((pausetime_departure+60) - traveltime_arrival)
                        else:
                            pausetime = (pausetime_departure - traveltime_arrival)
                    else:
                        traveltime = 1.1
                        pausetime = 1.1

                    # delete shape-points that are beyond the next bus-/metro-/train-station
                    odparams = []

                    # count bpoints until there's a bus stop
                    for n in range(0,len(bpoints)):
                        if bpoints[n]['stop'] == True:
                            odparams.append(int(bpoints[n]['shape_pt_sequence']))

                            # <break> loop if next station is detected
                            # and destination != origin
                            if len(odparams) > 1:
                                if int(bpoints[n]['shape_pt_sequence'])-1 not in odparams:
                                    break

                    # create array that provides linestring parameters
                    # like [[x,y], [x,y], ...]
                    delta = max(odparams)-min(odparams)
                    breakpoints = [None] * delta

                    # create geometry between two stations
                    for j in range(0, len(breakpoints)):

                        bp_lon = float(bpoints[j]['shape_pt_lon'])
                        bp_lat = float(bpoints[j]['shape_pt_lat'])

                        bpoint = ogr.Geometry(ogr.wkbPoint)
                        bpoint.AddPoint(bp_lon, bp_lat)
                        bpoint.Transform(transform)

                        breakpoints[j] = [bpoint.GetX(), bpoint.GetY()]

                    # pub-sub
                    package = json.dumps([
                        trips[i]['route_short_name'],
                        sf,
                        breakpoints,
                        # bpoints[0]['stop_sqs'],  # as array[2], from/to
                        traveltime,  # arr_times,  # as array[2], from/to
                        pausetime  # dep_times,  # as array[2], from/to
                    ])

                    # self.publish('hcu.csl.smsq.' + dest + 'gtfsAnimate02b', package)
                    self.publish('hcu.csl.smsq.' + 'desk1.' + 'gtfsAnimate02b', package)
                else:
                    log.append('One trip has ended: ' + trips[i]['route_short_name'])

                print(  # concat
                    str(i+1) + '/' +
                    str(len(trips)) + ': ' +
                    str(temp_b) + '/' +
                    str(temp_a) + ': ' +
                    str(trips[i]['route_short_name']) + ', ' +
                    str(traveltime) + ' min., ' +
                    str(pausetime) + ' min.'
                )

            # else:
            # print(str(i+1) + '/' + str(len(trips)) + ': ' + str(temp_b) + '/' + str(temp_a))

            for k in log:
                print(k)
        else:
            print('No new trips at this time.')

    def gtfsAnimation02bDesk2(self, string):
        # 'string' isn't used. just for sending anything...

        print('receiving values...')

        # 0. get important ol.layers for animation
        # driver = ogr.GetDriverByName("WFS")
        # wfs = driver.Open(wfs_url, 0) # 0 means read-only. 1 means writeable.

        # stops = wfs.GetLayerByName('csl:hvv_stops')
        # shapes = wfs.GetLayerByName('csl:hvv_shapes')
        # shapez = wfs.GetLayerByName('csl:hvv_shapes')

        print('Start gtfsAnimation# 01 of 02...')

        # (!)
        # trips = getNextTrips(dow) # sql
        trips = getFutureTripsWithShape(dow) # sql
        print(len(trips))

        if len(trips)>0:
            print(trips[0]['departure_time'])
            print(datetime.now().time())

            # transform vars
            source = osr.SpatialReference()
            source.ImportFromEPSG(4326) # lon, lat
            target = osr.SpatialReference()
            # target.ImportFromEPSG(25832) # Hamburg
            target.ImportFromEPSG(3857) # Web Mercator
            transform = osr.CoordinateTransformation(source, target)

            temp_a = 0
            temp_b = 0

            log = []

            traveltime = 0
            pausetime = 0

            for i in range(0,len(trips)):
                sf = []
                # atempfeat = []

                # dumb ways:
                # #1: OGR-SetSpatialFilter/-SetAttributeFilter
                # #2: for-loops (several times) w/ OGR-ResetReading()(!)

                sf_lon = float(trips[i]['stop_lon'])
                sf_lat = float(trips[i]['stop_lat'])

                sfpoint = ogr.Geometry(ogr.wkbPoint)
                sfpoint.AddPoint(sf_lon, sf_lat)
                sfpoint.Transform(transform)

                sf.append([sfpoint.GetX(), sfpoint.GetY()]) # !

                # #3: with ARRAY_AGGs(distance deltas)
                index = 0
                delta = trips[i]['delta'][0]

                # sql-aggr_arrays don't stick to their indices, but don't lose relation...
                if len(trips[i]['delta']) > 1:
                    for m in range(1,len(trips[i]['delta'])):
                        if trips[i]['delta'][m] < delta:
                            index = m
                            delta = trips[i]['delta'][index]

                # (!)
                # atempfeat = getSFeatEquiv(trips[i]['shape_id'], sf_lon, sf_lat) # sql
                # assert len(atempfeat) = 1 (?)

                # if len(atempfeat) > 0:
                temp_a += 1

                # a-lternative s-tart f-eature
                asf_sid = trips[i]['shape_id']
                asf_sps = trips[i]['shape_pt_sequence'][index]

                tid = trips[i]['trip_id']  # trips.trip_id
                sqs = trips[i]['stop_sequence']  # times.stop_sequence

                # (!)
                bpoints = getRouteShapes(asf_sid, asf_sps, 50, tid, sqs) # sql
                # print(bpoints) // sind sortiert <sequence ASC>

                if len(bpoints) > 0:
                    temp_b += 1

                    # transform datetime to array as datetime is not json serializable
                    # TODO trips[i]['departure_time'] == bpoints[0][dep_times]
                    if len(bpoints[0]['dep_times']) == 2 and len(bpoints[0]['arr_times']) == 2:
                        traveltime_departure = bpoints[0]['dep_times'][0].minute
                        traveltime_arrival = bpoints[0]['arr_times'][1].minute

                        pausetime_departure = bpoints[0]['dep_times'][1].minute

                        # check times running over :59 (negative values)
                        if traveltime_departure > traveltime_arrival:
                            traveltime = ((traveltime_arrival+60) - traveltime_departure)
                        else:
                            traveltime = (traveltime_arrival - traveltime_departure)

                        if (traveltime_arrival > pausetime_departure):
                            pausetime = ((pausetime_departure+60) - traveltime_arrival)
                        else:
                            pausetime = (pausetime_departure - traveltime_arrival)
                    else:
                        traveltime = 1.1
                        pausetime = 1.1

                    # delete shape-points that are beyond the next bus-/metro-/train-station
                    odparams = []

                    # count bpoints until there's a bus stop
                    for n in range(0,len(bpoints)):
                        if bpoints[n]['stop'] == True:
                            odparams.append(int(bpoints[n]['shape_pt_sequence']))

                            # <break> loop if next station is detected
                            # and destination != origin
                            if len(odparams) > 1:
                                if int(bpoints[n]['shape_pt_sequence'])-1 not in odparams:
                                    break

                    # create array that provides linestring parameters
                    # like [[x,y], [x,y], ...]
                    delta = max(odparams)-min(odparams)
                    breakpoints = [None] * delta

                    # create geometry between two stations
                    for j in range(0, len(breakpoints)):

                        bp_lon = float(bpoints[j]['shape_pt_lon'])
                        bp_lat = float(bpoints[j]['shape_pt_lat'])

                        bpoint = ogr.Geometry(ogr.wkbPoint)
                        bpoint.AddPoint(bp_lon, bp_lat)
                        bpoint.Transform(transform)

                        breakpoints[j] = [bpoint.GetX(), bpoint.GetY()]

                    # pub-sub
                    package = json.dumps([
                        trips[i]['route_short_name'],
                        sf,
                        breakpoints,
                        # bpoints[0]['stop_sqs'],  # as array[2], from/to
                        traveltime,  # arr_times,  # as array[2], from/to
                        pausetime  # dep_times,  # as array[2], from/to
                    ])

                    # self.publish('hcu.csl.smsq.' + dest + 'gtfsAnimate02b', package)
                    self.publish('hcu.csl.smsq.' + 'desk2.' + 'gtfsAnimate02b', package)
                else:
                    log.append('One trip has ended: ' + trips[i]['route_short_name'])

                print(  # concat
                    str(i+1) + '/' +
                    str(len(trips)) + ': ' +
                    str(temp_b) + '/' +
                    str(temp_a) + ': ' +
                    str(trips[i]['route_short_name']) + ', ' +
                    str(traveltime) + ' min., ' +
                    str(pausetime) + ' min.'
                )

            # else:
            # print(str(i+1) + '/' + str(len(trips)) + ': ' + str(temp_b) + '/' + str(temp_a))

            for k in log:
                print(k)
        else:
            print('No new trips at this time.')

    def onDisconnect(self):
        print("disconnected")
        if reactor.running:
            reactor.stop()


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
