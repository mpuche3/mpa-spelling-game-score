// To install MongoDB in your workspace, you can open a terminal and run the following command:
// sudo apt-get install -y mongodb-org

// Mongodb data will be stored in the folder data.
// $ chmod a+x mongod
// $ echo 'mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@"' > mongod
// $ chmod a+x mongod

// You can start mongodb by running the mongod script on your project root:
// $ ./mongod

// Update behaviour
// If upsert is true and no document matches the query criteria, update() inserts a single document

const folder = './client/pics/';
const websiteUrl = 'https://spelling-game-score-mpuche3.c9users.io/pics/';
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://admin:admin@ds121309.mlab.com:21309/spelling-game";
const mLabDb = "spelling-game"

function getData () {
  return new Promise ((resolve, reject)=>{
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(mLabDb);
      dbo.collection("words").find({}).toArray(function(err, result) {
        if (err) throw err;
        resolve(result);
        db.close();
      });
    });
  });
}

function updateScore(fileName, score){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mLabDb);
    var myquery = { fileName: fileName };
    var newvalues = { $set: {score: score } };
    dbo.collection("words").updateMany(myquery, newvalues, { upsert: true }, function(err, res) {
      if (err) throw err;
      console.log(res);
      db.close();
    });
  });
}

function getFileNames () {
  return new Promise ((resolve, reject) => {
    fs.readdir(folder, (err, fileNames) => {
      if (err) return reject(err);
      resolve(fileNames);
    });
  });
}

function isFilenameInDatabase (fileName) {
  return new Promise ((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      const dbo = db.db(mLabDb);
      const myquery = {fileName: fileName };
      dbo.collection("words").find(myquery).toArray(function(err, res) {
        if (err) return reject(err);
        resolve(res.length !== 0);
        db.close();
      });
    });
  });
}

function deleteWordfromDatabase (fileName) {
  return new Promise (function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("spelling-game");
      var myquery = { fileName: fileName };
      dbo.collection("words").deleteOne(myquery, function(err, obj) {
        if (err) return reject(err);
        resolve(fileName);
        db.close();
      });
    });
  });
}

function deleteWordFromFileSystem (fileName) {
  return new Promise(function(resolve, reject) {
    fs.unlink(folder + fileName,function(err){
      if(err) return reject(err);
      resolve (fileName);    
    });
  });
}

function insertFileIfNew (fileName) {
  isFilenameInDatabase(fileName).then(res => {
    if (!res) updateScore(fileName, 0);
  });
}

getData().then(arr => console.log(arr));