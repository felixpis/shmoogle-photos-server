
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var objectId = mongo.ObjectID;
var config = require('../config.json');
var url = config.database.url;


module.exports.connect = function (next) {
    mongoClient.connect(url, function (err, client) {
        if (err) {
            console.error('Failed to connect to server', err);
            return next(err);
        }
        const db = client.db("shmoogle-photos");
        console.log("Connected correctly to MongoDB server.");
        var theDB = {
            db: db,
            objectId: objectId,
            files: db.collection('files'),
            thumbnails: db.collection('thumbnails')
        };
        module.exports.db = theDB;
        next(null, {});
    });
}