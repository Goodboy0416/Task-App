const express=require("express")
const bodyParser=require('body-parser')
//const D=require(__dirname+"\\date.js")
const mongoose=require("mongoose")
const Register=require("./models/register")
require("./db/conn")
//console.log(date())
const app=express()

const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const auth=require("./middleware/auth")

const items=[]
const workItems=[]

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine","ejs")
app.use(cookieParser())

const port=process.env.PORT || 3000


const itemsSchema={
    name:String
}
const Item=mongoose.model("Item",itemsSchema)

const item1=new Item({
    name:"Welcome to your todolist"
})

const item2=new Item({
    name:"Hit the + button to add a new item"
})

const item3=new Item({
    name:"Hit this to delete an item"
})

app.get("/",auth,(req,res)=>{
    Item.find({},(err,foundItems)=>{

        if(foundItems.length===0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("Items are inserted into database")
                }
            })
            res.redirect("/")
        }else{
            res.render("list",{ListTitle:"Today",newListitem:foundItems})
            //console.log(foundItems)
        }

    })
})

app.get("/register",(req,res)=>{
    res.render('register')
})

app.post("/register",async(req,res)=>{
    try{
        const a=req.body.password
        const b=req.body.confirmPassword
        if(a===b){
            const newRegister=new Register({
               email:req.body.email,
               password:req.body.password,
               confirmPassword:req.body.confirmPassword,
            })     
            //const token=await newRegister.generateAuthToken()
            const registered= await newRegister.save() 
            //console.log(registered)
            res.status(200).render('register')
        }else{
            res.send("password is wrong")
        }
    }catch(err){
        console.log(err)
        res.status(400).send('error')
    }
})

app.post("/login",async(req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password
       // console.log(`email is ${email} and password is ${password}`)
        const userEmail=await Register.findOne({email:email})
        const match=await bcrypt.compare(password,userEmail.password)
        const token=await userEmail.generateAuthToken()
        //console.log(token)
        res.cookie('jwt',token,{
            expires:new Date(Date.now()+500000000),
            httpOnly:true,
            //secure:true
        })
        
        if(match){
            res.status(201).redirect("/")
        }else{
            res.send('please enter valid credentials')
        }
    }catch(err){
        console.log(err)
        res.status(404).send("invalid Login Details")
    }
})

const defaultItems=[item1,item2,item3]

const listSchema={
    name:String,
    items:[itemsSchema]
   }
const List=mongoose.model("List",listSchema)


app.post("/",auth,(req,res)=>{
    const itemName=req.body.item_name
    const listName=req.body.list
    const item=new Item({
        name:itemName
    })
    if(listName==="Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(item);
            foundList.save()
            res.redirect("/"+listName)
        })
    }
    
})

app.post("/delete",auth,(req,res)=>{
    const checkedItemId=req.body.checkbox
    const listName=req.body.listName

    if(listName==="Today"){
        Item.findByIdAndDelete(checkedItemId,(err)=>{
            if(!err){
                console.log("Successfully deleted checked item")
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
    
})

app.get("/:customListName",auth,(req,res)=>{
   const customListName=(req.params.customListName)
   List.findOne({name:customListName},(err,foundList)=>{
    if(!err){
        if(!foundList){
            //create a new List
            const list=new List({
                name:customListName,
                items:defaultItems
               })
               list.save()
               res.redirect("/"+customListName)
        }else{
            //show existing list
            res.render("list",{ListTitle:foundList.name,newListitem:foundList.items})
        }
    }else{
        console.log(err)
    }
   })
   
})

app.post("/work",auth,(req,res)=>{
    let item=req.body.item_name
    workItems.push(item)
    res.redirect("/")
})

app.get("/about",auth,(req,res)=>{
    res.render("about")
})

app.listen(port,()=>{
    console.log("server is running at port"+port)
})

