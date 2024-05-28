const jwt = require("jsonwebtoken");

const authenticationToken = (req, res, next)=>{
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        
    }
}

