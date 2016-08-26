const gcal = require("./gcal.js");
const express = require("express");
const compress = require('compression');
const Promise = require("bluebird");
const crypto = require("crypto");
const apicache = require('apicache').options({ debug: false }).middleware;

let dbCalendars = require('./agendas.json');

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

subApp.get('/events', apicache('60 minutes'), (req, res) => {

    let params = req.query;

    return listEvents(params, res, normalizeCalendar)
    .then(events => res.json(events));
});

subApp.get('/events/goves', apicache('60 minutes'), (req, res) => {

    let params = req.query;

    return listEvents(params, res, normalizeCalendarGovES)
    .then(events => {
        events = events.reduce((previous, current) => {
            return previous.concat(current);
        }, [])
        .sort((a,b) => {
            return a.created.localeCompare(b.created);
        });
        
        res.json(events);
    });
});

function listEvents(params, res, normalization) {
    let calendars = getCalendarsParameter(params.calendars);

    let promises = calendars.map(calendar => {

        let cal = dbCalendars[calendar];
        return gcal.listEvents(cal.key, cal.calendarId, params);
    });

    return Promise.all(promises)
    .then(events => {

        return events.map(normalization);
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

function normalizeCalendarGovES(calendar) {
    return calendar.items;
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
