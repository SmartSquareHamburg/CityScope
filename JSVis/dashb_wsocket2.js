requirejs(["ini"], function(ini) {

    var connection = new autobahn.Connection({
        url: wsuri, // "ws://csl.local.hcuhh.de:8081/ws", // wsuri,
        realm: realm // "cslrealm"
    });

    // fired when connection is established and session attached
    connection.onopen = function (session, details) {
        console.log("Connected");

        function locAssignTv2(args) {
            var dest = args[0];
            var target = args[1];

            location.assign(target);
        }

        session.subscribe('hcu.csl.desk2.locassigntv2', locAssignTv2).then( // tv2 ^= TV@Desk2
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.locassigntv2'"); // tv2 ^= TV@Desk2
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        session.subscribe('hcu.csl.smsq.desk2.locassigntv2', locAssignTv2).then( // tv2 ^= TV@Desk2
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.locassigntv2'"); // tv2 ^= TV@Desk2
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        function locAssign(args) {
            var target = args[0];
            if (target != filepath + 'lgnd_user.html' && target != filepath + 'init1.html') {

                location.assign(target);
            }
        }

        session.subscribe('hcu.csl.desk2.locassign', locAssign).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.desk2.locassign'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );

        session.subscribe('hcu.csl.smsq.desk2.locassign', locAssign).then(
            function (sub) {
                console.log("subscribed to topic 'hcu.csl.smsq.desk2.locassign'");
            },
            function (err) {
                console.log("failed to subscribed: " + err);
            }
        );
    }

    // fired when connection was lost (or could not be established)
    connection.onclose = function (reason, details) {
        console.log("Connection lost: " + reason);
    }

    // now actually open the connection
    connection.open();
});