const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    screenName: { type: String, required: true, unique: true, trim: true },
    unfinishedTaskNum: { type: Number, required: true, default: 4 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    yearOfBirth: { type: Number, required: true, min: 1900, max: 2022 },
    textBio: { type: String, required: true },
    supportMessage: { type: String },
    engagementRate: { type: Number, min: 0, max: 100, default: 0 },
    creatAt: { type: String, required: true },
    needToDo: {
        bloodSugar: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
        },
        exercise: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
        },
        weight: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
        },
        insulin: {
            status: {
                type: String,
                enum: ['no', 'recorded', 'unrecorded'],
                default: 'unrecorded',
            },
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
        },
    },
    recordsList: [
        {
            recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
        },
    ],
})
const Patients = mongoose.model('Patients', schema)
module.exports = Patients
