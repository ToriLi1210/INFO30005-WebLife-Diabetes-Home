const express = require('express')

// create our Router object
const patientRouter = express.Router()

// import patient controller functions
const patientController = require('../controllers/patientController')

// add a route to handle the GET request for all patient data
patientRouter.get('/', patientController.getAllPatientData)

// add a route to handle the GET request for one data instance
patientRouter.get('/:patient_id', patientController.getDataById)
patientRouter.get('/:patient_id/PatientBloodSugarPage', patientController.renderTaskPage)
patientRouter.post('/:patient_id/PatientBloodSugarPage', patientController.addPatientRecord)

// add a new JSON object to the database
// patientRouter.post('/', patientController.insertData)

// export the router
module.exports = patientRouter
