// is copy of ..\en\controlWsocket.js except var lang

requirejs(["../ini"], function(ini) {

    ////////// ////////// ////////// ////////// ////////// ////////// ////////// //////////
    // initial vars //
    ////////// ////////// ////////// ////////// ////////// ////////// ////////// //////////

    var lang = 'en';
    var destination = 'desk1'; // DEFAULT

    var artDump; // "global"

    // Query string
    if(window.location.search) { // Debug
        var query = window.location.search;
        query = query.replace('?', ''); // query is either desk1, desk2 or bento

        // exception:
        // bento needs to locassign to but topic would'nt be right
        var withBentoException;
        if(query=='bento'){
            withBentoException = 'desk1' + '.';
        } else{
            withBentoException = query + '.';
        }

        // anyway
        destination = query + '.';
    }

    var pressedClr = 'skyblue'; // if button pressed

    var interval; // for gtfs-animation

    // the WAMP connection to the Router
    var connection = new autobahn.Connection({
        url: wsuri,
        realm: realm
    });

    ////////// ////////// ////////// ////////// ////////// ////////// ////////// //////////

    // fired when connection is established and session attached
    connection.onopen = function (session, details) {
        console.log("Connected");

        /*
        $('#initTv1').on('click', function() {
            console.log('Init Dashboard 1 on/off');

            if(this.value == 'false'){ // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv1',
                    [
                        'tv1',
                        filepath + 'dashb_init1.html'
                    ]
                );
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv1',
                    [
                        'tv1',
                        'http://csl.local.hcuhh.de/csl1.html'
                    ]
                );
            }
        });
        */

        initTv1Func = function(){
            console.log('Init Dashboard 1 on/off');

            if(this.value == 'false'){ // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv1',
                    [
                        'tv1',
                        filepath + 'dashb_init1.html'
                    ]
                );
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv1',
                    [
                        'tv1',
                        'http://csl.local.hcuhh.de/csl1.html'
                    ]
                );
            }
        }

        /*
        $('#initTv2').on('click', function() {
            console.log('Init Dashboard 2 on/off');

            if(this.value == 'false'){ // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv2',
                    [
                        'tv2',
                        filepath + 'dashb_init2.html'
                    ]
                );
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv2',
                    [
                        'tv2',
                        'http://csl.local.hcuhh.de/csl2.html'
                    ]
                );
            }
        });
        */

        initTv2Func = function(){
            console.log('Init Dashboard 2 on/off');

            if(this.value == 'false'){ // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv2',
                    [
                        'tv2',
                        filepath + 'dashb_init2.html'
                    ]
                );
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish(
                    'hcu.csl.smsq.' + destination + 'locassigntv2',
                    [
                        'tv2',
                        'http://csl.local.hcuhh.de/csl2.html'
                    ]
                );
            }
        }

        /*
        $('#viewAerialInitCtrl').on('click', function() {
            console.log('layerOrtho1 on/off');

            if(this.value == 'false'){ // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', true]);

                document.getElementById('viewModelInitCtrl').value = 'false';
                document.getElementById('viewModelInitCtrl').style.backgroundColor = '';
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['altstadtWalkable', false]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', '']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', false]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', 'smsq_osm_platz_bw']);
            }
        });
        */

        viewAerialInitFunc = function(){
            console.log('layerOrtho1 on/off');

            var bt = document.getElementById('viewAerialInitCtrl');

            if(bt.value == 'false'){ // here 'true' is set as default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', true]);

                document.getElementById('viewModelInitCtrl').value = 'false';
                document.getElementById('viewModelInitCtrl').style.backgroundColor = '';
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['altstadtWalkable', false]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', '']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', false]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', 'smsq_osm_platz_bw']);
            }
        }

        /*
        $('#viewModelInitCtrl').on('click', function() {
            console.log('model-view on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                document.getElementById('viewAerialInitCtrl').value = 'false';
                document.getElementById('viewAerialInitCtrl').style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['altstadtWalkable', true]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', 'smsq_osm_platz_bw']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['altstadtWalkable', false]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', '']);
            }
        });
        */

        viewModelInitFunc = function(){
            console.log('model-view on/off');

            var bt = document.getElementById('viewModelInitCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                document.getElementById('viewAerialInitCtrl').value = 'false';  // aerial
                document.getElementById('viewAerialInitCtrl').style.backgroundColor = '';  // aerial

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['altstadtWalkable', true]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', 'smsq_osm_platz_bw']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['layerOrtho1', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['altstadtWalkable', false]);

                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', '']);
            }
        }

        chooseAOIFunc = function(){
            var sel = document.getElementById('chooseAOICtrl');
            var val = sel.value;

            session.publish('hcu.csl.smsq.' + destination + 'panToAoi', [query, val]);
        }

        /*
        $('#chooseAOICtrl').change(function(){
            session.publish('hcu.csl.smsq.' + destination + 'panToAoi', [query, this.value]);
        });
        */

        spotOnSmsqFunc = function(){
            console.log('smsq_osm_platz on/off');

            var bt = document.getElementById('spotOnSmsqCtrl');

            if(bt.value == 'false'){ // here 'true' is set as default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', true]);

                // change sld-style regarding to background image
                if(document.getElementById('viewAerialInitCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', '']);
                } else{
                    session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', 'smsq_osm_platz_bw']);
                }
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', false]);
            }
        }

        /*
        $('#spotOnSmSqCtrl').on('click', function() {
            console.log('smsq_osm_platz on/off');

            if(this.value == 'false'){ // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', true]);

                if(document.getElementById('viewAerialInitCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', '']);
                } else{
                    session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['smsq_osm_platz', 'STYLES', 'smsq_osm_platz_bw']);
                }
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', false]);
            }
        });
        */

        axBuildingsFunc = function(){
            console.log('smsq_ax_gebaeude_edit on/off');

            var bt = document.getElementById('axBuildingsCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_buildings.html']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                if(document.getElementById('lgndHKLegoCtrl').value == 'true'){
                    // do nothing
                } else{
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', false]);
                }

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#axBuildingsCtrl').on('click', function() {
            console.log('smsq_ax_gebaeude_edit on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_buildings.html']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                if(document.getElementById('lgndHKLegoCtrl').value == 'true'){
                    // do nothing
                } else{
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', false]);
                }

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        hhInnerCityConceptFunc = function(){
            console.log('innenstadtkonzept_eh on/off');

            var bt = document.getElementById('hhInnerCityConceptCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['innenstadtkonzept_eh', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_cityStrategy.html']);

            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['innenstadtkonzept_eh', false]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#hhInnerCityConceptCtrl').on('click', function() {
            console.log('innenstadtkonzept_eh on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['innenstadtkonzept_eh', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_cityStrategy.html']);

            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['innenstadtkonzept_eh', false]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        // setvisible(false) for all historic layers
        function light(bool){
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', bool]);

            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1150ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1200ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1250ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1550ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1650ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1813ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1859ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1938ad', bool]);
            session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_1946ad', bool]);
        }

        annoFunc = function(){
            var bt = document.getElementById('annoCtrl');

            if(bt.value == 'nix'){
                light(false);

                session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['layerOrtho1', 1]);

                if(document.getElementById('spotOnSmSqCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', true]);
                }

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);

            } else{
                light(false);
                session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['layerOrtho1', 0.75]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_' + bt.value + 'ad', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_historicView.html']);
            }
        }

        /*
        $('#annoCtrl').change(function(){
            if(this.value == 'nix'){
                light(false);

                session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['layerOrtho1', 1]);

                if(document.getElementById('spotOnSmSqCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', true]);
                }

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);

            } else{
                light(false);
                session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['layerOrtho1', 0.75]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_' + this.value + 'ad', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_historicView.html']);
            }
        });
        */

        infrastrFunc = function(){
            console.log('infrastructure on/off');

            var bt = document.getElementById('infrastrCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                document.getElementById('greenInfrastructureCtrl').value = 'false';  // green
                document.getElementById('greenInfrastructureCtrl').style.backgroundColor = '';  // green
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_vegetationsmerkmal', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', false]);
            }
        }

        /*
        $('#infrastructureCtrl').on('click', function() {
            console.log('infrastructure on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                document.getElementById('greenInfrastructureCtrl').value = 'false';
                document.getElementById('greenInfrastructureCtrl').style.backgroundColor = '';
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_vegetationsmerkmal', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', false]);
            }
        });
        */

        grInfrastrFunc = function(){
            console.log('green_infrastructure on/off');

            var bt = document.getElementById('grInfrastrCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                document.getElementById('infrastructureCtrl').value = 'false';
                document.getElementById('infrastructureCtrl').style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_vegetationsmerkmal', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_vegetationsmerkmal', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', false]);
            }
        }

        /*
        $('#greenInfrastructureCtrl').on('click', function() {
            console.log('green_infrastructure on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                document.getElementById('infrastructureCtrl').value = 'false';
                document.getElementById('infrastructureCtrl').style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_vegetationsmerkmal', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_vegetationsmerkmal', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hh_sib_haltestellen', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvv_bahn_masten', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['parkhaus', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['stadtRad_points', false]);
            }
        });
        */

        lgndHKLegoFunc = function(){
            console.log('smsq_ax_gebaeude_edit on/off');
            console.log('setOpacity smsq_ax_gebaeude_edit');
            console.log('locassign hk-legend on/off');

            var bt = document.getElementById('lgndHKLegoCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['smsq_ax_gebaeude_edit', 0.5]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['highlightsLayer', true]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_stakeholder.html']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                if(document.getElementById('axBuildingsCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['smsq_ax_gebaeude_edit', 1]);
                } else{
                    session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['smsq_ax_gebaeude_edit', 1]);
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', false]);
                }

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['highlightsLayer', false]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#lgndHKLegoCtrl').on('click', function() {
            console.log('smsq_ax_gebaeude_edit on/off');
            console.log('setOpacity smsq_ax_gebaeude_edit');
            console.log('locassign hk-legend on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['smsq_ax_gebaeude_edit', 0.5]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['highlightsLayer', true]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_stakeholder.html']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                if(document.getElementById('axBuildingsCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['smsq_ax_gebaeude_edit', 1]);
                } else{
                    session.publish('hcu.csl.smsq.' + destination + 'layeropacity', ['smsq_ax_gebaeude_edit', 1]);
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_ax_gebaeude_edit', false]);
                }

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['highlightsLayer', false]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        HKResetFunc = function(){
            console.log('reset hk-interaction');

            // TODO: highlightsLayer.getSource().clear() // API: Remove all features from the source.

            session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_stakeholder.html']);
        }

        /*
        $('#HKResetCtrl').on('click', function() {
            console.log('reset hk-interaction');

            // TODO: highlightsLayer.getSource().clear() // API: Remove all features from the source.

            session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_stakeholder.html']);
        });
        */

        qualProfilesFunc = function(){
            console.log('q_nutzungszonen_disp on/off');
            console.log('locassign profiles-legend on/off');

            var bt = document.getElementById('qualProfilesCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['q_nutzungszonen_disp', true]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_zone.html']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['q_nutzungszonen_disp', false]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#qualProfilesCtrl').on('click', function() {
            console.log('q_nutzungszonen_disp on/off');
            console.log('locassign profiles-legend on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['q_nutzungszonen_disp', true]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_zone.html']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['q_nutzungszonen_disp', false]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        profilesResetFunc = function(){
            console.log('reset profiles-interaction');

            session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['q_nutzungszonen_disp', 'STYLES', '']);
            session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_zone.html']);
        }

        /*
        $('#profilesResetCtrl').on('click', function() {
            console.log('reset profiles-interaction');

            session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['q_nutzungszonen_disp', 'STYLES', '']);
            session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/lego_zone.html']);
        });
        */

        qualNetworkFunc = function(){
            console.log('smsq_q_passagen on/off');

            var bt = document.getElementById('qualNetworkCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_q_passagen', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_q_passagen', false]);
            }
        }

        /*
        $('#qualNetworkCtrl').on('click', function() {
            console.log('smsq_q_passagen on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_q_passagen', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_q_passagen', false]);
            }
        });
        */

        hhFIDFunc = function(){
            console.log('smsq_freqindwirk on/off');

            var bt = document.getElementById('hhFIDCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_freqindwirk', true]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_freqimpact.html']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_freqindwirk', false]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#hhFIDCtrl').on('click', function() {
            console.log('smsq_freqindwirk on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_freqindwirk', true]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_freqimpact.html']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_freqindwirk', false]);

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        noiseDayFunc = function(){
            console.log('laermkarte_tag on/off');

            var bt = document.getElementById('noiseDayCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_tag', true]);

                if(document.getElementById('noiseNightCtrl').value == 'true'){
                    document.getElementById('noiseNightCtrl').value = 'false';
                    document.getElementById('noiseNightCtrl').style.backgroundColor = '';
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_nacht', false]);
                } else{
                    session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_noise2.html']);
                }
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_tag', false]);

                if(document.getElementById('noiseNightCtrl').value == 'true'){
                    console.log("Not assigning location.")
                } else{
                    // TODO: bentoException this time needs to point to desk2
                    // session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
                    session.publish('hcu.csl.smsq.' + 'desk2.' + 'locassign', [filepath + 'dashb_init1.html']);
                }
            }
        }

        /*
        $('#noiseDayCtrl').on('click', function() {
            console.log('laermkarte_tag on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_tag', true]);

                if(document.getElementById('noiseNightCtrl').value == 'true'){
                    document.getElementById('noiseNightCtrl').value = 'false';
                    document.getElementById('noiseNightCtrl').style.backgroundColor = '';
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_nacht', false]);
                } else{
                    session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_noise2.html']);
                }
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_tag', false]);

                if(document.getElementById('noiseNightCtrl').value == 'true'){
                    console.log("Not assigning location.")
                } else{
                    // TODO: bentoException this time needs to point to desk2
                    // session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
                    session.publish('hcu.csl.smsq.' + 'desk2.' + 'locassign', [filepath + 'dashb_init1.html']);
                }
            }
        });
        */

        noiseNightFunc = function(){
            console.log('laermkarte_nacht on/off');

            var bt = document.getElementById('noiseNightCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_nacht', true]);

                if(document.getElementById('noiseDayCtrl').value == 'true'){
                    document.getElementById('noiseDayCtrl').value = 'false';
                    document.getElementById('noiseDayCtrl').style.backgroundColor = '';
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_tag', false]);
                } else{
                    session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_noise2.html']);
                }
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_nacht', false]);

                if(document.getElementById('noiseDayCtrl').value == 'true'){
                    console.log("Not assigning location.")
                } else{
                    // TODO: bentoException this time needs to point to desk2
                    // session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
                    session.publish('hcu.csl.smsq.' + 'desk2.' + 'locassign', [filepath + 'dashb_init1.html']);
                }
            }
        }

        /*
        $('#noiseNightCtrl').on('click', function() {
            console.log('laermkarte_nacht on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_nacht', true]);

                if(document.getElementById('noiseDayCtrl').value == 'true'){
                    document.getElementById('noiseDayCtrl').value = 'false';
                    document.getElementById('noiseDayCtrl').style.backgroundColor = '';
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_tag', false]);
                } else{
                    session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_noise2.html']);
                }
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['laermkarte_nacht', false]);

                if(document.getElementById('noiseDayCtrl').value == 'true'){
                    console.log("Not assigning location.")
                } else{
                    // TODO: bentoException this time needs to point to desk2
                    // session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
                    session.publish('hcu.csl.smsq.' + 'desk2.' + 'locassign', [filepath + 'dashb_init1.html']);
                }
            }
        });
        */

        camPositionFunc = function(){
            console.log('smsq_cam_ref on/off');

            var bt = document.getElementById('camPositionCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_cam_ref', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_cam_ref', false]);
            }
        }

        /*
        $('#cameraPointsCtrl').on('click', function() {
            console.log('smsq_cam_ref on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_cam_ref', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_cam_ref', false]);
            }
        });
        */

        camViewsFunc = function(){
            // TODO: "view-angle" - what area is monitored ?
        }

        /*
        $('#cameraViewsCtrl').on('click', function() {
            // dummy
            // then: view-angle - what area is monitored ?
        });
        */

        trxRawFunc = function(){
            console.log('tracks_raw on/off');

            var bt = document.getElementById('trxRawCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', true]);
                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['tracks_raw', 'STYLES', '']);

                document.getElementById('trxHeatCtrl').value = 'false';
                document.getElementById('trxHeatCtrl').style.backgroundColor = '';
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', false]);
            }
        }

        /*
        $('#trxRawCtrl').on('click', function() {
            console.log('tracks_raw on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', true]);
                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['tracks_raw', 'STYLES', '']);

                document.getElementById('trxHeatCtrl').value = 'false';
                document.getElementById('trxHeatCtrl').style.backgroundColor = '';
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', false]);
            }
        });
        */

        trxHeatFunc = function(){
            console.log('updateParams to heat map');

            var bt = document.getElementById('trxHeatCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', true]);
                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['tracks_raw', 'STYLES', 'csl:simple_heatmap']);

                document.getElementById('trxRawCtrl').value = 'false';
                document.getElementById('trxRawCtrl').style.backgroundColor = '';
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', false]);
            }
        }

        /*
        $('#trxHeatCtrl').on('click', function() {
            console.log('updateParams to heat map');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', true]);
                session.publish('hcu.csl.smsq.' + destination + 'updateParams', ['tracks_raw', 'STYLES', 'csl:simple_heatmap']);

                document.getElementById('trxRawCtrl').value = 'false';
                document.getElementById('trxRawCtrl').style.backgroundColor = '';
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['tracks_raw', false]);
            }
        });
        */

        trxLgndFunc = function(){
            console.log('locassign trx-legend on/off');

            var bt = document.getElementById('trxLgndCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_trxanim.html']);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#trxLgndCtrl').on('click', function() {
            console.log('locassign trx-legend on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_trxanim.html']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        trxAnimFunc = function(){
            var camera = document.getElementById('trxCamCtrl').value;
            var timestamp = document.getElementById('trxTimeCtrl').value;
            var multiplier = document.getElementById('trxMultiplyCtrl').value;

            session.publish('hcu.csl.smsq.' + withBentoException + 'startTrxAnim', [camera, timestamp, multiplier]);
            console.log('published:' + camera + ', ' + timestamp);
        }

        /*
        $('#trxAnimCtrl').on('click', function() {
            var camera = document.getElementById('trxCamCtrl').value;
            var timestamp = document.getElementById('trxTimeCtrl').value;
            var multiplier = document.getElementById('trxMultiplyCtrl').value;

            session.publish('hcu.csl.smsq.' + withBentoException + 'startTrxAnim', [camera, timestamp, multiplier]);
            console.log('published:' + camera + ', ' + timestamp);
        });
        */

        trxPCAFunc = function(){
            console.log('trxPCA + Var on/off');

            var bt = document.getElementById('trxPCACtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirtrue', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirfalse', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurvevariance', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirtrue', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirfalse', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurvevariance', false]);
            }
        }

        /*
        $('#trxPCACtrl').on('click', function() {
            console.log('trxPCA + Var on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirtrue', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirfalse', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurvevariance', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirtrue', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurve_dirfalse', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['trx_princurvevariance', false]);
            }
        });
        */

        abmAnimFunc = function(){
            console.log('start-abpedsim');

            // defaults
            var type = 'FollowWayPointsModel';
            var target = [565970.0026190672, 5933772.461778085];

            // receive and transform map-extent
            // var mapExtent = map.getView().calculateExtent(map.getSize());
            // mapExtent = ol.proj.transformExtent(mapExtent, 'EPSG:3857', 'EPSG:25832');

            // TODO: Subscribe mapextent info
            var mapExtent = [565872.108005478, 5933653.989872328, 1113193, 7085520.166666667];

            // get values
            var args0 = document.getElementById('abmArgs0').value;
            var args1 = document.getElementById('abmArgs1').value;

            var peds = parseInt(args0);
            var type = parseInt(args1);

            // TODO: What about that target-value?

            // publish Start
            console.log("publish topic 'ABPedSimStart'");
            session.publish('hcu.csl.smsq.' + withBentoException + 'ABPedSimStart', [mapExtent, peds, type]);
        }

        /*
        $('#abmAnimCtrl').on('click', function() {
            console.log('start-abpedsim');

            // defaults
            var type = 'FollowWayPointsModel';
            var target = [565970.0026190672, 5933772.461778085];

            // receive and transform map-extent
            // var mapExtent = map.getView().calculateExtent(map.getSize());
            // mapExtent = ol.proj.transformExtent(mapExtent, 'EPSG:3857', 'EPSG:25832');

            // TODO: Subscribe mapextent info
            var mapExtent = [565872.108005478, 5933653.989872328, 1113193, 7085520.166666667];

            // get values
            var args0 = document.getElementById('abmArgs0').value;
            var args1 = document.getElementById('abmArgs1').value;

            var peds = parseInt(args0);
            var type = parseInt(args1);

            // TODO: What about that target-value?

            // publish Start
            console.log("publish topic 'ABPedSimStart'");
            session.publish('hcu.csl.smsq.' + withBentoException + 'ABPedSimStart', [mapExtent, peds, type]);
        });
        */

        installFunc = function(){
            console.log('smsq_memorials on/off');

            var bt = document.getElementById('installCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_memorials', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_memorials', false]);
            }
        }

        /*
        $('#installationsCtrl').on('click', function() {
            console.log('smsq_memorials on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_memorials', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_memorials', false]);
            }
        });
        */

        beaconsFunc = function(){
            console.log('smsq_beacons on/off');

            var bt = document.getElementById('beaconsCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_beacons', true]);
            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_beacons', false]);
            }
        }

        /*
        $('#beaconsCtrl').on('click', function() {
            console.log('smsq_beacons on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_beacons', true]);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_beacons', false]);
            }
        });
        */

        hvvRoutesFunc = function(){
            console.log('hvvLayer on/off');

            var bt = document.getElementById('hvvRoutesCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';
                bt.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvvLayer', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_publicTransport.html']);
            } else{
                bt.value = 'false';
                bt.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvvLayer', false]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#hvvRoutesCtrl').on('click', function() {
            console.log('hvvLayer on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvvLayer', true]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + lang + '/dashb_publicTransport.html']);
            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['hvvLayer', false]);
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        hvvAnimFunc = function(){
            session.publish('hcu.csl.smsq.' + withBentoException + 'gtfsAnimate01', ['string']);
            console.log("published 'hcu.csl.smsq." + withBentoException + "gtfsAnimate01'");

            interval = setInterval(function(){
                session.publish('hcu.csl.smsq.' + withBentoException + 'gtfsAnimate01', ['string']);
                console.log("published 'hcu.csl.smsq." + withBentoException + "gtfsAnimate01'");
            }, 30000);

            if (interval){
                console.log("interval active...");
            }
        }

        /*
        $('#hvvAnimCtrl').on('click', function() {
            session.publish('hcu.csl.smsq.' + withBentoException + 'gtfsAnimate01', ['string']);
            console.log("published 'hcu.csl.smsq." + withBentoException + "gtfsAnimate01'");

            interval = setInterval(function(){
                session.publish('hcu.csl.smsq.' + withBentoException + 'gtfsAnimate01', ['string']);
                console.log("published 'hcu.csl.smsq." + withBentoException + "gtfsAnimate01'");
            }, 30000);

            if (interval){
                console.log("interval active...");
            }
        });
        */

        hvvClearIntervalFunc = function(){
            clearInterval(interval);
            console.log("interval cleared.")
        }

        /*
        $('#hvvClearCtrl').on('click', function() {
            clearInterval(interval);
            console.log("interval cleared.")
        });
        */

        // FindingPlaces
        csl_fpFunc = function(){
            console.log('FindingPlaces on/off');

            var bt = document.getElementById('csl_fpCtrl');

            if(bt.value == 'false'){ // is default
                bt.value = 'true';

                bt.style.backgroundColor = pressedClr;

                if(document.getElementById('spotOnSmSqCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', false]);
                }

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01bLayer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01cLayer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01dLayer', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms11Layer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms10dLayer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['sessionlayer', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['schulenLayer', true]);

                // locassign
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'fp_black.html']);

            } else{
                bt.value = 'false';

                bt.style.backgroundColor = '';

                if(document.getElementById('spotOnSmSqCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', true]);
                }

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01bLayer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01cLayer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01dLayer', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms11Layer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms10dLayer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['sessionlayer', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['schulenLayer', false]);

                // locassign
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        }

        /*
        $('#csl_fpCtrl').on('click', function() {
            console.log('FindingPlaces on/off');

            if(this.value == 'false'){ // is default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                if(document.getElementById('spotOnSmSqCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', false]);
                }

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01bLayer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01cLayer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01dLayer', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms11Layer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms10dLayer', true]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['sessionlayer', true]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['schulenLayer', true]);

                // locassign
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'fp_black.html']);

            } else{
                this.value = 'false';

                this.style.backgroundColor = '';

                if(document.getElementById('spotOnSmSqCtrl').value == 'true'){
                    session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['smsq_osm_platz', true]);
                }

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01bLayer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01cLayer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms01dLayer', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms11Layer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['wms10dLayer', false]);
                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['sessionlayer', false]);

                session.publish('hcu.csl.smsq.' + destination + 'layeronoff', ['schulenLayer', false]);

                // locassign
                session.publish('hcu.csl.smsq.' + withBentoException + 'locassign', [filepath + 'dashb_init1.html']);
            }
        });
        */

        trxFunc = function(){
            console.log("trxTest-Button pressed.");

            var art = $('#article');  // TODO: jQuery? need?
            var ele = document.getElementById('article');

            artDump = ele.innerHTML; // global
            var artTemp = '<button type="button" id="artBack" value=false onclick="artBackFunc()">Zur&uuml;ck</button><br>'; // two vertical spaces

            artTemp += '<select id="trxCamCtrl" style="margin-top:100px;">\n' +
                '<option value="nix">Camera</option>\n' +
                '<option value="garnix">======</option>\n' +

                '<option value="backhus">Dat Backhus</option>\n' +
                '<option value="designOffices">DesignOffices</option>\n' +
                '<option value="kirchvorplatz">Bei St. Petri</option>\n' +
                '<option value="kreuzungDomplatz">Gr&uuml;nfl&auml;che</option>\n' +
                '</select>';

            artTemp += '<select id="trxTimeCtrl" style="width:399px;">\n' +
                '<option value="nix">Time</option>\n' +
                '<option value="garnix">======</option>\n' +

                '<option value="20180314_0800_1000">A priori - morgens, M&auml;rz Werktag</option>\n' +
                '<option value="20180314_1130_1330">A priori - mittags, M&auml;rz Werktag</option>\n' +
                <!-- '<option value="20180314_1330_1530">A priori - nachmittag, M&auml;rz Werktag</option>\n' + -->
                '<option value="20180314_1530_1730">A priori - abends, M&auml;rz Werktag</option>\n' +

                '<option value="20180317_0800_1000">A priori - morgens, M&auml;rz Samstag</option>\n' +
                '<option value="20180317_1130_1330">A priori - mittags, M&auml;rz Samstag</option>\n' +

                '<option value="20180318_0800_1000">A priori - morgens, M&auml;rz Sonntag</option>\n' +
                '<option value="20180318_1130_1330">A priori - mittags, M&auml;rz Sonntag</option>\n' +
                '</select>';

            artTemp += '<input id="trxMultiplyCtrl" type="text" value="10">';

            artTemp += '<button type="button" id="trxRaw" style="left:50px;width:200px;" value=false>Traj</button>';
            artTemp += '<button type="button" id="trxHeat" style="width:200px;" value=false>Heat</button>';
            artTemp += '<button type="button" id="trxAnim" style="width:200px;" value=false>Anim</button>';
            artTemp += '<button type="button" id="trxFreq" style="width:200px;" value=false>Freq</button>';
            artTemp += '<button type="button" id="trxStay" style="width:199px;" value=false>Stay</button>';

            art.animate({left:'1920px'}, 1000, function(){ele.innerHTML = artTemp;});
            art.animate({left:'50px'}, 1000);
        }

        /*
        $('#trxTest').on('click', function() {
            console.log("trxTest-Button pressed.");

            var art = $('#article');
            var ele = document.getElementById('article');

            artDump = ele.innerHTML; // global
            var artTemp = '<button type="button" id="artBack" value=false onclick="artBackFunc()">Zur&uuml;ck</button><br>'; // two vertical spaces

            artTemp += '<select id="trxCamCtrl" style="margin-top:100px;">\n' +
                    '<option value="nix">Camera</option>\n' +
                    '<option value="garnix">======</option>\n' +

                    '<option value="backhus">Dat Backhus</option>\n' +
                    '<option value="designOffices">DesignOffices</option>\n' +
                    '<option value="kirchvorplatz">Bei St. Petri</option>\n' +
                    '<option value="kreuzungDomplatz">Gr&uuml;nfl&auml;che</option>\n' +
                '</select>';

            artTemp += '<select id="trxTimeCtrl" style="width:399px;">\n' +
                    '<option value="nix">Time</option>\n' +
                    '<option value="garnix">======</option>\n' +

                    '<option value="20180314_0800_1000">A priori - morgens, M&auml;rz Werktag</option>\n' +
                    '<option value="20180314_1130_1330">A priori - mittags, M&auml;rz Werktag</option>\n' +
                    <!-- '<option value="20180314_1330_1530">A priori - nachmittag, M&auml;rz Werktag</option>\n' + -->
                    '<option value="20180314_1530_1730">A priori - abends, M&auml;rz Werktag</option>\n' +

                    '<option value="20180317_0800_1000">A priori - morgens, M&auml;rz Samstag</option>\n' +
                    '<option value="20180317_1130_1330">A priori - mittags, M&auml;rz Samstag</option>\n' +

                    '<option value="20180318_0800_1000">A priori - morgens, M&auml;rz Sonntag</option>\n' +
                    '<option value="20180318_1130_1330">A priori - mittags, M&auml;rz Sonntag</option>\n' +
                '</select>';

            artTemp += '<input id="trxMultiplyCtrl" type="text" value="10">';

            artTemp += '<button type="button" id="trxRaw" style="left:50px;width:200px;" value=false>Traj</button>';
            artTemp += '<button type="button" id="trxHeat" style="width:200px;" value=false>Heat</button>';
            artTemp += '<button type="button" id="trxAnim" style="width:200px;" value=false>Anim</button>';
            artTemp += '<button type="button" id="trxFreq" style="width:200px;" value=false>Freq</button>';
            artTemp += '<button type="button" id="trxStay" style="width:199px;" value=false>Stay</button>';

            art.animate({left:'1920px'}, 1000, function(){ele.innerHTML = artTemp;});
            art.animate({left:'50px'}, 1000);
        });
        */

        artBackFunc = function() {
            console.log("artBack-Button pressed.");

            var art = $('#article');
            var ele = document.getElementById('article');

            art.animate({left:'1920px'}, 1000, function(){ele.innerHTML = artDump;}); // global
            art.animate({left:'50px'}, 1000);
        };
    };

    // fired when connection was lost (or could not be established)
    connection.onclose = function (reason, details) {
        console.log("Connection lost: " + reason);
    }

    // now actually open the connection
    connection.open();
});
