// --------------------------------------------------------------------------------------
// Base-Layers
// --------------------------------------------------------------------------------------

// OpenStreetMap ------------------------------------------------------------------------
var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
        source: new ol.source.OSM()
    })
});
osmLayer.set('id', 'osmLayer');
osmLayer.set('base', true);
map.addLayer(osmLayer);
osmLayer.setVisible(false);


// BingMaps (Orthophoto) ----------------------------------------------------------------
var bingLayerAerial = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'AlyQRsfvGUEWN47st7KU6DuYJan_ubl-okHO4Qpf-UfYkDut0nk0VJ_gofZW3BLy',
        imagerySet: 'Aerial',
        culture: 'de-DE'
    })
});
bingLayerAerial.set('id', 'bingLayerAerial');
bingLayerAerial.set('base', true);
map.addLayer(bingLayerAerial);
bingLayerAerial.setVisible(false);


// BingMaps (Orthophoto) mit Labels (Straßennamen und Orte werden angezeigt.) -----------
var bingLayerAerialWithLabels = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'AlyQRsfvGUEWN47st7KU6DuYJan_ubl-okHO4Qpf-UfYkDut0nk0VJ_gofZW3BLy',
        imagerySet: 'AerialWithLabels',
        culture: 'de-DE'
    })
});
bingLayerAerialWithLabels.set('id', 'bingLayerAerialWithLabels');
bingLayerAerialWithLabels.set('base', true);
map.addLayer(bingLayerAerialWithLabels);
bingLayerAerialWithLabels.setVisible(false);


// LGV-Orthophoto DOP20 belaubt ------------------------------------------------------------------
var layerOrtho1 = new ol.layer.Tile({
    name: 'layerOrtho1',
    source: new ol.source.TileWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/gwc/service/wms',
        // params: {'LAYERS': 'csl:HH_WMS_DOP20_belaubt', 'TILED': true, 'SRS': 'EPSG:3857'},
        // url: owspath + 'gwc/service/wms',
        // params: {'LAYERS': 'csl:1', 'TILED': true, 'SRS': 'EPSG:3857'},
        url: 'https://geodienste.hamburg.de/HH_WMS_DOP',
        params: {'LAYERS': '1', 'TILED': true, 'SRS': 'EPSG:3857'},
        //serverType: 'geoserver'
    })
});
layerOrtho1.set('id', 'layerOrtho1');
layerOrtho1.set('base', true);
map.addLayer(layerOrtho1);
layerOrtho1.setVisible(true);

// LGV-Orthophoto clipped (inner)
var altstadt_dop20_inner = new ol.layer.Tile({
    name: 'altstadt_dop20_inner',
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:altstadt_dop20_inner', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
altstadt_dop20_inner.set('id', 'altstadt_dop20_inner');
altstadt_dop20_inner.set('base', true);
map.addLayer(altstadt_dop20_inner);
altstadt_dop20_inner.setVisible(false);

// LGV-Orthophoto clipped (outer)
var altstadt_dop20_outer = new ol.layer.Tile({
    name: 'altstadt_dop20_inner',
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:altstadt_dop20_outer', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
altstadt_dop20_outer.set('id', 'altstadt_dop20_outer');
altstadt_dop20_outer.set('base', true);
map.addLayer(altstadt_dop20_outer);
altstadt_dop20_outer.setVisible(false);

// Monochrome-Layer ------------------------------------------------------------------------------
var iconFeatures1 = [];
var feature1 = new ol.Feature({
    geometry: new ol.geom.Polygon([[
        [1072492, 7049321],
        [1072492, 7122700],
        [1155044, 7122700],
        [1155044, 7049321],
        [1072492, 7049321]
    ]])
});
iconFeatures1.push(feature1);
var vectorSource1 = new ol.source.Vector({
    features: iconFeatures1
});
var monochromeLayer = new ol.layer.Vector({
    source: vectorSource1,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, 1)'
        })
    })
});
monochromeLayer.set('id', 'monochromeLayer');
monochromeLayer.set('base', true);
map.addLayer(monochromeLayer);
monochromeLayer.setVisible(false);


// --------------------------------------------------------------------------------------
// Layers
// --------------------------------------------------------------------------------------

// Bezirke ------------------------------------------------------------------------------
var bezirkeLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:bezirke', 'TILED': true, 'STYLES': 'bezirk_polygon'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:bezirke', 'TILED': true, 'STYLES': 'bezirkeFilled'},
        //params: {'LAYERS': 'csl:bezirke', 'TILED': true, 'STYLES': 'bezirk_polygon', 'CQL_FILTER': "bezirk='Wandsbek'"},
        serverType: 'geoserver'
    })
});
bezirkeLayer.set('id', 'bezirkeLayer');
map.addLayer(bezirkeLayer);
bezirkeLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerBezirkeChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== bezirkeLayer.getVisible()) {
            bezirkeLayer.setVisible(checked);
        }
    });

    var sel = document.getElementById('auswahlBezirk');
    sel.onchange = function () {
        var pan = ol.animation.pan({
            duration: 2000,
            source: /** @type {ol.Coordinate} */ (view.getCenter())
        });
        map.beforeRender(pan);

        switch (this.value) {
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
                var bbox = [1108333, 7086585, 1122679, 7110157];
                break;
            case 'Harburg':
                var bbox = [1086878, 7059903, 1118940, 7084173];
                break;
            case 'Wandsbek':
                var bbox = [1115443, 7087175, 1137903, 7120962];
                break;

            // Addition for SmartSquare-Project
            case 'HH-Altstadt':
                var bbox = [1110825, 7083673, 1114473, 7086915]; // gerundet
                break;
            case 'SmartSquare':
                var bbox = [1112548, 7084947, 1113193, 7085520]; // gerundet
                break;
            case 'SmartSquare_Z':
                // map.getView().getZoom() = 19.998183454202827
                // NEW 07.12.2018: 19.75
                // map.getView().getCenter() = [1112869, 7085273.5]
                // NEW 07.12.2018: [1112869, 7085295]

                // gerundet aus ST_TRANSFORM()/PostGIS
                var bbox = [1112708, 7085130, 1113030, 7085417];
                break;
        }
        var resX = (bbox[2] - bbox[0]) / map.getSize()[0];
        var resY = (bbox[3] - bbox[1]) / map.getSize()[1];
        view.setCenter([bbox[0] + (bbox[2] - bbox[0]) / 2, bbox[1] + (bbox[3] - bbox[1]) / 2]);
        view.setResolution(Math.max(resX, resY));
        // var params = {'LAYERS': 'csl:bezirke', 'TILED': true, 'STYLES': 'bezirk_polygon', 'CQL_FILTER': "bezirk<>'" + this.value + "'" };
        var params = {
            'LAYERS': 'csl:bezirke',
            'TILED': true,
            'STYLES': 'bezirke',
            'CQL_FILTER': "bezirk<>'" + this.value + "'"
        };
        bezirkeLayer.getSource().updateParams(params);

        console.log(resX + ", " + resY);
        console.log([bbox[0] + (bbox[2] - bbox[0]) / 2 + ', ' + bbox[1] + (bbox[3] - bbox[1]) / 2]);
    }
} catch (err) {
}

// Umland ------------------------------------------------------------------------------
var umlandLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:umland', 'TILED': true, 'STYLES': 'umland_polygon'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:umland', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
umlandLayer.set('id', 'umlandLayer');
map.addLayer(umlandLayer);
umlandLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerUmlandChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== umlandLayer.getVisible()) {
            umlandLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Grünring, Naherholung ------------------------------------------------------------------------------
var gruenringLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:gruenring', 'TILED': true, 'STYLES': 'gruenring'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:gruenring', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
gruenringLayer.set('id', 'gruenringLayer');
map.addLayer(gruenringLayer);
gruenringLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerGruenringChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== gruenringLayer.getVisible()) {
            gruenringLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Alle Potenzialflächen ------------------------------------------------------------------------------
var allepotflaechenLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_georrt'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke'},
        serverType: 'geoserver'
    })
});
allepotflaechenLayer.set('id', 'allepotflaechenLayer');
map.addLayer(allepotflaechenLayer);
allepotflaechenLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerAllePotFlaechenChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== allepotflaechenLayer.getVisible()) {
            allepotflaechenLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01a / fskPrivat --------------------------------------------------------------------------------
var wms01aLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_privat'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
wms01aLayer.set('id', 'wms01aLayer');
map.addLayer(wms01aLayer);
wms01aLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01aChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01aLayer.getVisible()) {
            wms01aLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01b / fskHart--------------------------------------------------------------------------------
var wms01bLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_hart'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstueckeRot'},
        serverType: 'geoserver'
    })
});
wms01bLayer.set('id', 'wms01bLayer');
map.addLayer(wms01bLayer);
wms01bLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01bChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01bLayer.getVisible()) {
            wms01bLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01b1 / fskHart_schraffur------------------------------------------------------------------------
var wms01b1Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_hart_schraffur'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_hart_schraffur'},
        serverType: 'geoserver'
    })
});
wms01b1Layer.set('id', 'wms01b1Layer');
map.addLayer(wms01b1Layer);
wms01b1Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01b1Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01b1Layer.getVisible()) {
            wms01b1Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01b2 / fskHart_50 --------------------------------------------------------------------------------
var wms01b2Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_hart_50'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_hart_50'},
        serverType: 'geoserver'
    })
});
wms01b2Layer.set('id', 'wms01b2Layer');
map.addLayer(wms01b2Layer);
wms01b2Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01b2Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01b2Layer.getVisible()) {
            wms01b2Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01c / fskWeich --------------------------------------------------------------------------------
var wms01cLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_weich'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstueckeOrange'},
        serverType: 'geoserver'
    })
});
wms01cLayer.set('id', 'wms01cLayer');
map.addLayer(wms01cLayer);
wms01cLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01cChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01cLayer.getVisible()) {
            wms01cLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01c1 / fskWeich_schraffur-----------------------------------------------------------------------
var wms01c1Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_weich_schraffur'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_weich_schraffur'},
        serverType: 'geoserver'
    })
});
wms01c1Layer.set('id', 'wms01c1Layer');
map.addLayer(wms01c1Layer);
wms01c1Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01c1Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01c1Layer.getVisible()) {
            wms01c1Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01b2 / fskWeich_50-------------------------------------------------------------------------------
var wms01c2Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_weich_50'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_weich_50'},
        serverType: 'geoserver'
    })
});
wms01c2Layer.set('id', 'wms01c2Layer');
map.addLayer(wms01c2Layer);
wms01c2Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01c2Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01c2Layer.getVisible()) {
            wms01c2Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01d / fskOhne--------------------------------------------------------------------------------
var wms01dLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_ohne'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstueckeGelb'},
        serverType: 'geoserver'
    })
});
wms01dLayer.set('id', 'wms01dLayer');
map.addLayer(wms01dLayer);
wms01dLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01dChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01dLayer.getVisible()) {
            wms01dLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01d1 / fskOhne_schraffur------------------------------------------------------------------------
var wms01d1Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_ohne_schraffur'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_ohne_schraffur'},
        serverType: 'geoserver'
    })
});
wms01d1Layer.set('id', 'wms01d1Layer');
map.addLayer(wms01d1Layer);
wms01d1Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01d1Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01d1Layer.getVisible()) {
            wms01d1Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 01d2 / fskOhne_50 --------------------------------------------------------------------------------
var wms01d2Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_ohne_50'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_ohne_50'},
        serverType: 'geoserver'
    })
});
wms01d2Layer.set('id', 'wms01d2Layer');
map.addLayer(wms01d2Layer);
wms01d2Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01d2Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01d2Layer.getVisible()) {
            wms01d2Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// abgelehnt durch ZKF --------------------------------------------------------------------
var gestrichenLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_gestrichen'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstueckeAbgelehnt'},
        serverType: 'geoserver'
    })
});
gestrichenLayer.set('id', 'gestrichenLayer');
map.addLayer(gestrichenLayer);
gestrichenLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerGestrichenChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== gestrichenLayer.getVisible()) {
            gestrichenLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Gewässer ------------------------------------------------------------------------------
var gewaesserLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:gewaesser', 'TILED': true, 'STYLES': 'gewaesser'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:gewaesser', 'TILED': true, 'STYLES': 'gewaesser'},
        serverType: 'geoserver'
    })
});
gewaesserLayer.set('id', 'gewaesserLayer');
map.addLayer(gewaesserLayer);
gewaesserLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerGewaesserChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== gewaesserLayer.getVisible()) {
            gewaesserLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Konturlinien --------------------------------------------------------------------------
var konturlinienLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:konturlinien', 'TILED': true, 'STYLES': 'konturlinien'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:konturlinien', 'TILED': true, 'STYLES': 'konturlinien'},
        serverType: 'geoserver'
    })
});
konturlinienLayer.set('id', 'konturlinienLayer');
map.addLayer(konturlinienLayer);
konturlinienLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerKonturlinienChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== konturlinienLayer.getVisible()) {
            konturlinienLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// HVV ------------------------------------------------------------------------------
var hvvLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:hvvlinien', 'TILED': true, 'STYLES': 'hvvlinien'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:hvv_linien', 'TILED': true, 'STYLES': 'hvvlinien'},
        serverType: 'geoserver'
    })
});
hvvLayer.set('id', 'hvvLayer');
map.addLayer(hvvLayer);
hvvLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerHVVChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== hvvLayer.getVisible()) {
            hvvLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Achtungskreise -------------------------------------------------------------------
var achtungskreiseLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:achtung_zone', 'TILED': true, 'STYLES': 'achtungskreise'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:achtung_zone', 'TILED': true, 'STYLES': 'achtung_zone'},
        serverType: 'geoserver'
    })
});
achtungskreiseLayer.set('id', 'achtungskreiseLayer');
map.addLayer(achtungskreiseLayer);
achtungskreiseLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerAchtungskreiseChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== achtungskreiseLayer.getVisible()) {
            achtungskreiseLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Stadtteile ------------------------------------------------------------------------------
var stadtteileLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:stadtteile', 'TILED': true, 'STYLES': 'stadtteil_grenze'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:stadtteile', 'TILED': true, 'STYLES': 'smsq_stadtteile'},
        serverType: 'geoserver'
    })
});
stadtteileLayer.set('id', 'stadtteileLayer');
map.addLayer(stadtteileLayer);
// stadtteileLayer.setVisible(false);


// Layer-Switcher
try {
    document.querySelector('#layerStadtteileChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== stadtteileLayer.getVisible()) {
            stadtteileLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// Bezirksgrenzen ------------------------------------------------------------------------------
var bezirksgrenzenLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:bezirke', 'TILED': true, 'STYLES': 'bezirk_grenze'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:bezirke', 'TILED': true, 'STYLES': 'bezirke'},
        serverType: 'geoserver'
    })
});
bezirksgrenzenLayer.set('id', 'bezirksgrenzenLayer');
map.addLayer(bezirksgrenzenLayer);
bezirksgrenzenLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerBezirksgrenzenChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== bezirksgrenzenLayer.getVisible()) {
            bezirksgrenzenLayer.setVisible(checked);
        }
    });
} catch (err) {
}

/**
 // Rothenburgsort-Raster: Historic_1945
 var rbo_rasHistoric = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': 'csl:rbo_historic45_lzw', 'STYLES': '', 'TRANSPARENT': 'true'}
    })
});
 rbo_rasHistoric.set('id', 'rbo_rasHistoric');
 rbo_rasHistoric.setOpacity(0.5); // just for raster-layer
 map.addLayer(rbo_rasHistoric);
 rbo_rasHistoric.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_rasHistoric').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_rasHistoric.getVisible()) {
            rbo_rasHistoric.setVisible(checked);
        }
    });
} catch(err) {
}

 // Rothenburgsort-Raster: Altersstruktur (allg.)
 var rbo_rasAltersstruktur = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': 'csl:rbo_altersstruktur_lzw', 'STYLES': '', 'TRANSPARENT': 'true'}
    })
});
 rbo_rasAltersstruktur.set('id', 'rbo_rasAltersstruktur');
 rbo_rasAltersstruktur.setOpacity(0.5); // just for raster-layer
 map.addLayer(rbo_rasAltersstruktur);
 rbo_rasAltersstruktur.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_rasAltersstruktur').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_rasAltersstruktur.getVisible()) {
            rbo_rasAltersstruktur.setVisible(checked);
        }
    });
} catch(err) {
}

 // Rothenburgsort-Raster: Jugendliche
 var rbo_rasJuvenile = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': 'csl:rbo_jugendliche_lzw', 'STYLES': '', 'TRANSPARENT': 'true'}
    })
});
 rbo_rasJuvenile.set('id', 'rbo_rasJuvenile');
 rbo_rasJuvenile.setOpacity(0.5); // just for raster-layer
 map.addLayer(rbo_rasJuvenile);
 rbo_rasJuvenile.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_rasJuvenile').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_rasJuvenile.getVisible()) {
            rbo_rasJuvenile.setVisible(checked);
        }
    });
} catch(err) {
}

 // Rothenburgsort-Raster: Noise (all)
 var rbo_rasNoise = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': 'csl:rbo_laerm_tag_lzw', 'STYLES': '', 'TRANSPARENT': 'true'}
    })
});
 rbo_rasNoise.set('id', 'rbo_rasNoise');
 rbo_rasNoise.setOpacity(0.5); // just for raster-layer
 map.addLayer(rbo_rasNoise);
 rbo_rasNoise.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_rasNoise').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_rasNoise.getVisible()) {
            rbo_rasNoise.setVisible(checked);
        }
    });
} catch(err) {
}

 // Rothenburgsort-Raster: Gebäudenutzung (allg.)
 var rbo_rasWohnen = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': 'csl:rbo_wohnen_lzw', 'STYLES': '', 'TRANSPARENT': 'true'}
    })
});
 rbo_rasWohnen.set('id', 'rbo_rasWohnen');
 rbo_rasWohnen.setOpacity(0.5); // just for raster-layer
 map.addLayer(rbo_rasWohnen);
 rbo_rasWohnen.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_rasWohnen').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_rasWohnen.getVisible()) {
            rbo_rasWohnen.setVisible(checked);
        }
    });
} catch(err) {
}

 // Rothenburgsort: BB-Einwohner <400
 var rbo_bev_u400 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_bev_u400', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_bev_u400.set('id', 'rbo_bev_u400');
 map.addLayer(rbo_bev_u400);
 rbo_bev_u400.setVisible(false);

 // Rothenburgsort: BB-Einwohner <800
 var rbo_bev_u800 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_bev_u800', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_bev_u800.set('id', 'rbo_bev_u800');
 map.addLayer(rbo_bev_u800);
 rbo_bev_u800.setVisible(false);

 // Rothenburgsort: BB-Einwohner <1.200
 var rbo_bev_u1200 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_bev_u1200', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_bev_u1200.set('id', 'rbo_bev_u1200');
 map.addLayer(rbo_bev_u1200);
 rbo_bev_u1200.setVisible(false);

 // Rothenburgsort: BB-Einwohner <1.600
 var rbo_bev_u1600 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_bev_u1600', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_bev_u1600.set('id', 'rbo_bev_u1600');
 map.addLayer(rbo_bev_u1600);
 rbo_bev_u1600.setVisible(false);

 // Rothenburgsort: BB-Einwohner >1.600
 var rbo_bev_o1600 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_bev_o1600', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_bev_o1600.set('id', 'rbo_bev_o1600');
 map.addLayer(rbo_bev_o1600);
 rbo_bev_o1600.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_bb_einw').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_bev_u400.getVisible()) {
            rbo_bev_u400.setVisible(checked);
        }
        if (checked !== rbo_bev_u800.getVisible()) {
            rbo_bev_u800.setVisible(checked);
        }
        if (checked !== rbo_bev_u1200.getVisible()) {
            rbo_bev_u1200.setVisible(checked);
        }
        if (checked !== rbo_bev_u1600.getVisible()) {
            rbo_bev_u1600.setVisible(checked);
        }
        if (checked !== rbo_bev_o1600.getVisible()) {
            rbo_bev_o1600.setVisible(checked);
        }
    });
} catch(err) {
}

 // Rothenburgsort: BB-Ausländer <0.2
 var rbo_ausl_u20 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_ausl_u20', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_ausl_u20.set('id', 'rbo_ausl_u20');
 map.addLayer(rbo_ausl_u20);
 rbo_ausl_u20.setVisible(false);

 // Rothenburgsort: BB-Ausländer <0.4
 var rbo_ausl_u40 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_ausl_u40', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_ausl_u40.set('id', 'rbo_ausl_u40');
 map.addLayer(rbo_ausl_u40);
 rbo_ausl_u40.setVisible(false);

 // Rothenburgsort: BB-Ausländer <0.6
 var rbo_ausl_u60 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_ausl_u60', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_ausl_u60.set('id', 'rbo_ausl_u60');
 map.addLayer(rbo_ausl_u60);
 rbo_ausl_u60.setVisible(false);

 // Rothenburgsort: BB-Ausländer <0.8
 var rbo_ausl_u80 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_ausl_u80', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_ausl_u80.set('id', 'rbo_ausl_u80');
 map.addLayer(rbo_ausl_u80);
 rbo_ausl_u80.setVisible(false);

 // Rothenburgsort: BB-Ausländer >0.8
 var rbo_ausl_o80 = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:rbo_ausl_o80', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
 rbo_ausl_o80.set('id', 'rbo_ausl_o80');
 map.addLayer(rbo_ausl_o80);
 rbo_ausl_o80.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#rbo_bb_ausl').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== rbo_ausl_u20.getVisible()) {
            rbo_ausl_u20.setVisible(checked);
        }
        if (checked !== rbo_ausl_u40.getVisible()) {
            rbo_ausl_u40.setVisible(checked);
        }
        if (checked !== rbo_ausl_u60.getVisible()) {
            rbo_ausl_u60.setVisible(checked);
        }
        if (checked !== rbo_ausl_u80.getVisible()) {
            rbo_ausl_u80.setVisible(checked);
        }
        if (checked !== rbo_ausl_o80.getVisible()) {
            rbo_ausl_o80.setVisible(checked);
        }
    });
} catch(err) {
}

 **/

    // WMS 01e --------------------------------------------------------------------------------
var wms01eLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
            // params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstuecke_grenzen'},
            url: owspath + 'csl/wms',
            params: {'LAYERS': 'csl:flurstuecke', 'TILED': true, 'STYLES': 'flurstueckeGrenzen'},
            serverType: 'geoserver'
        })
    });
wms01eLayer.set('id', 'wms01eLayer');
map.addLayer(wms01eLayer);
wms01eLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS01eChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms01eLayer.getVisible()) {
            wms01eLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 10a --------------------------------------------------------------------------------
var wms10aLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': 'unterkuenfte_geplant_buffer_r1000m'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
wms10aLayer.set('id', 'wms10aLayer');
map.addLayer(wms10aLayer);
wms10aLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS10aChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms10aLayer.getVisible()) {
            wms10aLayer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 11a --------------------------------------------------------------------------------
var wms11aLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': 'unterkuenfte_bestehend_buffer_r1000m'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': ''},
        serverType: 'geoserver'
    })
});
wms11aLayer.set('id', 'wms11aLayer');
map.addLayer(wms11aLayer);
wms11aLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS11aChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms11aLayer.getVisible()) {
            wms11aLayer.setVisible(checked);
        }
    });
} catch (err) {
}

/**
 // Gebäude --------------------------------------------------------------------------------
 var gebaeudeLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/gwc/service/wms',
        // params: {'LAYERS': 'csl:gebaeude', 'TILED': true, 'SRS': 'EPSG:3857'},
        url: 'http://csl.local.hcuh.de:8080/geoserver/gwc/service/wms',
        params: {'LAYERS': 'csl:gebaeude', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
 gebaeudeLayer.set('id', 'gebaeudeLayer');
 map.addLayer(gebaeudeLayer);
 gebaeudeLayer.setVisible(false);

 try {  // Layer-Switcher
    document.querySelector('#gebaeudeLayerChbx').addEventListener('change', function() {
        var checked = this.checked;
        if (checked !== gebaeudeLayer.getVisible()) {
            gebaeudeLayer.setVisible(checked);
        }
    });
} catch(err) {
}
 **/

    // Schulen --------------------------------------------------------------------------------
var schulenLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
            // params: {'LAYERS': 'csl:einrichtungen', 'tiled': true, 'STYLES': 'einrichtungen_schule_svg'},
            url: owspath + 'csl/wms',
            params: {'LAYERS': 'csl:einrichtungen', 'tiled': true, 'STYLES': 'einrichtungen'},
            serverType: 'geoserver'
        })
    });
schulenLayer.set('id', 'schulenLayer');
schulenLayer.setZIndex(1);
map.addLayer(schulenLayer);
schulenLayer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#schulenLayerChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== schulenLayer.getVisible()) {
            schulenLayer.setVisible(checked);
        }
    });
} catch (err) {
}


// WMS 11 --------------------------------------------------------------------------------
var wms11Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': 'unterkuenfte_bestehend'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:bestehende', 'tiled': true, 'STYLES': 'bestehende'},
        serverType: 'geoserver'
    })
});
wms11Layer.set('id', 'wms11Layer');
map.addLayer(wms11Layer);
wms11Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS11Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms11Layer.getVisible()) {
            wms11Layer.setVisible(checked);
        }
    });
} catch (err) {
}

// WMS 10 --------------------------------------------------------------------------------
var wms10Layer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': 'unterkuenfte_geplant'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:geplante', 'tiled': true, 'STYLES': 'geplante'},
        serverType: 'geoserver'
    })
});
wms10Layer.set('id', 'wms10Layer');
map.addLayer(wms10Layer);
wms10Layer.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#layerWMS10Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== wms10Layer.getVisible()) {
            wms10Layer.setVisible(checked);
        }
    });
} catch (err) {
}

///
/** ab hier ändert tom FindingPlaces für den workshop (okt./nov. 2016) und fügt neue layer hinzu
 FindingPlaces funktioniert aber weiter und wird gar nicht beeinträchtigt **/
///

// "Start SmSq"
try { // Layer-Switcher
    document.querySelector('#smsqInit').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) {
            layerOrtho1.setVisible(false);
            altstadtWalkable.setVisible(true);
            stadtRad_points.setVisible(true);
            parkhaus.setVisible(true);
            hvv_bahn_masten.setVisible(true);

            smsq_osm_platz.getSource().updateParams({'STYLES': 'smsq_osm_platz_bw'});
        }
    });
} catch (err) {

}

/// SmartSquare-Additions
var smsq_ax_gebaeude_edit = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:altstadt_gebaeudeflaechengeschosse', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
smsq_ax_gebaeude_edit.set('id', 'smsq_ax_gebaeude_edit');
map.addLayer(smsq_ax_gebaeude_edit);
smsq_ax_gebaeude_edit.setZIndex(1);
smsq_ax_gebaeude_edit.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_ax_gebaeude_edit').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_ax_gebaeude_edit.getVisible()) {
            smsq_ax_gebaeude_edit.setVisible(checked);
        }
    });
} catch (err) {

}

try {
    document.querySelector('#styleGebKlassen').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) {
            smsq_ax_gebaeude_edit.getSource().updateParams({'STYLES': 'gebklassen'});
            layerOrtho1.setOpacity(0.75);
        } else {
            smsq_ax_gebaeude_edit.getSource().updateParams({'STYLES': ''});
            layerOrtho1.setOpacity(1);
        }
    });
} catch (err) {

}

var smsq_anlieger = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:smsq_anlieger', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
smsq_anlieger.set('id', 'smsq_anlieger');
map.addLayer(smsq_anlieger);
smsq_anlieger.setZIndex(2);
smsq_anlieger.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_anlieger').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_anlieger.getVisible()) {
            smsq_anlieger.setVisible(checked);
        }
    });
} catch (err) {

}


var altstadtWalkable = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:altstadt_walkable', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
altstadtWalkable.set('id', 'altstadtWalkable');
map.addLayer(altstadtWalkable);
altstadtWalkable.setZIndex(1);
altstadtWalkable.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#altstadtWalkable').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== altstadtWalkable.getVisible()) {
            altstadtWalkable.setVisible(checked);
        }
    });
} catch (err) {
}

// var smsq_ax_strassenVA_linestring = new ol.layer.Image({
// source: new ol.source.ImageWMS({
// url: owspath + 'csl/wms',
// params: {'LAYERS': 'csl:smsq_ax_strassenverkehrsanlage_linestring', 'TILED': true, 'STYLES': ''},
// serverType: 'geoserver'
// })

// });
// smsq_ax_strassenVA_linestring.set('id', 'smsq_ax_strassenVA_linestring');
// map.addLayer(smsq_ax_strassenVA_linestring);
// smsq_ax_strassenVA_linestring.setZIndex(1);
// smsq_ax_strassenVA_linestring.setVisible(false);

// try {  // Layer-Switcher
// document.querySelector('#smsq_ax_strassenVA_linestring').addEventListener('change', function() {
// var checked = this.checked;
// if (checked !== smsq_ax_strassenVA_linestring.getVisible()) {
// smsq_ax_strassenVA_linestring.setVisible(checked);
// }
// });
// } catch(err) {
// }

var altstadtDriveable = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:altstadt_driveable', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
altstadtDriveable.set('id', 'altstadtDriveable');
map.addLayer(altstadtDriveable);
altstadtDriveable.setZIndex(1);
altstadtDriveable.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#altstadtDriveable').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== altstadtDriveable.getVisible()) {
            altstadtDriveable.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_ax_vegetationsmerkmal = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:smsq_ax_vegetationsmerkmal', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
smsq_ax_vegetationsmerkmal.set('id', 'smsq_ax_vegetationsmerkmal');
map.addLayer(smsq_ax_vegetationsmerkmal);
smsq_ax_vegetationsmerkmal.setOpacity(0.75);
smsq_ax_vegetationsmerkmal.setZIndex(2);
smsq_ax_vegetationsmerkmal.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_ax_vegetationsmerkmal').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_ax_vegetationsmerkmal.getVisible()) {
            smsq_ax_vegetationsmerkmal.setVisible(checked);
        }
    });
} catch (err) {
}

var hh_sib_haltestellen = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:hh_sib_haltestellen', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
hh_sib_haltestellen.set('id', 'hh_sib_haltestellen');
map.addLayer(hh_sib_haltestellen);
hh_sib_haltestellen.setZIndex(5);
hh_sib_haltestellen.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#hh_sib_haltestellen').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== hh_sib_haltestellen.getVisible()) {
            hh_sib_haltestellen.setVisible(checked);
        }
    });
} catch (err) {
}

var hvv_bahn_masten = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:hvv_bahn_masten', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
hvv_bahn_masten.set('id', 'hvv_bahn_masten');
map.addLayer(hvv_bahn_masten);
hvv_bahn_masten.setZIndex(5);
hvv_bahn_masten.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#hvv_bahn_masten').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== hvv_bahn_masten.getVisible()) {
            hvv_bahn_masten.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_osm_platz = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:smsq_osm_gestaltungbreimannbruun', 'TILED': true, 'STYLES': ''},
        serverType: 'geoserver'
    })

});
smsq_osm_platz.set('id', 'smsq_osm_platz');
map.addLayer(smsq_osm_platz);
smsq_osm_platz.setZIndex(1);
smsq_osm_platz.setVisible(true);

try {  // Layer-Switcher
    document.querySelector('#smsq_osm_platz').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_osm_platz.getVisible()) {
            smsq_osm_platz.setVisible(checked);
        }
    });
} catch (err) {
}

try {  // Layer-Switcher
    document.querySelector('#smsq_osm_platz_bw').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) {
            smsq_osm_platz.getSource().updateParams({'STYLES': 'smsq_osm_platz_bw'});
        } else {
            smsq_osm_platz.getSource().updateParams({'STYLES': ''});
        }
    });
} catch (err) {
}

/// historic images "Domplatz"

// var smsq_1100ad = new ol.layer.Tile({
// name: 'smsq_1100ad',
// source: new ol.source.TileWMS({
// url: owspath + 'gwc/service/wms',
// params: {'LAYERS': 'csl:smsq_1100ad', 'TILED': true, 'SRS': 'EPSG:3857'},
// serverType: 'geoserver'
// })
// });
// smsq_1100ad.set('id', 'smsq_1100ad');
// smsq_1100ad.set('base', true);
// map.addLayer(smsq_1100ad);
// smsq_1100ad.setVisible(false);

var smsq_1150ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1150ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1150ad.set('id', 'smsq_1150ad');
smsq_1150ad.setOpacity(0.45);
map.addLayer(smsq_1150ad);
smsq_1150ad.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#smsq_1150adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1150ad.getVisible()) {
            smsq_1150ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1200ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1200ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1200ad.set('id', 'smsq_1200ad');
smsq_1200ad.setOpacity(0.45);
map.addLayer(smsq_1200ad);
smsq_1200ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1200adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1200ad.getVisible()) {
            smsq_1200ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1250ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1250ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1250ad.set('id', 'smsq_1250ad');
smsq_1250ad.setOpacity(0.45);
map.addLayer(smsq_1250ad);
smsq_1250ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1250adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1250ad.getVisible()) {
            smsq_1250ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1550ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1550ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1550ad.set('id', 'smsq_1550ad');
smsq_1550ad.setOpacity(0.45);
map.addLayer(smsq_1550ad);
smsq_1550ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1550adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1550ad.getVisible()) {
            smsq_1550ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1650ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1650ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1650ad.set('id', 'smsq_1650ad');
smsq_1650ad.setOpacity(0.45);
map.addLayer(smsq_1650ad);
smsq_1650ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1650adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1650ad.getVisible()) {
            smsq_1650ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1813ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1813ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1813ad.set('id', 'smsq_1813ad');
smsq_1813ad.setOpacity(0.45);
map.addLayer(smsq_1813ad);
smsq_1813ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1813adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1813ad.getVisible()) {
            smsq_1813ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1859ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1859ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1859ad.set('id', 'smsq_1859ad');
smsq_1859ad.setOpacity(0.45);
map.addLayer(smsq_1859ad);
smsq_1859ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1859adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1859ad.getVisible()) {
            smsq_1859ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1938ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1938ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1938ad.set('id', 'smsq_1938ad');
smsq_1938ad.setOpacity(0.45);
map.addLayer(smsq_1938ad);
smsq_1938ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1938adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1938ad.getVisible()) {
            smsq_1938ad.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_1946ad = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_1946ad', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_1946ad.set('id', 'smsq_1946ad');
smsq_1946ad.setOpacity(0.45);
map.addLayer(smsq_1946ad);
smsq_1946ad.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_1946adChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_1946ad.getVisible()) {
            smsq_1946ad.setVisible(checked);
        }
    });
} catch (err) {
}

/// mobility

var parkhaus = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:parkhaus', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
parkhaus.set('id', 'parkhaus');
parkhaus.setZIndex(5);
map.addLayer(parkhaus);
parkhaus.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#parkhausChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== parkhaus.getVisible()) {
            parkhaus.setVisible(checked);
        }
    });
} catch (err) {
}

// var stadtRad_points = new ol.layer.Vector({
// source: new ol.source.Vector({
// format: new ol.format.GeoJSON(),
// url: function(extent){
// return owspath + 'wfs?service=WFS&' +
// 'version=1.1.0&request=GetFeature&typename=csl:stadtrad&' +
// 'outputFormat=application/json&srsname=EPSG:3857&' +
// 'bbox=564830.4556312944,5932883.081415687,567028.6696844574,5934838.892594484';
// },
// strategy: ol.loadingstrategy.bbox
// }),
// style: new ol.style.Style({
// stroke: new ol.style.Stroke({
// color: 'rgba(0, 0, 255, 1.0)',
// width: 2
// })
// })
// });

// window.loadFeatures_stadtrad = function(response){
// stadtRad_points.getSource().addFeatures(
// new ol.format.GeoJSON().readFeatures(response));
// };

// var stadtRad_points = new ol.layer.Tile({
// source: new ol.source.TileWMS({
// url: owspath + 'gwc/service/wms',
// params: {'LAYERS': 'csl:stadtrad', 'TILED': true, 'SRS': 'EPSG:3857'},
// serverType: 'geoserver'
// })
// });

/*
var stadtRad_points = new ol.layer.Vector({
    source: new ol.source.Vector({
        projection: 'EPSG:25832',
        url: 'data/stadtrad.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: '#319FD3',
            width: 1
        })
    }),
    zIndex: 1
});
map.addLayer(stadtRad_points);

try{
    // stadtrad-stationen innerhalb hamburg-altstadt (stadtteil)
    var stadtRad_LonLat = [
        [2533, 565951.90101635700557381, 5934166.88400411792099476],
        [2636, 566062.8520320460665971, 5933999.08477012626826763],
        [2632, 565391.4941014169016853, 5933720.24073318485170603],
        [2534, 566146.94574054703116417, 5934097.95705390721559525],
        [2639, 566608.7010745886946097, 5934104.45285045448690653],
        [2633, 565863.62650149082764983, 5933636.23382851574569941],
        [2535, 566524.30414413218386471, 5934215.75539236329495907],
        [2531, 565597.92988084140233696, 5933933.73743391782045364],
        [2638, 566608.50290649384260178, 5933766.41415215283632278],
        [2637, 566352.36373592063318938, 5933956.19137276522815228],
        [2634, 566175.65573135728482157, 5933676.09378523286432028],
        [2635, 566065.06904283515177667, 5933774.4638246139511466]
    ];

    // function returnAjaxData(data){
        // var val = data;
        // return val;
    // }

    function getFlinksterInfo(lon, lat){
        $.ajax({
            url: 'https://api.deutschebahn.com/flinkster-api-ng/v1/' +
            'bookingproposals?lat=' + lat + '&lon=' + lon + '&providernetwork=2',

            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Bearer a0139be05762a252a08289a59e4f3f2f");
            },
            type: 'GET',
            // dataType: 'json',
            contentType: 'application/json',
            success: function(data){
                console.log(data);
                console.log('FLINKSTER-API: ' + data.items.length);
                // returnAjaxData(data);
            },
            error: function(){
                console.log('SMSQ: Some error occured on Flinkster-API-Data.');
                return -1;
            }

            // curl -X GET --header "Accept: application/json" --header "Authorization: Bearer a0139be05762a252a08289a59e4f3f2f" "https://api.deutschebahn.com/flinkster-api-ng/v1/bookingproposals?lat=53.548703&lon=9.997126&providernetwork=2"
        })
    }

    function createStadtRadSld(){
        var start = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><NamedLayer><Name>stadtradFlinkster</Name><UserStyle><Title>FlinksterInfo</Title><FeatureTypeStyle>';

        for(i=0; i< stadtRad_LonLat.length; i++){
            var newLon = ol.proj.transform([stadtRad_LonLat[i][1], stadtRad_LonLat[i][2]], 'EPSG:25832', 'EPSG:4326')[0];
            var newLat = ol.proj.transform([stadtRad_LonLat[i][1], stadtRad_LonLat[i][2]], 'EPSG:25832', 'EPSG:4326')[1];

            var middle = '<Rule>' +
                '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>code</ogc:PropertyName>' +
                        '<ogc:Literal>' + stadtRad_LonLat[i][0] + '</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                '</ogc:Filter>' +
                '<PointSymbolizer>' +
                    '<Graphic>' +
                        '<ExternalGraphic>' +
                            '<OnlineResource xlink:type="simple" xlink:href="file:///opt/geoserver-data/svg/0080-StadtRAD-Hamburg-icon.png" />' +
                            '<Format>image/png</Format>' +
                        '</ExternalGraphic>' +
                        '<Size>32</Size>' +
                    '</Graphic>' +
                '</PointSymbolizer>' +
                '<TextSymbolizer>' +
                    '<Label>' +
                        getFlinksterInfo(newLon, newLat) +
                    '</Label>' +
                    '<Font>' +
                        '<CssParameter name="font-family">DejaVu Sans</CssParameter>' +
                        '<CssParameter name="font-size">24</CssParameter>' +
                        '<CssParameter name="font-style">normal</CssParameter>' +
                        '<CssParameter name="font-weight">bold</CssParameter>' +
                    '</Font>' +
                    '<LabelPlacement>' +
                        '<PointPlacement>' +
                            '<AnchorPoint>' +
                                '<AnchorPointX>0.5</AnchorPointX>' +
                                '<AnchorPointY>0.0</AnchorPointY>' +
                            '</AnchorPoint>' +
                            '<Displacement>' +
                                '<DisplacementX>0</DisplacementX>' +
                                '<DisplacementY>-50</DisplacementY>' +
                            '</Displacement>' +
                        '</PointPlacement>' +
                    '</LabelPlacement>' +
                    '<Fill>' +
                        '<CssParameter name="fill">#000000</CssParameter>' +
                    '</Fill>' +
                '</TextSymbolizer>' +
                '</Rule>';

            var start = start + middle;
        }

        var end = '</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';

        return start + end;
    }

    var stadtRad_style = createStadtRadSld();
}catch(err){
    console.log('SMSQ: Flinkster-API not ready.');
}
*/

var stadtRad_points = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        // params: {'LAYERS': 'csl:stadtrad', 'TILED': true, 'SLD_BODY': stadtRad_style, 'SRS': 'EPSG:3857'},
        params: {'LAYERS': 'csl:stadtrad', 'TILED': true, 'SLD_BODY': '', 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});

stadtRad_points.set('id', 'stadtRad_points');
stadtRad_points.setZIndex(5);
map.addLayer(stadtRad_points);
stadtRad_points.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#stadtRad_pointsChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== stadtRad_points.getVisible()) {
            stadtRad_points.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_parken = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_parken', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_parken.set('id', 'smsq_parken');
// smsq_parken.setZIndex(1);
map.addLayer(smsq_parken);
smsq_parken.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_parkenChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_parken.getVisible()) {
            smsq_parken.setVisible(checked);
        }
    });
} catch (err) {
}

/// smsq_akteure

var smsq_akteure_1704061200 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_akteure_1704061200', 'TILED': true, 'STYLES': '', 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_akteure_1704061200.set('id', 'smsq_akteure_1704061200');
smsq_akteure_1704061200.setZIndex(1);
map.addLayer(smsq_akteure_1704061200);
smsq_akteure_1704061200.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_akteure_1704061200Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) { // !== smsq_akteure_1704061200.getVisible()) {
            layerOrtho1.setOpacity(0.75);
            smsq_akteure_1704061200.setVisible(checked);
        } else {
            layerOrtho1.setOpacity(1);
            smsq_akteure_1704061200.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_akteure_1706291700 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_akteure_1706291700', 'TILED': true, 'STYLES': '', 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_akteure_1706291700.set('id', 'smsq_akteure_1706291700');
smsq_akteure_1706291700.setZIndex(1);
map.addLayer(smsq_akteure_1706291700);
smsq_akteure_1706291700.setVisible(false);

try {  // Layer-Switcher
    document.querySelector('#smsq_akteure_1706291700Chbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) { // !== smsq_akteure_1706291700.getVisible()) {
            layerOrtho1.setOpacity(0.75);
            smsq_akteure_1706291700.setVisible(checked);
        } else {
            layerOrtho1.setOpacity(1);
            smsq_akteure_1706291700.setVisible(checked);
        }
    });
} catch (err) {
}

try {  // Layer-Switcher
    document.querySelector('#mobilityInfrastructure').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) {
            layerOrtho1.setOpacity(0.75);

            hh_sib_haltestellen.setVisible(checked);
            hvv_bahn_masten.setVisible(checked);
            // parkhaus.setVisible(checked);
            // stadtRad_points.setVisible(checked);
        } else {
            layerOrtho1.setOpacity(1);

            hh_sib_haltestellen.setVisible(checked);
            hvv_bahn_masten.setVisible(checked);
            // parkhaus.setVisible(checked);
            // stadtRad_points.setVisible(checked);
        }

    });
} catch (err) {
}

var innenstadtkonzept_eh = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:innenstadtkonzept_eh', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
innenstadtkonzept_eh.set('id', 'innenstadtkonzept_eh');
innenstadtkonzept_eh.setZIndex(2);
innenstadtkonzept_eh.setOpacity(0.75);
map.addLayer(innenstadtkonzept_eh);
innenstadtkonzept_eh.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#innenstadtkonzept_ehChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== innenstadtkonzept_eh.getVisible()) {
            innenstadtkonzept_eh.setVisible(checked);
        }
    });
} catch (err) {
}

var altstadt_lichtsa = new ol.layer.Vector({
    source: new ol.source.Vector({
        loader: function (extent, resolution, projection) {
            var url = owspath + 'csl/ows?service=WFS&' +
                'version=1.0.0&request=GetFeature&typename=csl:altstadt_lichtsa&' +
                'outputFormat=text/javascript&format_options=callback:loadFeatures_lichtSa';

            $.ajax({url: url, dataType: 'jsonp', jsonp: false});
        }
    }),
    style: new ol.style.Style({
        fill: new ol.style.Fill({color: 'black'}),
        geometry: function (feature) {
            var x = feature.getGeometry().getCoordinates()[0];
            var y = feature.getGeometry().getCoordinates()[1];

            var a = 8 * map.getView().getResolution(); // 4000;
            var b = 24 * map.getView().getResolution(); // 10000;

            var c = 2 / 3 * a;
            var d = 2 / 3 * b;

            return new ol.geom.Polygon(
                [[[x - a, y + d], [x + a, y + d], [x + a, y - d], [x - a, y - d], [x - a, y + d]], // outer geom (ampel)
                    [[x, y + 3 * c], [x + c, y + 2 * c], [x, y + c], [x - c, y + 2 * c], [x, y + 3 * c]], // red
                    [[x, y + c], [x + c, y], [x, y - c], [x - c, y], [x, y + c]], // yellow
                    [[x, y - c], [x + c, y - 2 * c], [x, y - 3 * c], [x - c, y - 2 * c], [x, y - c]]] // green
            );
            // return new ol.geom.Polygon(
            // [[[x-7.5,y+15],[x+7.5,y+15],[x+7.5,y-15],[x-7.5,y-15],[x-7.5,y+15]], // outer geom (ampel)
            // [[x,y+15],[x+5,y+10],[x,y+5],[x-5,y+10],[x,y+15]], // red
            // [[x,y+5],[x+5,y],[x,y-5],[x-5,y],[x,y+5]], // yellow
            // [[x,y-5],[x+5,y-10],[x,y-15],[x-5,y-10],[x,y-5]]] // green
            // );
        }
    })
});

window.loadFeatures_lichtSa = function (response) {
    altstadt_lichtsa.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
};

altstadt_lichtsa.set('id', 'altstadt_lichtsa');
map.addLayer(altstadt_lichtsa);
altstadt_lichtsa.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#altstadt_lichtsa').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== altstadt_lichtsa.getVisible()) {
            altstadt_lichtsa.setVisible(checked);
        }
    });
} catch (err) {
}

// necessary? maybe for hk_data lego-query?
var hk_anrainer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:hk_anrainer', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
hk_anrainer.set('id', 'hk_anrainer');
map.addLayer(hk_anrainer);
hk_anrainer.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#hk_anrainerChbx').addEventListener('change', function () {
        var checked = this.checked;
        // if (checked !== hk_anrainer.getVisible()) {
        // hk_anrainer.setVisible(checked);
        // smsq_buildings_entries.setVisible(checked);
        // }

        // if(smsq_ax_gebaeude_edit.getVisible() != checked){
        smsq_ax_gebaeude_edit.setOpacity(0.5);
        smsq_ax_gebaeude_edit.setVisible(checked);
        // } else{
        // smsq_ax_gebaeude_edit.setOpacity(1);
        // }

    });
} catch (err) {
}

var smsq_buildings_entries = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_buildings_entries', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_buildings_entries.set('id', 'smsq_buildings_entries');
map.addLayer(smsq_buildings_entries);
smsq_buildings_entries.setVisible(false);

// "Frequenz induzierende Wirkung" nach CIMA/ PED S. 46
var smsq_freqindwirk = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:grid_3249_smsq', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_freqindwirk.set('id', 'smsq_freqindwirk');
map.addLayer(smsq_freqindwirk);
smsq_freqindwirk.setVisible(false);
smsq_freqindwirk.setOpacity(0.5);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#smsq_freqindwirkChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_freqindwirk.getVisible()) {
            smsq_freqindwirk.setVisible(checked);
            smsq_freqindwirk.setOpacity(0.5)
        }
    });
} catch (err) {
}

// Lärmkarten (Tag)
var laermkarte_tag = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:altstadt_strasverk_lden_2012', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
laermkarte_tag.set('id', 'laermkarte_tag');
laermkarte_tag.setOpacity(0.65);
map.addLayer(laermkarte_tag);
laermkarte_tag.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#laermkarte_tagChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== laermkarte_tag.getVisible()) {
            smsq_osm_platz.setOpacity(0.5);

            laermkarte_tag.setVisible(checked);
        }

        if (checked == false) {
            smsq_osm_platz.setOpacity(1);
        }
    });
} catch (err) {
}

// Lärmkarten (Nacht)
var laermkarte_nacht = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:altstadt_strasverk_lnight_2012', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
laermkarte_nacht.set('id', 'laermkarte_nacht');
laermkarte_nacht.setOpacity(0.65);
map.addLayer(laermkarte_nacht);
laermkarte_nacht.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#laermkarte_nachtChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== laermkarte_nacht.getVisible()) {
            smsq_osm_platz.setOpacity(0.5);

            laermkarte_nacht.setVisible(checked);
        }

        if (checked == false) {
            smsq_osm_platz.setOpacity(1);
        }
    });
} catch (err) {
}

// smsq_buildings_entries: NO CHECKBOX

// Grid-Data Quali-Team
// .. Vis
/// var smsq_nutzzone_disp = new ol.layer.Tile({
/// source: new ol.source.TileWMS({
/// url: owspath + 'gwc/service/wms',
/// params: {'LAYERS': 'csl:smsq_nutzzone_disp', 'TILED': true, 'SRS': 'EPSG:3857'},
/// serverType: 'geoserver'
/// })
/// });

var q_nutzungszonen_disp = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:q_nutzungszonen', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
})

q_nutzungszonen_disp.set('id', 'q_nutzungszonen_disp');
q_nutzungszonen_disp.setZIndex(2);
map.addLayer(q_nutzungszonen_disp);
q_nutzungszonen_disp.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#q_nutzungszonen_dispChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== q_nutzungszonen_disp.getVisible()) {
            q_nutzungszonen_disp.setVisible(checked);
        }
    });
} catch (err) {
}

// .. Data
var smsq_q_nutzungszonen = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_q_nutzungszonen', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});

// smsq_q_nutzungszonen.set('id', 'smsq_q_nutzungszonen');
// smsq_q_nutzungszonen.setOpacity(.5);
// smsq_q_nutzungszonen.setZIndex(2);
// map.addLayer(smsq_q_nutzungszonen);
// smsq_q_nutzungszonen.setVisible(false);

// osm-greenspaces (Altstadt)
var altstadt_osm_greenspaces = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:altstadt_osm_greenspaces', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
altstadt_osm_greenspaces.set('id', 'altstadt_osm_greenspaces');
map.addLayer(altstadt_osm_greenspaces);
altstadt_osm_greenspaces.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#altstadt_osm_greenspacesChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== altstadt_osm_greenspaces.getVisible()) {
            altstadt_osm_greenspaces.setVisible(checked);
        }
    });
} catch (err) {
}

// rivers/lakes (Altstadt)
var altstadt_gewaesser = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:altstadt_gewaesser', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
altstadt_gewaesser.set('id', 'altstadt_gewaesser');
map.addLayer(altstadt_gewaesser);
altstadt_gewaesser.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#altstadt_gewaesserChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== altstadt_gewaesser.getVisible()) {
            altstadt_gewaesser.setVisible(checked);
        }
    });
} catch (err) {
}

// smsq_q_passagen
var smsq_q_passagen = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_q_passagen', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_q_passagen.set('id', 'smsq_q_passagen');
smsq_q_passagen.setZIndex(5);
map.addLayer(smsq_q_passagen);
smsq_q_passagen.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#smsq_q_passagenChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_q_passagen.getVisible()) {
            smsq_q_passagen.getSource().updateParams({'STYLES': 'csl:smsq_q_passagen_all'});
            smsq_q_passagen.setVisible(checked);
        }
    });
} catch (err) {
}

// tps transformed camera images (geotiff)
var smsq_cam_070218_doffice_qd = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_cam_070218_doffice_qd', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_cam_070218_doffice_qd.set('id', 'smsq_cam_070218_doffice_qd');
map.addLayer(smsq_cam_070218_doffice_qd);
smsq_cam_070218_doffice_qd.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#camDOtps').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_cam_070218_doffice_qd.getVisible()) {
            smsq_cam_070218_doffice_qd.setVisible(checked);
        }
    });
} catch (err) {
}

// smsq_cam_ref
var smsq_cam_ref = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_cam_ref', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_cam_ref.set('id', 'smsq_cam_ref');
smsq_cam_ref.setZIndex(5);
map.addLayer(smsq_cam_ref);
smsq_cam_ref.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#cameraPosChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_cam_ref.getVisible()) {
            smsq_cam_ref.setVisible(checked);
        }
    });
} catch (err) {
}

// smsq_cam_trajec_points
var smsq_cam_trajec_points = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_cam_070218_points_manually', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_cam_trajec_points.set('id', 'smsq_cam_trajec_points');
map.addLayer(smsq_cam_trajec_points);
smsq_cam_trajec_points.setVisible(false);

// smsq_cam_trajec_lines
var smsq_cam_trajec_lines = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_cam_070218_trajec_manually', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_cam_trajec_lines.set('id', 'smsq_cam_trajec_lines');
map.addLayer(smsq_cam_trajec_lines);
smsq_cam_trajec_lines.setVisible(false);

// smsq_cam_trajec_lines
var tracks_raw = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:tracks_raw', 'TILED': true, 'SRS': 'EPSG:3857', 'STYLES': ''},
        serverType: 'geoserver'
    })
});
tracks_raw.set('id', 'tracks_raw');
tracks_raw.setZIndex(5);
map.addLayer(tracks_raw);
tracks_raw.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#detClPointsChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== tracks_raw.getVisible()) {
            tracks_raw.setVisible(checked);
        }
    });
} catch (err) {
}

try {  // Layer-Switcher
    console.log('updateParams (tracks_raw)');
    document.querySelector('#detHeatmapChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (tracks_raw.getSource().getParams().STYLES != 'csl:simple_heatmap') {
            tracks_raw.getSource().updateParams({'STYLES': 'csl:simple_heatmap'});
        } else {
            tracks_raw.getSource().updateParams({'STYLES': ''});
        }
    });
} catch (err) {
}

// disp_ik_ehnutzungen (Innenstadtkonzept Raster2Vector)
var disp_ik_ehnutzungen = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_disp_ik_ehnutzungen', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
disp_ik_ehnutzungen.set('id', 'disp_ik_ehnutzungen');
disp_ik_ehnutzungen.setZIndex(1);
map.addLayer(disp_ik_ehnutzungen);
disp_ik_ehnutzungen.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#disp_ik_ehnutzungenChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== disp_ik_ehnutzungen.getVisible()) {
            disp_ik_ehnutzungen.setVisible(checked);
        }
    });
} catch (err) {
}

// csl_cityfurniture // erhebung durch martin knura (august 2018)
var smsq_beacons = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_beacons', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_beacons.set('id', 'smsq_beacons');
smsq_beacons.setZIndex(2);
map.addLayer(smsq_beacons);
smsq_beacons.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#beaconsChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_beacons.getVisible()) {
            smsq_beacons.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_memorials = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_memorials', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_memorials.set('id', 'smsq_memorials');
smsq_memorials.setZIndex(3);
map.addLayer(smsq_memorials);
smsq_memorials.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#memorialsChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_memorials.getVisible()) {
            smsq_memorials.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_cityfurniture = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_cityfurniture', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_cityfurniture.set('id', 'smsq_cityfurniture');
smsq_cityfurniture.setZIndex(1);
map.addLayer(smsq_cityfurniture);
smsq_cityfurniture.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#cityfurnitureChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_cityfurniture.getVisible()) {
            smsq_cityfurniture.setVisible(checked);
        }
    });
} catch (err) {
}

var smsq_usables = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_usables', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_usables.set('id', 'smsq_usables');
smsq_usables.setZIndex(1);
map.addLayer(smsq_usables);
smsq_usables.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#usablesChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== smsq_usables.getVisible()) {
            smsq_usables.setVisible(checked);
        }
    });
} catch (err) {
}

///

var trx_princurve_dirtrue = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:trx_princurve_dirtrue', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
trx_princurve_dirtrue.set('id', 'trx_princurve_dirtrue');
trx_princurve_dirtrue.setZIndex(6);
map.addLayer(trx_princurve_dirtrue);
trx_princurve_dirtrue.setVisible(false);

var trx_princurve_dirfalse = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:trx_princurve_dirfalse', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
trx_princurve_dirfalse.set('id', 'trx_princurve_dirfalse');
trx_princurve_dirfalse.setZIndex(6);
map.addLayer(trx_princurve_dirfalse);
trx_princurve_dirfalse.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#trx_princurveChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== trx_princurve_dirtrue.getVisible()) {
            trx_princurve_dirtrue.setVisible(checked);
            trx_princurve_dirfalse.setVisible(checked);
        }
    });
} catch (err) {
}

///

var trx_princurvevariance = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:trx_princurvevariance', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
trx_princurvevariance.set('id', 'trx_princurvevariance');
trx_princurvevariance.setZIndex(6);
map.addLayer(trx_princurvevariance);
trx_princurvevariance.setVisible(false);

try {  // Layer-Switcher
    console.log('layerswitcher'); // debug tom
    document.querySelector('#trx_princurveVarChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== trx_princurvevariance.getVisible()) {
            trx_princurvevariance.setVisible(checked);
        }
    });
} catch (err) {
}

///

// LAYER TO HIGHLIGHT SELECTED GEOMETRIES
var highlightsLayer = new ol.layer.Vector({
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 5
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
        })
    })
});
highlightsLayer.set('id', 'highlightsLayer')
highlightsLayer.setZIndex(99);
map.addLayer(highlightsLayer);

try {
    document.querySelector('#anrainerResetChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked) {
            highlightsLayer.setVisible(false);
        }
    });
} catch (err) {
}

///
/** hier sind toms änderungen auch schon wieder vorbei **/
///

/*
    Busfahrt START

*/

Busanimation = function (olFeature, speed) {
    // args = ol-Feature with parameters name and geometry

    console.log('Create new Busanimation-Object.');

    var featname = olFeature.get('name');
    var travelspeed = speed;

    var jump;

    var fewLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [olFeature] //(new ol.format.GeoJSON()).readFeatures(routeLineString)
        })
    });

    function slowdown(lineString, objType) {
        // INPUT: ol.geom.Linestring; OUTPUT: ol.geom.LineString

        // Definition Teilroute
        var coords = lineString.getCoordinates();
        var clength = coords.length; // Anzahl der Koordinatenpaare

        // Erstellung neuer Linestring mit 5m-Teilstücken
        newCoords = new Array();

        for (i = 0; i < clength - 1; i++) {
            teilcoordinates = [coords[i], coords[i + 1]];

            var teilroute = new ol.geom.LineString(teilcoordinates);

            // stopps every or every 5th Meter
            if (objType == 0) {
                jump = 1;
            } else {
                jump = 5
            }

            var stopps = Math.round(teilroute.getLength() / jump); // getLength() -> measured length

            var fractions = 1 / stopps;

            for (j = 0; j < stopps; j++) {
                newCoords.push(teilroute.getCoordinateAt(fractions * (j + 1)));
            }
        }

        var newLineString = new ol.geom.LineString(newCoords);
        return newLineString;
    }

    var fastRoute = fewLayer.getSource().getFeatures()[0].getGeometry(); // geom. siehe oben

    var route = slowdown(fastRoute, featname); // *

    var routeCoords = route.getCoordinates();
    var routeLength = routeCoords.length; // no. of points

    var startPoint = route.getCoordinateAt(0);
    var endPoint = route.getCoordinateAt(1);

    // var routeFeature = new ol.Feature({ // ol.geom.LineString-Feature
    //     type: 'route',
    //     geometry: route
    // });

    var geoMarker = new ol.Feature({
        type: 'geoMarker',
        geometry: new ol.geom.Point(routeCoords[0])
    });

    // var startMarker = new ol.Feature({
    //     type: 'icon',
    //     geometry: new ol.geom.Point(routeCoords[0])
    // });

    var endMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[routeLength - 1])
    });

    /*
    // only needed if whole distance should be visualized

    var busfahrt = new ol.layer.Vector({
        name: 'busfahrt',
        source: new ol.source.Vector({
            features: [
                // routeFeature,
                geoMarker,
                // startMarker,
                endMarker
            ]
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

    var styles = {
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
        // console.log('icondreher()');

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
    */

    var animating = false;
    // var speed;
    var now;

    // var startButton = true;

    var busPosition;

    var ampel = false;
    var ampelLineString;
    var ampelListe0 = [];
    var ampelListe1 = [];

    var regex = /^[0-9].*$/;

    var moveFeature = function (event) {
        // from: http://openlayers.org/en/latest/examples/feature-move-animation.html?q=animation
        console.log('moveFeature()');

        var vectorContext = event.vectorContext;
        var frameState = event.frameState;

        if (animating) { // should be true
            var elapsedTime = frameState.time - now; // milliseconds

            // here the trick to increase speed is to jump some indexes
            // on lineString coordinates
            var index = Math.round(travelspeed * (elapsedTime / 1000) / jump); // m/s * milliseconds/1000 /5m
            // var index = Math.round(speed * elapsedTime) / 100000);

            if (index >= routeLength) { // length = no. of points
                stopAnimation(true);
                return;
            }

            var currentPoint = new ol.geom.Point(routeCoords[index]);
            console.log(currentPoint.getCoordinates());

            busPosition = new ol.Feature(currentPoint);
            // geoMarker.setGeometry(currentPoint.getCoordinates());

            if (regex.test(featname)) { // featname is something with numbers
                if (featname >= 1) { // if bus
                    busStyle = new ol.style.Style({
                        // facing problems with ol.style.Icon
                        image: new ol.style.RegularShape({
                            points: 4,
                            radius: 22.5,
                            rotation: Math.PI / 4,
                            snapToPixel: false,
                            fill: new ol.style.Fill({color: 'red'}),
                            // stroke: new ol.style.Stroke({color: 'blue', width: 2})
                        }),
                        text: new ol.style.Text({
                            text: featname,
                            font: '22px DejaVu Sans',
                            fill: new ol.style.Fill({color: 'white'}),
                            textAlign: 'center',
                            // offsetX: 6,
                            // offsetY: 1
                        })
                    })
                }
                else if (featname == 0.1) { // if pedestrian: name == 0
                    busStyle = new ol.style.Style({
                        // facing problems with ol.style.Icon
                        image: new ol.style.RegularShape({
                            points: 4,
                            radius: 22.5,
                            rotation: Math.PI / 4,
                            snapToPixel: false,
                            // fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.25)'}),
                            fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.75)'}),
                            // stroke: new ol.style.Stroke({color: 'lightgrey', width: 4})
                            stroke: new ol.style.Stroke({color: 'rgb(64, 64, 64)', width: 4})
                        })
                    })
                }
                else if (featname == 0.3) { // car
                    busStyle = new ol.style.Style({
                        // facing problems with ol.style.Icon
                        image: new ol.style.RegularShape({
                            points: 4,
                            radius: 22.5,
                            rotation: Math.PI / 4,
                            snapToPixel: false,
                            // fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.25)'}), // opaque black
                            fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.25)'}), // from pedestrians
                            // stroke: new ol.style.Stroke({color: 'black', width: 4}) // black
                        })
                    })
                }
                else if (featname == 0.35) { // tempo-sünder
                    busStyle = new ol.style.Style({
                        // facing problems with ol.style.Icon
                        image: new ol.style.RegularShape({
                            points: 4,
                            radius: 22.5,
                            rotation: Math.PI / 4,
                            snapToPixel: false,
                            fill: new ol.style.Fill({color: 'rgba(139, 0, 0, 0.25)'}), // opaque darkred
                            // stroke: new ol.style.Stroke({color: 'darkred', width: 4}) // darkred
                        })
                    })
                }
            } else if (featname.startsWith('U')) {
                busStyle = new ol.style.Style({
                    // facing problems with ol.style.Icon
                    image: new ol.style.RegularShape({
                        points: 4,
                        radius: 22.5,
                        rotation: Math.PI / 4,
                        snapToPixel: false,
                        fill: new ol.style.Fill({color: 'rgba(0,0,255,0.5)'}), // 'blue'
                        // stroke: new ol.style.Stroke({color: 'blue', width: 2})
                    }),
                    text: new ol.style.Text({
                        text: featname,
                        font: '22px DejaVu Sans',
                        fill: new ol.style.Fill({color: 'white'}),
                        textAlign: 'center',
                        // offsetX: 6,
                        // offsetY: 1
                    })
                })
            } else if (featname.startsWith('S')) {
                busStyle = new ol.style.Style({
                    // facing problems with ol.style.Icon
                    image: new ol.style.RegularShape({
                        points: 4,
                        radius: 22.5,
                        rotation: Math.PI / 4,
                        snapToPixel: false,
                        fill: new ol.style.Fill({color: 'rgba(0,128,0,0.5)'}), // 'green'
                        // stroke: new ol.style.Stroke({color: 'blue', width: 2})
                    }),
                    text: new ol.style.Text({
                        text: featname,
                        font: '22px DejaVu Sans',
                        fill: new ol.style.Fill({color: 'white'}),
                        textAlign: 'center',
                        // offsetX: 6,
                        // offsetY: 1
                    })
                })
            } else {
                busStyle = new ol.style.Style({
                    // facing problems with ol.style.Icon
                    image: new ol.style.RegularShape({
                        points: 4,
                        radius: 22.5,
                        rotation: Math.PI / 4,
                        snapToPixel: false,
                        fill: new ol.style.Fill({color: 'rgba(255,165,0,0.5)'}), // 'orange'
                        // stroke: new ol.style.Stroke({color: 'blue', width: 2})
                    }),
                    text: new ol.style.Text({
                        text: featname.substr(0, 2), // first two characters of, e. g. 'RE800'
                        font: '22px DejaVu Sans',
                        fill: new ol.style.Fill({color: 'white'}),
                        textAlign: 'center',
                        // offsetX: 6,
                        // offsetY: 1
                    })
                })
            }

            vectorContext.drawFeature(busPosition, busStyle);
            // console.log('drawFeature()');

            // Ampelerkennung
            if (altstadt_lichtsa.getVisible() == true) {
                // console.log("buskreis");
                var buskreis = new ol.geom.Circle(currentPoint.getCoordinates(), 50);
                //console.log(buskreis.getCenter());

                // for each ampel in ol.layer.Vector() // GeoJSON
                for (i = 0; i < altstadt_lichtsa.getSource().getFeatures().length; i++) {
                    var ampelcoords = altstadt_lichtsa.getSource().getFeatures()[i].getGeometry().getCoordinates();

                    if (buskreis.intersectsCoordinate(ampelcoords)) {
                        // Koordinaten werden getrennt, da leicher zu vergleichen
                        var ampelx = ampelcoords[0];
                        var ampely = ampelcoords[1];

                        // Wenn Ampel noch nicht animiert: Koordination in Array & Animation starten
                        if ((ampelListe0.includes(ampelx) == false) && (ampelListe1.includes(ampely) == false)) {

                            // Ampel auf rot setzen
                            ampel = true;
                            console.log(ampel);

                            ampelListe0.push(ampelx);
                            ampelListe1.push(ampely);
                            radarFeature(ampelcoords);
                        }

                        var ampelLineString = new ol.geom.LineString([ampelcoords, currentPoint.getCoordinates()]);
                        console.log(ampelLineString.getCoordinates());

                        //var lineStringFeature = new ol.Feature(ampelLineString);
                        //vectorContext.drawFeature(lineStringFeature, styles.ampelLine);
                        //ampelListe.push(lineStringFeature);
                        //map.render();
                        //console.log(ampelListe);
                    }
                }
            }
        }

        // tell OpenLayers to continue the postcompose animation
        map.render();
    };

    this.startAnimation = function () {
        console.log('startAnimation()');

        if (animating) {
            stopAnimation(false);
        } else {
            animating = true;
            now = new Date().getTime(); // milliseconds

            // if(regex.test(featname)){
            //     speed = 300;
            // } else{
            //     speed = 600;
            // }

            // startButton.textContent = 'Cancel Animation';

            // hide geoMarker
            geoMarker.setStyle(null);

            map.on('postcompose', moveFeature);
            map.render();
        }
    }

    function stopAnimation(ended) {
        console.log('stopAnimation()');

        animating = false;
        // startButton.textContent = 'Start Animation';

        // if animation cancelled set the marker at the beginning
        // var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0]; // "conditional (ternary) operator" ->
        if (ended) {
            var coord = routeCoords[routeLength - 1];
        } else {
            var coord = routeCoords[0];
        }

        (geoMarker.getGeometry()).setCoordinates(coord); // @type {ol.geom.Point}
        busPosition = null; // ... if not moving

        //remove listener
        map.un('postcompose', moveFeature);

        // var t = setTimeout(function(){
        // document.getElementById('startTime').click(); // once (false)
        // document.getElementById('startTime').click(); // twice (true)
        // }, 30000); // 1000 ms = 1 s
    }
}


function checkTime(i) {
    // add a zero in front of numbers < 10
    // console.log('checkTime()');
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}

function startTime() {
    // console.log('startTime()');
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    h = checkTime(h);
    m = checkTime(m);
    //s = checkTime(s);
    //document.getElementById("txt").innerHTML = h + ":" + m + ":" + s;

    var currentTime = h + ':' + m;

    function checkBus(string) { // callback-function of [].some(), see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/some
        // console.log('checkBus()');
        return string == currentTime;
    }
}

// NEW END

/*
    Busfahrt ENDE

*/

/*
    Ampel-Animation START

*/
var radarSource = new ol.source.Vector({
    wrapX: false
});

var radarVector = new ol.layer.Vector({
    source: radarSource,
    style: new ol.style.Style({
        image: new ol.style.Circle({radius: 0})
    })
});
map.addLayer(radarVector);


function radarFeature(coordinates) {
    console.log("radarFeature");
    var geom = new ol.geom.Point(coordinates);
    var feature = new ol.Feature(geom);
    radarSource.addFeature(feature);
}


function flash(feature) {
    var start = new Date().getTime();
    var listenerKey;

    function animate(event) {
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;
        var flashGeom = feature.getGeometry().clone();
        var elapsed = frameState.time - start;
        var elapsedRatio = elapsed / 3000;
        // radius will be 5 at start and 40 at end.
        var radius = ol.easing.easeOut(elapsedRatio) * 35 + 5;
        var opacity = ol.easing.easeOut(1 - elapsedRatio);

        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: radius,
                snapToPixel: false,
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 0, 0, ' + opacity + ')',
                    width: 0.25 + opacity
                })
            })
        });

        vectorContext.setStyle(style);

        vectorContext.drawGeometry(flashGeom);
        if (elapsed > 3000) {
            ol.Observable.unByKey(listenerKey);
            return;
        }
        // tell OpenLayers to continue postcompose animation
        map.render();
    }

    listenerKey = map.on('postcompose', animate);
}

radarSource.on('addfeature', function (e) {
    flash(e.feature);
});
/*
    Ampel-Animation ENDE

*/

var pedestrian_p = new ol.layer.Vector({
    checked: true,
    style: new ol.style.Style({
        // facing problems with ol.style.Icon
        image: new ol.style.RegularShape({
            points: 4,
            radius: 22.5,
            rotation: Math.PI / 4,
            snapToPixel: false,
            fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.25)'}),
            stroke: new ol.style.Stroke({color: 'yellow', width: 4})
            // image: new ol.style.Circle({
            // radius: 3,
            // fill: new ol.style.Fill({
            // color: 'blue'
            // })
        })
    })
});
pedestrian_p.setZIndex(100);
map.addLayer(pedestrian_p);
pedestrian_p.setVisible(pedestrian_p.get('checked'));

// LineString-Layer
var pedestrian_line = new ol.layer.Vector({
    checked: true,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'yellow',
            opacity: 0.5,
            width: 2
        })
    })
});
pedestrian_line.setZIndex(99);
map.addLayer(pedestrian_line);
pedestrian_line.setVisible(pedestrian_line.get('checked'));

// Extents (that cityscope is providing for smartsquare
// remains invisible (only for debug-mode)
var smsq_extents = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: owspath + 'gwc/service/wms',
        params: {'LAYERS': 'csl:smsq_extents', 'TILED': true, 'SRS': 'EPSG:3857'},
        serverType: 'geoserver'
    })
});
smsq_extents.set('id', 'smsq_extents');
smsq_extents.setZIndex(6);
map.addLayer(smsq_extents);
smsq_extents.setVisible(false);


// Session-Layer --------------------------------------------------------------------------
// http://5.9.123.72:8080/geoserver/csl/wms?service=WMS&version=1.1.0&request=GetMap&layers=csl:csl_session&styles=&bbox=545000.0,5912000.0,589000.0,5955000.0&width=768&height=750&srs=EPSG:25832&format=image%2Fpng
/*
var sessionLayer = new ol.layer.Image({
    extent: [1077138.9413251637, 7048976.144526426, 1152075.2710173083, 7120324.748129732],
    source: new ol.source.ImageWMS({
        url: 'http://5.9.123.72:8080/geoserver/csl/wms',
        params: {'LAYERS': 'csl:csl_session'},
        serverType: 'geoserver'
    })
});
sessionLayer.set('id', 'sessionLayer');
map.addLayer(sessionLayer);
*/
var sessionLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        // url: 'http://map01.local.hcu-hamburg.de:8080/geoserver/csl/wms',
        // params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': 'unterkuenfte_heute'},
        url: owspath + 'csl/wms',
        params: {'LAYERS': 'csl:unterkuenfte', 'tiled': true, 'STYLES': 'vorgeschlagene'},
        serverType: 'geoserver'
    })
});
sessionLayer.set('id', 'sessionLayer');
map.addLayer(sessionLayer);
sessionLayer.setVisible(false);

// Layer-Switcher
try {
    document.querySelector('#layerSessionChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== sessionLayer.getVisible()) {
            sessionLayer.setVisible(checked);
        }
    });
} catch (err) {
}
sessionLayer.setVisible(false);


// Suchraum -----------------------------------------------------------------------------------

var suchraumFeature;

/*
var suchraumFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.transform( [10.005150, 53.553325], 'EPSG:4326', 'EPSG:3857'))
});
*/

var suchraumFeatureArray = [];
//suchraumFeatureArray.push(suchraumFeature);

/*
var suchraumStyle = new ol.style.Style({
    image: new ol.style.RegularShape({
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 12/(4.777314267823516/map.getView().getResolution())
        }),
        points: 4,
        radius: 375, // 250 entspricht einer Kantenlänge von 1000 m bei Zoomstufe 15
        angle: Math.PI/4
    })
});
*/
var suchraumStyle = new ol.style.Style({
    image: new ol.style.Icon(({
        src: 'images/cross3.svg'
    }))
});
//suchraumStyle.getImage().setScale(4.777314267823516/map.getView().getResolution());

//suchraumFeature.setStyle(suchraumStyle);

var suchraumVectorSource = new ol.source.Vector({
    features: suchraumFeatureArray
});

var suchraumLayer = new ol.layer.Vector({
    source: suchraumVectorSource
});
suchraumLayer.set('id', 'suchraumLayer');
map.addLayer(suchraumLayer);
try {	// Layer-Switcher
    document.querySelector('#layerSuchraumChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== suchraumLayer.getVisible()) {
            suchraumLayer.setVisible(checked);
        }
    });
} catch (err) {
}
suchraumLayer.setVisible(false);

/*
map.getView().on('change:resolution', function(event) {
    var width = 12/(4.777314267823516/map.getView().getResolution());
    /*
    suchraumStyle = new ol.style.Style({
        image: new ol.style.RegularShape({
            stroke: new ol.style.Stroke({
                color: 'black',
                width: width
            }),
            points: 4,
            radius: 375, // 250 entspricht einer Kantenlänge von 1000 m bei Zoomstufe 15
            angle: Math.PI/4
        })
    });
    */
/*	var suchraumStyle = new ol.style.Style({
        image: new ol.style.Icon( ({
            src: 'images/cross3.svg'
        }))
    });
    suchraumStyle.getImage().setScale(4.777314267823516/map.getView().getResolution());
    suchraumFeature.setStyle(suchraumStyle);
});
*/


// Curtain-Layer ------------------------------------------------------------------------------
var iconFeatures = [];
var feature = new ol.Feature({
    geometry: new ol.geom.Polygon([[
        [1070000, 7040000],
        [1070000, 7130000],
        [1160000, 7130000],
        [1160000, 7040000],
        [1070000, 7040000]
    ]])
});
iconFeatures.push(feature);
var vectorSource = new ol.source.Vector({
    features: iconFeatures
});
var curtainLayer = new ol.layer.Vector({
    source: vectorSource,
    style: curtainPolygon
});
curtainLayer.set('id', 'curtainLayer');
map.addLayer(curtainLayer);
curtainLayer.setVisible(false);

// Zoom to Layer
$('#zoom2curtain').click(function () {
    var layerExtent = curtainLayer.getSource().getExtent();
    map.getView().fit(layerExtent, map.getSize());
});

try {  // Layer-Switcher
    document.querySelector('#layerCurtainChbx').addEventListener('change', function () {
        var checked = this.checked;
        if (checked !== curtainLayer.getVisible()) {
            curtainLayer.setVisible(checked);
        }
    });
} catch (err) {
}
