// middleware to ensure patient is logged in
function unLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/clinician/dashboard')
    }
    next()
    // return res.redirect('/clinician/dashboard');
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    // if not logged in, redirect to login form
    res.redirect('/clinician')
    // return next();
}

module.exports = {
    isLoggedIn,
    unLoggedIn,
}
