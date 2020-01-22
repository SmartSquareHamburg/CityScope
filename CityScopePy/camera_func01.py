#!/usr/bin/env python
# -*- coding: utf-8 -*-

## 27.11.2017
## TM@SmartSquare
## 1/6 scripts (1/3 colortizer)
##
## w/o main-method
## functions to publish a grid-array (u,v,value) for a single camera
##

# from os import environ
import cv2
import numpy as np
# from imagestuff import * # :D
from time import time
# import pickle
import sys
# from autobahn.twisted.util import sleep
# from twisted.internet.defer import inlineCallbacks
# from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner
from math import floor

# from csl import load_config
# from scipy.interpolate import griddata
start_time = time()

'''
	Hardcoding START
'''
gridsize = 11
'''
	Hardcoding END
'''

# debug 0 = none, 1 = print debug messages, 2 = write images # TODOTOD make that true again
# pass as second argument
debug = 0
if debug >= 1:
    np.set_printoptions(threshold=np.nan)  # print full np arrays, careful...


# target:
image_width = gridsize*gridsize
image_height = image_width

"""
# soll-koordinaten
äußere sowie quadrat in der mitte auf 8, 19
# they have to be float for findHomography
"""


# hannes: the two functions below use different gridsize, this is super confusing and ugly

# berechnet die koordinaten der grid-schnittpunkte aus den kamerabildern und kalibriert somit die kameras/ das system
# input: kalibrierungsbild (paint) --> todo tom
# input: "gridsize" (anzahl der schnittpunkte pro achse)
# output: koordinaten der schnittpunkte im originalbild
def generate_pts_src(camera, gridsize=12):
    # image_path = 'calibration_images/points_{position}.png'.format(position=camera['position'])
    # image_path = 'test_schrank/kalib.png'
    image_path = 'kalib.png'
    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # convert color
    assert gray.shape == (720, 1280)

    contour, hier = cv2.findContours(gray, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)[-2:]
    centroids = []

    for cnt in contour:
        mom = cv2.moments(cnt) # wiki: "an image moment is a certain particular weighted average (moment) of the image pixels' intensities", detail: http://docs.opencv.org/3.1.0/d8/d23/classcv_1_1Moments.html
        if int(mom['m10']) > 0:
            (x,y) = int(mom['m10']/mom['m00']), int(mom['m01']/mom['m00'])

            cv2.circle(image,(x,y),4,(0,255,0),-1) #rgb 'lime'
            centroids.append((x,y))
    print("We found {} centroids.".format(len(centroids)))
    assert len(centroids) == gridsize*gridsize  # probe

    # hannes: now we have the list of centroid coordinates, we need to sort it though
    centroids = np.array(centroids,dtype = np.float32)
    c = centroids.reshape((gridsize*gridsize,2)) # tom: unnötig? werte bleiben gleich...
    c2 = c[np.argsort(c[:,1])] # sortiert alle zeilen (:) aufsteigend nach dem y-Wert (,1) # tom: why?

    b = np.vstack([c2[i*gridsize:(i+1)*gridsize][np.argsort(c2[i*gridsize:(i+1)*gridsize,0])] for i in range(gridsize)]) # hannes: wat? this was from SO, wasn't it? sudoku example? # output: 1x841x(tuple)

    pts_src = b.reshape((gridsize, gridsize, 2)) # 29x29 # [[[2.960 2.0][...]]]
    pts_src = pts_src.reshape(gridsize*gridsize, 2)  #hannes: why reshape twice? 8) # [[296. 2.][...]]
    pts_src = pts_src[:,::-1]  # hannes: fix this earlier... # "reverse a list using [::-1] (double colon)"
    #print('pts_src:')
    #print(pts_src)
    return pts_src


def generate_pts_dst(gridsize=12):
    pts_dst = np.zeros((gridsize*gridsize, 2), dtype=np.float32)
    shift = gridsize/ 2
    dx = dy = shift
    n = 1

    for i in pts_dst:
        if n > gridsize:
            dy += gridsize
            n = 1

        i[0] = dy
        n += 1

    for i in pts_dst:
        if dx > gridsize*gridsize - shift:
            dx = shift

        i[1] = dx
        dx += gridsize

    return pts_dst

# # tom: wurde gekürzt durch Einzeiler...
# def decompose_lab(image):
# image_lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
# return cv2.split(image_lab)

'''
	Color-Recognition: Thresholds
'''
def threshold_masks(channel_l, channel_a, channel_b):
    # mask_green = np.where(channel_a < 128 -8, 255, 0).astype(np.uint8) # b, a, L (OpenCV)
    # mask_red = np.where(channel_a > 128 +17, 255, 0).astype(np.uint8)
    # mask_blue = np.where(channel_b < 128 -18, 255, 0).astype(np.uint8)
    # mask_yellow = np.where(channel_b > 128 +12, 255, 0).astype(np.uint8)
    # mask_black = np.zeros(channel_l.shape, dtype=np.uint8)

    mask_green = np.where(channel_a < 128 -32, 255, 0).astype(np.uint8) # b, a, L (OpenCV)
    mask_red = np.where(channel_a >= 128 +16, 255, 0).astype(np.uint8)
    mask_blue = np.where(channel_b < 128 -16, 255, 0).astype(np.uint8)
    mask_yellow = np.where(channel_b >= 128 +16, 255, 0).astype(np.uint8)
    mask_black = np.zeros(channel_l.shape, dtype=np.uint8)

    masks = (mask_black, mask_green, mask_red, mask_blue, mask_yellow)

    masks = [remove_camera(mask, image_width, image_height) for mask in masks]

    return masks

# def remove_camera(mask, image_width: int, image_height: int):
def remove_camera(mask, image_width, image_height):
    assert mask.dtype == np.uint8
    camera_mask = np.ones((image_width, image_height), np.uint8)
    tl, br = (336, 728), (420, 784)

    cv2.rectangle(camera_mask, tl, br, 0, -1)

    return mask * camera_mask

def create_image_grid(width, height, gridsize):
    #tom#: erstellt ein rechtwinkliges raster-gitter entsprechend der parameter

    ### Create a grid
    # TODO image shape has to be a multiple of the gridsize or we will get stupid lines here, cant plot subpixel/floatcoords
    # TODO binary instead of 3 channel!
    image_grid = np.ones((width, height, 3), np.uint8)
    step_x = int(width / gridsize)
    step_y = int(height / gridsize)
    # print(step_x)
    # print(step_y)

    # vertical lines
    for x in range(0, width + step_x, step_x):
        cv2.line(image_grid, (x, 0), (x, height), (255, 255, 255), 1)

    # horizontal lines
    for y in range(0, height + step_y, step_y):
        cv2.line(image_grid, (0, y), (width, y), (255, 255, 255), 1)

    # print('image_grid:')
    # print(image_grid)
    # print(image_grid.shape)

    return image_grid


def create_image_grid_subdiv(width, height, gridsize):
    ### Create a grid with subdivisions
    # TODO eher subdiv= flag zu der create_image_grid function hinzufuegen!
    # TODO mein subdiv grid hat rechts und unten zuwenig rand?!
    image_grid = create_image_grid(width, height, gridsize)

    # these are supposed to be floats
    step_x = width / gridsize / 2.0
    step_y = height / gridsize / 2.0

    # vertical lines
    x = 0
    while x < width:
        cv2.line(image_grid, (int(round(x,0)), 0), (int(round(x,0)), height), (255, 255, 255), 1)
        x += step_x

    # horizontal lines
    y = 0
    while y < height:
        cv2.line(image_grid, (0, int(round(y,0))), (width, int(round(y,0))), (255, 255, 255), 1)
        y += step_y

    # print('image_grid:')
    # print(image_grid)
    # print(image_grid.shape)

    return image_grid

# def get_subcells(masks, image_width: int, image_height: int, gridsize: int, grid_subdiv):
# """
# split the masks by subdiv grid
# find contours
# set each corresponding subcell UV to each contour's color code
# returns a list of "filled" subcells
# """
# subcells_all = []

# # # test-plots
# test_a = cv2.morphologyEx(masks[2], cv2.MORPH_CLOSE, np.ones((3, 3),np.uint8)) # masks[2] == red
# test_b = test_a * grid_subdiv
# test_c = np.where(test_b > 145, 255, 0).astype(np.uint8) # values for masks[2]
# test_d0, test_d1, test_d2 = cv2.findContours(test_c.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
# # print(test_d1)
# # print(test_d1[0])

# test_e0 = np.zeros((gridsize*gridsize, gridsize*gridsize, 3), np.uint8)
# test_e1 = cv2.drawContours(test_e0, test_d1, -1, (0,255,0), 1)

# cv2.imshow('test_e1', test_e1)
# cv2.waitKey(0)
# cv2.destroyAllWindows()

# test_h = cv2.contourArea(test_d1[0])
# # print(test_h)

# test_f = get_centroid(test_d1[0])
# test_g = image_xy_to_subgrid_uv(test_f[0], test_f[1], image_width, image_height, gridsize, gridsize)
# print('get_subcells() --> test_g:')
# print(test_g)
# test_i = (test_g, '0', test_h)
# print('get_subcells() --> test_i:')
# print(test_i)

# # cv2.imshow('test_g', test_g)
# # cv2.waitKey(0)
# # cv2.destroyAllWindows()

# # cv2.imshow('test_h', test_h)
# # cv2.waitKey(0)
# # cv2.destroyAllWindows()

# dict = {}
# uv = test_i[0]
# dict[uv] = test_i

# test_k = []
# test_k.append(test_i)
# print('get_subcells() --> From Array:')
# print(test_k)
# print('get_subcells() --> To Dict:')
# print(dict.values())

# print('get_subcells() --> As Row-Column-Unit:')
# print('(' + str(test_k[0][0][0]/2) + ', ' + str(test_k[0][0][1]/2) + ')')

# # assert test_b.all() == test_c.all() # tom: is true... überflüssig?
# # print('test_i')
# # print(test_i)
# # cv2.imshow('test_e1', test_e1)
# # cv2.waitKey(0)
# # cv2.destroyAllWindows()

# # # test-plots_ende

# for color_code, mask in enumerate(masks):
# # color_code == index within masks

# kernel = np.ones((3, 3),np.uint8) # 3x3-Matrix

# closed_mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
# # http://docs.opencv.org/trunk/d9/d61/tutorial_py_morphological_ops.html
# # Closing is reverse of Opening, Dilation followed by Erosion. It is useful in closing small holes inside the foreground objects, or small black points on the object.

# for subcell in subcells_all:
# # Then cut the mask with the subdiv grid, we split everything so the shapes are not connected anymore
# closed_mask *= grid_subdiv

# ## TODOTODO hier kommt KEIN binäres bild raus, wtf!
# closed_mask = np.where(closed_mask > 1, 255, 0).astype(np.uint8) #workaround erstmal

# image, contours, hierarchy = cv2.findContours(closed_mask.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)  # findContours modifies the image (mask here) so i copy!

# blank_image = np.zeros((gridsize*gridsize, gridsize*gridsize, 3), np.uint8)
# contour_image = cv2.drawContours(blank_image, contours, -1, (0,255,0), 1)

# # let's collect the centroid and color of each contour
# for contour in contours:
# contour_area = cv2.contourArea(contour)
# contour_area_limit = 30
# if contour_area < contour_area_limit:
# # a perfect square would have about 10x10 pixels for our 784x784 images
# # we can purge substandard ones here to improve the quality of detection
# # TODOTODO test if this was a good idea :D
# if debug >= 3: print("DEBUG: contour_area < {}, skipping".format(contour_area_limit))
# continue

# contour_x, contour_y = get_centroid(contour)
# uv = image_xy_to_subgrid_uv(contour_x, contour_y, image_width, image_height, gridsize, gridsize)
# subcell = (uv, color_code, contour_area)
# subcells_all.append(subcell)

# if debug >= 3: print(subcells_all)

# subcells_dict = {}
# for subcell in subcells_all:
# uv = subcell[0]
# code = subcell[1]
# area = subcell[2]
# if uv in subcells_dict.keys():
# if subcells_dict[uv][1] == 0 and code != 0:
# if debug >= 3: print("overwriting: {o} with {n}".format(o=subcells_dict[uv], n=subcell))
# subcells_dict[uv] = subcell
# if subcells_dict[uv][2] < area:
# if debug >= 2: print("overwriting: {o} with {n}".format(o=subcells_dict[uv], n=subcell))
# subcells_dict[uv] = subcell
# else:
# subcells_dict[uv] = subcell

# if debug >= 3: print(subcells_dict)
# subcells = subcells_dict.values()

# return subcells

# def getSubcells(masks, imageShape: (int, int), gridsize: int, grid_subdiv):
def getSubcells(masks, imageShape, gridsize, grid_subdiv):
    """
    split the masks by subdiv grid
    find contours
    set each corresponding subcell UV to each contour's color code
    returns a list of "filled" subcells
    """

    # # # test-plots
    # test_a = cv2.morphologyEx(masks[2], cv2.MORPH_CLOSE, np.ones((3, 3),np.uint8)) # masks[2] == red
    # test_b = test_a * grid_subdiv
    # test_c = np.where(test_b > 145, 255, 0).astype(np.uint8) # values for masks[2]
    # test_d0, test_d1, test_d2 = cv2.findContours(test_c.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    # # print(test_d1)
    # # print(test_d1[0])

    # test_e0 = np.zeros((gridsize*gridsize, gridsize*gridsize, 3), np.uint8)
    # test_e1 = cv2.drawContours(test_e0, test_d1, -1, (0,255,0), 1)

    # cv2.imshow('test_e1', test_e1)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    # test_h = cv2.contourArea(test_d1[0])
    # # print(test_h)

    # test_f = getCentroid(test_d1[0])
    # test_g = imageXY2SubgridRC(test_f, imageShape, gridsize, 2)
    # print('get_subcells() --> test_g:')
    # print(test_g)
    # test_i = (test_g, '0', test_h)
    # print('get_subcells() --> test_i:')
    # print(test_i)

    # # cv2.imshow('test_g', test_g)
    # # cv2.waitKey(0)
    # # cv2.destroyAllWindows()

    # # cv2.imshow('test_h', test_h)
    # # cv2.waitKey(0)
    # # cv2.destroyAllWindows()

    # dict = {}
    # uv = test_i[0]
    # dict[uv] = test_i

    # test_k = []
    # test_k.append(test_i)
    # print('get_subcells() --> From Array:')
    # print(test_k)
    # print('get_subcells() --> To Dict:')
    # print(dict.values())

    # print('get_subcells() --> As Row-Column-Unit:')
    # print('(' + str(test_k[0][0][0]/2) + ', ' + str(test_k[0][0][1]/2) + ')')

    # # assert test_b.all() == test_c.all() # tom: is true... überflüssig?
    # # print('test_i')
    # # print(test_i)
    # # cv2.imshow('test_e1', test_e1)
    # # cv2.waitKey(0)
    # # cv2.destroyAllWindows()

    # # # test-plots_ende

    subcells_all = []

    for color_code, mask in enumerate(masks):
        # color_code == index within masks

        kernel = np.ones((3, 3),np.uint8) # 3x3-Matrix

        closed_mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        # http://docs.opencv.org/trunk/d9/d61/tutorial_py_morphological_ops.html
        # Closing is reverse of Opening, Dilation followed by Erosion. It is useful in closing small holes inside the foreground objects, or small black points on the object.

        # Then cut the mask with the subdiv grid, we split everything so the shapes are not connected anymore
        closed_mask *= grid_subdiv
        # cv2.imshow('closed_mask', closed_mask)
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()

        ## TODOTODO hier kommt KEIN binäres bild raus, wtf!
        closed_mask = np.where(closed_mask > 1, 255, 0).astype(np.uint8) #workaround erstmal

        image, contours, hierarchy = cv2.findContours(closed_mask.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)  # findContours modifies the image (mask here) so i copy!

        blank_image = np.zeros((gridsize*gridsize, gridsize*gridsize, 3), np.uint8)
        contour_image = cv2.drawContours(blank_image, contours, -1, (0,255,0), 1)
        # cv2.imshow('contour_image', contour_image)
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()
        # print(len(contours))

        # let's collect the centroid and color of each contour
        for contour in contours:
            contour_area = cv2.contourArea(contour)
            # print(contour_area)

            contour_area_limit = 0 # 5 # 30 # harcoded! -.-
            if contour_area < contour_area_limit:
                # a perfect square would have about 10x10 pixels for our 784x784 images
                # we can purge substandard ones here to improve the quality of detection
                # TODOTODO test if this was a good idea :D
                if debug >= 3: print("DEBUG: contour_area < {}, skipping".format(contour_area_limit))
                continue

            contourCentroid = getCentroid(contour)
            uv = imageXY2SubgridRC(contourCentroid, imageShape, gridsize, 2) # hardcoded! -.-
            # print(uv)
            subcell = (uv, color_code, contour_area)
            subcells_all.append(subcell)

    if debug >= 3: print(subcells_all)

    subcells_dict = {}
    for subcell in subcells_all:
        uv = subcell[0]
        code = subcell[1]
        area = subcell[2]
        if uv in subcells_dict.keys():
            if subcells_dict[uv][1] == 0 and code != 0:
                if debug >= 3: print("overwriting: {o} with {n}".format(o=subcells_dict[uv], n=subcell))
                subcells_dict[uv] = subcell
            if subcells_dict[uv][2] < area:
                if debug >= 2: print("overwriting: {o} with {n}".format(o=subcells_dict[uv], n=subcell))
                subcells_dict[uv] = subcell
        else:
            subcells_dict[uv] = subcell
        # ???

    if debug >= 3: print(subcells_dict)
    subcells = subcells_dict.values()

    return subcells

# def get_centroid(contour):
# """
# Returns the centroid of a cv2 contour
# """
# M = cv2.moments(contour)
# centroid_x = int(M['m10'] / M['m00'])
# centroid_y = int(M['m01'] / M['m00'])
# return centroid_x, centroid_y

def getCentroid(contour):
    """
    Returns the centroid of a cv2 contour
    """
    M = cv2.moments(contour)
    if(M['m00'] == 0):
        centroid_x = 0
        centroid_y = 0
    else:
        centroid_x = int(M['m10'] / M['m00'])
        centroid_y = int(M['m01'] / M['m00'])

    return (centroid_x, centroid_y)

# def image_xy_to_subgrid_uv(image_x, image_y, image_width, image_height, grid_width, grid_height, factor=2):
# """
# Returns the subgrid UV coordinate of an image pixel
# UV origin at top left, same as image
# factor = subdivision factor, how many cells are within a cell
# """
# # int() is used to floor
# pixel_per_u = int(image_width / grid_width / factor)
# pixel_per_v = int(image_height / grid_height / factor)
# grid_u = int(image_x / pixel_per_u)
# grid_v = int(image_y / pixel_per_v)
# return grid_u, grid_v

def imageXY2SubgridRC(pxCoord, imageShape, gridsize, factor):
    """
    Returns the (sub-)grid RC coordinate of an image pixel
    RC origin at top left, same as image
    factor = subdivision factor, how many cells are within a cell
    """
    pxPerC = imageShape[1]/ (gridsize * factor)
    pxPerR = imageShape[0]/ (gridsize * factor)	# ist identisch bei quadratischen images...
    # pxPerC = int(imageShape[1]/ gridsize/ factor)
    # pxPerR = int(imageShape[0]/ gridsize/ factor)

    # int() is used to floor (schneidet nachkommastellen ab) - zuweisung auf eindeutiges kaestchen
    subgridC = int(pxCoord[0]/ pxPerC)
    subgridR = int(pxCoord[1]/ pxPerR)

    return (subgridC, subgridR)


def subdiv_list_to_subgrid(subdiv_list, gridsize, factor=2):
    """
    Creates a zero-filled numpy array with the entries of the list added
    """
    subgrid = np.zeros((gridsize*factor, gridsize*factor), dtype=np.int)  # ich brauche 4 stellen und ggf negativ, uint16?

    for cell in subdiv_list:
        # print(cell)

        # ((centroid_u, centroid_v), color, area)
        # cell uv origin is topleft
        # for numpy the array indexing is v, u
        col = cell[0][0]
        row = cell[0][1]
        code = cell[1]

        subgrid[row, col] = code

    # print('subgrid:')
    # print(subgrid)

    return subgrid

def subgrid_codes_to_grid_codes(subdiv_grid, factor=2):
    """
    The subgrid is made of 4 cells per parent cell, this function returns the values of the subcells of a parent cell as one concatenated string
    A grid goes in (1, 2,"\n" 3, 4) -> a grid comes out (1243)
    Yes, codes are clockwise starting at topleft! like in colortizer
    ['0000' '0000' '0000' '0000' '0000' '0000' '0000' '0000' '0000' '0000'
  '0200' '0000' '0000' '2000' '0000' '0000' '0202' '2000' '0000' '0002'
  '0000' '0222' '0202' '0222' '0020' '0000' '2232' '0223']
    """

    subdiv_gridsize = subdiv_grid.shape[0] # TODO ugly?
    gridsize = int(subdiv_gridsize/factor)
    grid = np.zeros((gridsize, gridsize), dtype="int")  # np.str wäre nur 1 character!!!!!!! >:

    # 0 means NULL, our "color values"/codes start at 1
    # should we really use -1 as NULL...?
    # no, if we leave out 0, we can use easy(?) math below!

    # codes are in this order:
    # 1 2
    # 4 3
    # -> "1234"

    # this will only work for factor 2!
    # numpy array indexing is [v, u]!
    for row in range(0, subdiv_gridsize-1, factor):
        for col in range(0, subdiv_gridsize-1, factor):
            a = subdiv_grid[row, col]
            b = subdiv_grid[row, col+1]
            c = subdiv_grid[row+1, col+1]
            d = subdiv_grid[row+1, col]

            # code = a*1000 + b*100 + c*10 + d
            # nope, that would give us
            # 1 3
            # 2 4
            # :(

            #characters = (str(a), str(b), str(c), str(d))
            #code = "".join(characters)

            code = a*1000 + b*100 + c*10 + d
            # tom: ... folglich ist der Code als int abgelegt. Vorteil/Nachteil?

            #print("Cell {u} {v} is {code}".format(u=u, v=v, code=code))
            grid[int(row/2), int(col/2)] = code

    return grid

def code_to_value(target_number):
    assert type(target_number) == int  # 1234

    # number is a 4 digit number corresponding with colors found in subcells of the grid
    # eg 1234, 6168, 9012 etc
    # as bricks can be rotated, we have to accept for eg
    # 1 2
    # 4 3
    # all these variations:
    # 1234, 4123, 3412, 2341

    # mask_black, mask_green, mask_red, mask_blue, mask_yellow
    # 0, 1, 2, 3, 4
    codes = {

        # red/pink and blue
        2222: 1,  # 40,
        2223: 80,
        2233: 120,
        2323: 160,
        2333: 200,

        # blue and yellow
        3333: 240,
        3334: 280,
        3344: 320,
        3434: 360,
        3444: 400,

        # green and pink/red
        1111: 500,
        1112: 600,
        1122: 700,
        1212: 800,
        1222: 1000,

        # diverse... TODO
        1144: 900,
        2244: 1500,

        # investigatorbrick
        4444: 3,  # -1,


    } # TODO from csl.ini?

    # loop over the entries of the dict
    for code, value in codes.items():
        # number = 2323
        # code = 120

        # create them ONCE, instead of every time...?
        # NOPE irrelevant, its fast...

        # (a % 1000) * 10 + floor(a / 1000) # shifts the number 1234 to 2341
        var1 = code
        var2 = (var1 % 1000) * 10 + floor(var1 / 1000)
        var3 = (var2 % 1000) * 10 + floor(var2 / 1000)
        var4 = (var3 % 1000) * 10 + floor(var3 / 1000)
        variations = (var1, var2, var3, var4)

        # if any(n in number for n in variations):  # TODO so machen?
        for variation in variations:
            if variation == target_number:
                return value

    return 0 # TODO this should rather return None, eh? right now this 0 is already used elsewhere i think so be careful changing this

def code_grid_to_value_grid(grid):
    """
    Turns a grid of the subcell-codes per cell into the "proper" identifier per cell
    in: <U4
    out: int64 # TODO int8 reicht?
    [-1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1  9 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 10 -1 -1]]
    """
    # print('grid:')
    # print(grid)

    f = np.vectorize(code_to_value, otypes=["int"])
    code_grid = f(grid)

    # print('code_grid:')
    # print(code_grid)

    return code_grid

# def draw_subcells_on_image(image, image_width: int, image_height: int, gridsize: int, subcells):
def draw_subcells_on_image(image, image_width, image_height, gridsize, subcells):
    # draw the subcell values into the image
    for subcell in subcells:
        u, v = subcell[0]
        color_code = subcell[1]

        x, y = subgrid_uv_to_image_xy(u, v, image_width, image_height, gridsize)
        cv2.putText(image, str(color_code), (x, y), cv2.FONT_HERSHEY_PLAIN, 0.7, (0, 255, 0))

def subgrid_uv_to_image_xy(u, v, image_width, image_height, gridsize, factor=2):
    """
    Returns the center image pixel that lies inside this UV subgrid coordinate
    UV origin at top left, same as image
    """
    # TODO testen!
    cell_width = int(image_width / gridsize / factor)
    cell_height = int(image_height / gridsize / factor)

    x = int(0 + cell_width / 2 + (cell_width * u))
    y = int(0 + cell_height / 2 + (cell_height * v))

    return x, y

def display_interpreted_image(image_displayed, camera):
    windowname_main = "Main - " + camera['url']
    cv2.namedWindow(windowname_main)
    cv2.imshow(windowname_main, image_displayed)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

def display_allthethings(channel_l, channel_a, channel_b, mask_green, mask_red, mask_blue, mask_yellow, mask_black, image_displayed, camera):
    # http://stackoverflow.com/questions/11067962/is-it-possible-to-have-black-and-white-and-color-image-on-same-window-by-using-o/11069276
    # UGH!?
    image_green = channel_a * mask_green
    cv2.putText(image_green, "green", (10, 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255))
    image_green = cv2.cvtColor(image_green, cv2.COLOR_GRAY2BGR)
    image_red = channel_a * mask_red
    cv2.putText(image_red, "red", (10, 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255))
    image_red = cv2.cvtColor(image_red, cv2.COLOR_GRAY2BGR)
    image_blue = channel_b * mask_blue
    cv2.putText(image_blue, "blue", (10, 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255))
    image_blue = cv2.cvtColor(image_blue, cv2.COLOR_GRAY2BGR)
    image_yellow = channel_b * mask_yellow
    cv2.putText(image_yellow, "yellow", (10, 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255))
    image_yellow = cv2.cvtColor(image_yellow, cv2.COLOR_GRAY2BGR)
    image_black = channel_l * mask_black
    cv2.putText(image_black, "black", (10, 10), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255))
    image_black = cv2.cvtColor(image_black, cv2.COLOR_GRAY2BGR)

    channel_a = cv2.cvtColor(channel_a, cv2.COLOR_GRAY2BGR)
    channel_b = cv2.cvtColor(channel_b, cv2.COLOR_GRAY2BGR)
    channel_l = cv2.cvtColor(channel_l, cv2.COLOR_GRAY2BGR)

    image_top = np.hstack((image_green, image_red, image_black))
    image_bottom = np.hstack((image_blue, image_yellow, image_displayed))
    image_extra = np.hstack((channel_a, channel_b, channel_l))
    image_all = np.vstack((image_top, image_bottom, image_extra))
    #image_all = cv2.resize(image_all, None, fx=0.8, fy=0.8)

    windowname_masks = "Masks - "+camera['url']
    cv2.namedWindow(windowname_masks)
    cv2.imshow(windowname_masks, image_all)
    cv2.waitKey(0)
    cv2.destroyAllWindows()