const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')

const Patient = require('./models/patients')
const Clinician = require('./models/clinicians.js')
const bcrypt = require('bcryptjs')

module.exports = (passport) => {
    // Serialize information to be stored in session/cookie
    passport.serializeUser((user, done) => {
        // Use id to serialize user
        done(undefined, { _id: user._id, role: user.role })
    })

    passport.deserializeUser((login, done) => {
        if (login.role === 'patient') {
            Patient.findById(login._id, (err, user) => {
                return done(err, user)
            })
        } else if (login.role === 'clinician') {
            Clinician.findById(login._id, (err, user) => {
                return done(err, user)
            })
        } else {
            return done('This user does not have role', undefined)
        }
    })

    passport.use(
        'patient-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
            },
            (req, email, password, done) => {
                process.nextTick(() => {
                    // Find the user associated with the email provided by the user
                    Patient.findOne(
                        { email: email.toLowerCase() },
                        async (err, patient) => {
                            if (err) {
                                res.render('404not_found.hbs')
                                return done(err)
                            } else if (!patient) {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        'loginMessage',
                                        'Incorrect email address or password'
                                    )
                                )
                            } else if (
                                !(await bcrypt.compare(
                                    password,
                                    patient.password
                                ))
                            ) {
                                // } else if (!(password == patient.password)) {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        'loginMessage',
                                        'Incorrect email address or password'
                                    )
                                )
                            } else {
                                return done(
                                    null,
                                    patient,
                                    req.flash(
                                        'loginMessage',
                                        'Login successful!'
                                    )
                                )
                            }
                        }
                    )
                })
            }
        )
    )

    passport.use(
        'clinician-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
            },
            (req, email, password, done) => {
                process.nextTick(() => {
                    // Find the user associated with the email provided by the user
                    Clinician.findOne(
                        { email: email.toLowerCase() },
                        async (err, clinician) => {
                            if (err) {
                                res.render('404not_found.hbs')
                                return done(err)
                            } else if (!clinician) {
                                return done(
                                    null,
                                    false,
                                    req.flash('loginMessage', 'No user found.')
                                )
                            } else if (
                                !(await bcrypt.compare(
                                    password,
                                    clinician.password
                                ))
                            ) {
                                return done(
                                    null,
                                    false,
                                    req.flash('loginMessage', 'Wrong password.')
                                )
                            } else {
                                return done(
                                    null,
                                    clinician,
                                    req.flash(
                                        'loginMessage',
                                        'Login successful!'
                                    )
                                )
                            }
                        }
                    )
                })
            }
        )
    )
}
