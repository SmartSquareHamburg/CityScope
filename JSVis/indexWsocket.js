/*
* IS COPY FROM de/controlWsocket.js
* - topic names have destination
*
*/

requirejs(["ini"], function(ini) {

    var pressedClr = 'skyblue'; // if button pressed

    // the WAMP connection to the Router
    var connection = new autobahn.Connection({
        url: wsuri,
        realm: realm
    });

    // fired when connection is established and session attached
    connection.onopen = function (session, details) {
        console.log("Connected");

        $('#initTv1').on('click', function () {
            console.log('Init Dashboard 1 on/off');

            if (this.value == 'false') { // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish(
                    'hcu.csl.smsq.desk1.locassigntv1', // var destination
                    [
                        'tv1',
                        filepath + 'dashb_init1.html'
                    ]
                );
            } else {
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish(
                    'hcu.csl.smsq.desk1.locassigntv1', // var destination
                    [
                        'tv1',
                        'http://csl.local.hcuhh.de/csl1.html'
                    ]
                );
            }
        });

        $('#initTv2').on('click', function () {
            console.log('Init Dashboard 2 on/off');

            if (this.value == 'false') { // here 'true' is set as default
                this.value = 'true';

                this.style.backgroundColor = pressedClr;

                session.publish(
                    'hcu.csl.smsq.desk2.locassigntv2', // var destination
                    [
                        'tv2',
                        filepath + 'dashb_init2.html'
                    ]
                );
            } else {
                this.value = 'false';

                this.style.backgroundColor = '';

                session.publish(
                    'hcu.csl.smsq.desk2.locassigntv2', // var destination
                    [
                        'tv2',
                        'http://csl.local.hcuhh.de/csl2.html'
                    ]
                );
            }
        });
    };

    // fired when connection was lost (or could not be established)
    connection.onclose = function (reason, details) {
        console.log("Connection lost: " + reason);
    }

    // now actually open the connection
    connection.open();
});