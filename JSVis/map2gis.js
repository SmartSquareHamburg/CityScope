/*
 *  Bezirkstisch
 */

// https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.14/proj4.js
// Adds EPSG:25832 projection (ETRS89 / UTM zone 32N)
proj4.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");

var view = new ol.View({
    center: [1112649, 7085294], // ol.proj.transform( [10.005150, 53.553325], 'EPSG:4326', 'EPSG:3857'),
    //rotation: Math.PI / 2,
    zoom: 16.5 // 12
});

var map = new ol.Map({
    target: 'map',
    view: view,
    pixelRatio: 1,	// sonst will OL 512x512 Kacheln und GWC antwortet HTTP400!
    controls: []	// disable all controls (includes attribution!)
});

// Scaleline zur Karte hinzufügen.
var scaleline = new ol.control.ScaleLine({
    units:'metric',
    minWidth: 300
});
map.addControl(scaleline);

var curtainPolygon = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: [0, 0, 0, 1], width: 10 }),
    fill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 1)' })
});

/*
	Busfahrt START

*/

// [0] Get all public transit-lines (IDs, names) of AOI (e. g. Hamburg-Altstadt)
// - Vector-Layers with JSONP (still with ol v3.14.2) !
var smsq_hvv_filter = new ol.layer.Vector({
    source: new ol.source.Vector({
        loader: function(extent, resolution, projection){
            var url = 'http://csl.local.hcuhh.de:8080/geoserver/csl/ows?service=WFS&' +
                'version=1.0.0&request=GetFeature&typename=csl:smsq_hvv_filter&' +
                'outputFormat=text/javascript&format_options=callback:loadFeatures_hvvSpatialFilter'; // + &' +
            // Parametric SQL-View
            // 'viewparams:location=' + 'Altstadt';

            $.ajax({url: url, dataType: 'jsonp', jsonp: false});
        }
    })

    // NO GEOMETRY - NO STYLE
});

window.loadFeatures_hvvSpatialFilter = function(response){
    smsq_hvv_filter.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
};

smsq_hvv_filter.set('id', 'smsq_hvv_filter');
map.addLayer(smsq_hvv_filter);

// [1.0] Get all departure_times for each public transit-line
// - Vector-Layers with JSONP (still with ol v3.14.2) !
// function getTimesForLinenames(linenames){
// for(i=0; i<linenames.length;i++){
// var shortname = linenames[i].get('route_short_name'); // GTFS-Column

// var variable = new ol.layer.Vector({
// source: new ol.source.Vector({
// loader: function(extent, resolution, projection){
// var url = 'http://csl.local.hcuhh.de:8080/geoserver/csl/ows?service=WFS&' +
// 'version=1.0.0&request=GetFeature&typename=csl:smsq_hvv_routedata&' +
// 'outputFormat=text/javascript&format_options=callback:loadFeatures_hvvRouteData'; // + &' +
// // Parametric SQL-View
// // 'viewparams:location=' + 'Altstadt';

// $.ajax({url: url, dataType: 'jsonp', jsonp: false});
// }
// })

// // NO GEOMETRY - NO STYLE

// });

// window.loadFeatures_hvvRouteData = function(response){
// variable.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
// };

// this['hvvroutedata_' + shortname] = variable;

// this['hvvroutedata_' + shortname].set('id', 'hvvroutedata_' + shortname);
// map.addLayer(this['hvvroutedata_' + shortname]);
// }
// }

// [1.1] Get all linestrings for [0]
// - Vector-Layers with JSONP (still with ol v3.14.2) !
// function getLinestringsFromLinenames(linenames){
// for(i=0; i<linenames.length;i++){
// // var shortname = linenames[i].get('route_short_name'); // GTFS-Column

// var variable = new ol.layer.Vector({
// source: new ol.source.Vector({
// loader: function(extent, resolution, projection){
// var url = 'http://csl.local.hcuhh.de:8080/geoserver/csl/ows?service=WFS&' +
// 'version=1.0.0&request=GetFeature&typename=csl:smsq_hvv_routedata&' +
// 'outputFormat=text/javascript&format_options=callback:loadFeatures_hvvRouteData;'; // &' +
// // Parametric SQL-View
// // 'viewparams:shortname=' + shortname;

// $.ajax({url: url, dataType: 'jsonp', jsonp: false});
// }
// })
// // ,
// // style: new ol.style.Style({
// // stroke: new ol.style.Stroke({
// // color: '#FFFFFF',
// // width: 2
// // })
// // })
// });

// this['hvvroutedata_' + shortname] = variable;

// window.loadFeatures_hvvRouteData = function(response){
// this['hvvroutedata_' + shortname].getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
// };

// this['hvvroutedata_' + shortname].set('id', 'hvvroutedata_' + shortname);
// this['hvvroutedata_' + shortname].setZIndex(1);
// map.addLayer(this['hvvroutedata_' + shortname]);
// this['hvvroutedata_' + shortname].setVisible(true);
// }
// }

// [2] ...
var fewCoordinatesShort = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name',
        'properties': {
            'name': 'EPSG:3857'
        }
    },
    'features': [{
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': [
                [ 1112754.2699398184, 7085443.9513817718 ],
                [ 1112754.2699398184, 7085380.4512547739 ],
                [ 1112795.5450223717, 7085275.6760452278 ],
                [ 1112828.8825890468, 7085182.0133579075 ],
                [ 1112841.5826144442, 7085089.9381737551 ],
                [ 1112847.9326271443, 7084956.5879070545 ],
                [ 1112868.5701684193, 7084831.1751562282 ]
            ]
        }
    }]
};

var fewCoordinatesLong = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name',
        'properties': {
            'name': 'EPSG:3857'
        }
    },
    'features': [{
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': [
                [ 1110984.4599889806, 7085199.6471760729 ], [ 1111329.8722719168, 7085084.5097484272 ], [ 1111649.322193716, 7084962.5995309195 ], [ 1111948.4537459346, 7084879.0684559625 ], [ 1111928.1353763484, 7085081.1233534953 ], [ 1111991.3480817243, 7085077.7369585643 ], [ 1112077.1367533009, 7085089.0249416688 ], [ 1112118.9022907808, 7085110.4721095636 ], [ 1112274.6764575965, 7085230.1247304492 ], [ 1112432.7082210293, 7085391.5428888164 ], [ 1112481.2465483721, 7085428.7932330519 ], [ 1112548.9744469854, 7085467.1723756045 ], [ 1112661.8542780112, 7085487.4907451877 ], [ 1112734.0973698676, 7085501.0363249099 ], [ 1112761.188529314, 7085443.4676110893 ], [ 1112760.059731001, 7085375.7397124721 ], [ 1112819.8860414471, 7085214.3215541048 ], [ 1112845.8484025805, 7085096.9265298387 ], [ 1112843.5908059606, 7084955.8267410602 ], [ 1112867.2955704769, 7084824.8861370711 ], [ 1112861.6515789267, 7084734.5822722511 ], [ 1112863.9091755468, 7084690.5591381537 ], [ 1112881.9699485102, 7084550.5881476821 ], [ 1112907.9323096466, 7084404.9731656555 ], [ 1112941.7962589532, 7084296.6085278727 ], [ 1112842.4620076504, 7084252.5853937743 ]
            ]
        }
    }]
};

// NEW #0 outsourced
var fahrplan = [
    "04:30", "05:50",
    "05:10", "05:48",
    "06:08", "06:31", "06:46", "06:56",
    "07:06", "07:16", "07:26", "07:36", "07:46", "07:56",
    "08:05", "08:15", "08:28", "08:38", "08:48", "08:58",
    "09:08", "09:18", "09:28", "09:38", "09:49", "09:59",
    "10:09", "10:19", "10:34", "10:49",
    "11:09", "11:19", "11:34", "11:49",
    "12:09", "12:19", "12:34", "12:49",
    "13:04", "13:16", "13:21", "13:34", "13:51",
    "14:09", "14:19", "14:34", "14:49",
    "15:03", "15:18", "15:33", "15:48",
    "16:03", "16:18", "16:33", "16:48",
    "17:03", "17:18", "17:33", "17:48",
    "18:03", "18:18", "18:33", "18:48",
    "19:03", "19:18", "19:33", "19:48",
    "20:01", "20:16", "20:30", "20:50",
    "21:10", "21:30", "21:50",
    "22:10", "22:27", "22:47",
    "23:07"

    // Testzeiten zum ausprobieren
    , "15:40", "15:41"
];
// NEW END

// NEW #1.0
Busanimation = function(routeLineString){
// NEW END
    console.log('Create new Busanimation-Object.');

    var fewLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            // NEW #5 input-value
            features: (new ol.format.GeoJSON()).readFeatures(routeLineString)
            // NEW END
        })
    });

    function slowdown(lineString){
        // INPUT: ol.geom.Linestring; OUTPUT: ol.geom.LineString
        console.log('slowdown(route)');

        // Definition Teilroute
        var coords = lineString.getCoordinates();
        var clength = coords.length; // Anzahl der Koordinatenpaare

        // Erstellung neuer Linestring mit 5m-Teilstücken
        newCoords = new Array();

        for (i = 0; i < clength-1; i++){
            teilcoordinates = [coords[i], coords[i+1]];

            var teilroute = new ol.geom.LineString(teilcoordinates);

            // Stopps alle 5 Meter
            var stopps = Math.round(teilroute.getLength() / 5); // getLength() -> measured length
            var fractions = 1/stopps;

            for (j = 0; j < stopps; j++) {
                newCoords.push(teilroute.getCoordinateAt(fractions*(j+1)));
            }
        }

        var newLineString = new ol.geom.LineString(newCoords);
        return newLineString;
    }

    var fastRoute = fewLayer.getSource().getFeatures()[0].getGeometry(); // geom. siehe oben

    var route = slowdown(fastRoute); // *

    var routeCoords = route.getCoordinates();
    var routeLength = routeCoords.length;

    var startPoint = route.getCoordinateAt(0);
    var endPoint = route.getCoordinateAt(1);

    var routeFeature = new ol.Feature({ // ol.geom.LineString-Feature
        type: 'route',
        geometry: route
    });

    var geoMarker = new ol.Feature({
        type: 'geoMarker',
        geometry: new ol.geom.Point(routeCoords[0])
    });

    var startMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[0])
    });

    var endMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[routeLength - 1])
    });

    // NEW #2 sort
    var busfahrt = new ol.layer.Vector({
        name: 'busfahrt',
        source: new ol.source.Vector({
            features: [routeFeature, geoMarker, startMarker, endMarker]
        }),
        style: function(feature) {
            // hide geoMarker if animation is active
            if (animating && feature.get('type') === 'geoMarker') {
                return null; // styles[feature.get('type')]; // null;
            }
            return styles[feature.get('type')];
        }
    });
    busfahrt.set('id', 'busfahrt');
    busfahrt.setZIndex(1);
    map.addLayer(busfahrt);
    busfahrt.setVisible(false);

    try {  // Layer-Switcher
        document.querySelector('#animationLayers').addEventListener('change', function() {
            var checked = this.checked;
            if (checked !== busfahrt.getVisible()) {
                busfahrt.setVisible(checked);
            }
        });
    } catch(err) {

    }
    // NEW END

    var styles = {
        // 'route': new ol.style.Style({
        // stroke: new ol.style.Stroke({
        // width: 6, color: [237, 212, 0, 0.8]
        // })
        // }),
        'ampelLine': new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 6, color: [237, 212, 0, 0.8]
            })
        }),
        'icon': new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 0.5,
                src: 'data/icons/bus.png'
            })
        }),
        'geoMarker': new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 1,
                rotation: icondreher(startPoint, endPoint),
                src: 'data/icons/busline6.png'
            })
        })
    };

    function icondreher(startPoint, endPoint){
        // Berechnet den Winkel der Fahrtrichtung
        console.log('icondreher()');

        var dx = endPoint[0] - startPoint[0];
        var dy = endPoint[1] - startPoint[1];
        var s = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy,2));

        if( dx > dy){
            return Math.acos((dx) / s);
        }
        else{
            return Math.asin((dy) / s);
        }
    }

    var animating = false;
    var speed, now;

    var startButton = true;

    var busPosition;

    var ampelLineString;

    var moveFeature = function(event) {
        // from: http://openlayers.org/en/latest/examples/feature-move-animation.html?q=animation
        console.log('moveFeature()');

        var vectorContext = event.vectorContext;
        var frameState = event.frameState;

        if (animating) { // should be
            var elapsedTime = frameState.time - now;

            // here the trick to increase speed is to jump some indexes
            // on lineString coordinates
            var index = Math.round(speed * elapsedTime / 100000);

            if (index >= routeLength) {
                stopAnimation(true);
                return;
            }

            var currentPoint = new ol.geom.Point(routeCoords[index]);

            busPosition = new ol.Feature(currentPoint);
            // geoMarker.setGeometry(currentPoint.getCoordinates());
            busStyle = new ol.style.Style({
                // facing problems with ol.style.Icon
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: 10,
                    rotation: Math.PI /4,
                    snapToPixel: false,
                    fill: new ol.style.Fill({color: 'yellow'}),
                    stroke: new ol.style.Stroke({color: 'blue', width: 2})
                }),
                text: new ol.style.Text({
                    text: '6',
                    font: '11px DejaVu Sans',
                    fill: new ol.style.Fill({color: 'blue'}),
                    textAlign: 'left',
                    // offsetX: 6,
                    // offsetY: 1
                })
            })

            console.log('almost...');
            vectorContext.drawFeature(busPosition, busStyle);
            console.log('drawFeature()');

            /*
            // Ampelerkennung
            console.log("buskreis");
            var buskreis = new ol.geom.Circle(currentPoint.getCoordinates(), 50);
            //console.log(buskreis.getCenter());
            // for each ampel in GeoJSON
            $.getJSON('data/ampeln.geojson', function (data) {
                var items = [];
                $.each(data.features, function (key, val) {

                    geometry = val.geometry;

                        //wenn Ampel innerhalb Buskreis
                    if (buskreis.intersectsCoordinate(geometry.coordinates)) {
                        console.log(geometry.coordinates);

                        var ampelLineString = new ol.geom.LineString([geometry.coordinates, currentPoint.getCoordinates()]);
                        console.log(ampelLineString.getCoordinates());

                        var lineStringFeature = new ol.Feature(ampelLineString)
                        // vectorContext.drawFeature(lineStringFeature, styles.ampelLine);
                        vectorContext.setStyle(styles.ampelLine);
                        vectorContext.drawGeometry(ampelLineString);
                        // map.render();
                    }

                });
            });
            */
        }

        // tell OpenLayers to continue the postcompose animation
        map.render();
    };

    // NEW #3 this.startAnimation()
    // function startAnimation() {
    this.startAnimation = function(){
        // NEW END
        console.log('startAnimation()');

        if (animating) {
            stopAnimation(false);
        } else {
            animating = true;
            now = new Date().getTime();
            speed = 300;
            startButton.textContent = 'Cancel Animation';

            // hide geoMarker
            geoMarker.setStyle(null);

            map.on('postcompose', moveFeature);
            map.render();
        }
    }

    function stopAnimation(ended) {
        console.log('stopAnimation()');

        animating = false;
        startButton.textContent = 'Start Animation';

        // if animation cancelled set the marker at the beginning
        // var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0]; // "conditional (ternary) operator" ->
        if(ended){
            var coord = routeCoords[routeLength -1];
        } else{
            var coord = routeCoords[0];
        }

        (geoMarker.getGeometry()).setCoordinates(coord); // @type {ol.geom.Point}
        busPosition = null; // ... if not moving

        //remove listener
        map.un('postcompose', moveFeature);
        startTime();
    }
// NEW #1.1
}
// NEW END

function checkTime(i) {
    // add a zero in front of numbers < 10
    // console.log('checkTime()');
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}

function startTime() {
    console.log('startTime()');
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    h = checkTime(h);
    m = checkTime(m);
    //s = checkTime(s);
    //document.getElementById("txt").innerHTML = h + ":" + m + ":" + s;

    var currentTime = h + ':' + m;

    function checkBus(string){ // callback-function of [].some(), see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/some
        // console.log('checkBus()');
        return string == currentTime;
    }

    if(s==0){
        if (fahrplan.some(checkBus)){
            console.log(h + ':' + m);
            // geoMarker.setGeometry(routeCoords[0]);

            // NEW #4
            // startAnimation()
            // } else{
            // console.log('false');
            // }
            bus1 = new Busanimation(fewCoordinatesShort);
            bus1.startAnimation();

            bus2 = new Busanimation(fewCoordinatesLong);
            bus2.startAnimation();
        }
    } else{
        console.log('Please wait ' + (60-s) + ' Seconds.');
    }
    var t = setTimeout(function(){ startTime() }, 999.9); // 1000 ms = 1 s
}

// startTime();
// NEW END

/*
	Busfahrt ENDE

*/

// JavaScript-Datei dazuladen
$.getScript("ini.js", function () {
    console.log("ini.js loaded.");
});

// JavaScript-Datei dazuladen
$.getScript("map_layers.js", function(){
    console.log("LAYERS.JS");
});
