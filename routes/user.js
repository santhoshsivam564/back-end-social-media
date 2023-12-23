const router = require("express").Router();
const User = require("../Models/User");
const Post = require("../Models/Post");
// const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWTSEC= "abcdefg";
const verifyToken = require("../middlewares/VerifyToken");


//signup

router.post("/signup", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt); 
        const user = new User({
            username:req.body.username,
            email:req.body.email,
            password:secpass,
            age:req.body.age,
            contactno:req.body.contactno,
            profile:req.body.profile
        });
        const data = await user.save();
        const token = jwt.sign({ id: data._id }, "JWTSEC");

        return res.json({ msg:"Signed up successfully" });
    } catch (error) {
        res.json({ msg: error.message });
    }
});


//login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(user){
            const result = await bcrypt.compare(req.body.password, user.password);
            if(result){
                const token = jwt.sign({ id:user._id },"JWTSEC");
                return res.json({msg:"Login Succesfully"});
            } else {
                return res.json({ msg: "Wrong password" });
            }
        } else {
            return res.json({ msg: "No user found" });
        }
    } catch (error) {
        return res.json({ msg: error.message });
    }
});

router.get("/data", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        res.json(user);
    } catch (error) {
        return res.json({ msg: error.message });
    }
});


    
//Following
router.put("/following/:id" , verifyToken , async(req , res)=>{
    if(req.params.id !== req.body.user){
        const user = await User.findById(req.params.id);
        const otheruser = await User.findById(req.body.user);

        if(!user.Followers.includes(req.body.user)){
            await user.updateOne({$push:{Followers:req.body.user}});
            await otheruser.updateOne({$push:{Following:req.params.id}});
            return res.status(200).json("User has followed");
        }else{
            await user.updateOne({$pull:{Followers:req.body.user}});
            await otheruser.updateOne({$pull:{Following:req.params.id}});
            return res.status(200).json("User has Unfollowed");
        }
    }else{
        return res.status(400).json("You can't follow yourself")
    }
});

//Fetch post from following
router.get("/flw/:id" , verifyToken , async(req , res)=>{
    try {
        const user = await User.findById(req.params.id);
        const followersPost = await Promise.all(
            user.Following.map((item)=>{
                return Post.find({user:item})
            })
        )
        const userPost = await Post.find({user:user._id});

        res.status(200).json(userPost.concat(...followersPost));
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//Update User Profile
router.put("/update/:id" , verifyToken , async(req , res)=>{
    try {
        if(req.params.id === req.user.id){
            if(req.body.password){
                const salt = await bcrypt.genSalt(10);
                const secpass = await bcrypt.hash(req.body.password , salt);
                req.body.password = secpass;
                const updateuser = await User.findByIdAndUpdate(req.params.id , {
                    $set:req.body
                });
                await updateuser.save();
                res.status(200).json(updateuser);
            }
        }else{
            return res.status(400).json("Your are not allow to update this user details ")
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//Delete User account 
router.delete("/delete/:id" , verifyToken , async(req , res)=>{
    try {
        if(req.params.id !== req.user.id){
            return res.status(400).json("Account doesn't match")
        }else{
            const user = await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("User account has been deleted")
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})



 module.exports = router;       