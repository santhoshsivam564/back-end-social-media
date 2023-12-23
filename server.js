const express = require("express");
const connectDB=require("./config/Db");
const cors =require("cors");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");

const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/post", postRouter);

app.get("/",(req,res)=>{
    res.send("Api is Working");
});

app.listen(process.env.PORT || 4000,()=>{
    console.log("Server is up and Running");
});