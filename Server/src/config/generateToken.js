import jwt from "jsonwebtoken"

export const generateToken = async(id, res) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"})
    

}