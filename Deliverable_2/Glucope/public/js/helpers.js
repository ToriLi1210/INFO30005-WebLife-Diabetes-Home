const helpers = {
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

    ifNeed: function (status, options) {
        if (status != 'no') {
            return options.fn(this)
        }
        return
    },

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
