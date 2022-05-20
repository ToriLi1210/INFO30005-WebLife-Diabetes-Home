const helpers = {
    // helping record
    ifRecorded: function (status, options) {
        if (status == 'recorded') {
            return options.fn(this)
        }
        return options.inverse(this)
    },

    ifUnrecorded: function (status, options) {
        if (status == 'unrecorded') {
            return options.fn(this)
        }
        return options.inverse(this)
    },

    // helping get the upper case into task
    getUpper: function (keyName) {
        if (keyName == 'bloodSugar') {
            return 'Blood Sugar'
        } else if (keyName == 'exercise') {
            return 'Exercise'
        } else if (keyName == 'weight') {
            return 'Weight'
        } else if (keyName == 'insulin') {
            return 'Insulin'
        }
    },

    // set the input rule
    setInput: function (keyName, options) {
        if (
            keyName == 'bloodSugar' ||
            keyName == 'weight' ||
            keyName == 'BloodSugar' ||
            keyName == 'Weight'
        ) {
            return options.fn(this)
        }
        return options.inverse(this)
    },

    // check if patient need to record or not
    ifNeed: function (status, options) {
        if (status != 'no') {
            return options.fn(this)
        }
        return options.inverse(this)
    },

    // check if patient need to record or not
    ifNoNeed: function (status, options) {
        if (status == 'no') {
            return options.fn(this)
        }
    },

    // check if patient's data exceed threshold
    withinRange: function (status, min, max, value, options) {
        if (status == 'recorded') {
            if (min < value && value < max) {
                return options.fn(this)
            }
            return options.inverse(this)
        }
        return options.fn(this)
    },
}

module.exports.helpers = helpers
