// Import patient model
const Patients = require('../models/patients')
const Records = require('../models/records')

// Find the given patient, if not exist, then creat a new patient
async function findOrCreatePatient() {
    try {
        // if patients collection is empty, add the patient to the database
        const patients = await Patients.find().lean()
        if (patients.length == 0) {
            const newPatient = new Patients({
                firstName: 'Pat',
                lastName: 'Smith',
                screenName: 'Pat',
                unfinishedTaskNum: 4,
                email: 'pat56417@gmail.com',
                password: '12345678',
                yearOfBirth: '1960',
                textBio: 'Do more exercises!',
                supportMessage: 'Happy birthday!!',
                creatAt: new Date().toLocaleDateString('en-Au', {
                    timeZone: 'Australia/Melbourne',
                }),
            })

            // save new patient
            const patient = await newPatient.save()
            return patient._id
        } else {
            // find the patient
            const patient = await Patients.findOne({ firstName: 'Pat' })
            return patient._id
        }
    } catch (err) {
        console.log('Error in finding or creating patient: ', err)
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
            patientId: patientId,
            patientName: patientName,
        }).lean()

        // create a new record
        if (!currentRecord) {
            const newRecord = new Records({
                recordDate: new Date().toLocaleDateString('en-Au', {
                    timeZone: 'Australia/Melbourne',
                }),
                patientId: patientId,
                patientName: patientName,
            })

            // save the new record to database and the record list of patient
            const record = await newRecord.save()
            const onePatient = await Patients.findById(patientId)
            onePatient.recordsList.push({ recordId: record._id })
            await onePatient.save()

            return record._id
        } else {
            return currentRecord._id
        }
    } catch (err) {
        console.log('Error in finding or creating record: ', err)
    }
}

// Handle request to get all patient data instances
const getAllPatientData = async (req, res, next) => {
    try {
        const patients = await Patients.find().lean()

        return res.render('allData', { patientData: patients })
    } catch (err) {
        return next(err)
    }
}

// Handle request to get one patient data instance
const getDataById = async (req, res, next) => {
    try {
        // find patient full name and all infomation
        const patient = await Patients.findById(req.params.patient_id)
        const patientInfo = await Patients.findById(
            req.params.patient_id
        ).lean()
        const patientName = patient.firstName + ' ' + patient.lastName

        // according to the name and id find or creat the record
        const recordId = await findOrCreateRecord(
            req.params.patient_id,
            patientName
        )

        return res.render('patientDashboard', { patientInfo: patientInfo })
    } catch (err) {
        return next(err)
    }
}

// Render the blood sugar page for patient
const renderTaskPage = async (req, res, next) => {
    try {
        // find patient id and all infomation
        const patientId = await findOrCreatePatient()
        const patientInfo = await Patients.findById(patientId).lean()

        // find patient full name
        const onePatient = await Patients.findById(patientId)
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the record
        const recordId = await findOrCreateRecord(patientId, patientName)
        const record = await Records.findById(recordId)
            .populate('patientId')
            .lean()

        // render the patient page
        return res.render('PatientBloodSugarPage', {
            newRecord: record,
            patientInfo: patientInfo,
        })
    } catch (err) {
        return next(err)
    }
}

// Receive the input record and comment from patient, then save to database
const addPatientRecord = async (req, res, next) => {
    try {
        // find patient id
        const patientId = await findOrCreatePatient()

        // find patient full name
        const onePatient = await Patients.findById(patientId)
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the new record
        const recordId = await findOrCreateRecord(patientId, patientName)
        const todayRecord = await Records.findById(recordId)

        // first, recieve the input record data
        if (
            todayRecord.bloodSugar.status == 'unrecorded' &&
            req.body.comment == undefined
        ) {
            todayRecord.bloodSugar.value = req.body.measurement
            todayRecord.bloodSugar.time = new Date().toLocaleTimeString(
                'en-Au',
                {
                    timeZone: 'Australia/Melbourne',
                }
            )
            todayRecord.bloodSugar.status = 'recorded'
            onePatient.unfinishedTaskNum = onePatient.unfinishedTaskNum - 1
            onePatient.needToDo.bloodSugar.status = 'recorded'
        }

        // second, recieve the input comment
        if (
            req.body.comment != undefined &&
            todayRecord.bloodSugar.comState == 'unrecorded' &&
            todayRecord.bloodSugar.status != 'unrecorded'
        ) {
            todayRecord.bloodSugar.comment = req.body.comment
            todayRecord.bloodSugar.comState = 'recorded'
        }

        // save the record, comment and the patient status
        await todayRecord.save()
        await onePatient.save()

        // redirect to the patient page
        return res.redirect('/patient/' + patientId + '/PatientBloodSugarPage')
    } catch (err) {
        console.log('Error in addrecord funtion: ', err)
        return next(err)
    }
}

// Export the objects, which contain functions imported by router
module.exports = {
    getAllPatientData,
    getDataById,
    renderTaskPage,
    addPatientRecord,
}
