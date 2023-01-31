require('dotenv').config
const mongoose=require('mongoose')
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const Schema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})
//Genertaing token
Schema.methods.generateAuthToken=async function(){
    try{
        const token= await jwt.sign({_id:this._id.toString()},"mynamesisgauravmehtailovecodingwow")
        //console.log( "first     ")
        this.tokens=this.tokens.concat({token:token})
        //this.confirmPassword=undefined
       // console.log( "second     ")
        await this.save()
        //console.log( "third     ")
        return token
    }catch(err){
        //res.send("the error part")
        console.log(err)
        return null
    }
}

Schema.pre("save",async function(next){
    // this.password= await bcrypt.hash(this.password,10)
    // next()
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10)
        this.confirmPassword=this.password
    }
    next()
})

const Register=new mongoose.model('Register',Schema)


module.exports=Register