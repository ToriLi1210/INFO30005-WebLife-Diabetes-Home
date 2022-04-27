const mongoose = require('mongoose')

const clinicianSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    workPlace: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    yearOfBirth: { type: Number, required: true, min: 1900, max: 2022 },
    textBio: { type: String, default: "" },
    patientsList: [{
        patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patients"},
    }],
})
const Clinicians = mongoose.model('Clinicians', clinicianSchema)
module.exports = Clinicians