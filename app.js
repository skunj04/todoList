//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://ADMIN_ID:AMDIN_PASSWORD@cluster0.wg6xk.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});


const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {


  Item.find({},function(err,results){
    if(err){
      console.log(err);
    }
    else{

      if(results.length === 0){

        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Insert successful");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: results});
      }
    }
  });

  

});

app.get("/:custom",function(req,res){
  const customListName = _.capitalize(req.params.custom);
  List.findOne({name:customListName},function(err,result){
    if(result){
      // console.log("Already Exists");
      //Show existing list
      res.render('list',{listTitle: result.name, newListItems: result.items});
    }
    else{
      // console.log("New one");
      //Create a new list

      const list = new List({
        name: customListName,
        items: defaultItems 
      });
      list.save();
      res.redirect("/" + customListName);
    }
  })
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }

  
});

app.post("/delete",function(req,res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
      
    Item.findByIdAndRemove(checkedId,function(err) {
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }

    })    
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
      else{
        console.log(err);
      }
    })
  }

})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(3000, function() {
  console.log("Server has started successfully");
});
