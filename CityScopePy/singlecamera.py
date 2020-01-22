#!/usr/bin/env python
# -*- coding: utf-8 -*-

from camera_func01 import * # still full of hardcode
from scipy.interpolate import griddata
from scipy import stats
import math
import json

from os import environ
from autobahn.twisted.util import sleep
from twisted.internet.defer import inlineCallbacks
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner

from csl import load_config

'''
	Camera-Def
'''
# camera = {
# "position": "xx",
# # "url": 'http://localhost:8080/teststream.mjpeg',
# "url": 'original.jpeg',
# "quadrant": "somewhere"
# }

camera_tl = {
    "position": "tl",
    "url": 'http://192.168.5.2:8080/webcam0_1280.mjpeg',
    "quadrant": "topleft"
}

camera_bl = {
    "position": "bl",
    "url": 'http://192.168.5.2:8080/webcam1_1280.mjpeg',
    "quadrant": "bottomleft"
}

camera_tr = {
    "position": "tr",
    "url": 'http://192.168.5.4:8080/webcam0_1280.mjpeg',
    "quadrant": "topright"
}

camera_br = {
    "position": "br",
    "url": 'http://192.168.5.4:8080/webcam1_1280.mjpeg',
    "quadrant": "bottomright"
}

'''
	Crossbar-Main
'''
class Component(ApplicationSession):
    @inlineCallbacks
    def onJoin(self, details):

        gridsize = 11

        # get command arguments with sys.argv: 0 is filename
        if len(sys.argv) > 1:
            cameras = (camera_tl, camera_bl, camera_tr, camera_br)
            camera = cameras[int(sys.argv[1])]
            global debug
            debug = int(sys.argv[2])
        else:
            camera = camera_br

        pts_src = generate_pts_src(camera, 12)
        pts_dst = generate_pts_dst()

        grid_x, grid_y = np.mgrid[0:143:144j, 0:143:144j] # tom: zwei matrizen mit zeilen-/spalten-nr.
        grid_z = griddata(pts_dst, pts_src, (grid_x, grid_y), method='linear') # 841 x 841 like grid_x/y

        map_x = np.append([], [ar[:,1] for ar in grid_z]).reshape(144,144)
        map_y = np.append([], [ar[:,0] for ar in grid_z]).reshape(144,144)
        map_x_32 = map_x.astype('float32') # declare as float
        map_y_32 = map_y.astype('float32')

        '''
            starting endless loop with <while True:>...
        '''
        while True:
            '''
                with Video-Stream
            '''
            cap = cv2.VideoCapture(camera['url'])
            cap.set(cv2.CAP_PROP_FPS, 5)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            cap.set(cv2.CAP_PROP_AUTOFOCUS, 0)
            cap.set(cv2.CAP_PROP_FOCUS, 0)

            ret, raw = cap.read()

            ''' 
                with Images (Test) 
            '''
            # raw = cv2.imread(camera['url'], cv2.IMREAD_UNCHANGED)

            '''
            '''

            print('Got new image to process...')

            image = cv2.remap(raw, map_x_32, map_y_32, cv2.INTER_LINEAR)
            image = image[6:image.shape[1] -6, 6:image.shape[1] -6] # hannes: r/c; tom: cut out image frame
            image = cv2.resize(image, (gridsize*gridsize, gridsize*gridsize)) # tom: ... and resize back (aber warum 11^2?)

            channel_l, channel_a, channel_b = cv2.split(cv2.cvtColor(image, cv2.COLOR_BGR2LAB))
            masks = threshold_masks(channel_l, channel_a, channel_b)
            mask_black, mask_green, mask_red, mask_blue, mask_yellow = masks

            grid_subdiv = create_image_grid_subdiv(image.shape[1], image.shape[0], gridsize)
            grid_subdiv = cv2.cvtColor(grid_subdiv, cv2.COLOR_BGR2GRAY)

            subcells = getSubcells(masks, image.shape, gridsize, grid_subdiv)

            subgrid_cells = subdiv_list_to_subgrid(subcells, gridsize)

            cells = subgrid_codes_to_grid_codes(subgrid_cells)
            cells_codes = code_grid_to_value_grid(cells)

            # display_allthethings(
            # channel_l, channel_a, channel_b,
            # mask_green, mask_red, mask_blue, mask_yellow, mask_black,
            # image, _displayed,
            # camera
            # )

            '''
                Crossbar-PubSub
            '''
            # serializing/encoding

            msg = json.dumps((camera['quadrant'], cells_codes.tolist()), separators=(',','['))

            ###
            # rotating cells_codes missing (depends on camera-position)

            yield self.publish('hcu.csl.single_grids', msg, protocol=0)
            print('published hcu.csl.single_grids', msg)
            yield sleep(0.001)

        ###
        # braucht ca. 8 Sekunden bis zum nächsten Ergebnis (Fujitsu Lifebook S)

if __name__ == '__main__':
    config = load_config()
    router = config['router']
    # ws_server = config['ws_server']
    ws_server = 'ws://csl.local.hcuhh.de:8081/ws'
    realm = config['realm']

    runner = ApplicationRunner(
        environ.get(router, ws_server),  # TODO why environ.get?
        realm
    )
    runner.run(Component)