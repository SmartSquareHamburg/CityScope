import numpy as np
from scipy import stats

import pickle  # TODO: move to json
import json

from os import environ

from twisted.internet import reactor
from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

from csl import load_config

# TODO mess of instance variables and non-instance variables...


def mode_of_grids(new_grid, grids, max_grids):
    """
    Insert new grid and return element-wise mode of current window
    :param new_grid:
    :return:
    """

    # TODO ich hab grids von global auf instance geändert, TESTEN! müsste mutable passen
    # TODO nope, ist nicht mutable... daher gebe ich jetzt sowohl grids als auch grids_mode zurück
    # TODO ist doch kacke die funktion so...

    # todo shape assertions

    new_grid = new_grid[np.newaxis, ...] # turn shape (x, x) to (1, x, x) so concat works

    # if we don't want a mode to be computed, so just return the new grid
    if max_grids == 1:
        return grids, new_grid

    # remove the oldest/earliest grid
    grids = np.delete(grids, 0, axis=0)

    # adding the current_grid to the end of grids
    grids = np.concatenate((grids, new_grid))
    # TODO ^ crashes if grids arrive when it is not ready! find out why!
    #   builtins.ValueError: zero-dimensional arrays cannot be concatenated
    # To replicate, start colortizer before the whole crossbar shebang

    # calculate the element-wise mode
    grids_mode = stats.mode(grids, axis=0)
    return grids, grids_mode[0]  # 0 = mode, 1 = counts


def find_changes(grid_a, grid_b, gridsize) -> list:
    """
    Returns a list of changes between two grids (only returns the new value)
    :param grid_a:
    :param grid_b:
    :return: (u, v, new value)
    """

    # TODO shape assertions

    if max_grids == 1:
        grid_b = grid_b[np.newaxis, ...] # turn shape (x, x) to (1, x, x) so concat works

    # create a matrix of same dimensions with True/False values depending on equality
    equal = (np.array(grid_a) == np.array(grid_b))

    num_changes = gridsize*gridsize - np.sum(equal)
    if num_changes > 0:
        print("INFO: {} changes detected".format(num_changes))
    #elif num_changes > 100:
    #    print("WARNING: {} changes detected, this can't be right".format(num_changes))
    #    return None

    # get indices of changes, array of same dimensions. first dimension is always 0 for us
    changed = np.where(equal == False)
    # (array([0, 0]), array([ 9, 20]), array([ 5, 12]))
    # means we have changes at 9, 5 and 20, 12

    # turn the columns into shape (1, N) arrays so concatenate works
    rows = np.array([changed[1]]).transpose()
    columns = np.array([changed[2]]).transpose()

    # concatenate u and v values into a 2xN array
    changed_cells = np.concatenate([rows, columns], axis=1)

    changes = []

    for (row, column) in changed_cells:
        new_value = grid_b[0, row, column] # hier war [0, u, v] für colortizer_to_grid
        changes.append((row, column, new_value))

    return changes


def print_changes(changes: list) -> None:
    for (row, column, new_value) in changes:
        print("INFO: At Row: {r}, Column: {c} we found new value {v}".format(r=row, c=column, v=new_value))


class Component(ApplicationSession):

    config = load_config()
    gridsize = config['gridsize']
    max_grids = config['grid_interpolation']

    grids = None
    last_grid = None

    pause = False

    def initialise_grids(self, max_grids, gridsize):
        # the array of grids has shape (max_grids, gridsize, gridsize)
        self.grids = np.zeros(shape=(max_grids, gridsize, gridsize), dtype=int)
        #self.grids.fill(-1) # TODO changed from -1 to zeros again, since we use that now
        self.last_grid = np.zeros(shape=(1, gridsize, gridsize), dtype=int)
        #self.last_grid.fill(-1)

    @inlineCallbacks
    def onJoin(self, details):
        print("session attached")
        sub_grid = yield self.subscribe(self.on_event_grid, 'hcu.csl.grid')
        print("Subscribed to hcu.csl.grid with {}".format(sub_grid.id))
        sub_bbox = yield self.subscribe(self.on_event_bbox, 'hcu.csl.bbox')
        print("Subscribed to hcu.csl.bbox with {}".format(sub_bbox))
        sub_sessionlayer = yield self.subscribe(self.on_event_sessionlayer, 'hcu.csl.sessionlayer')
        print("Subscribed to hcu.csl.sessionlayer with {}".format(sub_sessionlayer))

        self.initialise_grids(self.max_grids, self.gridsize)

    def on_event_sessionlayer(self, event):
        """
        Allows to pause change detection
        :param event:
        :return:
        """
        if event == "pause":
            print("INFO: Pausing change detection")
            self.pause = True
        elif event == "unpause":
            print("INFO: Unpausing change detection")
            self.pause = False

    def on_event_bbox(self, x0, y0, x1, y1):
        # if bbox gets changed we need to wipe the grids
        # even when paused!
        print("INFO: Got new BBOX, wiping grids: {}".format((x0, y0, x1, y1)))
        self.initialise_grids(self.max_grids, self.gridsize)

    def on_event_grid(self, grid):
        if self.pause:
            return None

        new_grid = pickle.loads(grid)

        if max_grids > 1:
            self.grids, current_mode = mode_of_grids(new_grid, self.grids, self.max_grids)
        else:
            current_mode = new_grid

        changes = find_changes(self.last_grid, current_mode, self.gridsize)

        if changes:
            self.last_grid = current_mode
            # TODOTODO we need to ignore the first change as it is from 00000 to SOMETHING
            # in our case to -1 -1 -1 -1 -1. we dont want to propagate that...
            # For proper pause/unpause, the table has to be repopulated before resuming (of course)
            # if that was ignored, lifting a block and placing it again will trigger it as change

            u = int(changes[0][0])
            v = int(changes[0][1])
            val = int(changes[0][2])

            message = [u, v, val, self.gridsize]

            print('publishing hcu.csl.changes.cityscope', message)
            print_changes(changes)  # TODO: Necessary?

            # das verkackte hcu vpn lässt nichts durch, maximal string mit 812 chars gepickelt, wtf!
            #changes = "t"*812
            #print(len(changes))

            self.publish('hcu.csl.changes.cityscope', json.dumps(message))
            # self.publish('hcu.csl.changes.cityscope', pickle.dumps(changes, protocol=0))

        # else the last_grid == current_mode so we can just leave it as it is

    def onDisconnect(self):
        print("disconnected")
        if reactor.running:
            reactor.stop()


if __name__ == '__main__':
    config = load_config()
    realm = config['realm']
    router = config['router']
    ws_server = config['ws_server']
    gridsize = config['gridsize']
    max_grids = config['grid_interpolation']

    runner = ApplicationRunner(
        environ.get(router, ws_server),  # TODO why environ.get?
        realm
    )
    runner.run(Component)
