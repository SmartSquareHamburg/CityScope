requirejs(["ini"], function(ini) {

    var destination = 'desk1.'; // DEFAULT
    var withBentoException = 'desk1.';

    // Query string
    // TODO: Every window needs to provide a query-string...
    // TODO: this is not very self-explanatory...
    if(window.location.search) { // Debug
        var query = window.location.search;
        query = query.replace('?', ''); // query is either desk1, desk2 or bento

        var path = window.location.pathname; // path is either map1 or map2
        var ixStart = path.indexOf('/', 1);
        var ixEnd = path.indexOf('.');
        path = path.substring(ixStart +1, ixEnd);

        // exception:
        // bento needs to locassign to but topic would'nt be right
        if(query=='bento'){
            destination = query + '.';
            // withBentoException = 'desk1' + '.';

        } else{
            if(path=='map1'){
                destination = destination; // accept default
                withBentoException = withBentoException; // accept default
            } else{
                destination = 'desk2' + '.';
                withBentoException = destination;
            }
        }
    }

    // the WAMP connection to the Router
    var connection = new autobahn.Connection({
        url: wsuri, // "ws://csl.local.hcuhh.de:8081/ws", // wsuri,
        realm: realm // "cslrealm"
    });

    // fired when connection is established and session attached
    connection.onopen = function (session, details) {
        console.log("Connected");

        // SUBSCRIBE to a topic and receive events
        function bbox(args) {
            // BoundingBox (EPSG:25832)
            var x0 = parseFloat(args[0]);
            var y0 = parseFloat(args[1]);
            var x1 = parseFloat(args[2]);
            var y1 = parseFloat(args[3]);

            // Map Extent (EPSG:3857) des angezeigten Kartenausschnittes
            mapExtent = map.getView().calculateExtent(map.getSize());
            x0Map = parseFloat(mapExtent[0]);
            x1Map = parseFloat(mapExtent[2]);
            dxMap = (x1Map - x0Map) / 2;

            // Pan to BoundingBox
            var extent = [x0, y0, x1, y1];
            var pan = ol.animation.pan({
                duration: 2000,
                source: /** @type {ol.Coordinate} */ (view.getCenter())
            });
            map.beforeRender(pan);
            if (query == 'left') {
                x = x0 + (x1 - x0) / 2 - dxMap;
                y = y0 + (y1 - y0) / 2;
            } else if (query == 'right') {
                x = x0 + (x1 - x0) / 2 + dxMap;
                y = y0 + (y1 - y0) / 2;
            } else {
                x = x0 + (x1 - x0) / 2;
                y = y0 + (y1 - y0) / 2;
            }
            xRes = (x1 - x0) / map.getSize()[0];
            yRes = (y1 - y0) / map.getSize()[1];
            view.setCenter([x, y]);
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'bbox', bbox).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "bbox'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );


        // Bezirk auswählen
        function selectDistrict(args) {
            var pan = ol.animation.pan({
                duration: 2000,
                source: /** @type {ol.Coordinate} */ (view.getCenter())
            });
            map.beforeRender(pan);

            switch (args[0]) {
                case 'Altona':
                    var bbox = [1083153, 7083797, 1110629, 7100656];
                    break;
                case 'Bergedorf':
                    var bbox = [1118873, 7056414, 1149404, 7080970];
                    break;
                case 'Eimsbüttel':
                    var bbox = [1098634, 7086697, 1114110, 7105185];
                    break;
                case 'Hamburg-Mitte':
                    var bbox = [1091776, 7067396, 1131982, 7088643]; //1087849
                    break;
                case 'Hamburg-Nord':
                    //var bbox = [1108333, 7086585, 1122679, 7110157];
                    var bbox = [1102569, 7086652, 1126458, 7109925];
                    break;
                case 'Harburg':
                    var bbox = [1086878, 7059903, 1118940, 7084173];
                    break;
                case 'Wandsbek':
                    //var bbox = [1115443, 7087175, 1137903, 7120962];
                    var bbox = [1108928, 7086428, 1143105, 7119668];
                    break;

                // Addition for SmartSquare-Project
                case 'HH-Altstadt':
                    var bbox = [1110825, 7083673, 1114473, 7086915]; // gerundet
                    break;
                case 'SmartSquare':
                    var bbox = [1112548, 7084947, 1113193, 7085520]; // gerundet
                    break;
                case 'SmartSquare_Z': // aus postgis: ST_TRANSFORM WHERE location = SmSq_Z
                    var bbox = [1112708, 7085130, 1113030, 7085417]; // gerundet
                    break;
            }

            var x1 = bbox[0];
            var y1 = bbox[1];
            var x2 = bbox[2];
            var y2 = bbox[3];

            var dx = x2 - x1;
            var dy = y2 - y1;

            var x = x1 + dx / 2;
            var y = y1 + dy / 2;

            if (dx > dy) {
                resolution = dx / map.getSize()[0];
                if (query == 'left') {
                    x = x1 + dx / 4;
                    resolution = resolution / 2;
                } else if (query == 'right') {
                    x = x2 - dx / 4;
                    resolution = resolution / 2;
                }
            } else {
                resolution = dy / map.getSize()[1];
                if (query == 'left') {
                    x = x1 + dx / 2 - dy / map.getSize()[1] * map.getSize()[0] / 2;
                } else if (query == 'right') {
                    x = x1 + dx / 2 + dy / map.getSize()[1] * map.getSize()[0] / 2;
                }
            }

            view.setResolution(resolution);
            view.setCenter([x, y]);

            var params = {
                'LAYERS': 'csl:bezirke',
                'TILED': true,
                'STYLES': 'bezirkSelected',
                'CQL_FILTER': "bezirk<>'" + args[0] + "'"
            };
            bezirkeLayer.getSource().updateParams(params);
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'selectdistrict', selectDistrict).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "selectdistrict'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        // with new (2019) control interface
        function panToAoi(args) {
            desk = args[0];
            bbox_name = args[1];

            var pan = ol.animation.pan({
                duration: 2000,
                source: /** @type {ol.Coordinate} */ (view.getCenter())
            });
            map.beforeRender(pan);

            switch (bbox_name) {
                // Addition for SmartSquare-Project
                case 'HH-Altstadt':
                    var bbox = [1110825, 7083673, 1114473, 7086915]; // gerundet
                    break;
                case 'SmartSquare':
                    var bbox = [1112548, 7084947, 1113193, 7085520]; // gerundet
                    break;
                case 'SmartSquare_Z': // aus postgis: ST_TRANSFORM WHERE location = SmSq_Z
                    var bbox = [1112708, 7085130, 1113030, 7085417]; // gerundet
                    break;
            }

            var x1 = bbox[0];
            var y1 = bbox[1];
            var x2 = bbox[2];
            var y2 = bbox[3];

            var dx = x2 - x1;
            var dy = y2 - y1;

            var centerX = x1 + dx / 2;
            var centerY = y1 + dy / 2;

            if (dx > dy) {
                resolution = dx / map.getSize()[0];
                if (query == 'left') {
                    centerX = x1 + dx / 4;
                    resolution = resolution / 2;
                } else if (query == 'right') {
                    centerX = x2 - dx / 4;
                    resolution = resolution / 2;
                }
            } else {
                resolution = dy / map.getSize()[1];
                if (query == 'left') {
                    centerX = x1 + dx / 2 - dy / map.getSize()[1] * map.getSize()[0] / 2;
                } else if (query == 'right') {
                    centerX = x1 + dx / 2 + dy / map.getSize()[1] * map.getSize()[0] / 2;
                }
            }

            view.setResolution(resolution);
            view.setCenter([centerX, centerY]);

            // further...
            if (desk == 'desk1' || desk == 'bento') {
                // publish view information
                console.log('publish view info...');

                // desk1, even if desk == 'bento'
                session.publish('hcu.csl.smsq.desk1.viewResolution', [resolution]);
                session.publish('hcu.csl.smsq.desk1.bbox', bbox);
            } else{
                // publish view information, if...
                console.log('publish view info...');

                // desk2
                session.publish('hcu.csl.smsq.desk2.viewResolution', [resolution]);
                session.publish('hcu.csl.smsq.desk2.bbox', bbox);
            }
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'panToAoi', panToAoi).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "panToAoi'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        // SUBSCRIBE to a topic and receive events
        function zoom(args) {
            console.log('Zoom to ...');
            zoom = parseInt(args[0]);
            view.setZoom(zoom);
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'zoom', zoom).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "zoom'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );


        // Base-Layers on/off
        function baseLayerOnOff(args) {
            layername = args[0];
            onoff = args[1];
            map.getLayers().forEach(function (layer, i) {
                if (layer.getProperties().base) {
                    layer.setVisible(false);
                    if (layername === layer.getProperties().id) {
                        console.log(layer.getProperties().id + ': ' + onoff);
                        layer.setVisible(true);
                    }
                }
            });
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'baselayeronoff', baseLayerOnOff).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "baselayeronoff'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );


        // Layers on/off
        function layerOnOff(args) {
            console.log(args); // debug tom
            layername = args[0];
            onoff = args[1];
            map.getLayers().forEach(function (layer, i) {
                if (layername === layer.getProperties().id) {
                    console.log(layer.getProperties().id + ': ' + onoff);
                    console.log(layer + '.setVisible(' + onoff + ');'); // debug tom
                    layer.setVisible(onoff);
                }
            });
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'layeronoff', layerOnOff).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "layeronoff'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        /*
        /// tom for isochrones visualization on beamer
        function calculate (args){
            console.log('--> ' + args[0][0]);
            isochrone.getSource().updateParams({'VIEWPARAMS': 'param:' + args[0][0]});
        }
        session.subscribe('hcu.csl.smsq.desk1.featureid_voronoi', calculate).then(
        function (sub) {
            console.log("subscribed to topic 'hcu.csl.smsq.desk1.featureid_voronoi'");
        },
        function (err) {
            console.log("failed to subscribed: " + err);
        });
        /// tom end
        */

        // Layer Opacity
        function layerOpacity(args) {
            layername = args[0];
            opacity = parseFloat(args[1]);
            map.getLayers().forEach(function (layer, i) {
                if (layername === layer.getProperties().id) {
                    console.log(layer.getProperties().id + ': ' + opacity);
                    layer.setOpacity(opacity);
                }
            });
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'layeropacity', layerOpacity).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "layeropacity'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        /*
            SmartSquare-Behaviour START
            - updateParams
        */
        function updateParams(args) {
            layername = args[0];
            parameter = args[1];
            value = args[2];

            // layername.getSource().updateParams({parameter: value});
            map.getLayers().forEach(function (layer, i) {
                if (layername === layer.getProperties().id) {
                    console.log(layer.getProperties().id + ': ' + value);
                    eval('layer.getSource().updateParams({"' + parameter + '":"' + value + '"})');
                }
            });
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'updateParams', updateParams).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "updateParams'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        function updateParamsFromPy(args) {
            var data = JSON.parse(args);

            var layername = data[0];
            var parameter = data[1];
            var value = data[2];

            console.log(layername);
            console.log(parameter);
            console.log(value);

            // layername.getSource().updateParams({parameter: value});
            map.getLayers().forEach(function (layer, i) {
                if (layername === layer.getProperties().id) {
                    console.log(layer.getProperties().id + ': ' + value);
                    eval('layer.getSource().updateParams({"' + parameter + '":"' + value + '"})');
                }
            });
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'updateParamsFromPy', updateParamsFromPy).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "updateParamsFromPy'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        // start dynamic data animation ("busfahrt")
        function evaluateString(args) {
            var string = args[0];
            eval(string);
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'starttime', evaluateString).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "starttime'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        /*
            SmartSquare-Behaviour END

        */

        // SUBSCRIBE to a topic and receive events
        function sessionlayer(args) {
            switch (args[0]) {
                case 'update':
                    console.log('SessionLayer.UPDATE');
                    sessionLayer.getSource().updateParams({"time": Date.now()});
                    break;
                case 'pause':
                    console.log('SessionLayer.PAUSE');
                    break;
                case 'unpause':
                    console.log('SessionLayer.UNPAUSE');
                    break;
            }
            // geht nicht -> testLayer.getSource().changed();
            // geht nicht -> testLayer.getSource().changed();
            // geht nicht -> map.updateSize();
            // geht nicht -> map.render();
            // geht nicht -> map.renderSync();

            // geht auch nur mit WMS-Layer
            //sessionLayer.getSource().updateParams({"time": Date.now()});

            // funktioniert mit einem WMS-Layer
            //var source = testLayer.getSource();
            //var params = source.getParams();
            //params.t = new Date().getMilliseconds();
            //source.updateParams(params);
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'sessionlayer', sessionlayer).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "sessionlayer'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        // SUBSCRIBE, THEN DRAW SELECTED FEATURE (HIGHLIGHTING)
        function selectgeom(args) {
            console.log('selectgeom(args)');

            var raw = args[0];

            // console.log(raw0);

            var arr = JSON.parse(raw);
            geom = arr[0].geom;

            console.log(geom); // debug

            try {
                highlightsLayer.setSource(new ol.source.Vector({
                        features: [
                            new ol.format.WKT().readFeature(
                                geom,
                                {
                                    dataProjection: 'EPSG:25832',
                                    featureProjection: 'EPSG:3857'
                                }
                            )
                        ]
                    })
                );

            } catch (err) {
                console.log('throwing try-catch-error:');
                console.log(err);
            }
        }

        session.subscribe('hcu.csl.smsq.' + destination + 'selectgeom', selectgeom).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + destination + "selectgeom'");
            },
            function (err) {
                console.log('failed to subscribe: ' + err);
            }
        );

        function gtfsAnimation02b(args) {
            // console.log('new input (b): animating...');

            var trip = JSON.parse(args[0]);

            var route_short_name = trip[0];
            var startpoint = trip[1];
            var breakpoints = trip[2];

            var traveltime = trip[3]; // minutes
            // var pausetime = trip[4]; // minutes

            var linestring = new Array(breakpoints.length);
            linestring[0] = [startpoint[0][0], startpoint[0][1]];

            for (i = 0; i < breakpoints.length; i++) {
                linestring[i + 1] = breakpoints[i];
            }

            var feat = new ol.Feature({
                name: route_short_name,
                geometry: new ol.geom.LineString(
                    linestring
                )
            });

            // get travel-speed
            var distance = feat.getGeometry().getLength(); // meter

            var speed = distance / (traveltime * 60); // m/s

            new Busanimation(feat, speed).startAnimation()
        }

        session.subscribe('hcu.csl.smsq.' + withBentoException + 'gtfsAnimate02b', gtfsAnimation02b).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + withBentoException + "gtfsAnimate02b'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        function trxAnimation(args) {
            console.log('trxAnimation');

            var tracks = args[0][0];

            for (i = 0; i < tracks.length; i++) {
                var objtype = tracks[i]['objtype'];
                var startframe = tracks[i]['startframe'];
                var speed = tracks[i]['speed'];
                var geom = tracks[i]['geom'];

                var feat = new ol.format.WKT().readFeature(
                    geom
                );

                if (objtype == 1) {
                    feat.setProperties({name: 0.1}); // styling purposes
                } else { // 3
                    if (speed < 13.8889) { // > 50 km/h
                        feat.setProperties({name: 0.3}); // styling purposes
                    } else {
                        feat.setProperties({name: 0.35}) // styling purposes
                    }
                }

                new Busanimation(feat, speed).startAnimation();
            }
        }

        session.subscribe('hcu.csl.smsq.' + withBentoException + 'trxAnimation', trxAnimation).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + withBentoException + "trxAnimation'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        // MARTINS Masterarbeit START

        function geojs(args) {
            // var layersToRemove = [];
            // map.getLayers().forEach(function (layer) {
            // if (layer.get('name') != undefined && layer.get('name') === 'pedestrian_p') {
            // layersToRemove.push(layer);
            // }
            // });

            // var len = layersToRemove.length;
            // for(var i = 0; i < len; i++) {
            // map.removeLayer(layersToRemove[i]);
            // }

            console.log(args[0]);
            var geojsonData = args[0];

            var vectorSource = new ol.source.Vector({
                features: (new ol.format.GeoJSON({
                    defaultDataProjection: 'EPSG:25832',
                    featureProjection: 'EPSG:3857'
                })).readFeatures(args[0])
            });

            pedestrian_p.setSource(vectorSource);

            // var pedestrian_p = new ol.layer.Vector({
            // name: 'pedestrian_p',
            // checked: true,
            // menu: 'Fußgänger (Punkt)',
            // source: vectorSource,
            // style: new ol.style.Style({
            // image: new ol.style.Circle({
            // radius: 3,
            // fill: new ol.style.Fill({
            // color: 'blue'
            // })
            // })
            // })
            // });
            // pedestrian_p.setZIndex(100);
            // map.addLayer(pedestrian_p);
            // pedestrian_p.setVisible(pedestrian_p.get('checked'));
        }

        // TODO: desk1 only?
        session.subscribe('hcu.csl.smsq.' + withBentoException + 'ABPedSimWalk', geojs).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq." + withBentoException + "ABPedSimWalk'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        // MARTINS Masterarbeit ENDE

    };

    // fired when connection was lost (or could not be established)
    connection.onclose = function (reason, details) {
        console.log("Connection lost: " + reason);
    }

    // now actually open the connection
    connection.open();


    function createBoundingBoxLayer(x0, y0, x1, y1) {
        var iconFeatures = [];
        var feature = new ol.Feature({
            geometry: new ol.geom.Polygon([[
                [x0, y0],
                [x0, y1],
                [x1, y1],
                [x1, y0],
                [x0, y0]
            ]])
        });
        iconFeatures.push(feature);
        //console.log(iconFeatures[0]);
        vectorSource = new ol.source.Vector({
            features: iconFeatures
        });
        bboxLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({color: [27, 103, 159, 0.8], width: 2})
            })
        });
        map.addLayer(bboxLayer);
    }

});