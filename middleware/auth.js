const jwt=require('jsonwebtoken')
const Register=require("../models/register")

const auth=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt
        const verifyUser=jwt.verify(token,"mynamesisgauravmehtailovecodingwow")
        console.log(verifyUser)
        const user=await Register.findOne({_id:verifyUser._id})
        // if user is not valid then this verify user will not return anything
        next()
    }catch(err){
        res.status(401).send(err)
    }
}

module.exports=auth