var mongoose = require('mongoose');
var User = require('server/models/user');

var express = require('express');
var secretKey = "its_really_very_secret";
var api = express.Router();
var bcrypt = require('bcrypt-nodejs');
var jsonwebtoken = require('jsonwebtoken');


function createToken(user){
  var token = jsonwebtoken.sign({
    _id:user._id,
    name:user.name,
    username:user.username
  },secretKey);
  return token;
}
  api.post('/signup',function(req,res){
    var user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      data:req.body.data
    });
    user.save(function(err){
      if(err){
        res.json({failureMessage:"User Registration Failed"});
        return;
      }
      res.json({successMessage:"User has been created"});
    });
  });

  api.get('/users',function(req, res){
    User.find({},function(err, users){
      if(err){
        res.send(err);
        return;
      }
      res.send({users:users});
    });
  });

  api.post('/user', function(req, res){
    User.findOne({
      username:req.body.eUser
    }).exec(function(err, user){
        if(err) throw err;
        res.send({user:user});

    });
  });

  api.get('/hehe',function(req, res){
    console.log("Hey fellas...so much to do!!");
    res.send("Hey brother...!");
  });

  api.post('/login', function(req, res){
    User.findOne({
      username:req.body.username
    }).select('password').exec(function(err,user){
        if(err) throw err;
        if(!user){
          res.send({message:"User doesnot exist!"});
        }else if(user){
          var validPassword = user.comparePassword(req.body.password);
          if(!validPassword){
            res.send({message:"Invalid password"});
        }else{
          //console.log(user);
          user.username = req.body.username;
          // console.log(user);
          var token = createToken(user);
          // console.log(token);
          res.json({
            success:true,
            message:"successfully login!",
            token: token
          });
        }
      }
    });
  });


  api.use(function(req, res, next){
    console.log("We have a guest");
    var token = req.body.token ||  req.headers['x-access-token'] || req.headers['token'] ;
    //console.log(token);
    //check whether token exists
    if(token){
      jsonwebtoken.verify(token,secretKey,function(err,decoded){
        if(err){
          res.status(403).send({success:false, message:"Failed to authenticate user"});
        } else {
          req.decoded = decoded;
          //console.log(req.decoded);
          next();
        }
      });
    } else {
      res.status(403).send({success:false, message:"No token provided"});
    }
  });

  // with the valid token travel the other part of API

  api.route('/')
    .put(function(req, res){
      var todo =[{
          task: req.body.task,
          isCompleted: req.body.isCompleted,
          isEditing: req.body.isEditing
        }];
      //console.log(req.decoded.username);
      User.update({username: req.decoded.username},{ $push : {data :{$each : todo}  }},function(err, result){
        //for more push types refer mongo db documentation
        // https://docs.mongodb.com/manual/reference/operator/update/push/#example-push-each
        if(err){
          res.send(err);
          return;
        }
        console.log("New Task Created successfully");
        res.json({message:"New Task created",
                  result:result
                });
      })
    })

    .get(function(req, res){
      //console.log(req.decoded.username);
      User.find({_id: mongoose.Types.ObjectId(req.decoded._id)})
        .select('data')
        .exec(function(err, todos){
        if(err){
          res.send(err);
          return;
        }
        console.log("Tasks loaded");
        res.json({todos:todos[0].data});
        //res.json(todos[0].data[0]); res.json(todos[0]); res.json(todos); console.log(todos);
      });
    });
    api.route('/:id1/:id2')
    .put(function(req,res){
      var id1 = req.params.id1;//id for the user
      var id2 = req.params.id2;//id for the particular task
      User.update({"_id": mongoose.Types.ObjectId(id1),
                   "data._id": mongoose.Types.ObjectId(id2)},{ $set :{"data.$.task" : req.body.task}},function(err, result){
        if(err){
          res.send(err);
          return;
        }
        console.log("Task Updated on screen");
        res.json({message:"Task Updated",
                  result:result
                });
      });
    });
    api.route('/:id1')
    .put(function(req,res){
      var id1 = req.params.id1;//id for the particular task
      console.log(req.decoded.username);
      console.log(id1);
      User.update({username: req.decoded.username},
      { $pull :{data :{_id:mongoose.Types.ObjectId(id1)}}},
      function(err, result){
        if(err){
          res.send(err);
          return;
        }
        console.log("Task deleted");
        res.json({message:"Task deleted",
                  result:result
                });
      });
    });

    api.get('/me',function(req, res){
      res.json({resp:req.decoded});
    });//for getting the decoded as many times we want for aa particular user session



  module.exports = api;
