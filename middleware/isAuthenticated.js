import jsw from 'jsonwebtoken';
import { Message } from '../models/messageModel';
const isAuthenticated = async (req, res, next) => {
    try{
        const token = req.cookie.token;
        if(!token){
            return res.status(401).json({
                message: "User not authenticated",
                sucess: false
            });
        }
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message: "User not authenticated",
                sucess: false
            });
        }
        req.id = decode.userId;
        next()
    }
    catch(err){
        console.log(err);
    }
}