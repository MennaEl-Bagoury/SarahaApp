const validation = (schema) => {
    return (req,res,next)=> {
        let errorsResult = []
        for (const key of Object.keys(schema)) {
            const result = schema[key].validate(req[key],{abortEarly:false})
            
            
            if(result.error){
                console.log(result.error);
                /* to handel error response to be more organized */
                result.error.details.forEach(element => {
                    errorsResult.push({
                    key,
                    path:element.path[0],
                    message:element.message
                })
                });
            }
        }
        if(errorsResult.length){
            return res.status(400).json({mes:"validation error",err:errorsResult})
        }
        // return res.status(200).json({mes:"validation error"})
        next()
    }
}

export default validation;

