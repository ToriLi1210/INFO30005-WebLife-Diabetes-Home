const express = require('express')

// create Router object
const patientRouter = express.Router()

// import patient controller functions
const patientController = require('../controllers/patientController')

// add a route to handle the GET request for all patient data
patientRouter.get('/', patientController.getAllPatientData)

// add a route to handle the GET request for one patient data instance
patientRouter.get('/:patient_id', patientController.getDataById)
patientRouter.get(
    '/:patient_id/PatientBloodSugarPage',
    patientController.renderTaskPage
)

// add a route to handle the POST request for one patient data instance
patientRouter.post(
    '/:patient_id/PatientBloodSugarPage',
    patientController.addPatientRecord
)

// export the router
module.exports = patientRouter
