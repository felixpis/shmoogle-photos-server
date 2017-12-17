var gm = require('gm').subClass({ imageMagick: true });
var fs = require('fs');
var path = require('path');
var config = require('../config.json');
var fx = require('mkdir-recursive');
const sizes = {
    thumbnails: {
        x: 200, y: 200
    },
    preview: {
        x: 800, y: 800
    }
}

function getThumbnail(filePath, fileName, type) {
    return new Promise((resolve, reject) => {
        // Source file original image
        let sourcePathFile = path.resolve(filePath, fileName);
        // Destination file thumbnail of original image
        let thumbPath = path.resolve(config.cacheFolder, type, normalizeSourcePathFile(sourcePathFile));
        fs.exists(thumbPath, (exists) => {
            if (exists) {
                resolve(thumbPath);
                return;
            }

            // Create recursively directories in cache for this file thumbnail
            ensureDirExists(thumbPath);

            let size = sizes[type];
            createThumbnail(sourcePathFile, thumbPath, size.x, size.y).then(() => {
                resolve(thumbPath);
                // After creating thumbnail, try create also preview
                if (type == 'thumbnails') {
                    getThumbnail(filePath, fileName, "preview");
                }
            }).catch((error) => {
                reject(error);
            });
        })
    })
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

/**
 * Create thumbnail for original image
 */
function createThumbnail(file, targetFile, width, height) {
    return new Promise((resolve, reject) => {
        var gmObject = gm(file);
        gmObject.resize(width, height);
        gmObject.write(targetFile, (error, stdout) => {
            if (error) {
                console.log('Error creating thumbnail', error);

                reject(error);
            }
            else {
                resolve(stdout);
            }
        })

    })

}

module.exports.getThumbnail = getThumbnail;