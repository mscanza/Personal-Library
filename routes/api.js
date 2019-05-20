/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;


module.exports = function (app) {
  
  MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
  if (err) {
    return err.message;
  } else {
    
  console.log('Connected to Database')
    
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    db.collection('books').aggregate([
      {$match: {}},
      {$project: {_id: true, title: true, commentcount: { $size: {$ifNull: ["$comments", []]}}}}
    ]).toArray(function(err, docs){
      if (err) {
        return console.log(err)
      }
      res.json(docs)
    })
      
    })
    .post(function (req, res){
      var title = req.body.title;
      var id = req.body.id
      if (!title) {
        return res.send("missing title")
      }
      //response will contain new book object including atleast _id and title
    db.collection('books').insertOne({title: title, comments: []}, function(err, doc) {
      if (err) {
        return res.send("fail: could not add book to library")
      }
        res.json(doc.ops[0])
      
    })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    db.collection('books').remove({}, function(err, response){
      if (err) {
        return res.send(err.message)
      } 
      res.send('complete delete successful')
    })
    });

 

  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    try {
      bookid = ObjectId(bookid)
    } catch(err) {
      return res.send('invalid id');
    }
    
    db.collection('books').findOne({_id: bookid}, function(err, doc){
      if (err) {
        return res.send(err.message)
      }
      res.send(doc == null ?  'no book exists' : doc)
    })
  
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
    try {
      bookid = ObjectId(bookid)
    } catch(err) {
      return res.send('invalid id')
    }
    console.log(req.body)
    if (!comment) {
      return res.send('no comment to upload')
    }
      //json res format same as .get
    db.collection('books').findOneAndUpdate(
      {_id: bookid},
      {$push: { comments: comment } },
      {returnOriginal: false},
      function(err, doc){
        if (err) {
          return console.log(err);
        }
        res.send(doc.value == null ? 'no book exists' : doc.value);
      }
    )
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      try {
        bookid = ObjectId(bookid)
      } catch(err) {
        return res.send('invalid id')
      }
    
    db.collection('books').findOneAndDelete(
      {_id: bookid},
      function(err, doc) {
        if (err) {
          return res.send(err.message)
        }
        res.send('delete successful')
      }
    )
    });
    
    app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});
  
}

  }); 
  
};
