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
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

function createDatabase () {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });
}

function createCollection () {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.createCollection("words", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
}

function getData () {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("words").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
  });
}

function updateScore(fileName, score){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myquery = { fileName: fileName };
    var newvalues = { $set: {score: score } };
    dbo.collection("words").updateMany(myquery, newvalues, { upsert: true }, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}

function getFileNames (folder){
  let fileNames = [];
  fs.readdirSync(folder).forEach(file => {
    fileNames.push(file);
  });
  return fileNames;
}

function insertWordIfMissing (fileName) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    const dbo = db.db("mydb");
    const myquery = { fileName: fileName };
    const newvalues = { $set: {score: 0} };
    dbo.collection("words").update(myquery, newvalues, { upsert: true }, function(err, res) {
      if (err) throw err;
      console.log(fileName + " updated");
      db.close();
    });
  });
}

function dropCollection (collection) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.dropCollection(collection, function(err, delOK) {
      if (err) throw err;
      if (delOK) console.log("Collection deleted");
      db.close();
    });
  });
}

//dropCollection("words");
getData();
let fileNames = getFileNames(folder);
fileNames.forEach(fileName => insertWordIfMissing(fileName));
//getData();
//updateScore("abrogate.JPG", 153);

//createDatabase();