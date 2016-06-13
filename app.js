var gcal = require("./gcal.js");
var express = require("express");
var Promise = require("bluebird");
var crypto = require("crypto");

var app = express();

function gerarCor(nome) {
    var md5sum = crypto.createHash('md5');

    md5sum.update(nome, 'utf8', 'hex');
    var cor = md5sum.digest('hex');

    return "#" + cor.substring(0, 6);
}

function colorirAgenda(agenda) {
    agenda.color = gerarCor(agenda.summary);

    agenda.items = agenda.items.map(function (evento) {
        evento.color = agenda.color;
        return evento;
    });

    return agenda;
}

app.get('/events', function (req, res) {

    res.set("Content-Type", "application/json");

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
        eventosComCor = eventos.map(colorirAgenda);

        res.json(eventosComCor);

    }).catch(function (err) {
        console.log(err);
        res.send({ erro: err.message });
    });
});

app.get('/agendas', function (req, res) {
    res.set("Content-Type", "application/json");

    var secrets = require('./agendas.json');

    var agendas = Object.keys(secrets).map(key => { return { nome: key, color: gerarCor(key) } });

    res.json(agendas);
});

// Launch server
app.listen(4242);
