const gcal = require("./gcal.js");
const express = require("express");
const compress = require('compression');
const Promise = require("bluebird");
const crypto = require("crypto");
const redis = require('redis');

let dbCalendars = require('./agendas.json');
const client = redis.createClient(6379, process.env.REDIS || "10.243.9.4/redis");

let app = express();
app.use(compress());

let subApp = express();

subApp.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

subApp.get('/', (req, res) => {

    let calendars = Object.keys(dbCalendars)
        .map(key => { return { name: key, color: generateColor(key) } })
        .sort();

    return res.json(calendars);
});

subApp.get('/events', (req, res) => {

    let params = req.query;

    return listEvents(params, res);
});

function listEvents(params, res) {
    let calendars = getCalendarsParameter(params.calendars);

    let promises = calendars.map(calendar => {

        let cal = dbCalendars[calendar];
        return gcal.listEvents(cal.key, cal.calendarId, params);
    });

    Promise.all(promises)
    .then(events => {

        eventsReady = events.map(normalizeCalendar);
        return res.json(eventsReady);

    })
    .catch(err => {

        console.log(err);
        return res.send(err);
    });
}

function getCalendarsParameter(calendarsParam) {
    if (!calendarsParam) {
        calendars = [];
    }
    else if (!Array.isArray(calendarsParam)) {
        calendars = [calendarsParam];
    }
    else {
        calendars = calendarsParam;
    }

    // Remove duplicates
    return Array.from(new Set(calendars));
}

function normalizeCalendar(calendar) {
    let normalizedCalendar = new Object();

    normalizedCalendar.color = generateColor(calendar.summary);
    normalizedCalendar.summary = calendar.summary;
    normalizedCalendar.etag = calendar.etag;

    normalizedCalendar.items = calendar.items.map(event => {
        let normalizedEvent = new Object();
        normalizedEvent.color = normalizedCalendar.color;
        normalizedEvent.start = event.start;
        normalizedEvent.end = event.end;
        normalizedEvent.summary = event.summary;
        normalizedEvent.id = event.id;
        normalizedEvent.htmlLink = event.htmlLink;

        return normalizedEvent;
    });

    return normalizedCalendar;
}

function generateColor(nome) {
    let md5sum = crypto.createHash('md5');

    md5sum.update(nome, 'utf8', 'hex');
    let cor = md5sum.digest('hex');

    return "#" + cor.substring(0, 6);
}

let path = process.env.REQUEST_PATH || '';
app.use(path, subApp);

// Launch server
app.listen(4242);
