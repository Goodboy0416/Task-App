const mongoose=require("mongoose")

mongoose.set('strictQuery',false)
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log("Connection Successfull")
}).catch((err)=>{
    console.log(err)
})


