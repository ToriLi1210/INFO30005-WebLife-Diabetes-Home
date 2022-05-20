// Import models
const Clinicians = require('../models/clinicians')
const Records = require('../models/records')
const Patients = require('../models/patients')

// Change Date format for drawing graph
function changeDateFormat(date, containYear) {
    var day = date.slice(0, 2)
    var mon = date.slice(3, 5)
    var year = date.slice(6, 10)

    if (containYear) {
        return [mon, day, year].join('/')
    }
    return [mon, day].join('/')
}

// Obtain the one week's day time
function getDateList(timespan) {
    var oneDay = 24 * 60 * 60 * 1000
    var today = Date.now()
    var dateList = []
    for (let i = 0; i < timespan; i++) {
        //add element at start of array
        var dateItem = new Date(today - i * oneDay).toLocaleDateString(
            'en-Au',
            { timeZone: 'Australia/Melbourne' }
        )
        dateList.unshift(dateItem)
    }
    return dateList
}

// Update the patient information
async function updatePatient(patientId) {
    try {
        // find current patient and receive the information to update
        const patient = await Patients.findById(patientId)
        var taskNum = 4
        var allTask = ['bloodSugar', 'exercise', 'weight', 'insulin']
        for (var task of allTask) {
            if (patient.needToDo[task].status == 'no') {
                taskNum -= 1
            } else if (patient.needToDo[task].status == 'recorded') {
                patient.needToDo[task].status = 'unrecorded'
            }
        }
        patient.unfinishedTaskNum = taskNum
        await patient.save()
    } catch (err) {
        res.render('404not_found.hbs')
        console.log('Error in update patient function: ', err)
    }
}

// Find the newest record, if not exist, then creat a new record
async function findOrCreateRecord(patientId, patientName) {
    try {
        // find the newest record
        const currentRecord = await Records.findOne({
            recordDate: new Date().toLocaleDateString('en-Au', {
                timeZone: 'Australia/Melbourne',
            }),
            //find patient under two conditions
            patientId: patientId,
            patientName: patientName,
        }).lean()

        // create a new record
        if (!currentRecord) {
            const newRecord = new Records({
                recordDate: new Date().toLocaleDateString('en-Au', {
                    timeZone: 'Australia/Melbourne',
                }),
                //under record model, those two are required
                patientId: patientId,
                patientName: patientName,
            })

            // save the new record to database and the record list of patient
            const newR = await newRecord.save()
            const record = await Records.findById(newR._id)
            var allTask = ['bloodSugar', 'exercise', 'weight', 'insulin']
            const onePatient = await Patients.findById(patientId)

            // update the status of patient
            await updatePatient(patientId)

            // update the status
            for (var item of allTask) {
                if (onePatient.needToDo[item].status == 'no') {
                    record[item].status = 'no'
                    record[item].comState = 'no'
                }
            }
            // save the record
            await record.save()

            //add to the top of array
            onePatient.recordsList.unshift({ recordId: record._id })
            await onePatient.save()

            return record._id
        } else {
            return currentRecord._id
        }
    } catch (err) {
        res.render('404not_found.hbs')
        console.log('Error in finding or creating record: ', err)
    }
}

// Find the given clinician, if not exist, then create a new clinician
async function findOrCreateClinician() {
    try {
        // if clinician collection is empty, add the clinician to the database
        const clinician = await Clinicians.find().lean()
        if (clinician.length == 0) {
            const newClinician = new Clinicians({
                firstName: 'Chris',
                lastName: 'Smith',
                email: '17638cr@gmail.com',
                password: '123',
                textBio: 'Responsibility!',
                yearOfBirth: '1985',
                workPlace: 'Victoria Royal Hospital',
            })
            // save the clinician
            const clinician = await newClinician.save()

            return clinician._id
        } else {
            // find the clinician
            const clinician = await Clinicians.findOne({ firstName: 'Chris' })
            return clinician._id
        }
    } catch (err) {
        res.render('404not_found.hbs')
        console.log('Error in creating clinician: ', err)
    }
}

// Handle request to get all patient data instances for the given clinician
const getAllRecords = async (req, res, next) => {
    try {
        // obtain the patient information and sent to hbs to render
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }
        const patients = []
        const allRecords = []
        const allComments = []
        // find clinician's patients store in to patients database
        const patientsNum = clinicianData.patientsList.length
        for (let i = 0; i < patientsNum; i++) {
            var patientId = clinicianData.patientsList[i].patientId
            patients.push(await Patients.findById(patientId).lean())
        }
        patients.sort(function (a, b) {
            if (a['firstName'] == b['firstName']) {
                return 1
            } else if (a['firstName'] < b['firstName']) {
                return -1
            } else {
                return 0
            }
        })
        patients.sort()
        const date = new Date().toLocaleDateString('en-Au', {
            timeZone: 'Australia/Melbourne',
        })

        // find each patients' today's records and comments
        for (let i = 0; i < patients.length; i++) {
            // if there is no record use 0 to replace it, if the task not required, use -- to replace it.
            var tempRecord = (
                await Records.find({ patientId: patients[i]._id })
                    .find({ recordDate: date })
                    .lean()
            )[0]
            if (tempRecord == null) {
                if (patients[i].needToDo.bloodSugar.status == 'unrecorded') {
                    tempRecord = { bloodSugar: { value: '0' } }
                    // tempRecord = { bloodSugar: { value: '0' } }
                } else {
                    tempRecord = { bloodSugar: { value: '--' } }
                }
                if (patients[i].needToDo.exercise.status == 'unrecorded') {
                    tempRecord = Object.assign(tempRecord, {
                        exercise: { value: '0' },
                    })
                } else {
                    tempRecord = Object.assign(tempRecord, {
                        exercise: { value: '--' },
                    })
                }
                if (patients[i].needToDo.insulin.status == 'unrecorded') {
                    tempRecord = Object.assign(tempRecord, {
                        insulin: { value: '0' },
                    })
                } else {
                    tempRecord = Object.assign(tempRecord, {
                        insulin: { value: '--' },
                    })
                }
                if (patients[i].needToDo.weight.status == 'unrecorded') {
                    tempRecord = Object.assign(tempRecord, {
                        weight: { value: '0' },
                    })
                } else {
                    tempRecord = Object.assign(tempRecord, {
                        weight: { value: '--' },
                    })
                }

                allRecords.push(
                    Object.assign(
                        { patID: patients[i]._id },
                        patients[i],
                        tempRecord
                    )
                )
                const patientId = patients[i]._id
                const onePatient = await Patients.findById(patientId)
                const patientName =
                    onePatient.firstName + ' ' + onePatient.lastName
                findOrCreateRecord(patientId, patientName)
            } else {
                // if patients have records, then store all today's comments
                const patientInfo = await Patients.findById(
                    patients[i]._id
                ).lean()
                if (patientInfo.needToDo.bloodSugar.status == 'no') {
                    tempRecord = { bloodSugar: { value: '--' } }
                } else {
                    if (
                        patientInfo.needToDo.bloodSugar.status == 'unrecorded'
                    ) {
                        tempRecord.bloodSugar.value = 'N/A'
                    }

                    if (tempRecord.bloodSugar.comState == 'recorded') {
                        allComments.push(
                            Object.assign(
                                { patID: patients[i]._id },
                                patients[i],
                                tempRecord.bloodSugar
                            )
                        )
                    }
                }

                if (patientInfo.needToDo.exercise.status == 'no') {
                    tempRecord = Object.assign(tempRecord, {
                        exercise: { value: '--' },
                    })
                } else {
                    if (patientInfo.needToDo.exercise.status == 'unrecorded') {
                        tempRecord.exercise.value = 'N/A'
                    }

                    if (tempRecord.exercise.comState == 'recorded') {
                        allComments.push(
                            Object.assign(
                                { patID: patients[i]._id },
                                patients[i],
                                tempRecord.exercise
                            )
                        )
                    }
                }

                if (patientInfo.needToDo.insulin.status == 'no') {
                    tempRecord = Object.assign(tempRecord, {
                        insulin: { value: '--' },
                    })
                } else {
                    if (patientInfo.needToDo.insulin.status == 'unrecorded') {
                        tempRecord.insulin.value = 'N/A'
                    }

                    if (tempRecord.insulin.comState == 'recorded') {
                        allComments.push(
                            Object.assign(
                                { patID: patients[i]._id },
                                patients[i],
                                tempRecord.insulin
                            )
                        )
                    }
                }

                if (patientInfo.needToDo.weight.status == 'no') {
                    tempRecord = Object.assign(tempRecord, {
                        weight: { value: '--' },
                    })
                } else {
                    if (patientInfo.needToDo.weight.status == 'unrecorded') {
                        tempRecord.weight.value = 'N/A'
                    }

                    if (tempRecord.weight.comState == 'recorded') {
                        allComments.push(
                            Object.assign(
                                { patID: patients[i]._id },
                                patients[i],
                                tempRecord.weight
                            )
                        )
                    }
                }
            }
            // combined each patients and each patients' records in the same object
            // var temp = Object.assign({patID: patients[i]._id},patients[i], tempRecord)
            // allRecords.push(temp)
            allRecords.push(
                Object.assign(
                    { patID: patients[i]._id },
                    patients[i],
                    tempRecord
                )
            )
        }
        return res.render('clinicianDashboard', {
            recordsData: allRecords,
            clinicianData: clinicianData,
            recordsComent: allComments,
        })
    } catch (err) {
        res.render('404not_found.hbs')
        return next(err)
    }
}

// Used to render patient's detail page
const getDataById = async (req, res, next) => {
    try {
        // obtain the patient information and sent to hbs to render
        const patientId = req.params.patient_id
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }

        const onePatient = await Patients.findById(patientId).lean()
        const patientName = onePatient.firstName + ' ' + onePatient.lastName
        const node = onePatient.noteList[0]

        const date = new Date().toLocaleDateString('en-Au', {
            timeZone: 'Australia/Melbourne',
        })

        // use patient id to find today's record
        var record = await Records.find({
            patientId: patientId,
            recordDate: date,
        }).lean()

        // use patient id to find all the record
        var recor = await Records.find({ patientId: patientId }).lean()

        // check if recorded then send to hds to render
        const allComments = []
        for (var rec of recor) {
            if (rec.bloodSugar.comState == 'recorded') {
                allComments.push(
                    Object.assign({ day: rec.recordDate }, rec.bloodSugar)
                )
            }
            if (rec.exercise.comState == 'recorded') {
                allComments.push(
                    Object.assign({ day: rec.recordDate }, rec.exercise)
                )
            }
            if (rec.insulin.comState == 'recorded') {
                allComments.push(
                    Object.assign({ day: rec.recordDate }, rec.insulin)
                )
            }
            if (rec.weight.comState == 'recorded') {
                allComments.push(
                    Object.assign({ day: rec.recordDate }, rec.weight)
                )
            }
        }

        return res.render('clinicianDetailed', {
            patientName: patientName,
            patientId: patientId.toString(),
            patientInfo: onePatient,
            recordData: record[0],
            node: node,
            clinicianData: clinicianData,
            url: '/clinician/dashboard/',
            recordsComent: allComments,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Login
const loginPage = async (req, res, next) => {
    try {
        res.render('login', req.session.flash)
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Logout
const logoutPage = (req, res) => {
    req.logout()
    res.redirect('/clinician')
}

// Use to render Createclinician page
const renderCreateClinician = async (req, res, next) => {
    try {
        res.render('createClinician')
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Receive the data from hbs then create new clinician
const createClinician = async (req, res, next) => {
    try {
        // firstly check is it exit
        const clinicianInfo = await Clinicians.findOne({
            email: req.body.email.toLowerCase(),
        }).lean()

        // if not then create one
        if (clinicianInfo == null) {
            const newClinician = new Clinicians({
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                yearOfBirth: req.body.year,
                workPlace: req.body.place,
            })
            await newClinician.save()
        } else {
            var message = 'Email already exist!'
            return res.render('createClinician', {
                input: req.body,
                message: message,
            })
        }
        res.redirect('/clinician')
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Render create patient
const renderCreatePatient = async (req, res, next) => {
    try {
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }

        res.render('createpatient.hbs', {
            clinicianData: clinicianData,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Receive the patient information from hbs then create patient
const createPatient = async (req, res, next) => {
    try {
        // firstly check is it exit
        const clinicianData = await Clinicians.findById(req.user._id)
        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }
        var email = req.body.email
        const patientInfo = await Patients.findOne({
            email: email.toLowerCase(),
        }).lean()
        const name = 'User' + ((await Patients.find()).length + 1).toString()

        // if not then create one
        if (patientInfo == null) {
            if (req.body.password.length < 8 && req.body.password.length > 16) {
                return res.render('createpatient.hbs', {
                    clinicianData: clinicianData,
                    message: 'Enter at least 8 digit password!',
                })
            }
            const newPatient = new Patients({
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: email.toLowerCase(),
                password: req.body.password,
                yearOfBirth: req.body.year,
                sex: req.body.sex,
                screenName: name,
                creatAt: new Date().toLocaleDateString('en-Au', {
                    timeZone: 'Australia/Melbourne',
                }),
            })
            await newPatient.save()
            const clinician = await Clinicians.findById(req.user._id)
            clinician.patientsList.push({ patientId: newPatient._id })
            await clinician.save()
            return res.render('createpatient.hbs', {
                clinicianData: clinicianData,
                message: 'Successfully Created!',
            })
        }
        return res.render('createpatient.hbs', {
            clinicianData: clinicianData,
            message: 'Patient already exist!',
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Use to render clinician Profile page
const clinicianProfile = async (req, res, next) => {
    try {
        // obtain current clinician's information then send to hbs to render
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }

        // obtain current clinician's information then send to hbs to render
        const clinician = await Clinicians.findById(req.user._id).lean()

        return res.render('clinicianProfile.hbs', {
            clinicianData: clinicianData,
            clinicianInfo: clinician,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// For patient notes
const renderPatientNotes = async (req, res, next) => {
    try {
        // obtain current clinician's information then send to hbs to render
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }

        // obtain the current patient information
        const patientId = req.params.patient_id
        const onePatient = await Patients.findById(patientId).lean()
        const patientName = onePatient.firstName + ' ' + onePatient.lastName
        const node = onePatient.noteList[0]

        // got all the records and get all recorder comment send to hbs
        const Reco = require('../models/records')
        var rec = await Reco.find({ patientId: patientId }).lean()
        const allComments = []
        for (var record of rec) {
            if (record.bloodSugar.comState == 'recorded') {
                allComments.push(record.bloodSugar)
            }
            if (record.exercise.comState == 'recorded') {
                allComments.push(record.exercise)
            }
            if (record.insulin.comState == 'recorded') {
                allComments.push(record.insulin)
            }
            if (record.weight.comState == 'recorded') {
                allComments.push(record.weight)
            }
        }

        return res.render('clinician_notes.hbs', {
            patientName: patientName,
            patientId: patientId.toString(),
            patientInfo: onePatient,
            recordData: record,
            node: node,
            clinicianData: clinicianData,
            notes: onePatient.noteList,
            url: '/clinician/dashboard/' + patientId.toString(),
            recordsComent: allComments,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Used for different page's colour
function getChartAndColor(task) {
    var list = []
    if (task == 'bloodSugar') {
        list.push('line')
        list.push('#B93032')
        list.push('mmol/L')
    } else if (task == 'weight') {
        list.push('line')
        list.push('#5EB683')
        list.push('kg')
    } else if (task == 'insulin') {
        list.push('bar')
        list.push('#4A9DC1')
        list.push('dose(s)')
    } else if (task == 'exercise') {
        list.push('bar')
        list.push('#FDB86D')
        list.push('step(s)')
    }
    return list
}

// Obtain patient information to render patient's personal task page
const getPatientData = async (req, res, next) => {
    try {
        // obtain current clinician's information then send to hbs to render
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }

        // find patient id and all infomation
        const patientId = req.params.patient_id
        const onePatient = await Patients.findById(patientId)
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the record
        const task = req.params.taskPage
        const graphColor = getChartAndColor(task)
        const records = await Records.find({ patientId: patientId }).lean()

        //create a list 7days
        const weeklist = getDateList(7)
        const taskData = []
        for (date of weeklist) {
            oneRecord = records.find((arecord) => {
                return arecord.recordDate == date
            })
            if (oneRecord && oneRecord[task]) {
                taskData.push(oneRecord[task].value)
            } else {
                taskData.push(0)
            }
        }

        dayMon = []
        for (let i = 0; i < weeklist.length; i++) {
            dayMon.push(changeDateFormat(weeklist[i], false))
        }
        const patientInfo = await Patients.findById(patientId).lean()
        const node = patientInfo.noteList[0]
        const rangeInformation = patientInfo.needToDo[task]

        const day = new Date().toLocaleDateString('en-Au', {
            timeZone: 'Australia/Melbourne',
        })

        // // find each patients' today's records and comments
        var record = (
            await Records.find({ patientId: req.params.patient_id })
                .find({ recordDate: day })
                .lean()
        )[0]

        var recor = await Records.find({ patientId: patientId }).lean()

        // check if recorded then send to hds to render
        const allComments = []
        for (var rec of recor) {
            if (rec[task].comState == 'recorded') {
                allComments.push(
                    Object.assign({ day: rec.recordDate }, rec[task])
                )
            }
        }
        return res.render('clinician_' + task, {
            patientName: patientName,
            patientInfo: patientInfo,
            patientId: patientId,
            recordData: record,
            node: node,
            clinicianData: clinicianData,
            url: '/clinician/dashboard/' + patientId.toString(),
            url2:
                '/clinician/dashboard/' +
                patientId.toString() +
                '/' +
                task.toString() +
                '/history',
            task: task[0].toUpperCase() + task.substring(1),
            rangeInformation: rangeInformation,
            data: JSON.stringify(taskData),
            date: JSON.stringify(dayMon),
            graphType: JSON.stringify(graphColor[0]),
            colour: JSON.stringify(graphColor[1]),
            recordsComent: allComments,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Use to render each task page's history data
const getBglHistory = async (req, res, next) => {
    try {
        // obtain current clinician's information then send to hbs to render
        const clinicianData = await Clinicians.findById(req.user._id)

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }

        // obtain current patient's information
        const patientId = req.params.patient_id
        const patientInfo = await Patients.findById(patientId)
        const task = req.params.taskPage
        const graphColor = getChartAndColor(task)
        const records = await Records.find({ patientId: patientId }).lean()

        //create a list 7days
        const weeklist = getDateList(7)
        const taskData = []
        for (date of weeklist) {
            oneRecord = records.find((arecord) => {
                return arecord.recordDate == date
            })
            if (oneRecord) {
                taskData.push(oneRecord[task].value)
            } else {
                taskData.push(0)
            }
        }

        dayMon = []
        for (let i = 0; i < weeklist.length; i++) {
            dayMon.push(changeDateFormat(weeklist[i], false))
        }

        // find current patients comment history and record history
        const Rec = require('../models/records')
        var record = await Rec.find({ patientId: patientInfo.id }).lean()
        allComments = []
        allRecords = []

        for (var rec of record) {
            if (rec[task].status == 'recorded') {
                allRecords.push(
                    Object.assign({ day: rec.recordDate }, rec[task])
                )
            }
            if (rec[task].comState == 'recorded') {
                allComments.push(
                    Object.assign({ day: rec.recordDate }, rec[task])
                )
            }
        }

        // use to make first character upper case
        function titleCase(str) {
            newStr = str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
            return newStr
        }

        var newtask = titleCase(task)

        return res.render('clinician_bgl_history.hbs', {
            recordsComent: allComments,
            recordData: allRecords,
            clinicianData: clinicianData,
            patientId: patientId,
            url: '/clinician/dashboard/' + patientId.toString(),
            task: newtask,
            data: JSON.stringify(taskData),
            date: JSON.stringify(dayMon),
            graphType: JSON.stringify(graphColor[0]),
            colour: JSON.stringify(graphColor[1]),
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Used to change range & task & quickNote & support message
const setRange = async (req, res, next) => {
    try {
        // firstly receive patient's information
        const task = req.params.taskPage
        const patientInfo = await Patients.findById(req.params.patient_id)
        var patientId = req.params.patient_id
        var url = '/clinician/dashboard/' + patientId.toString()

        // count patient's need to do and check the task state within each post
        var num = 0
        if (
            req.body.bloodSugar == null &&
            req.body.exercise == null &&
            req.body.weight == null &&
            req.body.insulin == null
        ) {
        } else {
            if (req.body.bloodSugar == 'Select') {
                patientInfo.needToDo.bloodSugar.status = 'unrecorded'
                num++
            } else if (req.body.bloodSugar == 'on') {
                if (patientInfo.needToDo.bloodSugar.status == 'unrecorded') {
                    num++
                }
            } else {
                patientInfo.needToDo.bloodSugar.status = 'no'
            }

            if (req.body.exercise == 'Select') {
                patientInfo.needToDo.exercise.status = 'unrecorded'
                num++
            } else if (req.body.exercise == 'on') {
                if (patientInfo.needToDo.exercise.status == 'unrecorded') {
                    num++
                }
            } else {
                patientInfo.needToDo.exercise.status = 'no'
            }

            if (req.body.weight == 'Select') {
                patientInfo.needToDo.weight.status = 'unrecorded'
                num++
            } else if (req.body.weight == 'on') {
                if (patientInfo.needToDo.weight.status == 'unrecorded') {
                    num++
                }
            } else {
                patientInfo.needToDo.weight.status = 'no'
            }

            if (req.body.insulin == 'Select') {
                patientInfo.needToDo.insulin.status = 'unrecorded'
                num++
            } else if (req.body.insulin == 'on') {
                if (patientInfo.needToDo.insulin.status == 'unrecorded') {
                    num++
                }
            } else {
                patientInfo.needToDo.insulin.status = 'no'
            }
            patientInfo.unfinishedTaskNum = num
            await patientInfo.save()
        }

        // update quickNote information
        if (!req.body.quickNote) {
        } else {
            var note = req.body.quickNote
            var newNote = note.trim()
            if (newNote.length === 0) {
                return res.redirect(url)
            }
            patientInfo.noteList.unshift({
                note: newNote,
                time: new Date().toLocaleString('en-Au', {
                    timeZone: 'Australia/Melbourne',
                }),
            })
            await patientInfo.save()
        }

        // update support message
        if (!req.body.supportMessage) {
        } else {
            var supportMsg = req.body.supportMessage
            patientInfo.supportMessage = supportMsg.trim()
            await patientInfo.save()
        }

        // update range
        if (!req.body.min) {
        } else {
            patientInfo.needToDo[task].min = req.body.min
            patientInfo.needToDo[task].max = req.body.max

            await patientInfo.save()
        }
        return res.redirect(url)
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// update clinician profile
const updateClinicanProfile = async (req, res) => {
    try {
        // obtain current clinician's information then send to hbs to render
        const clinicianData = await Clinicians.findById(req.user._id)
        const clinician = await Clinicians.findById(req.user._id).lean()

        // check the is there have a clinicians first
        if (clinicianData == null) {
            req.logout()
            res.redirect('/clinician')
        }
        if (req.body.place == null) {
        } else {
            clinicianData.workPlace = req.body.place
        }

        if (
            req.body.password.length < 8 &&
            req.body.password != null &&
            req.body.password.length > 16
        ) {
            return res.render('clinicianProfile.hbs', {
                clinicianData: clinicianData,
                clinicianInfo: clinician,
                message: 'Enter 8-16 characters!',
            })
        } else if (req.body.password != null) {
            clinicianData.password = req.body.password
            await clinicianData.save()
            const clinicianDa = await Clinicians.findById(req.user._id)
            return res.render('clinicianProfile.hbs', {
                clinicianData: clinicianDa,
                clinicianInfo: clinician,
                GoodMessage: 'Password Changed!',
            })
        }
        // receive the information from hbs then change it
        await clinicianData.save()
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Exports an object, which contain functions imported by router
module.exports = {
    getAllRecords,
    getDataById,
    loginPage,
    logoutPage,
    clinicianProfile,
    renderCreateClinician,
    createPatient,
    renderCreatePatient,
    createClinician,
    getPatientData,
    renderPatientNotes,
    getBglHistory,
    setRange,
    updateClinicanProfile,
}
