module.exports = {
    straightAuth: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/PersonalArea');
    },
    checkedAuth: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('123', '...');
        res.redirect('/users/login');
    }
};
