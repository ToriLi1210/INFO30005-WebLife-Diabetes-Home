// import demo model 
const demoData = require('../models/demoModel') 
// handle request to get all demo data instances 
const getAllDemoData = (req, res) => { 
    res.send(demoData) // send list to browser 
} 
// exports an object, which contains a function named getAllDemoData 
module.exports = { 
    getAllDemoData
}

// handle request to get one data instance 
const getDataById = (req, res) => { 
    // search the database by ID 
    const data = demoData.find(data => data.id === req.params.id) 
    // return data if this ID exists 
    if (data) { 
        res.send(data) 
    } else { 
        // You can decide what to do if the data is not found. 
        // Currently, a 404 response is sent. 
        res.sendStatus(404) 
    } 
} 

module.exports = { 
    getAllDemoData, 
    getDataById 
} 