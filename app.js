var gcal = require("./gcal.js");
var express = require("express");
var Promise = require("bluebird");
var crypto = require("crypto");

var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function gerarCor(nome) {
    var md5sum = crypto.createHash('md5');

    md5sum.update(nome, 'utf8', 'hex');
    var cor = md5sum.digest('hex');

    return "#" + cor.substring(0, 6);
}

function pluckAgenda(agenda) {
    var agendaOut = new Object();

    agendaOut.color = gerarCor(agenda.summary);
    agendaOut.summary = agenda.summary;
    agendaOut.etag = agenda.etag;

    agendaOut.items = agenda.items.map(function (evento) {
        var eventoOut = new Object();
        eventoOut.color = agendaOut.color;
        eventoOut.start = evento.start;
        eventoOut.end = evento.end;
        eventoOut.summary = evento.summary;
        eventoOut.id = evento.id;
        eventoOut.htmlLink = evento.htmlLink;

        return eventoOut;
    });

    return agendaOut;
}

app.get('/events', function (req, res) {

    var secrets = require('./agendas.json');
    var params = req.query;

    var agendas;
    if (!Array.isArray(params.agendas)) {
        agendas = [params.agendas];
    }
    else {
        agendas = params.agendas;
    }
    // Remove duplicates
    agendas = Array.from(new Set(agendas));

    var promises = agendas.map(function (agenda) {
        var cal = secrets[agenda];
        return gcal.listEvents(cal.key, cal.calendarId, params);
    });

    Promise.all(promises).then(function (eventos) {
        eventosReady = eventos.map(pluckAgenda);

        res.json(eventosReady);

    }).catch(function (err) {
        console.log(err);
        res.send({ erro: err.message });
    });
});

app.get('/agendas', function (req, res) {

    var secrets = require('./agendas.json');

    var agendas = Object.keys(secrets).map(key => { return { nome: key, color: gerarCor(key) } });

    res.json(agendas);
});

// Launch server
app.listen(4242);
