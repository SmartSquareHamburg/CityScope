/*
     *  Detailtisch
     */

// https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.14/proj4.js
// Adds EPSG:25832 projection (ETRS89 / UTM zone 32N)
proj4.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");

var view = new ol.View({
    center: [1112870.8799573618, 7085233.297698348], // ol.proj.transform( [10.005150, 53.553325], 'EPSG:4326', 'EPSG:3857'),
    //rotation: Math.PI / 2,
    zoom: 19 // 12
});

var map = new ol.Map({
    target: 'map',
    view: view,
    pixelRatio: 1,	// sonst will OL 512x512 Kacheln und GWC antwortet HTTP400!
    controls: []	// disable all controls (includes attribution!)
});

// Scaleline zur Karte hinzufügen.
var scaleline = new ol.control.ScaleLine({
    units: 'metric',
    minWidth: 300
});
map.addControl(scaleline);

var curtainPolygon = new ol.style.Style({
    stroke: new ol.style.Stroke({color: [0, 0, 0, 1], width: 10}),
    fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 1)'})
});

// JavaScript-Datei dazuladen
$.getScript("ini.js", function () {
    console.log("ini.js loaded.");
});

// JavaScript-Datei dazuladen
$.getScript("map_layers.js", function () {
    console.log("map_layers.js loaded.");
});
