var jwt=require('jsonwebtoken')
const authsrt = "nikko";


const fetchuser=(req,res,next)=>{

    const token=req.header('auth-token');

    if(!token){

        console.log("no token")
        res.status(401).send({error:"please authenticatet"})
    }

    const st =jwt.decode(token,authsrt)
    console.log(st)
    req.user=st.user;
    console.log("user id", st.user)
    next();

}

module.exports=fetchuser;