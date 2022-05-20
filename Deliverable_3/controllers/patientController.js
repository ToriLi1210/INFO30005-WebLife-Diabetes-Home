// Import patient model
const Clinicians = require('../models/clinicians')
const Patients = require('../models/patients')
const Records = require('../models/records')
const bcrypt = require('bcryptjs')

// This function is used to change the data format
function changeDateFormat(date, containYear) {
    var day = date.slice(0, 2)
    var mon = date.slice(3, 5)
    var year = date.slice(6, 10)

    if (containYear) {
        return [mon, day, year].join('/')
    }
    return [mon, day].join('/')
}
//
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

async function updateRecordedDay(patientId) {
    try {
        const records = (
            await Records.find({ patientId: patientId }).lean()
        ).filter((recordedRecord) => {
            if (
                recordedRecord.bloodSugar.status == 'recorded' ||
                recordedRecord.exercise.status == 'recorded' ||
                recordedRecord.insulin.status == 'recorded' ||
                recordedRecord.weight.status == 'recorded'
            ) {
                return true
            }
            return false
        })
        const patient = await Patients.findById(patientId)
        patient.recordedDay = records.length
        await patient.save()
        return records.length
    } catch (err) {
        console.log('Error in updateRecordedDay funtion: ', err)
        res.render('404not_found.hbs')
    }
}

async function getEngagementRate(patientId) {
    try {
        var oneDayTime = 24 * 60 * 60 * 1000
        const infoPatient = await Patients.findById(patientId)
        const recordedDay = await updateRecordedDay(patientId)
        const startTime = new Date(changeDateFormat(infoPatient.creatAt, true))
        const newTime = new Date(
            changeDateFormat(
                new Date().toLocaleDateString('en-Au', {
                    timeZone: 'Australia/Melbourne',
                }),
                true
            )
        )
        const duration = parseInt((newTime - startTime) / oneDayTime) + 1
        const eRate = (recordedDay / duration) * 100
        infoPatient.engagementRate = eRate
        await infoPatient.save()
        return eRate
    } catch (err) {
        console.log('Error in getEngagementRate funtion: ', err)
        res.render('404not_found.hbs')
    }
}

// Update the patient information
async function updatePatient(patientId) {
    try {
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
        console.log('Error in update patient function: ', err)
        res.render('404not_found.hbs')
    }
}

// Find the newest record, if not exist, then creat a new record
async function findOrCreateRecord(patientId, patientName) {
    try {
        var allTask = ['bloodSugar', 'exercise', 'weight', 'insulin']
        const onePatient = await Patients.findById(patientId)
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
        console.log('Error in finding or creating record: ', err)
        res.render('404not_found.hbs')
    }
}
// patient login page
const loginPage = async (req, res, next) => {
    try {
        res.render('patientLogin', req.session.flash)
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// patient logout
const logoutPage = async (req, res) => {
    req.logout()
    res.redirect('/patient/login')
}

// Handle request to get one patient dashboard
const getPatientDataById = async (req, res, next) => {
    try {
        // find patient full name and all infomation
        const patient = await Patients.findById(req.user._id)
        if (patient == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        const patientName = patient.firstName + ' ' + patient.lastName

        // according to the name and id find or creat the record
        await findOrCreateRecord(req.user._id, patientName)

        // get the engagement rate of patient
        await getEngagementRate(req.user._id)
        const patientInfo = await Patients.findById(req.user._id).lean()
        const eRate = Math.round(patientInfo.engagementRate)
        return res.render('patientDashboard', {
            patientInfo: patientInfo,
            eRate: eRate,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

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

// Render each task page for patient
const renderOneTaskPage = async (req, res, next) => {
    try {
        // find patient id and all infomation
        const patientId = req.user._id

        // find patient full name
        const onePatient = await Patients.findById(patientId)
        if (onePatient == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the record
        const task = req.params.taskPage
        const graphColor = getChartAndColor(task)

        //patient record include information about all record
        const records = await Records.find({ patientId: patientId }).lean()
        const recordId = await findOrCreateRecord(patientId, patientName)
        const record = await Records.findById(recordId).lean()
        const oneTaskRecord = await Records.findOne(
            { _id: recordId },
            { _id: false, [task]: true }
        ).lean()

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

        // render the patient task page
        return res.render('task', {
            newRecord: oneTaskRecord,
            task: task.toString(),
            unit: graphColor[2],
            recordDate: record.recordDate,
            data: JSON.stringify(taskData),
            date: JSON.stringify(dayMon),
            graphType: JSON.stringify(graphColor[0]),
            colour: JSON.stringify(graphColor[1]),
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// render patient profile
const getPatientProfile = async (req, res, next) => {
    try {
        const patientInfo = await Patients.findById(req.user._id).lean()
        if (patientInfo == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        var age = new Date().getFullYear() - patientInfo.yearOfBirth
        const clinicians = await Clinicians.find(
            {},
            { firstName: true, lastName: true, patientsList: true }
        )
        var clinicianName
        var flag = false
        for (var each of clinicians) {
            for (var patient of each.patientsList) {
                if (patient.patientId.toString() == req.user._id.toString()) {
                    flag = true
                    break
                }
            }
            if (flag == true) {
                clinicianName = each.firstName + ' ' + each.lastName
                break
            }
        }
        res.render('patientProfile', {
            patientInfo: patientInfo,
            age: age,
            clinicianName: clinicianName,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

const renderPwd = async (req, res, next) => {
    try {
        res.render('updatePassword')
    } catch (err) {
        res.render('404not_found.hbs')
        return next(err)
    }
}

const updatePwd = async (req, res, next) => {
    try {
        const patientInfo = await Patients.findById(req.user._id)
        // check login state
        if (patientInfo == null) {
            req.logout()
            res.redirect('/patient/login')
        }

        // check password validation
        if (
            req.body.newpassword1.length < 8 &&
            req.body.newpassword1.length > 16
        ) {
            return res.render('updatePassword', {
                input: req.body,
                message: 'Enter at least 8 digit!',
            })
        }
        if (
            !(await bcrypt.compare(req.body.oldpassword, patientInfo.password))
        ) {
            return res.render('updatePassword', {
                input: req.body,
                message: 'Incorrect Current password!',
            })
        }
        if (req.body.oldpassword == req.body.newpassword1) {
            return res.render('updatePassword', {
                input: req.body,
                message: 'New password is the same as the old!',
            })
        }
        if (!(req.body.newpassword1 == req.body.newpassword2)) {
            return res.render('updatePassword', {
                input: req.body,
                message: 'New password is not match with confirm!',
            })
        }
        patientInfo.password = req.body.newpassword2
        await patientInfo.save()
        res.render('updatePassword', {
            message: 'Successfully change password!',
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

const changeProfile = async (req, res, next) => {
    try {
        const patientInfo = await Patients.findById(req.user._id).lean()
        var age = new Date().getFullYear() - patientInfo.yearOfBirth
        res.render('updatePatientProfile', {
            patientInfo: patientInfo,
            age: age,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

const updateProfile = async (req, res, next) => {
    try {
        // use for render the page
        const patientInfo = await Patients.findById(req.user._id).lean()
        if (patientInfo == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        //use for store the information
        const onePatient = await Patients.findById(req.user._id)

        // find all patients' screen name
        const allScreenName = await Patients.find({}, { screenName: true })
        var message = ''
        // check validation
        var screenName = req.body.screenName
        if (screenName != '') {
            if (
                screenName.match(/[.,\/#!$%\^&\*;:@{}=\-_`~()?<>]/g) != null ||
                screenName.trim().length === 0
            ) {
                return res.render('updatePatientProfile', {
                    message:
                        'Invalid screen name (cannot be empty or punctuation)!',
                })
            }
            // if name is valide
            else if (
                screenName.trim() != '' &&
                screenName.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?<>]/g) == null
            ) {
                // check name repeatation
                for (var patient of allScreenName) {
                    if (screenName.trim() == patient.screenName) {
                        return res.render('updatePatientProfile', {
                            patientInfo: patientInfo,
                            input: req.body,
                            message: 'Screen name already exist!',
                        })
                    }
                }
                message += 'Screen name changed! '
                onePatient.screenName = screenName.trim()
            }
        }
        message += 'Unchange screen name. '
        var bio = req.body.bio
        var newBio = bio.trim()
        var bioLength = newBio.length
        if (bio != undefined) {
            if ((bio = '')) {
                // store the screen name and bio
                onePatient.textBio = bio
            } else if (bioLength === 0) {
                return res.render('updatePatientProfile', {
                    patientInfo: patientInfo,
                    input: req.body,
                    message: "Please don't update white space!",
                })
            } else if (bioLength > 50) {
                return res.render('updatePatientProfile', {
                    patientInfo: patientInfo,
                    input: req.body,
                    message: 'Please enter no more than 50 characters!',
                })
            }

            // store the screen name and bio
            onePatient.textBio = newBio
        }
        await onePatient.save()
        res.render('updatePatientProfile', {
            patientInfo: req.body.screenName,
            input: req.body,
            message: message + 'Successfully change!',
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// Receive the input record and comment from patient, then save to database
const addPatientRecord = async (req, res, next) => {
    try {
        // find patient full name
        const onePatient = await Patients.findById(req.user._id)
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the new record
        const recordId = await findOrCreateRecord(req.user._id, patientName)
        const todayRecord = await Records.findById(recordId)
        const task = req.params.taskPage

        // first, recieve the input record data
        if (
            todayRecord[task].status == 'unrecorded' &&
            req.body.comment == undefined
        ) {
            todayRecord[task].value = req.body.measurement
            todayRecord[task].time = new Date().toLocaleTimeString('en-Au', {
                timeZone: 'Australia/Melbourne',
            })
            todayRecord[task].status = 'recorded'
            onePatient.unfinishedTaskNum = onePatient.unfinishedTaskNum - 1
            onePatient.needToDo[task].status = 'recorded'
        }

        // second, recieve the input comment
        if (req.body.comment != undefined) {
            var comment = req.body.comment
            var newComment = comment.trim()
            if (newComment.length === 0) {
                return res.redirect('/patient/dashboard/' + task)
            } else if (
                todayRecord[task].comState == 'unrecorded' &&
                todayRecord[task].status != 'unrecorded'
            ) {
                todayRecord[task].comment = newComment
                todayRecord[task].comState = 'recorded'
            }
        }

        // save the record, comment and the patient status
        await todayRecord.save()
        await onePatient.save()

        // redirect to the patient page
        return res.redirect('/patient/dashboard/' + task)
    } catch (err) {
        console.log('Error in addrecord funtion: ', err)
        return res.render('404not_found.hbs')
    }
}

// sort patient by engagement rate
const sortEngagementRate = async (req, res, next) => {
    try {
        // check whether the user have right to visit
        const patientInfo = await Patients.findById(req.user._id)
        var imageNo
        if (patientInfo == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        // change the tree for patient based on the record dayda
        const leaves = patientInfo.recordedDay
        if (leaves >= 0 && leaves < 20) {
            imageNo = 2
        } else if (leaves >= 20 && leaves < 40) {
            imageNo = 3
        } else if (leaves >= 40 && leaves < 60) {
            imageNo = 4
        } else if (leaves >= 60 && leaves < 80) {
            imageNo = 5
        } else if (leaves >= 80 && leaves < 100) {
            imageNo = 6
        } else if (leaves >= 100 && leaves < 120) {
            imageNo = 7
        } else if (leaves >= 120 && leaves < 140) {
            imageNo = 8
        } else if (leaves >= 140) {
            imageNo = 1
        }
        const patients = await Patients.find({}, {})
        for (var patient of patients) {
            await getEngagementRate(patient._id)
        }
        var allPatient = await Patients.find(
            {},
            { screenName: true, engagementRate: true }
        ).lean()
        allPatient = allPatient.sort((a, b) => {
            return b.engagementRate - a.engagementRate
        })

        // check the rank for all patient
        var position = 0
        var screenName
        for (var index in allPatient) {
            if (allPatient[index]._id.toString() == req.user._id.toString()) {
                screenName = allPatient[index].screenName
                position = index
                break
            }
        }
        position = parseInt(position) + 1
        var topFive = allPatient.slice(0, 5)

        res.render('motivation', {
            first: topFive[0],
            second: topFive[1],
            third: topFive[2],
            fourth: topFive[3],
            fifth: topFive[4],
            position: position,
            screenName: screenName,
            image: imageNo,
        })
    } catch (err) {
        console.log('Error in sortEngagementRate funtion: ', err)
        return res.render('404not_found.hbs')
    }
}

// get all comment history
const renderCommentHistory = async (req, res, next) => {
    try {
        const task = req.params.taskPage

        // according to the name and id find today's record
        const patientId = req.user._id
        const onePatient = await Patients.findById(patientId)

        // check whether the user have right to visit
        if (onePatient == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        const patientName = onePatient.firstName + ' ' + onePatient.lastName
        const recordId = await findOrCreateRecord(patientId, patientName)

        // find all record of one patient
        const records = await Records.find({ patientId: patientId }).lean()

        // find one task today's record
        const oneTaskRecord = await Records.findOne(
            { _id: recordId },
            { _id: false, [task]: true }
        ).lean()

        const patientWithComment = await Patients.find({ _id: patientId })
            .populate({
                path: 'recordsList',
                populate: { path: 'recordId', options: { lean: true } },
            })
            .lean()

        // get the history commment
        var allComments = []
        for (var index in patientWithComment[0].recordsList) {
            if (
                patientWithComment[0].recordsList[index].recordId[task]
                    .comState == 'recorded'
            ) {
                var temp = [
                    {
                        date: patientWithComment[0].recordsList[index].recordId
                            .recordDate,
                    },
                    {
                        time: patientWithComment[0].recordsList[index].recordId[
                            task
                        ].time,
                    },
                    {
                        comment:
                            patientWithComment[0].recordsList[index].recordId[
                                task
                            ].comment,
                    },
                ]

                allComments.push(temp)
            }
        }

        // generate data used for plot graph
        const graphColor = getChartAndColor(task)
        const weeklist = getDateList(7)
        const taskData = []
        const dayMon = []
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

        for (let i = 0; i < weeklist.length; i++) {
            dayMon.push(changeDateFormat(weeklist[i], false))
        }

        // render the patient task page
        return res.render('patient_comment_history', {
            newRecord: oneTaskRecord,
            task: task.toString(),
            unit: graphColor[2],
            data: JSON.stringify(taskData),
            date: JSON.stringify(dayMon),
            graphType: JSON.stringify(graphColor[0]),
            colour: JSON.stringify(graphColor[1]),
            allComments: allComments,
        })
    } catch (err) {
        return res.render('404not_found.hbs')
    }
}

// render all record history
const renderRecordHistory = async (req, res, next) => {
    try {
        const task = req.params.taskPage

        // according to the name and id find today's record
        const patientId = req.user._id
        const onePatient = await Patients.findById(patientId)

        // check whether the user have right to visit
        if (onePatient == null) {
            req.logout()
            res.redirect('/patient/login')
        }
        const patientName = onePatient.firstName + ' ' + onePatient.lastName
        const recordId = await findOrCreateRecord(patientId, patientName)

        // find all record of one patient
        const records = await Records.find({ patientId: patientId }).lean()

        const patientWithRecord = await Patients.find({ _id: patientId })
            .populate({
                path: 'recordsList',
                populate: { path: 'recordId', options: { lean: true } },
            })
            .lean()

        // get records history
        var allRecords = []
        for (var index in patientWithRecord[0].recordsList) {
            if (
                patientWithRecord[0].recordsList[index].recordId[task].status ==
                'recorded'
            ) {
                var temp = [
                    {
                        date: patientWithRecord[0].recordsList[index].recordId
                            .recordDate,
                    },
                    {
                        time: patientWithRecord[0].recordsList[index].recordId[
                            task
                        ].time,
                    },
                    {
                        value: patientWithRecord[0].recordsList[index].recordId[
                            task
                        ].value,
                    },
                ]
                allRecords.push(temp)
            }
        }

        // find one task today's record
        const oneTaskRecord = await Records.findOne(
            { _id: recordId },
            { _id: false, [task]: true }
        ).lean()

        // generate data used for plot graph
        const graphColor = getChartAndColor(task)
        const weeklist = getDateList(7)
        const taskData = []
        const dayMon = []
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

        for (let i = 0; i < weeklist.length; i++) {
            dayMon.push(changeDateFormat(weeklist[i], false))
        }

        // render the patient task page
        return res.render('patient_record_history', {
            newRecord: oneTaskRecord,
            task: task.toString(),
            unit: graphColor[2],
            data: JSON.stringify(taskData),
            date: JSON.stringify(dayMon),
            graphType: JSON.stringify(graphColor[0]),
            colour: JSON.stringify(graphColor[1]),
            allRecords: allRecords,
        })
    } catch (err) {
        console.log('Error in renderOneHistory funtion: ', err)
        return res.render('404not_found.hbs')
    }
}

// Export the objects, which contain functions imported by router renderTaskPage,
module.exports = {
    getPatientDataById,
    addPatientRecord,
    renderOneTaskPage,
    loginPage,
    logoutPage,
    renderCommentHistory,
    sortEngagementRate,
    getPatientProfile,
    renderRecordHistory,
    renderPwd,
    updatePwd,
    changeProfile,
    updateProfile,
}
