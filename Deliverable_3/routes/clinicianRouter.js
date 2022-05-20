const express = require('express')
const passport = require('passport')
const utility = require('./clinicianUtility')

// create Router object
const clinicianRouter = express.Router()
// import clinician controller functions
const clinicianController = require('../controllers/clinicianController')

// login
clinicianRouter.get('/', utility.unLoggedIn, clinicianController.loginPage)

clinicianRouter.post(
    '/',
    utility.unLoggedIn,
    passport.authenticate('clinician-login', {
        successRedirect: '/clinician/dashboard',
        failureRedirect: '/clinician',
        failureflash: true,
    })
)

// for clinician register
clinicianRouter.get(
    '/register',
    utility.unLoggedIn,
    clinicianController.renderCreateClinician
)

clinicianRouter.post(
    '/register',
    utility.unLoggedIn,
    clinicianController.createClinician
)
// for clinician logout
clinicianRouter.get(
    '/logout',
    utility.isLoggedIn,
    clinicianController.logoutPage
)
// for clinician profile
clinicianRouter.get(
    '/clinicianProfile',
    utility.isLoggedIn,
    clinicianController.clinicianProfile
)
// for clinician create patient
clinicianRouter.get(
    '/createpatient',
    utility.isLoggedIn,
    clinicianController.renderCreatePatient
)
// add a route to handle the GET request for all patient data
clinicianRouter.get(
    '/dashboard',
    utility.isLoggedIn,
    clinicianController.getAllRecords
)
// obtain patients detail send to hbs
clinicianRouter.get(
    '/dashboard/:patient_id',
    utility.isLoggedIn,
    clinicianController.getDataById
)

clinicianRouter.get(
    '/dashboard/:patient_id/notes',
    utility.isLoggedIn,
    clinicianController.renderPatientNotes
)

clinicianRouter.get(
    '/dashboard/:patient_id/:taskPage',
    utility.isLoggedIn,
    clinicianController.getPatientData
)

// clinicianRouter.get('/dashboard/commentlalahistory', utility.isLoggedIn, clinicianController.getAllComments)
clinicianRouter.get(
    '/dashboard/:patient_id/:taskPage/history',
    utility.isLoggedIn,
    clinicianController.getBglHistory
)

// clinicianRouter.get('/dashboard/:patient_id/:taskPage/CommentHistory', utility.isLoggedIn, clinicianController.getBglComment)

// clinicianRouter.get('/dashboard/:patient_id/:taskPage/singlecomment', utility.isLoggedIn, clinicianController.getSingleComment)

clinicianRouter.post(
    '/createpatient',
    utility.isLoggedIn,
    clinicianController.createPatient
)

clinicianRouter.post(
    '/clinicianProfile',
    utility.isLoggedIn,
    clinicianController.updateClinicanProfile
)

clinicianRouter.post(
    '/dashboard/:patient_id',
    utility.isLoggedIn,
    clinicianController.setRange
)

clinicianRouter.post(
    '/dashboard/:patient_id/:taskPage',
    utility.isLoggedIn,
    clinicianController.setRange
)

clinicianRouter.post(
    '/dashboard/:patient_id/:taskPage/history',
    utility.isLoggedIn,
    clinicianController.setRange
)
// export the router
module.exports = clinicianRouter
