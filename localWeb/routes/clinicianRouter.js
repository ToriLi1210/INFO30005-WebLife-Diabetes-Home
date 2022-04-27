const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

// import patient controller functions
const clinicianController = require('../controllers/clinicianController')

// add a route to handle the GET request for all patient data
clinicianRouter.get('/', clinicianController.getAllRecords)

// add a route to handle the GET request for one data instance
// clinicianRouter.get('/:clinician_id', clinicianController.getDataById)

// add a new JSON object to the database
// clinicianRouter.post('/', clinicianController.insertData)

// export the router
module.exports = clinicianRouter