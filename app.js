
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
    if (req.params.type == "preview") {
        let head = {};
        let stream = videoManager.createStream(req.params.path, req.params.fileName, req.headers['range'], head);
        res.writeHead(head.code, head.header);
        stream.pipe(res);
        return;
    }
    if (req.query.id && req.query.id == 'animation') {
        return res.sendFile(videoManager.getAnimation(req.params.path, req.params.fileName));
    }
    videoManager.getThumbnail(req.params.path, req.params.fileName).then((url) => {
        res.sendFile(url);
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
    })

})

app.get('/api/videotest', function (req, res) {
    //res.header("Content-Type", "image/jpg");
    //videoManager.createThumbnail("Y:\\Photos\\Путешествия и поездки\\2009-09. Прага. Свадьба Марианны\\P9290130.AVI", "C:\\Temp\\P9290130.AVI\\", 200, 200);
    //videoManager.createGif("Y:\\Photos\\Путешествия и поездки\\2009-09. Прага. Свадьба Марианны\\P9290130.AVI", "C:\\Temp\\P9290130.AVI\\animated.gif", 200, 200);
    videoManager.createGif("C:\\Photos\\Мои Фотки\\P9270030.AVI", "C:\\Photos\\Мои Фотки\\Temp\\P9290130.AVI\\animated.gif", 200, 200)
    res.status(200).send({ done: true })

})

app.get('/api/download/:path/:fileName', function (req, res) {

})

app.listen(3003, function () {
    console.log('Example app listening on port 3003!');
});