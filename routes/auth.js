const express = require("express");
const router=express.Router()

router.get('/',(req,res)=>{
    res.send("hello")
})

router.post('/signup',(req,res)=>{
    const{name,email,password}=req.body
    if (!email||!password||!name) {
        return res.status(422).send({error:"please add all the fields"})

    }
    res.send({message:"Success"})
})

module.exports=router