export const success_response = ({
    res,
    status = 200,
    message = "done",
    data = undefined
}) => {
    return res.status(status).json({message,data})
}