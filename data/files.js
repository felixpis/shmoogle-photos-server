const database = require('./database');

function insertFiles(files, next) {
    database.db.files.insertMany(files, (err, result) => {

    })
}