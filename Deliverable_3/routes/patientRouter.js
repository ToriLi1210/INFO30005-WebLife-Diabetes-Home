const express = require('express')
const passport = require('passport')
const utility = require('./patientUtility')

// create Router object
const patientRouter = express.Router()

// import patient controller functions
const patientController = require('../controllers/patientController')

// login page
patientRouter.get('/login', utility.unLoggedIn, patientController.loginPage)
patientRouter.post(
    '/login',
    utility.unLoggedIn,
    passport.authenticate('patient-login', {
        successRedirect: '/patient/dashboard',
        failureRedirect: '/patient/login',
        failureflash: true,
    })
)
// logout page
patientRouter.get('/logout', utility.isLoggedIn, patientController.logoutPage)

// add a route to handle the GET request for accomplishment page
patientRouter.get(
    '/accomplishment',
    utility.isLoggedIn,
    patientController.sortEngagementRate
)

// add a route to handle the GET request for one patient profile
patientRouter.get(
    '/profile',
    utility.isLoggedIn,
    patientController.getPatientProfile
)

patientRouter.get(
    '/profile/updatePassword',
    utility.isLoggedIn,
    patientController.renderPwd
)
patientRouter.post(
    '/profile/updatePassword',
    utility.isLoggedIn,
    patientController.updatePwd
)

patientRouter.get(
    '/profile/updatePersonalDetail',
    utility.isLoggedIn,
    patientController.changeProfile
)
patientRouter.post(
    '/profile/updatePersonalDetail',
    utility.isLoggedIn,
    patientController.updateProfile
)

// add a route to handle the GET request for one patient dashboard
patientRouter.get(
    '/dashboard',
    utility.isLoggedIn,
    patientController.getPatientDataById
)

// add a route to handle the GET request for one patient history comment
patientRouter.get(
    '/dashboard/:taskPage/commentHistory',
    utility.isLoggedIn,
    patientController.renderCommentHistory
)

// add a route to handle the GET request for one patient history record
patientRouter.get(
    '/dashboard/:taskPage/recordHistory',
    utility.isLoggedIn,
    patientController.renderRecordHistory
)

// add a route to handle the GET request for one patient data instance
patientRouter.get(
    '/dashboard/:taskPage',
    utility.isLoggedIn,
    patientController.renderOneTaskPage
)

// add a route to handle the POST request for one patient data instance
patientRouter.post(
    '/dashboard/:taskPage',
    utility.isLoggedIn,
    patientController.addPatientRecord
)

// export the router
module.exports = patientRouter
