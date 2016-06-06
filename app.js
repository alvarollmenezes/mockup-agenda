var gcal = require("./gcal.js");
var express = require("express");

var app = express();

app.get('/events', function (req, res) {
    res.set("Content-Type", "application/json");

    gcal.listEvents(req.query
        , function (err, response) {
            if (err) {
                res.send(err);
                return;
            }

            res.send(response);
        });
});

app.get('/agendas', function (req, res) {
    res.set("Content-Type", "application/json");

    res.send([
        { agenda: 'Teste 1', agendaId: '123456' },
        { agenda: 'Teste 2', agendaId: '654321' },
    ]);
});

// Launch server
app.listen(4242);
