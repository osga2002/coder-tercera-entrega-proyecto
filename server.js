const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/',(req, res) => {
    res.send('Hello World from Heroku')
})

const server = app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})

server.on("error", error  => {
    console.log("this is the ERROR", error);
})