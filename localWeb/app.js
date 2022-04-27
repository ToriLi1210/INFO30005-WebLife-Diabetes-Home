const exphbs = require('express-handlebars')

// Import express
const express = require('express')
require('./models')
// Set your app up as an express app
const app = express()

// configure Handlebars
app.engine(
    'hbs',
    exphbs.engine({
        defaultlayout: 'main',
        extname: 'hbs',
        partialsDir: __dirname + '/views/partials/',
        helpers: require('./public/js/helpers.js').helpers,
    })
)
// set Handlebars view engine
app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(express.static('static'))

// Set up to handle POST requests
app.use(express.json()) // needed if POST data is in JSON format
app.use(express.urlencoded({ extended: false })) // only needed for URL-encoded input

// link to our router
const patientRouter = require('./routes/patientRouter')
const clinicianRouter = require('./routes/clinicianRouter')

// the demo routes are added to the end of the '/patient' path
app.use('/patient', patientRouter)
app.use('/clinician', clinicianRouter)

// Tells the app to send the string: "Our demo app is working!" when you hit the '/' endpoint.
app.get('/', (req, res) => {
    res.render('glucope.hbs')
})

// not finished page
app.get('/notfinished', (req, res) => {
    res.render('notfinished.hbs')
})


// Tells the app to listen on port 3000 and logs that information to the console.
app.listen(process.env.PORT || 3000, () => {
    console.log('Glucope app is listening on port 3000!')
})

