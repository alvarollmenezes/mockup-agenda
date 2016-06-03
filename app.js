var gcal = require("./gcal.js");
var express = require("express");

var app = express();

app.get('/agenda', function (req, res) {
    res.set("Content-Type", "application/json");
    
    gcal.listEvents("AlvaroFisk"
        , function (events) {
            res.send(events);
        });
});

// Launch server
app.listen(4242);
