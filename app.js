
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', false);

const bodyParser = require("body-parser");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-rahul:Rahul1996@cluster0.mzgvmvr.mongodb.net/todoDB");

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to todo list"
});

const item2 = new Item({
  name:"Welcome rahul"
});

const item3 = new Item({
  name:"Welcome Manish"
});


const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
}
  
const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  Item.find({},function(err,foundItem){
    if(foundItem.length===0){

      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items");
        }
      });
      res.redirect("/");
    }

    else{

      res.render("list", {listTitle: "Today", newListItems: foundItem});

    }
  }); 
});

// Creating Custom List 

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){
if(!err){
  if(!foundList){
    const list = new List({
      name:customListName,
      items:defaultItems
  });
  list.save();
    res.redirect("/" + customListName);
  }
  else{
    
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
}
});

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
 
});





app.post("/delete",function(req,res){

const checkedItem = req.body.checkbox;
const listName =req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndDelete(checkedItem,function(err){
      if(!err){
        console.log("Successfully Deleted Item");
        res.redirect("/");
      }
        });
  }
  else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
        
      });



  }

});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;

app.listen(port || 3000, function() {
  console.log("Server started on port"+port);
});
