var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var path = require('path');
var config = require('../config.json');
var fx = require('mkdir-recursive');
var gify = require('gify');
var gifify = require('gifify');
var uid = require('uid2');
var exec = require('child_process').exec;
var gm = require('gm').subClass({ imageMagick: true });

const animation = "animation.gif";
const type = "thumbnails";
const sizes = {
    thumbnails: {
        x: 200, y: 200
    },
    preview: {
        x: 800, y: 800
    }
}

function getThumbnail(filePath, fileName) {
    return new Promise((resolve, reject) => {
        let sourcePathFile = path.resolve(filePath, fileName);
        let thumbPath = path.resolve(config.cacheFolder, type, normalizeSourcePathFile(sourcePathFile));
        let thumbPathFirst = path.resolve(thumbPath, `tn.png`);
        fs.exists(thumbPathFirst, (exists) => {
            if (exists) {
                resolve(thumbPathFirst);
                return;
            }

            ensureDirExists(thumbPathFirst);

            let size = sizes[type];
            createThumbnail(sourcePathFile, thumbPath, size.x, size.y).then((filename) => {
                if (!filename) {
                    reject({ message: 'No snapshots' });
                    return;
                }
                createGif(sourcePathFile, path.resolve(thumbPath, animation), size.x, size.y).then(() => {
                    resolve(path.resolve(thumbPath, filename));
                }).catch(() => {
                    resolve(path.resolve(thumbPath, filename));
                });
            }).catch((error) => {
                reject(error);
            });
        })
    })
}

function getAnimation(filePath, fileName) {
    let sourcePathFile = path.resolve(filePath, fileName);
    let thumbPath = path.resolve(config.cacheFolder, type, normalizeSourcePathFile(sourcePathFile));
    let thumbPathFirst = path.resolve(thumbPath, animation);
    return thumbPathFirst;
}

function normalizeSourcePathFile(filePath) {
    let ind = filePath.indexOf('\\');
    filePath = filePath.slice(ind + 1);
    if (filePath.startsWith('\\')) {
        filePath = filePath.slice(1);
    }
    return filePath;
}

function ensureDirExists(filePath) {
    let dirName = path.dirname(filePath);
    if (!fs.existsSync(dirName)) {
        fx.mkdirSync(dirName);
    }
}

function createThumbnail(fileName, outputPath, width, height) {
    return new Promise((resolve, reject) => {
        let fileNamesResult = [];
        ffmpeg(fileName)
            .on('filenames', (filenames) => {
                fileNamesResult = filenames;
            })
            .on('end', function () {
                console.log('Screenshots taken', fileNamesResult);
                resolve(fileNamesResult[0]);
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message);
                reject(err);
            })
            .screenshots({
                timestamps: [0],
                folder: outputPath,
                size: `${width}x?`
            })
    });
}

function createGif(fileName, outputPath, width, height) {

    return new Promise((resolve, reject) => {
        let id = uid(10);
        let dir = path.resolve(config.cacheFolder, `tmp\\${id}`);
        if (!fs.existsSync(dir)) {
            fx.mkdirSync(dir);
        }
        let cmd = `ffmpeg -i "${fileName}" -filter:v scale=200:-1 -r 5 -t 5 "${dir}\\%04d.png"`;
        exec(cmd, (err) => {
            if (err) {
                return reject(err);
            }
            gm().in(`${dir}/*.png`).delay(100).write(outputPath, (error, stdout) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
                fs.rmdir(dir, (err) => {

                })
            });
        });
    })

}

function createStream(filePath, fileName, range, resHead) {
    let videoPath = path.resolve(filePath, fileName);
    console.log('VIDEO', videoPath);
    let stat = fs.statSync(videoPath);
    console.log('STAT', stat);

    let total = stat.size;
    if (range) {
        var parts = range.replace(/bytes=/, "").split("-");
        console.log('PARTS', parts);
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total - 1;
        var chunksize = (end - start) + 1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
        var fileStream = fs.createReadStream(videoPath, { start: start, end: end });
        resHead.code = 206;
        resHead.header = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/avi'
        };
        return fileStream;
    } else {
        console.log('ALL: ' + total);
        resHead.code = 200;
        resHead.header = {
            'Content-Length': total,
            'Content-Type': 'video/mp4'
        };
        var fileStream = fs.createReadStream(videoPath);
        return fileStream;
    }
}

module.exports.getThumbnail = getThumbnail
module.exports.createThumbnail = createThumbnail;
module.exports.getAnimation = getAnimation;
module.exports.createGif = createGif;
module.exports.createStream = createStream;