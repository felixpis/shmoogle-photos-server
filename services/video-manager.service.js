var ffmpeg = require('fluent-ffmpeg');


function getThumbnail(filePath, fileName, type) {
    return new Promise((resolve, reject) => {
        let sourcePathFile = path.resolve(filePath, fileName);
        let thumbPath = path.resolve(config.cacheFolder, type, normalizeSourcePathFile(sourcePathFile));
        fs.exists(thumbPath, (exists) => {
            if (exists) {
                resolve(thumbPath);
                return;
            }

            ensureDirExists(thumbPath);

            let size = sizes[type];
            createThumbnail(sourcePathFile, thumbPath, size.x, size.y).then(() => {
                resolve(thumbPath);
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

function createThumbnails(fileName, outputPath) {
    ffmpeg(fileName)
        .on('filenames', (filenames) => {
            console.log(filenames);
        }).on('end', function () {
            console.log('Screenshots taken');
        }).screenshots({
            count: 5,
            folder: outputPath
        })
}

module.exports.getThumbnail = getThumbnail