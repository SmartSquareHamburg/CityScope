import numpy as np
import json
# import pickle
import cv2
from os import environ

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

from csl import load_config

# TODO mess of instance variables and non-instance variables...

image = None
debug = False

def montage_arrays(topleft=None, bottomleft=None, topright=None, bottomright=None):

    # FIXME why does this use None as default value? the quadrants are initialised as np.zeros below already

    # TODO instead of cropping the duplicate rows/columns, maybe average/median them instead somehow?

    # axis = 0 -> deletes rows
    # axis = 1 -> deletes columns

    # each array has 0..27 rows and 0..27 columns
    # they are already rotated to fit the table

    # we want to remove the highest row in the lowermost quadrants
    bottomleft = np.delete(bottomleft, (0), axis=0)
    bottomright = np.delete(bottomright, (0), axis=0)

    # h/v stack them
    left = np.vstack((topleft, bottomleft))
    right = np.vstack((topright, bottomright))

    # then we remove the leftmost column of the right side
    right = np.delete(right, (0), axis=1)

    full_grid = np.hstack((left, right))

    return full_grid


class Component(ApplicationSession):

    config = load_config()
    gridsize = config['gridsize']

    # Prepare empty grids
    blank_quadrant = np.zeros((28, 28), dtype=np.int)

    # At first all the quadrants are empty
    topleft = blank_quadrant
    bottomleft = blank_quadrant
    topright = blank_quadrant
    bottomright = blank_quadrant

    full_grid = np.zeros((gridsize, gridsize), dtype=np.int)

    pause = False

    @inlineCallbacks
    def onJoin(self, details):
        print("session attached")
        sub_grid = yield self.subscribe(self.on_event_grid, 'hcu.csl.test604')
        print("Subscribed to hcu.csl.test604 with {}".format(sub_grid.id))

    def on_event_grid(self, grid):

        print(grid)
        print(json.loads(grid))

        quadrant, array = json.loads(grid)  # grid is a tuple with (nparray, string). the string says which quadrant it is
        # quadrant, array = pickle.loads(grid)  # grid is a tuple with (nparray, string). the string says which quadrant it is

        #quadrant = grid['quadrant']
        #array = grid['array']

        print("Got quadrant: {}".format(quadrant))

        if quadrant == "topleft":
            self.topleft = array
        elif quadrant == "bottomleft":
            self.bottomleft = array
        elif quadrant == "topright":
            self.topright = array
        elif quadrant == "bottomright":
            self.bottomright = array

        self.full_grid = montage_arrays(self.topleft, self.bottomleft, self.topright, self.bottomright)

        self.publish('hcu.csl.grid', json.dumps(self.full_grid, protocol=0))
        # self.publish('hcu.csl.grid', pickle.dumps(self.full_grid, protocol=0))

        if debug:
            image = cv2.merge((self.full_grid, self.full_grid, self.full_grid)).astype(np.uint8)  # uint8 so we can resize and print
            image = cv2.resize(image, (1024, 1024), interpolation=cv2.INTER_NEAREST)  # trying to resize a int32 gave me some error imgwarp.cpp -215 "func != 0" blah
            cv2.normalize(image, image, 150, 255, cv2.NORM_MINMAX)
            cv2.imwrite("/tmp/full_grid.png", image)

    def onDisconnect(self):
        print("disconnected")
        if reactor.running:
            reactor.stop()


if __name__ == '__main__':
    config = load_config()
    realm = config['realm']
    router = config['router']
    ws_server = config['ws_server']
    gridsize_full = config['gridsize']
    gridsize_single = 28  # FIXME should just be floor(gridsize_full)+1

    runner = ApplicationRunner(
        environ.get(router, ws_server),  # TODO why environ.get?
        realm
    )
    runner.run(Component)
