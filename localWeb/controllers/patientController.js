// import patient model
const Patients = require('../models/patients')
const Records = require('../models/records')

// generate the data as given formate
function generateDate(date) {
    var newDate = new Date(date),
        month = "" + (newDate.getMonth() + 1),
        day = "" + newDate.getDate(),
        year = newDate.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

async function findOrCreatePatient() {
    try {
        // if patients collection is empty, add the patient to the database
        const patients = await Patients.find().lean();
        if (patients.length == 0) {
            const newPatient = new Patients({
                firstName: "Pat",
                lastName: "Smith",
                screenName: "Pat",
                unfinishedTaskNum: 4,
                email: "pat56417@gmail.com",
                password: "12345678",
                yearOfBirth: "1960",
                textBio: "Do more exercises!",
                supportMessage: "Happy birthday!!",
                creatAt: new Date().toLocaleDateString("en-Au", {"timeZone": "Australia/Melbourne"})
            });

            // save new patient
            const patient = await newPatient.save();
            return patient._id;
        } else {
            // find the patient
            const patient = await Patients.findOne({ firstName: "Pat" });
            return patient._id;
        }
    } catch (err) {
        console.log("Error in finding or creating patient: ", err);
    }
}

async function findOrCreateRecord(patientId, patientName) {
    try {
        // find the newest record
        const currentRecord = await Records.findOne({
            recordDate: new Date().toLocaleDateString("en-Au", {"timeZone": "Australia/Melbourne"}),
            patientId: patientId,
            patientName: patientName,
        }).lean();
        console.log("Today's date:", new Date().toLocaleDateString("en-Au", {"timeZone": "Australia/Melbourne"}))
        // console.log("---find record:", currentRecord)

        // create a new record
        if (!currentRecord) {
            const newRecord = new Records({
                recordDate: new Date().toLocaleDateString("en-Au", {"timeZone": "Australia/Melbourne"}),
                patientId: patientId,
                patientName: patientName,
            });

            // save the new record
            const record = await newRecord.save()
            const onePatient = await Patients.findById(patientId)
            onePatient.recordsList.push({ recordId: record._id })
            // console.log("RecordList: ", onePatient.recordsList)
            await onePatient.save()
            return record._id;
        } else {
            // console.log("---find record:", currentRecord._id)
            return currentRecord._id;
        }
    } catch (err) {
        console.log("Error in finding or creating record: ", err);
    }
}

// handle request to get all patient data instances
const getAllPatientData = async (req, res, next) => {
    try {
        const patients = await Patients.find().lean()

        return res.render('allData', { patientData: patients })
    } catch (err) {
        return next(err)
    }
}

// handle request to get one data instance
const getDataById = async (req, res, next) => {
    try {
        // find patient full name
        const patient = await Patients.findById(req.params.patient_id)
        const patientName = patient.firstName + ' ' + patient.lastName

        // according to the name and id find the record
        const recordId = await findOrCreateRecord(req.params.patient_id, patientName)
        // const record = await Records.findById(recordId).lean()

        // const patientData = await patient.populate({path: 'recordsList', 
        //                                     populate: {path: 'recordId', 
        //                                     select: ('bloodSugar exercise weight insulin'), 
        //                                     options: {lean: true}}});
        // const eachPatient = await Patients.findById(req.params.patient_id).lean()
        // const patientRecord = Object.assign(eachPatient,(await Records.find({patientId:req.params.patient_id}).lean().sort({"recordDate":-1}))[0])
        // const patientRecord = Records.findById(recordId).lean()
        // const newIndex = patient.recordsList.length - 1
        // const patientRecord = patientData.recordsList[newIndex].recordId

        // const patientInfo = Object.assign(patient, patientRecord)
        // console.log('record: ', record.bloodSugar.status == 'recorded')

        const patientInfo = await Patients.findById(req.params.patient_id).lean()
        // console.log('patientInfo: ', patient)

        // const eachPatient = Object.assign(eachPatient,(await Records.find({patientId:eachPatient._id}).lean().sort({"recordDate":-1}))[0])

        return res.render('patientDashboard', { patientInfo: patientInfo })
    } catch (err) {
        return next(err)
    }
}

// render the blood sugar page for patient
const renderTaskPage = async (req, res, next) => {
    try {
        // find patient id
        const patientId = await findOrCreatePatient()
        
        // find patient full name
        const onePatient = await Patients.findById(patientId)
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the record
        const recordId = await findOrCreateRecord(patientId, patientName)
        // const record = await Records.findOne({ _id: recordId }).populate('patientId').lean();  .populate({path: 'recordsList', populate: {path: 'recordId', options: {lean: true}}})
        // const record = Object.assign(onePatient, await Records.findById(recordId));.populate({path: 'recordId', options: {lean: true}})
        // const record = await onePatient.populate({path: 'recordsList', populate: {path: 'recordId', options: {lean: true}}});
        const record = await Records.findById(recordId).populate('patientId').lean()
        const patientInfo = await Patients.findById(patientId).lean()
        // var c = new Date().toLocaleDateString("en-Au", {"timeZone": "Australia/Melbourne"})
        // console.log("----onePatient in render function: ", onePatient)  
        return res.render('PatientBloodSugarPage', { newRecord: record, patientInfo: patientInfo})
    } catch (err) {
        return next(err)
    }
}

// receive the input record from patient, and save to database
const addPatientRecord = async (req, res, next) => {
    try {
        // find patient id
        const patientId = await findOrCreatePatient()

        // find patient full name
        const onePatient = await Patients.findById(patientId)
        // console.log(onePatient)
        const patientName = onePatient.firstName + ' ' + onePatient.lastName

        // according to the name and id find the record
        const recordId = await findOrCreateRecord(patientId, patientName)

        const todayRecord = await Records.findById(recordId)
        //console.log("--Record: ", todayRecord)  
        // .populate('patientId')

        if (todayRecord.bloodSugar.status === 'unrecorded') {
            todayRecord.bloodSugar.value = req.body.measurement
            todayRecord.bloodSugar.time = new Date().toLocaleTimeString('en-Au', { 'timeZone': "Australia/Melbourne" })
            todayRecord.bloodSugar.status = 'recorded'
            onePatient.unfinishedTaskNum = onePatient.unfinishedTaskNum - 1
            onePatient.needToDo.bloodSugar.status = 'recorded'

            // console.log("--Value: ", req.body.measurement)
            // console.log("--Date: ", req.body.date)
            // console.log("--Time: ", req.body.time)
        }

        if (req.body.comment != undefined && todayRecord.bloodSugar.comState == 'unrecorded'
            && todayRecord.bloodSugar.status != 'unrecorded') {
            todayRecord.bloodSugar.comment = req.body.comment
            todayRecord.bloodSugar.comState = 'recorded'
            console.log("--Comment: ", todayRecord.bloodSugar.comment)
        }

        await todayRecord.save();
        await onePatient.save();

        return res.redirect('/patient/' + patientId + '/PatientBloodSugarPage')
    } catch (err) {
        console.log('Error in addrecord funtion: ', err)
        return next(err)
    }
}


// const { _id, firstName, lastName } = req.body
// peoplatient.push({ _id, firstName, lastName })
// return res.redirect('back')
// exports an object, which contain functions imported by router


module.exports = {
    getAllPatientData,
    getDataById,
    renderTaskPage,
    addPatientRecord
}
