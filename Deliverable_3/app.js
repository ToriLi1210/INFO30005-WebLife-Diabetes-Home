const exphbs = require('express-handlebars')

// Import express
const express = require('express')
require('./models')

// Set your app up as an express app
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
require('./passport')(passport)
app.use(flash())
app.use(
    session({
        secret: process.env.SESSION_SECRET || "webLife",
        name: 'glucope',
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: 'strict',
            httpOnly: true,
            maxAge: 3600000,
        },
    })
)
app.use(passport.initialize())
app.use(passport.session())

// Configure Handlebars
app.engine(
    'hbs',
    exphbs.engine({
        defaultlayout: 'main',
        extname: 'hbs',
        partialsDir: __dirname + '/views/partials/',
        helpers: require('./public/js/helpers.js').helpers,
    })
)

// Set handlebars view engine
app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(express.static('static'))

// Set up to handle POST requests
app.use(express.json()) // needed if POST data is in JSON format
app.use(express.urlencoded({ extended: false })) // only needed for URL-encoded input

// Link to the routers
const patientRouter = require('./routes/patientRouter')
const clinicianRouter = require('./routes/clinicianRouter')

// The routes are added to the end of the given path
app.use('/patient', patientRouter)
app.use('/clinician', clinicianRouter)

// Render the homepage for app
app.get('/', (req, res) => {
    res.render('welcome.hbs')
})

// Render the not finished page
app.get('/notfinished', (req, res) => {
    res.render('notfinished.hbs')
})

// app.get('/text', (req, res) => {
//     res.render('clinician_single_comments.hbs')
// })

// app.get('/singlecomment', (req, res) => {
//     res.render('clinician_single_comments.hbs')
// })

// app.get('/patient'),(req,res) => {
//     res.render('')
// }

app.get('/aboutus', (req, res) => {
    res.render('aboutus')
})
app.get('/aboutdiabetes', (req, res) => {
    res.render('aboutdiabetes')
})

app.get('/404', (req, res) => {
    res.render('404not_found')
})

// Tells the app to listen on port 3000 and logs that information to the console.
app.listen(process.env.PORT || 3000, () => {
    console.log('Glucope app is listening on port 3000!')
})
