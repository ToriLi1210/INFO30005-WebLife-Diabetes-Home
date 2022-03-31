// import demo model
const demoData = require('../models/demoModel')
// handle request to get all demo data instances
const getAllDemoData = (req, res) => { res.send(demoData) // send list to browser
}
// exports an object, which contains a function named getAllDemoData
module.exports = { getAllDemoData
}