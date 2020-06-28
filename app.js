const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", { useUnifiedTopology: true});
const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);

app.route("/articles")
.get(function(req,res){
  Article.find( function(err, foundArticles){
    if (err){
      res.send(err);
    }else{
      res.send(foundArticles);
    }
  })
})
.post(function(req,res){

  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });
newArticle.save(function(err){
  if (err){
    res.send(err);
  } else {
    console.log("Successfully added a new article.");
  }
});
})
.delete(function(req,res){
  Article.deleteMany( function(err){
    if (err){
      res.send(err);
    } else {
      res.send("Successfully deleted all articles.");
    }
  })
});
///////TARGETING A SPECIFIC ARTICLE///////
app.route("/articles/:articleTitle")
.get(function(req,res){
  Article.findOne({title:req.params.articleTitle}, function(err, foundArticle){
  if(foundArticle)
  {res.send(foundArticle);
  } else {
    res.send("No articles matching that title were found.")
  }
  })
}) //end of get
.put(function(req,res){ //put will replace an entire document not just a selected part. To update a particular piece of doc see PATCH
  Article.update(
    {title:req.params.articleTitle},//conditions
    {title: req.body.title, content:req.body.content},//updates
    {overwrite:true},
    function(err, results){
      if(!err){
        res.send("Successfully updated article.")
      }
    }//err and results handler
  )
}) //end of put
.patch(function(req,res){ //updates a specific field in a specific document
  Article.update(
    {title:req.params.articleTitle},//conditions
    {$set: req.body}, //specific updates, for any part of the document
    // {$set: {content:req.body.content}} optionally can specify which exact part user can change
    function(err, updatedArticle) {
      if(!err){
        res.send("Specific article was patched.")
      }else {res.send(err)}
    }
  )
}) //end of patch

.delete(function(req,res){
  Article.deleteOne({title:req.params.articleTitle}, function(err){
    if (!err){res.send("Deleted Successfully.")
  }else{res.send(err)}
  })
});

app.listen(3001, function(){
  console.log("Server started on port 3001");
});
