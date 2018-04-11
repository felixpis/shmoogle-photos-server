var config = require('../config.json');
var fileBrowser = require('./file-browser.service');
var fs = require('fs');
var path = require('path');
const IMAGE_PATHS = ['jpg', 'png', 'bmp', 'jpeg'];
const VIDEO_PATHS = ['mpg', 'avi', '3gp', 'mp4'];


function getFilesExtensions(){
    let extensions = [];
    extensions.push(...IMAGE_PATHS);
    extensions.push(...VIDEO_PATHS);
    extensions.push(...IMAGE_PATHS.map(i => i.toUpperCase()));
    extensions.push(...VIDEO_PATHS.map(i => i.toUpperCase()));

    return extensions.join(',');
}
//const database = require('../data/database');
const glob = require('glob');

function start() {
    //1. get all root paths
    //2. Run recursively and find all the folders and images/videos and save to database
    //3. Create thumbnails/previews/animations for images/videos (in bulks of 4-5)
    //retrieveFilesAndFoldersRecursively();
    // getPaths(config.roots[0].path, (file) => {
    //     console.log(file);
    // });

    // glob(config.roots[0].path + '/*', (err, files) => {
    //     console.log(files);
    // })

    // let extensions = getFilesExtensions();
    // console.log(extensions);
    // glob(`C:/Photos/Мои Фотки/*.{${extensions}}`, (err, files) => {
    //     console.log(files);
    // })

    // glob(`C:/Photos/*/`, (err, files) => {
    //     console.log(files);
    // })

    fileBrowser.getPaths('C:/Photos/Мои Фотки/').then((result) => {
        console.log(result);
    }).catch((err) => {
        console.error(err);
    });

}

function retrieveFilesAndFoldersRecursively(filePath) {
    console.log('GET PATHS', filePath);
    fileBrowser.getPaths(filePath).then((result) => {
        console.log(result.files);
        result.files.forEach(file => {
            retrieveFilesAndFoldersRecursively(file.path);
        })
    })
}

function getPaths(filePath, next) {
    fs.readdir(filePath, (err, files) => {
        files.forEach(file => {
            const newFilePath = path.resolve(filePath, file);
            fs.stat(newFilePath, (err, stats) => {
                if (stats.isDirectory()) {
                    let dirObject = {
                        title: file,
                        path: newFilePath,
                        parent: filePath,
                        isDir: true,
                        size: stats.size
                    }
                    next(dirObject);
                    getPaths(newFilePath, next);
                }
                else {
                    let fileObject = prepareFileObject(file, filePath, newFilePath, stats.size);
                    if (fileObject) {
                        next(fileObject);
                    }
                }
            })
        })
    })
}

function prepareFileObject(file, filePath, newFilePath, size) {
    let type = getFileType(file);
    if (type == 'any') {
        return null;
    }

    return {
        caption: file,
        type: type,
        size: size,
        parent: filePath,
        path: newFilePath,
        thumb: `/api/${type}/thumbnails/${encodeURIComponent(filePath)}/${encodeURIComponent(file)}`,
        src: `/api/${type}/preview/${encodeURIComponent(filePath)}/${encodeURIComponent(file)}`,
        downloadUrl: `/api/download/${encodeURIComponent(filePath)}/${encodeURIComponent(file)}`,
        isDir: false
    }
}

function getFileType(file) {
    let ext = path.extname(file).toLowerCase();
    if (IMAGE_PATHS.indexOf(ext) >= 0) {
        return 'image';
    }
    if (VIDEO_PATHS.indexOf(ext) >= 0) {
        return 'video';
    }

    return 'any';
}

start();

