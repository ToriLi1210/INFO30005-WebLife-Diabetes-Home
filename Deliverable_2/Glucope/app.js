const exphbs = require('express-handlebars')

// Import express
const express = require('express')
require('./models')

// Set your app up as an express app
const app = express()

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
    res.render('glucope.hbs')
})

// Render the not finished page
app.get('/notfinished', (req, res) => {
    res.render('notfinished.hbs')
})

// Tells the app to listen on port 3000 and logs that information to the console.
app.listen(process.env.PORT || 3000, () => {
    console.log('Glucope app is listening on port 3000!')
})
