const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')

/** Inicia el servidor */
const app = express()
const port = process.env.PORT || 3000

app.use(session({
    secret: 'asdfghjklñ',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}))

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main.hbs'}));
app.set('view engine', '.hbs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))


app.get('/',(req, res) => {
    res.send('Tercera Entrega Proyecto Final')
})

const server = app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})

server.on("error", error  => {
    console.log("Error en Servidor", error);
})