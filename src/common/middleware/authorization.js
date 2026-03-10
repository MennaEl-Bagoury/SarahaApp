const authorization = (roles = [])=>{
    return (req, res, next)=> {
    if(roles.includes(req.user.role)){
        return next();
    } 
    throw new Error("role not exist");
}
}

export default authorization;

