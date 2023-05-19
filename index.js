//primary file to run app, has all API routes and logic
var express = require('express');
var bodyParser = require('body-parser');

var app=express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
 
const sqlite3 = require('sqlite3');
const { randomUUID } = require('crypto');

const db = new sqlite3.Database('model/database.db', sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        console.error(err.message);
    }
    else{
        console.log('connected');
    }
    
});

let crypto;
try {
  crypto = require('node:crypto');
} catch (err) {
  console.error('crypto support is disabled!');
}

const { createHash } = require('crypto');
const { timeStamp } = require('console');

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}
//SETUP SO FAR

app.get("/", function (req, res) {
    res.render("register_bootstrap");
  });
  
  // Handling user signup
  app.post("/", function (req, res) {

    var user= req.body.username
    var pass = req.body.password
    var id = hash(user);
    console.log(user);
    console.log(pass);
    db.get("SELECT * FROM users WHERE username = ?", user, (err, row) => {
      if(err){
        console.log(err);     
      }
      if(row !== undefined){
        console.log(row);
        return res.redirect("/" + row.id + "/profile");     
      }
      else{
        db.all("INSERT INTO users (username, password, id) VALUES (?, ?, ?)", [user, pass, id], (err) => {
          if (err) {
            console.log(err);
          }
        })
          var code = id;
          return res.redirect("/" + code + "/profile");
      }
    });
  });

  app.get("/:code/profile", function (req, res){
    var code = req.params.code;
    db.get('SELECT username FROM users WHERE id = ?', [code], (err, user1) => {
      db.all('SELECT * FROM posts WHERE hashid = ?', [code], (err, row) => {
        data = row;
        return res.render("profile", {data, id: code, username: user1.username});
      })
    })
  });
  
   app.get("/:code/create", function (req, res){
    res.render("create", {id: req.params.code})
   });

   app.post("/:code/create", function(req, res){
    var hashid = req.params.code;
    var title = req.body.title;
    var content = req.body.content;
    const currentDate = new Date();
    // current hours
    const year = currentDate.getFullYear();
    const date = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const hours = currentDate.getHours();
    
    // current minutes
    const minutes = currentDate.getMinutes();
    
    // current seconds
    const seconds = currentDate.getSeconds();
    var timestamp = year + '-' + month + '-' + date+ ' ' + hours + ':' + minutes + ':' + seconds;
    console.log(timestamp);
    var vote = Number(0);
    var postID = hash(String(timestamp));
    db.run("INSERT INTO posts (title, content, timestamp, vote, id, hashid) VALUES (?, ?, ?, ?, ?, ?)", [title, content, timestamp ,vote ,postID ,hashid], (err) => {
      if (err) {
        console.log(err);
      }
    })
    db.get('SELECT username FROM users WHERE id = ?', [hashid], (err, user1) => {
      db.all('SELECT * FROM posts WHERE hashid = ?', [hashid], (err, row) => {
        data = row;
        return res.render("profile", {data, id: hashid, username: user1.username});
      })
    })
  });
          
  app.get("/posts/:postID/:userID",function(req,res){
    postID = req.params.postID;
    id = req.params.userID;
    db.get('SELECT username from users where id = ?', [id], (err, user1) => {
      db.all('SELECT * from posts where id = ?', [postID], (err, row) => {
        data = row;
        return res.render("post", {data, username:user1.username})
      })
    })
    
  });
  var server=app.listen(5001,function() {});