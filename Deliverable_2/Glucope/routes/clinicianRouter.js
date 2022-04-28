const express = require('express')

// create Router object
const clinicianRouter = express.Router()

// import clinician controller functions
const clinicianController = require('../controllers/clinicianController')

// add a route to handle the GET request for all patient data
clinicianRouter.get('/', clinicianController.getAllRecords)

// export the router
module.exports = clinicianRouter
