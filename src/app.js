let gcal = require("./gcal.js");
let express = require("express");
let Promise = require("bluebird");
let crypto = require("crypto");

let secrets = require('./agendas.json');

let app = express();
let subApp = express.Router();

subApp.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

subApp.get('/', (req, res) => {

    let agendas = Object.keys(secrets).map(key => { return { nome: key, color: gerarCor(key) } });

    return res.json(agendas);
});

subApp.get('/events', (req, res) => {

    let params = req.query;

    return listarEventos(params, res);
});

function listarEventos(params, res) {
    let agendas = obterParamAgenda(params.calendars);

    let promises = agendas.map(function (agenda) {
        let cal = secrets[agenda];
        return gcal.listEvents(cal.key, cal.calendarId, params);
    });

    Promise.all(promises).then(function (eventos) {
        eventosReady = eventos.map(tratarAgenda);

        return res.json(eventosReady);

    }).catch(function (err) {
        console.log(err);
        return res.send({ erro: err.message });
    });
}

function obterParamAgenda(pAgenda) {
    if (!Array.isArray(pAgenda)) {
        agendas = [pAgenda];
    }
    else {
        agendas = pAgenda;
    }

    // Remove duplicates
    return Array.from(new Set(agendas));
}

function tratarAgenda(agenda) {
    let agendaOut = new Object();

    agendaOut.color = gerarCor(agenda.summary);
    agendaOut.summary = agenda.summary;
    agendaOut.etag = agenda.etag;

    agendaOut.items = agenda.items.map(function (evento) {
        let eventoOut = new Object();
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

function gerarCor(nome) {
    let md5sum = crypto.createHash('md5');

    md5sum.update(nome, 'utf8', 'hex');
    let cor = md5sum.digest('hex');

    return "#" + cor.substring(0, 6);
}

app.use(process.env.REQUEST_PATH, subApp);

// Launch server
app.listen(4242);
