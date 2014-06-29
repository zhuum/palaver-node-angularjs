(function (auth) {

    // TODO: move to routes

	auth.ensureAuthenticated = function (req, res, next) {
		if (req.isAuthenticated() && req.user.approved) {
			next();
		} else {
			res.redirect('/auth/login');
		}
	}

	auth.ensureApiAuthenticated = function (req, res, next) {
		if (req.isAuthenticated() && req.user.approved) {
			next();
		} else {
			res.send(401, 'Not authorized');
		}
	}

    auth.ensureAdmin = function (req, res, next) {
        if (req.isAuthenticated() ) {
            if ( req.user.admin )  {
                next();
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/auth/login');
        }
    }

    auth.ensureOwnerOrAdmin = function (req, res, next) {
        if (req.isAuthenticated() ) {
            if ( req.user.admin || req.user.username === req.params.username )  {
                next();
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/auth/login');
        }
    }


}) (module.exports);