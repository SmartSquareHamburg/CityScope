requirejs(["ini"], function(ini) {

    var raw;

    var connection = new autobahn.Connection({
        url: wsuri, // "ws://csl.local.hcuhh.de:8081/ws", // wsuri,
        realm: realm // "cslrealm"
    });

    // fired when connection is established and session attached
    connection.onopen = function (session, details) {
        console.log("Connected");

        //

        function locAssignTv1(args) {
            console.log('locAssignTv1');

            var dest = args[0];
            var target = args[1];

            location.assign(target);
        }

        session.subscribe('hcu.csl.smsq.desk1.locassigntv1', locAssignTv1).then( // tv2 ^= TV@Desk2
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.locassigntv1'"); // tv2 ^= TV@Desk2
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        /*
        session.subscribe('hcu.csl.smsq.desk1.locassigntv1', locAssignTv1).then( // tv2 ^= TV@Desk2
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.locassigntv1'"); // tv2 ^= TV@Desk2
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );
        */

        function locAssign(args) {
            console.log('locAssign');

            var target = args[0];
            location.assign(target);
        }

        session.subscribe('hcu.csl.smsq.desk1.locassign', locAssign).then( // todo: add (...).desk1.locassign
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.locassign'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        /*
        session.subscribe('hcu.csl.smsq.desk1.locassign', locAssign).then( // todo: add (...).desk1.locassign
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.locassign'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );
        */

        function bldginfo(args) {
            console.log('bldginfo(args):');

            raw = args[0];

            // if (location.href == filepath + 'hci_neighbors.html') {
            if (location.href == filepath + 'de/lego_stakeholder.html') {
                console.log(raw);

                var arr = JSON.parse(raw[0]);

                var nam = arr[0].nam;
                var namlag = arr[0].namlag;
                var hnr = arr[0].hnr;
                var bezgfk = arr[0].bezgfk;

                var grf = Math.round(arr[0].grf);
                var aog = arr[0].aog;
                var aug = arr[0].aug;
                var bja = arr[0].bja;

                var table = '<p style="font-size:1.5em">';

                if (nam) {
                    table += "<b>" + nam + ",</b> " + namlag + " " + hnr + "</p></br>";
                    console.log(table);
                } else {
                    table += namlag + " " + hnr + "</p></br>";
                    console.log(table);
                }

                // Erstelle Tabelle
                table += "<table>";

                // Erste Zeile
                table += "<tr><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'>";
                table += "Geb&auml;udefunktion: ";
                table += "</TD></th><th><TD ALIGN='LEFT' VALIGN='TOP'><b>"
                table += bezgfk;
                table += "</b></TD></th></tr>";

                // Nächste Zeile
                table += "<tr><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'>";
                table += "Fl&auml;che: ";
                table += "</TD></th><th><TD ALIGN='LEFT' VALIGN='TOP'><b>"
                table += grf.toString() + " m<sup>2</sup>";
                table += "</b></TD></th></tr>";

                // Nächste Zeile
                table += "<tr><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'>";
                table += "Anzahl der Obergeschosse (OG): ";
                table += "</TD></th><th><TD ALIGN='LEFT' VALIGN='TOP'><b>"
                table += aog.toString();
                table += "</b></TD></th></tr>";

                // Nächste Zeile
                table += "<tr><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'>";
                table += "Anzahl der Untergeschosse (UG): ";
                table += "</TD></th><th><TD ALIGN='LEFT' VALIGN='TOP'><b>"
                table += aug.toString();
                table += "</b></TD></th></tr>";

                // Nächste Zeile
                table += "<tr><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'>";
                table += "Baujahr: ";
                table += "</TD></th><th><TD ALIGN='LEFT' VALIGN='TOP'>"; // ! <b>
                if (bja != null) {
                    table += "<b>" + bja + "</b>";
                } else {
                    table += "Keine Angabe"
                }
                table += "</TD></th></tr>";

                // Ende der Tabelle
                table += "</table>";

                // console.log(table);

                // hide legobrick-popup
                popup.classList.toggle("show");

                // display data
                document.getElementById('leftside_top').innerHTML = table;
            }
        }

        session.subscribe('hcu.csl.smsq.desk1.bldginfo', bldginfo).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.bldginfo'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        //

        function hkInfo(args) {
            console.log('hkInfo(args)');

            raw = args[0];

            // if (location.href == filepath + 'hci_neighbors.html') {
            if (location.href == filepath + 'de/lego_stakeholder.html') {
                console.log(raw);

                var table = "<h2>Wichtigste Arbeitgeber</h2></br>";
                table += "<table>";

                var arr = JSON.parse(raw[0]);

                // sort, add sort-index and calc for no. of employees per branch
                var arri = [];
                for (i = 0; i < arr[0].hk_maxempl[0].length; i++) {
                    arri.push([i, arr[0].hk_maxempl[0][i]]); // [index, no. max. employees]
                }

                // as a result arri[i][0] are the sorted indices now
                arri.sort(
                    function (a, b) {
                        return b[1] - a[1]; // descending order
                    }
                );

                console.log('arri:');
                console.log(arri);

                // TABLE

                var top5 = [];
                for (i = 0; i < 5; i++) { // 0-4 = top5
                    if (arr[0].hk_maxempl[0][arri[i][0]]) {
                        console.log('if-case');

                        console.log([
                            arr[0].hk_firma[0][arri[i][0]],
                            arr[0].hk_branche[0][arri[i][0]],
                            arr[0].hk_minempl[0][arri[i][0]],
                            arr[0].hk_maxempl[0][arri[i][0]],
                            arr[0].hk_vertical[0][arri[i][0]]
                        ]);

                        top5.push(
                            [
                                arr[0].hk_firma[0][arri[i][0]],
                                arr[0].hk_branche[0][arri[i][0]],
                                arr[0].hk_minempl[0][arri[i][0]],
                                arr[0].hk_maxempl[0][arri[i][0]],
                                arr[0].hk_vertical[0][arri[i][0]]
                            ]
                        );
                    }
                }

                console.log('top5:');
                console.log(top5);

                for (i = 0; i < top5.length; i++) {
                    // Tabelle erstellen: Erste Spalte
                    table += "<tr><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'><b>";
                    table += "&bull; " + top5[i][0]; // bullet-point

                    // ... Zweite Spalte
                    table += "</b></TD></th><th><TD ALIGN='LEFT' VALIGN='TOP' WIDTH='340px'>";
                    table += top5[i][1];

                    // ... Dritte Spalte
                    table += "</TD></th><th><TD ALIGN='RIGHT' VALIGN='TOP'><b>";
                    table += top5[i][2] + "-" + top5[i][3] + " Besch&auml;ftigte";

                    // Ende einer Zeile
                    table += "</b><TD></th></tr>";
                }

                table += "</table>";

                console.log(table);

                // // dummy
                // document.getElementById('leftside_top').innerHTML = '<h2>Allgemeine Informationen</h2><br><br> <i style="color:darkgrey">&nbsp;tbc</i>';

                document.getElementById('leftside_bot').innerHTML = table;

                // PIE-CHART
                var pieData = [['Culture', 0.], ['Mobility', 0.], ['Tourism', 0.], ['Trade', 0.], ['Other', 0.]];

                console.log('pieData (unsorted):');
                console.log(pieData);

                for (i = 0; i < arr[0].hk_maxempl[0].length; i++) {
                    for (j = 0; j < pieData.length; j++) {
                        if (arr[0].hk_vertical[0][i] == pieData[j][0]) {
                            pieData[j][1] += Math.round((parseFloat(arr[0].hk_minempl[0][i]) + parseFloat(arr[0].hk_maxempl[0][i])) / 2);
                        }
                    }
                }

                // sort array of arrays (descending) // maybe merge with above sort-func?
                function comparator(a, b) {
                    if (a[1] > b[1]) return -1;
                    if (a[1] < b[1]) return 1;
                    return 0;
                }

                pieData = pieData.sort(comparator);

                // don't visualize branches with employees=0 (ugly pie)
                var pieDataShort = [];
                var clr; // color

                // if possible push() 'Other'-Branch first (better vizualisation)...
                for (i = 0; i < pieData.length; i++) {
                    if (pieData[i][1] > 0) {
                        if (pieData[i][0] == 'Other') {
                            clr = '#D3D3D3';
                            pieDataShort.push({
                                name: pieData[i][0],
                                y: pieData[i][1],
                                color: clr,
                                sliced: true,
                                selected: true
                            });
                        }
                    }
                }

                // .. then push() other branches
                for (i = 0; i < pieData.length; i++) {
                    if (pieData[i][1] > 0) {

                        if (pieData[i][0] != 'Other') {
                            // coloring
                            if (pieData[i][0] == 'Culture') {
                                clr = '#A6CEE3';
                            } else if (pieData[i][0] == 'Mobility') {
                                clr = '#1F78B4';
                            } else if (pieData[i][0] == 'Tourism') {
                                clr = '#B2DF8A';
                            } else if (pieData[i][0] == 'Trade') {
                                clr = '#33A02C';
                            }

                            pieDataShort.push({
                                name: pieData[i][0],
                                y: pieData[i][1],
                                color: clr,
                                sliced: true,
                                selected: true
                            });
                        }
                    }
                }

                console.log('pieDataShort (sorted & objectified):');
                console.log(pieDataShort);

                Highcharts.chart('rightside', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Angestellte je Branche'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {y}',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    series: [{
                        name: 'Verticals',
                        colorByPoint: true,
                        data: pieDataShort
                    }],
                    credits: {
                        enabled: false
                    }
                });
            }
        }

        session.subscribe('hcu.csl.smsq.desk1.hkinfo', hkInfo).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.hkinfo'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        //

        // dependent of lgnd_clock var time and update-method
        function startClock(args) {
            var raw = args[0];
            console.log(raw);
            console.log(raw[0]);

            if (raw[0] == 'test') {
                document.getElementById('clock').innerHTML = 'Demo';
            } else {
                // substring timestamp-string
                var y = parseInt(raw[0].substring(0, 4));
                var mo = parseInt(raw[0].substring(4, 6));
                var d = parseInt(raw[0].substring(6, 8));

                var h = parseInt(raw[0].substring(9, 11));
                var mi = parseInt(raw[0].substring(11, 13));

                var end_h = parseInt(raw[0].substring(14, 16));
                var end_mi = parseInt(raw[0].substring(16, 18));

                // get multiplier info (double speed, etc.)
                var multiplier = raw[1];

                // args as Date-object
                var time = new Date(y, mo, d, h, mi);

                // show and run clock
                function update() {
                    console.log('update()');

                    // show on website
                    document.getElementById('clock').innerHTML =
                        checkTime(time.getHours()) + ':' +
                        checkTime(time.getMinutes()) + ':' +
                        checkTime(time.getSeconds())
                    ;

                    // start clock
                    var upd = setTimeout(
                        update, 1000 / multiplier // milliseconds
                    );

                    time.setSeconds(time.getSeconds() + 1 * multiplier);

                    // stop clock
                    if (time.getHours() >= end_h && time.getMinutes() >= end_mi) {
                        console.log('clearTimeout()');

                        clearTimeout(upd);
                        document.getElementById('clock').innerHTML = null;
                    }
                }

                function checkTime(i) {
                    if (i < 10) {
                        i = "0" + i
                    }
                    ;  // add zero in front of numbers < 10
                    return i;
                }

                // finally call method
                update();
            }
        }

        session.subscribe('hcu.csl.smsq.desk1.animationTimestamp', startClock).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk1.animationTimestamp'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        )
    }

    // fired when connection was lost (or could not be established)
    connection.onclose = function (reason, details) {
        console.log("Connection lost: " + reason);
    }

    // now actually open the connection
    connection.open();
});