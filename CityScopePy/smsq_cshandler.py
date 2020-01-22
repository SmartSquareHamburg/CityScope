from osgeo import ogr, osr
from time import time
from datetime import datetime

from os import environ

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

from csl import load_config
from random import choice

import pickle
import json
# from csl import get_workshop

import psycopg2
from psycopg2.extras import RealDictCursor

# TODO benchmark if it would be faster if we kept the connection open forever and listen via WAMP
# or if we reconnect to the OWS server each time
# or if we just forge the HTTP requests ourselves...
# or if we always get the whole layer's data to local memory, operate on that and replace everything?

# This is quite horrible code.

# GLOBALS
wfs_url = None
workshop = None


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

def getDbaseData(column, table, whereCol, whereVal):
    columnData = None

    if len(column) > 1:
        col = ''

        for i in range(len(column)-1):
            col += column[i]+', '

        col += column[len(column)-1]

    else:
        col = column[0]

    query = 'SELECT '+col+' FROM '+table+' WHERE '+whereCol+ """='"""+str(whereVal+ """'""")
    print(query)

    with psycopg2.connect(connectionstring, cursor_factory=RealDictCursor) as dbconn:
        dbconn.autocommit=True  # so we do not need to conn.commit() every time... ;)
        with dbconn.cursor() as cursor:
            # cursor.execute('SELECT %s FROM %s WHERE %s=%s', (column, table, whereCol, whereVal))
            cursor.execute(query)  # triple-quoted strings (to add single-quote)
            columnData = cursor.fetchall()
        return columnData

def insert_point(coordinates: tuple, value: int) -> (str, int):
    """
    insert point to sessionlayer, return flurstueck_kennzeichen and current inhabitants
    we get 3857 from OL and use 25832 for this layer at CSL
    :param coordinates:
    :param value:
    :return: flurstueck_kennzeichen, current inhabitants
    """
    print(coordinates)
    print(value)

    if debug:
        start_time = time()
        print("DEBUG: Start: {}".format(start_time))

    '''
        Create and transform point from LEGO-brick to proper coordinates (rounded)
    '''
    # First create a proper geometry
    brick_point = ogr.CreateGeometryFromWkt("Point ({x} {y})".format(x=coordinates[0], y=coordinates[1])) # TODO is creating from WKT reasonable? feels stupid...

    # Then transform it from 3857 to 25832
    # aus cookbook
    source = osr.SpatialReference()
    source.ImportFromEPSG(3857)
    target = osr.SpatialReference()
    target.ImportFromEPSG(25832)
    transform = osr.CoordinateTransformation(source, target)
    brick_point.Transform(transform)
    print("Point in 25832: {}".format(brick_point))

    x25832 = brick_point.GetX()  # Get X coordinates
    y25832 = brick_point.GetY()  # Get Y coordinates

    # now we have super accurate sub millimeter coordinates again, so ...
    # x and y are rounded to the meter because we won't to get in any "this feature was 3 nanometers to the left" mess
    x25832 = round(x25832, 0)
    y25832 = round(y25832, 0)
    brick_point = ogr.CreateGeometryFromWkt("POINT ({x} {y})".format(x=x25832, y=y25832))
    print("New point is:", brick_point)
    # TODO surely above could be drastically simplified by transforming the coordinates first, then only creating ONE geometry...

    '''
        Bugfixing (create or overwrite)
    '''
    # # We have our new geometry, let's get the appropriate layer via WFS
    # # TODO nicht in der funktion, sondern in der klasse vorhalten!!?
    driver = ogr.GetDriverByName("WFS")
    wfs = driver.Open(wfs_url, update=1)  # 1 means writable

    # sessionlayer = None


    if value == 0:
        # Somehow we got a deletion even though there was no existing feature, let's just skip this then
        # del sessionlayer, wfs
        del wfs
        return None, None

    '''
        FindingPlaces
    '''
    # flurstuecke = wfs.GetLayerByName("csl:flurstuecke")
    # flurstuecke.SetSpatialFilter(brick_point) # magic!
    # assert len(flurstuecke) <= 1 # we should just get one flurstück or none at all

    # if len(flurstuecke) >= 0:
    # if debug: print("DEBUG: Flurstück found: {}".format(time()-start_time))
    # flurstueck = flurstuecke.GetNextFeature()
    # flurstueck_kennzeichen = flurstueck.fsk  # GetField("fsk") == .fsk :))
    # else:
    # if debug: print("DEBUG: No Flurstück found: {}".format(time()-start_time))
    # del flurstuecke, sessionlayer, wfs
    # return None, None

    # feature = ogr.Feature(sessionlayer.GetLayerDefn())

    # feature.SetGeometry(brick_point)
    # feature.SetField("platz", value)
    # feature.SetField("fsk", flurstueck_kennzeichen)
    # feature.SetField("status", 0)
    # feature.SetField("workshop", workshop)  # global can be read without declaring it global here :)

    # if debug:
    # print(feature.DumpReadable())
    # print("DEBUG: ^ Feature ready: {}".format(time()-start_time))
    # sessionlayer.CreateFeature(feature) # similar to layer.add(), magic!
    # if debug: print("DEBUG: Feature added: {}".format(time()-start_time))
    # del flurstueck, flurstuecke, sessionlayer, wfs  # TODO do i really need this?
    # return flurstueck_kennzeichen, value

    '''
        SmartSquare-GetNeighborsFromHandelskammer (Input: building.geom, Output: organizations inside) #1
    '''
    if value == -1:  # 3:  # 4x yellow legos  #code is typecasted already
        buildings = wfs.GetLayerByName('csl:altstadt_gebaeudeflaechengeschosse')
        buildings.SetSpatialFilter(brick_point)
        assert len(buildings) <= 1 # selected

        if len(buildings) >= 0:
            if debug: print("DEBUG: Building found: {}".format(time()-start_time))
            bld = buildings.GetNextFeature()

            geom = bld.GetGeometryRef()

            lag = bld.lag  # street-id
            hnr = bld.hnr  # house number
            pnr = bld.pnr  # "pseudo number" refers to main-bld
            lnr = bld.lnr  # like "pseudo number"

            return geom, [lag, hnr, pnr, lnr]  # get rid of "new"
        else:
            if debug: print("DEBUG: No Building found: {}".format(time()-start_time))
            del buildings, sessionlayer, wfs
            return None, None

    '''
        SmartSquare-GetUserGroup (Input: smsq_qualitativ.geom, Output: filtered-input-layer on map/ pictures of user-group) #1
    '''
    if value == 40:  # 1:  # 4x red legos  # code is typecasted already
        # usergroups = wfs.GetLayerByName('csl:smsq_q_nutzungszonen')
        usergroups = wfs.GetLayerByName('csl:q_nutzungszonen')
        usergroups.SetSpatialFilter(brick_point)
        # assert len(buildings) <= 1 # selected

        if len(usergroups) == 1:
            if debug: print("DEBUG: UserGroup found: {}".format(time()-start_time))
            userg = usergroups.GetNextFeature()
            nutzz = userg.nutzzone
            return nutzz, [userg.htmlcolor, userg.pid, userg.persona_short, userg.persona_long, userg.image, userg.quote1, userg.quote2, userg.timerange, userg.timeframe, userg.condition]
        elif len(usergroups) > 1:
            if debug: print("DEBUG: UserGroup found: {}".format(time()-start_time))
            ugroups = []

            for feature in usergroups:
                nutzz = feature.GetField('nutzzone')

                ugroups.append([
                    feature.GetField('htmlcolor'),
                    feature.GetField('pid'),
                    feature.GetField('persona_short'),
                    feature.GetField('persona_long'),
                    feature.GetField('image'),
                    feature.GetField('quote1'),
                    feature.GetField('quote2'),
                    feature.GetField('rangefrom'),
                    feature.GetField('rangeto'),
                    feature.GetField('framefrom'),
                    feature.GetField('frameto'),
                    feature.GetField('condition')
                ])

            return nutzz, ugroups
        else:
            if debug: print("DEBUG: No UserGroup found: {}".format(time()-start_time))
            del usergroups, sessionlayer, wfs
            return None

class Component(ApplicationSession):

    config = load_config()
    gridsize = config['gridsize']
    bbox = ()

    pause = False  # to pause accepting changes

    @inlineCallbacks
    def onJoin(self, details):
        print("session attached")

        sub_changes = yield self.subscribe(self.on_event_changes, 'hcu.csl.changes')
        print("Subscribed to hcu.csl.changes with {}".format(sub_changes.id))

        sub_changes_cs = yield self.subscribe(self.on_event_changes, 'hcu.csl.changes.cityscope')
        print("Subscribed to hcu.csl.changes.cityscope with {}".format(sub_changes_cs.id))

        sub_changes_bento = yield self.subscribe(self.on_event_changes, 'hcu.csl.changes.bento')
        print("Subscribed to hcu.csl.changes.bento with {}".format(sub_changes_bento.id))

        sub_bbox = yield self.subscribe(self.on_event_bbox, 'hcu.csl.smsq.desk1.bbox')
        print("Subscribed to hcu.csl.smsq.desk1.bbox with {}".format(sub_bbox))
        sub_sessionlayer = yield self.subscribe(self.on_event_sessionlayer, 'hcu.csl.sessionlayer')
        print("Subscribed to hcu.csl.sessionlayer with {}".format(sub_sessionlayer))

    def on_event_sessionlayer(self, event):
        """
        Allows to pause WFST edits and bbox updates
        Changes should not propagate here anyways when paused but bbox updates need to be ignored
        :param event:
        :return:
        """
        if event == "pause":
            print("INFO: Pausing WFST")
            self.pause = True
        elif event == "unpause":
            print("INFO: Unpausing WFST")
            self.pause = False

    def on_event_bbox(self, x0, y0, x1, y1):
        print("INFO: Got a bbox: {}".format((x0, y0, x1, y1)))
        self.bbox = (x0, y0, x1, y1)
    # yes, also if paused! especially then!

    def on_event_changes(self, changes):

        if self.pause:
            print("INFO: Ignoring changes, we are paused!")
            return None

        if not self.bbox:
            print("WARNING: Ignoring changes, we don't know the BBOX yet!")
            return None

        # global workshop
        # if not workshop:
        # workshop = get_workshop()

        changes = json.loads(changes)
        print("INFO: Changes {}".format(changes))

        # for change in changes:
        row = changes[0]
        column = changes[1]
        code = changes[2]
        grid = changes[3]

        x, y = rc_to_xy(row, column, self.bbox, grid)  # self.gridsize)
        print(x, y, code)

        # falls code = -1 -> get_fsk, delete feature at coordinate, recalculate sum(inhabitants) des flurstücks
        # sonst update/create feature at coordinate, get_fsk, recalculate sum(inhabitants) des flurstücks

        '''
            FindingPlaces #2
        '''
        # flurstueck_kennzeichen, gesetzte_plaetze = insert_point((x, y), code)
        # if flurstueck_kennzeichen is None and gesetzte_plaetze == -1:
        # # investigatorbrick :)
        # continue

        # print('publishing hcu.csl.flurstueck', (flurstueck_kennzeichen, gesetzte_plaetze))
        # self.publish('hcu.csl.flurstueck', (flurstueck_kennzeichen, gesetzte_plaetze))

        # # TODO race condition? wenn wir hier nicht schnell genug sind,
        # # kommen dann schnell aufeinanderfolgende changes rein?!
        # # TODOTODO das führt dazu, dass sich eine queue aufbaut... wird immer länger bis geoserver ram probleme bekommt

        '''
            SmartSquare-GetNeighbors #2
        '''
        if code == -1:  # 3: # 4x yellow legos
            # if insert_point((x, y), code) is not (None, None, None, None):

            geom = insert_point((x, y), code)[0]
            key = insert_point((x, y), code)[1] # = [lag, hnr, pnr, lnr]

            if(key[1]!=''):  # hnr
                case = [0, 'hnr']
                b_street_id = str(key[0])+'-'+str(key[1])
            else:
                if(key[2]!=''):  # pn3
                    case = [1, 'pnr']
                    b_street_id = str(key[0])+'-'+str(key[2])
                else:
                    case = [2, 'lnr']
                    b_street_id = str(key[0])+'-'+str(key[3])

            # get building-data and geometry
            b_data = getDbaseData(
                [
                    'nam',  # name, e. g. <town hall>, if exists
                    'namlag',  # street-name
                    case[1]+' AS hnr',  # house-number
                    'bezgfk',  # building's function
                    'aog',  # no. of levels w/o <aug>
                    'grf',  # area
                    'aug',  # no. of levels underground
                    'bja',  # construction-year
                    'ST_ASTEXT(geom) AS geom'
                ],
                'altstadt_gebaeudeflaechengeschosse',
                """CONCAT(lag,'-',"""+case[1]+')',  # str(key[0])+'-'+str(key[case]),
                b_street_id
            )

            print('publishing <bldginfo>:')
            print(b_data)

            # publish to map (highlight geometry)
            self.publish('hcu.csl.smsq.desk1.selectgeom', [json.dumps([{'geom': b_data[0]['geom']}])])  # geom

            # publish to screen (building-data)
            self.publish('hcu.csl.smsq.desk1.bldginfo', [
                json.dumps([{
                    'nam': b_data[0]['nam'],  # see above for description
                    'namlag': b_data[0]['namlag'],
                    'hnr': b_data[0]['hnr'],
                    'bezgfk': b_data[0]['bezgfk'],
                    'aog': b_data[0]['aog'],
                    'grf': float(b_data[0]['grf']),
                    'aug': b_data[0]['aug'],
                    'bja': b_data[0]['bja'],
                }])
            ])

            # get neighbor-data
            n_data = getDbaseData(
                ['hk_firma', 'hk_branche', 'hk_vertical', 'hk_minempl', 'hk_maxempl'],  # SELECT
                'hk_anrainer_new',  # FROM
                'geb_strid',  # WHERE
                b_street_id  # = ...
            )

            print('publishing <hkinfo>:')
            print(n_data)

            # publish to screen (hk-data)
            self.publish('hcu.csl.smsq.desk1.hkinfo', [json.dumps(n_data)])

        '''
            SmartSquare-GetUserGroup #2
        '''
        # if code == 0:

        # doesn't work because detections are not 100% clear

        # params = 'smsq_nutzzone_disp', 'STYLES', 'csl:smsq_q_nutzungszonen'
        # print('publishing things cuz of code=' + str(code))
        # self.publish('hcu.csl.smsq.desk1.usergroup', [json.dumps(code)])
        # self.publish('hcu.csl.smsq.desk1.updateParamsFromPy', [json.dumps(params)])

        if code == 40:  # 1:  # 4x red legos
            result = insert_point((x, y), code)

            nutzzone = result[0]
            usergrouplist = result[1]

            params = 'q_nutzungszonen_disp', 'STYLES', 'csl:smsq_q_nutzzone' + nutzzone

            print('publishing usergroup:')
            print(nutzzone + ' ' + str(usergrouplist))
            self.publish('hcu.csl.smsq.desk1.usergroup', [json.dumps(usergrouplist)])
            print('publishing updateParams-Command')
            self.publish('hcu.csl.smsq.desk1.updateParamsFromPy', [json.dumps(params)])

        print('publishing hcu.csl.sessionlayer', "update (wfst)")
        self.publish('hcu.csl.sessionlayer', "update")

    def onDisconnect(self):
        print("disconnected")
        if reactor.running:
            reactor.stop()


if __name__ == '__main__':
    config = load_config()
    realm = config['realm']
    router = config['router']
    ws_server = config['ws_server']
    connectionstring = config['dbconnstring']

    # global wfs_url
    wfs_url = config['ows_url']
    debug = config['debug']

    runner = ApplicationRunner(
        environ.get(router, ws_server),  # TODO why environ.get?
        realm
    )
    runner.run(Component)
