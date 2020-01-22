"""
	IMPORTS
"""
# from os import environ, setsid, getpgid, killpg
import os
import signal

from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

import subprocess

from csl import load_config

from time import sleep

import win32api


"""
	VARIABLES
"""

# dest = 'desk1.'  # publish-names

"""
	EXECUTION
"""

class Component(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        print("session attached")

        # subscribe topic that leads to a new animation (smsq_trxanim.py)
        # desk1
        try:
            yield self.subscribe(self.startTrxAnim, u'hcu.csl.smsq.desk1.startTrxAnim')

            print("subscribed to topic 'hcu.csl.smsq.desk1.startTrxAnim'")

        except Exception as e:
            print("could not subscribe to topic 'hcu.csl.smsq.desk1.startTrxAnim': {0}".format(e))

        # desk2
        try:
            yield self.subscribe(self.startTrxAnim, u'hcu.csl.smsq.desk2.startTrxAnim')

            print("subscribed to topic 'hcu.csl.smsq.desk2.startTrxAnim'")

        except Exception as e:
            print("could not subscribe to topic 'hcu.csl.smsq.desk2.startTrxAnim': {0}".format(e))

    def startTrxAnim(self, camera, timestamp, multiplier):
        print('startTrxAnim():' + ' ' + camera + ' ' + timestamp)

        # subprocess.call(['py', 'smsq_trxanim.py', camera, timestamp, multiplier])

        # call = system('start py smsq_trxanim.py' + ' ' + camera + ' ' + timestamp + ' ' + multiplier)
        # print(call)

        call = subprocess.Popen(
            'start py smsq_trxanim.py' + ' ' + camera + ' ' + timestamp + ' ' + multiplier,
            stdout=subprocess.PIPE,
            shell=True,
            # preexec_fn=os.setsid
        )

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
        os.environ.get(router, ws_server),  # TODO why environ.get?
        realm
    )
    runner.run(Component)
