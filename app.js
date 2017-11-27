
var express = require('express');
var app = express();
var static = require('serve-static');
var bodyParser = require('body-parser');
var fileBrowser = require('./services/file-browser.service');
var imageManager = require('./services/image-manager.service');
var videoManager = require('./services/video-manager.service');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.send('Hello World!');
});


app.post('/api/browser', function (req, res) {
    fileBrowser.getPaths(req.body.path).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
    })
})

app.post('/api/fileInfo', function (req, res) {
    fileBrowser.retrieveFileStats(req.body.path, req.body.files).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
    })
})

app.get('/api/image/:type/:path/:fileName', function (req, res) {
    //res.header("Content-Type", "image/jpg");
    imageManager.getThumbnail(req.params.path, req.params.fileName, req.params.type).then((url) => {
        res.sendFile(url);
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
    })

})

app.get('/api/video/:type/:path/:fileName', function (req, res) {
    //res.header("Content-Type", "image/jpg");
    videoManager.getThumbnail(req.params.path, req.params.fileName, req.params.type).then((url) => {
        res.sendFile(url);
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
    })

})

app.get('/api/download/:path/:fileName', function (req, res) {

})

app.listen(3003, function () {
    console.log('Example app listening on port 3003!');
});