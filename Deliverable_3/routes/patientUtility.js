// middleware to ensure patient is logged in
function unLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/patient/dashboard')
    }
    next()
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    // if not logged in, redirect to login form
    res.redirect('/patient/Login')
}

module.exports = {
    isLoggedIn,
    unLoggedIn,
}
