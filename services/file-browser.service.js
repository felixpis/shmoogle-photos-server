var fs = require('fs');
var config = require('../config.json');
var path = require('path');
const IMAGE_PATHS = ['jpg', 'png', 'bmp', 'jpeg'];
const VIDEO_PATHS = ['mpg', 'avi', '3gp', 'mp4'];
const glob = require('glob');
const async = require('async');
const extensions = getFilesExtensions();

function getPaths(filePath) {
    let result = {
        currentPath: '',
        previousPath: null,
        dirs: [],
        files: []
    }
    return new Promise((resolve, reject) => {
        if (!filePath) {
            result.dirs.push(...config.roots);
            result.currentPath = '';
            result.previousPath = null;
            resolve(result);
            return;
        }

        async.parallel({
            files: function (callback) {
                getFiles(filePath, callback);
            },
            dirs: function (callback) {
                getDirs(filePath, callback);
            }
        }, (err, asyncResult) => {
            if (err) {
                reject(err);
                return;
            }
            result.dirs = asyncResult.dirs.map((dir) => {
                return {
                    title: path.basename(dir),
                    path: dir
                }
            });
            result.files = asyncResult.files.map((file) => {
                let newFile = prepareFileObject(path.basename(file), filePath, 0);
                return newFile
            });
            result.currentPath = path.resolve(filePath);
            result.previousPath = isPathRoot(filePath) ? '' : path.resolve(getPreviousPath(filePath));
            resolve(result);
        })

        // fs.readdir(filePath, (error, files) => {
        //     if (error) {
        //         reject(error);
        //         return;
        //     }
        //     result.currentPath = path.resolve(filePath);
        //     result.previousPath = isPathRoot(filePath) ? '' : path.resolve(getPreviousPath(filePath));
        //     result.files.push(...files);
        //     result.files.sort();
        //     resolve(result);
        // })
    })

}

function getFiles(filePath, next) {
    glob(`${filePath}*.{${extensions}}`, (err, files) => {
        next(err, files)
    })
}

function getDirs(filePath, next) {
    glob(`${filePath}*/`, (err, files) => {
        next(err, files)
    })
}

function getFilesExtensions() {
    let extensions = [];
    extensions.push(...IMAGE_PATHS);
    extensions.push(...VIDEO_PATHS);
    extensions.push(...IMAGE_PATHS.map(i => i.toUpperCase()));
    extensions.push(...VIDEO_PATHS.map(i => i.toUpperCase()));

    return extensions.join(',');
}



function retrieveFileStats(filePath, files) {

    var counter = 0;
    let result = {
        dirs: [],
        files: []
    }
    return new Promise((resolve, reject) => {
        if (!filePath) {
            result.dirs.push(...files);
            resolve(result);
            return;
        }
        files.forEach((file) => {
            let newFilePath = path.resolve(filePath, file);
            fs.stat(newFilePath, (err, stats) => {
                if (stats.isDirectory()) {
                    result.dirs.push({
                        title: file,
                        path: path.resolve(filePath, file),
                        size: stats.size
                    })
                }
                else {
                    let fileObj = prepareFileObject(file, filePath, stats.size);
                    if (fileObj) {
                        result.files.push(fileObj);
                    }
                }
                counter++;
                if (counter == files.length) {
                    result.dirs.sort(sortDirs);
                    result.files.sort(sortFiles);
                    resolve(result);
                }
            })
        });
    })

}

function getPathsData(paths) {
    let result = {
        files: [],
        dirs: []
    }
    return new Promise((resolve, reject) => {
        paths.forEach((path) => {

        })
    })
}

function sortDirs(a, b) {
    if (a.title < b.title) {
        return -1;
    }

    if (a.title > b.title) {
        return 1;
    }

    return 0;
}

function sortFiles(a, b) {
    if (a.caption < b.caption) {
        return -1;
    }

    if (a.caption > b.caption) {
        return 1;
    }

    return 0;
}

function isPathRoot(filePath) {
    let foundRoot = config.roots.find((root) => {
        return root.path == filePath;
    })

    return !!foundRoot;
}

function getPreviousPath(filePath) {
    if (filePath.endsWith('\\')) {
        filePath = filePath.slice(0, filePath.length - 1);
    }

    let slashIndex = filePath.lastIndexOf('\\');
    return filePath.slice(0, slashIndex);
}

function isDir(file) {
    return !path.extname(file);
}

function getFileType(file) {
    let ext = path.extname(file).toLowerCase().substr(1);
    if (IMAGE_PATHS.indexOf(ext) >= 0) {
        return 'image';
    }
    if (VIDEO_PATHS.indexOf(ext) >= 0) {
        return 'video';
    }

    return 'any';
}

function prepareFileObject(file, filePath, size) {
    let type = getFileType(file);
    if (type == 'any') {
        return null;
    }

    return {
        caption: file,
        type: type,
        size: size,
        thumb: `/api/${type}/thumbnails/${encodeURIComponent(filePath)}/${encodeURIComponent(file)}`,
        src: `/api/${type}/preview/${encodeURIComponent(filePath)}/${encodeURIComponent(file)}`,
        downloadUrl: `/api/download/${encodeURIComponent(filePath)}/${encodeURIComponent(file)}`
    }
}

module.exports.getPaths = getPaths;
module.exports.retrieveFileStats = retrieveFileStats;