import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                sucess: false
            });
        }
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token", 
                sucess: false
            });
        }
        req.id = decode.userId;
        next()
    }
    catch (err) {
        console.log(err);
    }
}
export default isAuthenticated;