const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const path = require('path');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
//const FirebaseContainer = require('./containers/FirebaseContainer.js');
var serviceAccount = require(path.join(__dirname,"../db/appchoho-firebase-adminsdk-4wdhe-288507b775.json"));

// Base de datos Firebase
var admin = require("firebase-admin");
const { log } = require('console');
const { json } = require('express');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

console.log('Firebase online');

const getUser = async (username, password) => {
    try {

        const usuario = db.collection('usuarios');
        const docs = await usuario.where('usuario', '==', username).get();
        
        if (docs.empty) {
            console.log('No matching documents.');
            return;
        }
        
        docs.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            return doc.data();
        });
    } catch (error) {
        console.log(error);
    }
        /*
    if (!doc.exists) {
    console.log('No such document!');
    } else {
        let datos = doc.data();
        console.log('Sera que no puedo?!'+ doc.data());
        return datos;
    }
    /*try {
        const users = db.collection('usuarios').doc(username);
        const resultado = users.get();
        await resultado.get();
        if(!await student.get()) {
            console.log('Usuario no encontrado');
        }else {
            return (data.data());
        }
    } catch (error) {
        return error.message;
    }*/
}

async function CRUD() {
    const query = db.collection('usuarios')

    try {
        const id = 1;
        const doc = query.doc(`${id}`)
        await doc.create({ nombre: "Jesus", edad: 777})
        console.log("Data creada");
        
    } catch (error) {
        console.log(error);
    }
}

const usuarios = []

// Passport

passport.use('register', new LocalStrategy({
    passReqToCallback: true
}, ( req, username, password, done) => {

    const { direccion } = req.body

    const usuario = usuarios.find(usuario => usuario.username == username)
    if (usuario) {
        return done('ya esta registrado')
    }

    const user = {
        username,
        password,
        direccion,
    }
    usuarios.push(user)
    try {
        const response = db.collection("usuarios").add(user);
    } catch (error) {
        console.log(error);
    }
    console.log(usuarios)
    const todos = FirebaseContainer.getAll("usuarios");
    console.log(todos)
    return done(null, user)
}))

passport.use('local', new LocalStrategy(function( username, password, done){
   
    //const user = usuarios.find(usuario => usuario.username == username)
    console.log('Espiritu Santo ayudame!!');
    
    const user = getUser(username,password);
    console.log('Jehova');
    console.log(user);
    console.log('ingreso');
    
    
    
    /*bcrypt.compare(password, user.password, function(err, res) {
        if (err){   return done(err); }
            
        if (!res){  return done(null, false, { message: 'Username or password incorrect' });  }
            

        user.contador = 0
        console.log(user);
        return done(null, user);    
    })*/
    if (user.password != password) {
        return done(null, false)
        
    }
    user.contador = 0
    console.log(user);   
    return done(null, user)
}))
/** Inicia el servidor */
const app = express()
const port = process.env.PORT || 3000

passport.serializeUser(function user(user, done) {
    //console.log("Jehova Mi padre");
    done(null, user.username)
});

passport.deserializeUser(function (username, done) {
    //console.log("Jesus mi Señor");
    //console.log(username);
    const usuario = usuarios.find(usuario => usuario.username == username)
    done(null, usuario);
})
app.use(session({
    secret: 'asdfghjklñ',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}))

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main.hbs' }));
app.set('views', __dirname + '/views');
app.set('view engine', '.hbs');
app.use(cookieParser())
//app.use("/login", require('./auth.js'));
app.use(express.json())
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use('/public/imag', express.static(__dirname + '/imag'));

// Auth
function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/login')
    }
}
// Cookies 
app.get('/set', (req, res) => {
    res.cookie('server','express').send('Cookie Set')
})
app.get('/setEX', (req, res) => {
    res.cookie('server2','express2', { maxAge: 30000}).send('Cookie SetExt')
})

app.post('/cookies', (req, res) => {
    const { nombre, valor, tiempo } = req.body
    console.log(nombre, valor, tiempo);

    if (!nombre || !valor) {
        return res.json({ error: 'falta nombre ó valor'})
    } 
    
    if(tiempo){
        res.cookie(nombre, valor, { signed: true, maxAge: 1000 * parseInt(tiempo) })
    } else {
        res.cookie(nombre, valor, { signed: true })
    }
    res.json({ proceso: 'ok'})
})

app.get('/cookies', (req, rep) => {
    res.json({ normales: req.cookies, firmadas: req.signedCookies })
})

app.delete('/cookies/:nombre', (req, res) => {
    const { nombre } = req.params
    if (nombre) {
        res.clearCookie(nombre)
        res.json({proceso: 'ok'})
    } else {
        res.json({ error: 'falta el nombre'})
    }
})

/// Fin Cookies

/// registro de usuarios
app.get('/register',(req, res) => {
    res.render('register', {body: 'Jesus' })
})

app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/'}))

app.get('/failregister', (req, res) => {
    res.render('register-error')
})


// Login

app.get('/login', (req, res) => {
    // res.sendFile(__dirname + '/views/login.html')
    //let usuario = []
    //usuario.error = false
    //res.render('login', {usuario: usuario, body: 'Jesus' })
    res.render('login')
 })

app.post('/login', passport.authenticate('local',{ 
    failureRedirect: '/faillogin', 
    successRedirect: '/datos' 
}))

 app.get('/faillogin', (req, res) => {
    res.render('login-error')
 })

 // Datos

 app.get('/datos', isAuth, (req, res)=> {
    if (!req.user.contador) {
        req.user.contador = 0
    }
    req.user.contador++
    res.render('datos',{datos:  req.user})
    /*if (req.session.nombre) {
        req.session.contador++
        res.render('datos', {
            datos: usuarios.find(usuario => usuario.nombre == req.session.nombre),
            contador: req.session.contador
        })
    } else {
        res.redirect('login')
    }*/
})
//app.post('/register',(req, res) => {
    /*async function crear() {
    const query = db.collection('usuarios')
    const { nombre, password, direccion } = req.body

    try {
        const id = 2;
        const doc = query.doc(`${id}`)
        await doc.create({ nombre: nombre, password: password, direccion: direccion})
        console.log("Data creada");
        
    } catch (error) {
        console.log(error);
    }

}
crear()*/
    /*const usuario = usuarios.find(usuario => usuario.nombre == nombre)
    if (usuario) {
        res.render('Error en registro')        
    }

    usuarios.push({ nombre, password, direccion })
    res.redirect('/login')*/

//})



/*app.post('/login', (req, res) => {
    const { nombre, password } = req.body
    async function buscar() {
        const { nombre, password } = req.body
        const query = db.collection('usuarios')
    
        try {
            //query.collection('usuarios').doc(usuario).get()
            const usuarioB = query.where('usuario', '==', nombre);
            const resultado = await usuarioB.get();
            //const  usuarioe = await usuarioB.get('usuario');
            const usuario =  '';
            resultado.forEach(doc => {
                if( doc.id == 'usuario'){
                    usuario =  doc.data().usuario;
                }
                console.log('Mi señor '+doc.data().usuario);
               // console.log(doc.id, ' => ', doc.data());
            });
            //console.log("Data encontrada" + usuario);
            
            res.render('datos', {usuario: usuario, body: 'Jesus' })
        } catch (error) {
            console.log(error);
            res.render('login-error');
        }
    }
    buscar();
    //const usuario = usuarios.find(usuario => usuario.nombre == nombre && usuario.password == password)
    // if (!usuario) {
    //     return res.render('login-error');
    // }

    // req.session.nombre = nombre
    // req.session.contador = 0
    // res.redirect('/datos')
})*/
app.get('/quienes', (req, res) => {
   // res.sendFile(__dirname + '/views/login.html')
   let usuario = []
   usuario.error = false
    res.render('quienes', {usuario: usuario, body: 'Jesus' })
})



app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('login')
    })
})

app.get('/', (req, res) =>{
    
    getAll = async () => {
		const results = [];

		try {
			const db = admin.firestore();
			const query = db.collection('items');
			const querySnapshot = await query.get();
			querySnapshot.forEach((doc) => {
				results.push({ id: doc.id, ...doc.data() });
			});
           // console.log('Funciono');
		} catch (err) {
			console.log(err);
			throw new Error(`Error al intentar obtener todo: ${err}`);
		}
        res.render('index', { usuario: usuario, body: 'Jesus', items: results })
		return results;
	};
    console.log(req.session.usuario);
    const data = getAll()
    let usuario = [];
    /*if (req.session.nombre) {
        res.redirect('/datos')
    } else {
        usuario.error = true
                //res.redirect("login");
        
    }*/
    
})
const server = app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})

server.on("error", error  => {
    console.log("Error en Servidor", error);
})