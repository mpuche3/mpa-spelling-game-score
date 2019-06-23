
// Server
const folder = './client/pics/';
const websiteUrl = 'https://spelling-game-score-mpuche3.c9users.io/pics/';
const fs = require('fs');
var http = require('http');
var path = require('path');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
router.use(express.static(path.resolve(__dirname, 'client')));
var Request = require("request");
var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://admin:admin@ds121309.mlab.com:21309/spelling-game";
const mLabDb = "spelling-game";
const cors = require('cors');
router.use(cors());

// Server Listen
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

//Allow Cross Domain Requests
io.set("transports", ["websocket"]);

// Get words from database
function emitData (socket) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mLabDb);
    dbo.collection("words").find({}).toArray(function(err, result) {
      if (err) throw err;
      socket.emit("words", {words: result.sort(compare)});
      db.close();
    });
  });
}

// Socket Listen
io.on('connection', function (socket) {
  console.log("Connection established");
  emitData(socket);
  socket.on('definition', function(data){
    console.log("What's the definition of " + data.word);
    getDefinition(data.word, def => {
      console.log(def);
      socket.emit('definition', {
        "word": data.word, 
        "definition": def 
      });
    });
  });
  socket.on("updateScore", function (data) {
    console.log(data.fileName);
    console.log(data.score);
    updateScore(data.fileName, data.score);
  });
});

// Get definition on request
function getDefinition (word, callback) {
  let website = "https://en.oxforddictionaries.com/definition/";
  Request.get(website + word, (error, response, body) => {
    try {
      if(error) {
        console.log("this is an error");
      }
      let defs = body.split('<span class="iteration">');
      defs.shift();
      let def = defs[0].split('<span class="ind">')[1].split("</span>")[0];
      callback(def);
    } catch(err) {
      console.log("Ahhhhh - That's not a word");
    }
  });
}

// Compare. To be use to sort the words by score
function compare(firstWord,secondWord) {
  if (firstWord.score < secondWord.score) return -1;
  if (firstWord.score > secondWord.score) return 1;
  return 0;
}

// Update Score in database
function updateScore(fileName, score){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mLabDb);
    var myquery = { fileName: fileName };
    var newvalues = { $set: {score: score } };
    dbo.collection("words").updateMany(myquery, newvalues, { upsert: true }, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}