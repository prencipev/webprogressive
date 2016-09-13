var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var request = require('request');
var Q = require("q");
var app = express();
var phantom = require('phantom');
var striptags = require('striptags');
var fs = require('fs');

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(bodyParser.json());// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

app.get('/', function (req, response) {
    response.render("index.html");
    response.end();
});

app.get('/feed/:section', function (req, res) {
    var _section = req.params.section
    var sitepage = null;
    var phInstance = null;
    phantom.create()
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            return page.open('http://www.mrporter.com/journal/' + _section + '?json=true');
        })
        .then(status => {
            console.log(status);
            return sitepage.property('content');
        })
        .then(content => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(striptags(content));
            res.end();

            sitepage.close();
            phInstance.exit();
        })
        .catch(error => {
            console.log(error);
            phInstance.exit();
        });
});

app.get('/feed/:cat/:section', function (req, res) {
    var _cat = req.params.cat
    var _section = req.params.section
    var sitepage = null;
    var phInstance = null;
    phantom.create()
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            return page.open('http://www.mrporter.com/journal/' + _cat+'/'+_section +'?json=true');
        })
        .then(status => {
            console.log(status);
            return sitepage.property('content');
        })
        .then(content => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(striptags(content));
            res.end();

            sitepage.close();
            phInstance.exit();
        })
        .catch(error => {
            console.log(error);
            phInstance.exit();
        });
});

app.get('/feed/:cat/:section/:id', function (req, res) {
    var _cat = req.params.cat;
    var _section = req.params.section
    var _id = req.params.id;
    var _url = 'http://www.mrporter.com/journal/' + _cat + '/' + _section + "/" + _id + '?json=true';
    var sitepage = null;
    var phInstance = null;
    phantom.create()
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            return page.open(_url);
        })
        .then(status => {
            console.log(status);
            return sitepage.property('content');
        })
        .then(content => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(striptags(content));
            res.end();

            sitepage.close();
            phInstance.exit();
        })
        .catch(error => {
            console.log(error);
            phInstance.exit();
        });
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


module.exports = app;

