const express = require('express')
const exphbs = require('express-handlebars')
const session = require('cookie-session')
//const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy


const usuarios = []
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

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main.hbs' }));
app.set('view engine', '.hbs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/register',(req, res) => {
    res.sendFile(__dirname + '/views/register.html')
})


app.post('/register',(req, res) => {
    const { nombre, password, direccion } = req.body
    const usuario = usuarios.find(usuario => usuario.nombre == nombre)
    if (usuario) {
        res.render('Error en registro')        
    }

    usuarios.push({ nombre, password, direccion })
    res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html')
})

app.post('/login', (req, res) => {
    const { nombre, password } = req.body

    const usuario = usuarios.find(usuario => usuario.nombre == nombre && usuario.password == password)
    if (!usuario) {
        return res.render('login-error');
    }

    req.session.nombre = nombre
    req.session.contador = 0
    res.redirect('/datos')
})

app.get('/datos', (req, res)=> {
    if (req.session.nombre) {
        req.session.contador++
        res.render('datos', {
            datos: usuarios.find(usuario => usuario.nombre == req.session.nombre),
            contador: req.session.contador
        })
    } else {
        res.redirect('login')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('login')
    })
})

app.get('/', (req, res) =>{
    if (req.session.nombre) {
        res.redirect('/datos')
    } else {
        res.redirect('/login')
    }
})
const server = app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})

server.on("error", error  => {
    console.log("Error en Servidor", error);
})