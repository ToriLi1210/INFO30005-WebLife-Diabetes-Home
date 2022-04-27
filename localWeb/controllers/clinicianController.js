// import patient model
const Clinicians = require('../models/clinicians')
const Records = require('../models/records')
const Patients = require('../models/patients');
// const { populate } = require('../models/clinicians');

async function findOrCreateClinician() {
    try {
        // if clinician collection is empty, add the clinician to the database
        const clinician = await Clinicians.find().lean();
        if (clinician.length == 0) {
            const newClinician = new Clinicians({
                firstName:"Chris",
                lastName:"Smith",
                email:"17638cr@gmail.com",
                textBio:"Responsibility!",
                yearOfBirth:"1985",
                workPlace:"Victoria Royal Hospital"
            });

            // save the clinician
            const clinician = await newClinician.save();

            return clinician._id;
        } else {
            // find the clinician
            const clinician = await Clinicians.findOne({ firstName: "Chris" });
            return clinician._id;
        }
    } catch (err) {
        console.log("Error in creating clinician: ", err);
    }
}

// handle request to get all patient data instances
const getAllRecords = async (req, res, next) => {
    try { 
        const clinicianId = await findOrCreateClinician()
        const clinicianData = await Clinicians.findById(clinicianId)
        const allRecords = []
        const allComments = []
        const patients = []
        
        const patientsListLength = (clinicianData.patientsList).length
        for (let i = 0; i < patientsListLength; i++){
            var patientId = (clinicianData.patientsList)[i]
            patients.push((await (Patients.find({_id:patientId}).lean()))[0])
        }

        patients.sort(function(a,b){
            if(a["firstName"] == b["firstName"]){
                return 1
            }else if(a["firstName"] < b["firstName"]){
                return -1
            }else{
                return 0
            }
        })
        patients.sort()
        const date = new Date().toLocaleDateString("en-Au", {"timeZone": "Australia/Melbourne"})

        // var myDate = new Date();
        // console.log(myDate.toLocaleDateString(),myDate.toLocaleTimeString())

        for (let i = 0; i < patients.length; i++){
            var tempRecord = (await Records.find({patientId:patients[i]._id}).lean().find({recordDate:date}))[0]
            if(tempRecord==null){
                if((patients[i].needToDo).bloodSugar.status == 'unrecorded'){
                    tempRecord = {'bloodSugar': {value:'0'}}
                }else{
                    tempRecord = ({'bloodSugar': {value:'--'}})
                }
                if((patients[i].needToDo).exercise.status == 'unrecorded'){
                    tempRecord = Object.assign(tempRecord,{'exercise':{value: 0}})
                }else{
                    tempRecord = Object.assign(tempRecord,{'exercise':{value:'--'}})
                }
                if((patients[i].needToDo).insulin.status == 'unrecorded'){
                    tempRecord = Object.assign(tempRecord,{'insulin':{value: 0}})
                }else{
                    tempRecord = Object.assign(tempRecord,{'insulin':{value:'--'}})
                }
                if((patients[i].needToDo).weight.status == 'unrecorded'){
                    tempRecord = Object.assign(tempRecord,{'weight':{value:'0'}})
                }else{
                    tempRecord = Object.assign(tempRecord,{'weight':{value:'--'}})
                }
            }else{
                if(tempRecord.bloodSugar.comState == 'recorded'){
                    allComments.push(tempRecord.bloodSugar)
                }
                if(tempRecord.exercise.comState == 'recorded'){
                    allComments.push(tempRecord.exercise)
                }
                if(tempRecord.insulin.comState == 'recorded'){
                    allComments.push(tempRecord.insulin)
                }
                if(tempRecord.weight.comState == 'recorded'){
                    allComments.push(tempRecord.weight)
                }
            }
            var temp = Object.assign(patients[i],tempRecord)
            allRecords.push(temp)
        }
        return res.render('clinicianDashboard', { recordsData: allRecords , clinicianData: clinicianData, recordsComent: allComments})
    } catch (err) {
        return next(err)
    }
}


// exports an object, which contain functions imported by router
module.exports = {
    getAllRecords
}
