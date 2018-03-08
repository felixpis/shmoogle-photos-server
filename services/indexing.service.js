var fs = require('fs');
var path = require('path');

var config = require('../config.json');

const IMAGE_PATHS = ['.jpg', '.png', '.bmp', '.jpeg'];
const VIDEO_PATHS = ['.mpg', '.avi', '.3gp', '.mp4'];

function start() {
    fs.stat('C:\\Photos\\Мои Фотки', (err, stats) => {
        console.log(stats);
    })
}

start();