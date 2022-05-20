const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Password salt factor
const SALT_FACTOR = 10

const patientSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    screenName: { type: String, required: true, unique: true, trim: true },
    unfinishedTaskNum: { type: Number, required: true, default: 4 },
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
    supportMessage: { type: String, default: '' },
    recordedDay: { type: Number, min: 0, default: 0 },
    engagementRate: { type: Number, min: 0, max: 100, default: 0 },
    role: { type: String, default: 'patient' },
    creatAt: { type: String, required: true },
    sex: { type: String, required: true },
    needToDo: {
        bloodSugar: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 3 },
            max: { type: Number, default: 7 },
        },
        exercise: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 100 },
            max: { type: Number, default: 1000 },
        },
        weight: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 50 },
            max: { type: Number, default: 60 },
        },
        insulin: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 0 },
            max: { type: Number, default: 2 },
        },
    },
    recordsList: [
        {
            recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
        },
    ],
    noteList: [
        {
            note: { type: String, default: '' },
            time: { type: String, default: '' },
        },
    ],
})

const Patients = mongoose.model('Patients', patientSchema)
module.exports = Patients
