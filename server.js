require('dotenv').config()

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport')
const initializePassport = require("./passport-config");
const initialize = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');


const users = []
initializePassport
    (passport, 
    email =>{ return users.find(user => user.email === email)},
    id => users.find(user => user.id === id)
    )


app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated ,(req, res)=>{
    res.render('index.ejs',{name:req.user.name});
});

app.get('/register', checkNotAuthencticated,(req, res)=>{
    res.render('register.ejs')
});

app.post('/register', checkNotAuthencticated,async (req,res)=>{
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    try{
        const hashedPassword = await bcrypt.hash(password, 10)
        users.push({
            id: Date.now().toString(),
            name: name,
            email: email, 
            password: hashedPassword
        })

        res.redirect('/login')

    } catch(e){
        res.redirect('/register')

    }
    console.log(users)
})

app.get('/login', checkNotAuthencticated,(req, res)=>{
    res.render('login.ejs')
});
app.post('/login',checkNotAuthencticated,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthencticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
app.listen(3000);