const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    recordDate: {type: String, required: true},
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: "Patients", required: true},
    patientName: {type: String, required: true, trim: true},
    bloodSugar: {
        status: {type: String, enum: ["no", "recorded", "unrecorded"], default: "unrecorded"},
        value:{type: Number, default: 0},
        comment:{type: String, default: ""},
        comState:{type: String, enum: ["recorded", "unrecorded"], default: "unrecorded"},
        time: {type: String, default: ""}
    },
    exercise: {
        status: {type: String, enum: ["no", "recorded", "unrecorded"], default: "unrecorded"},
        value: {type: Number, default: 0},
        comment:{type: String, default: ""},
        comState:{type: String, enum: ["recorded", "unrecorded"], default: "unrecorded"},
        time: {type: String,  default: ""}
    },
    insulin: {
        status: {type: String, enum: ["no", "recorded", "unrecorded"], default: "unrecorded"},
        value: {type: Number, default: 0},
        comment:{type: String, default: ""},
        comState:{type: String, enum: ["recorded", "unrecorded"], default: "unrecorded"},
        time: {type: String,  default: ""}
        
    },
    weight: {
        status: {type: String, enum: ["no", "recorded", "unrecorded"], default: "unrecorded"},
        value: {type: Number, default: 0},
        comment:{type: String, default: ""},
        comState:{type: String, enum: ["recorded", "unrecorded"], default: "unrecorded"},
        time: {type: String,  default: ""}
    }
})


const Record = mongoose.model('Record', recordSchema)
module.exports = Record