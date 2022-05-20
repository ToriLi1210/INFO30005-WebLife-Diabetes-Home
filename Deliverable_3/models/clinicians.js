const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Password salt factor
const SALT_FACTOR = 10

const clinicianSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    workPlace: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        set: (val) => {
            return bcrypt.hashSync(val, SALT_FACTOR)
        },
        required: true,
    },
    yearOfBirth: { type: Number, required: true, min: 1900, max: 2022 },
    textBio: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: { type: String, default: 'clinician' },
    patientsList: [
        {
            patientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Patients',
            },
        },
    ],
})

const Clinicians = mongoose.model('Clinicians', clinicianSchema)
module.exports = Clinicians
