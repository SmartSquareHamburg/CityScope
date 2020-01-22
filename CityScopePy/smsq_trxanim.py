"""
	IMPORTS
"""
from os import environ

from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

import psycopg2
from psycopg2.extras import RealDictCursor

import sys

from csl import load_config

"""
	VARIABLES
"""

# TODO: find solution for demand on desk2

dest = 'desk1.'  # publish-names

"""
	FUNCTIONS
"""
def getMinMaxTimeInfo(camname, timestamp):
    with psycopg2.connect(connstring, cursor_factory=RealDictCursor) as dbconn:
        dbconn.autocommit=True  # HK@g2lab: "so we do not need to conn.commit() every time"
        with dbconn.cursor() as cursor:
            cursor.execute(
                "SELECT " +
                "MIN(startframe), MAX(startframe) " +
                "FROM " +
                "trx_persec_vlines " +
                "WHERE " +
                "camname = %s AND " +
                "timestamp = %s AND " +
                "objtype = 1 ", (camname, timestamp)

            )
            result = cursor.fetchall()
        return result

def getTracks(camname, timestamp):
    with psycopg2.connect(connstring, cursor_factory=RealDictCursor) as dbconn:
        dbconn.autocommit=True  # HK@g2lab: "so we do not need to conn.commit() every time"
        with dbconn.cursor() as cursor:
            cursor.execute(
                "SELECT " +
                    "startframe, " +
                    "num, " +
                    "ST_ASTEXT(ST_TRANSFORM(geom, 3857)) AS geom " +
                "FROM " +
                    "trx_persec_vlines " +
                "WHERE " +
                    "camname = %s AND " +
                    "timestamp = %s AND " +
                    "objtype = 1 " +
                "ORDER BY " +
                    "startframe", (camname, timestamp)

            )
            result = cursor.fetchall()
        return result

def getTracksByTime(camname, timestamp, frame):
    with psycopg2.connect(connstring, cursor_factory=RealDictCursor) as dbconn:
        dbconn.autocommit=True  # HK@g2lab: "so we do not need to conn.commit() every time"
        with dbconn.cursor() as cursor:
            cursor.execute(
                "SELECT " +
                    "objtype, " +
                    "startframe, " +
                    "num::integer, " +
                    "ST_LENGTH(geom)/num AS speed, " +
                    "ST_ASTEXT(ST_TRANSFORM(geom, 3857)) AS geom " +
                "FROM " +
                    "trx_persec_vlines " +
                "WHERE " +
                    "camname = %s AND " +
                    "timestamp = %s AND " +
                    "objtype IN (1, 3) AND " +
                    "startframe = %s", (camname, timestamp, frame)

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

        # script is started with arguments:
        # args must come in double-braclets: "..."
        if len(sys.argv) > 1:
            camname = sys.argv[1]  # is string
            timestamp = sys.argv[2]  # is string
            multiplier = int(sys.argv[3])  # is int # speed-multiplier
        else:
            camname = 'null'  # dummy
            timestamp = 'null'  # dummy
            multiplier = 1  # dummy
            print('script started w/o arguments...')

        print(camname)
        print(timestamp)

        print('Start trxAnimation# 01 of ?...')

        min_max = getMinMaxTimeInfo(camname, timestamp)

        # min = min_max[0]['min']
        # print(min)
        max = min_max[0]['max']
        print('max: ' + str(max))

        '''
        starting loop
        '''
        frame = 0

        print('publishing timestamp ' + timestamp + ' ...')
        yield self.publish('hcu.csl.smsq.' + dest + 'animationTimestamp', [timestamp, multiplier])

        while True:
            if frame == max:
                print('Done.')
                break

            trxs = getTracksByTime(camname, timestamp, frame)

            if len(trxs) > 0:

                if len(trxs) > 1:
                    for i in range(0, len(trxs)):
                        # "publishing i of x tracks at frame y..."
                        print('publishing ' + str(i) + ' of ' + str(len(trxs)) + ' tracks at frame ' + str(frame))

                        print(trxs[i])
                        yield self.publish('hcu.csl.smsq.' + dest + 'trxAnimation', [trxs[i]], multiplier)
                else:
                    # "publishing x tracks at frame y"
                    print('publishing ' + str(len(trxs)) + ' tracks at frame ' + str(frame) + '...')
                    yield self.publish('hcu.csl.smsq.' + dest + 'trxAnimation', [trxs, multiplier])

            frame += 1
            yield sleep((1/25) / multiplier)

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
