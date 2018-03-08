var config = require('../config.json');
var fileBrowser = require('./file-browser.service');

function start() {
    //1. get all root paths
    //2. Run recursively and find all the folders and images/videos and save to database
    //3. Create thumbnails/previews/animations for images/videos (in bulks of 4-5)

    retrieveFilesAndFoldersRecursively();
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

start();

