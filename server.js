const express = require('express');
const hbs = require('hbs');
const request = require('request');
const port = process.env.PORT || 3001;
var bodyParser = require('body-parser');
var app = express();
var moment = require('moment');
var date = moment();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/assets'));
hbs.registerPartials(__dirname + '/views/partials');
var expressSession = require('express-session');
var passwordHash = require('password-hash');
app.use(expressSession({ secret: 'max', saveUninitialized: false, resave: false }));

//test json-server

var jsonServer = require('json-server');

app.use('/api', jsonServer.router('db.json'));

//end test json-server

app.get('/', (req, res) => {
    req.session.homepage = true;
    request({
        url: 'https://movie2see.herokuapp.com/api/movie',
        json: true
    }, (error, response, body) => {
        res.render('index.hbs', {
            datas: body,
            ss_homepage: req.session.homepage,
            login: req.session.alertLogin,
            uname: req.session.uname
        });

    });
    req.session.homepage = false;
});

app.get('/admin', (req, res) => {
    if(req.session.loginComplete){
        req.session.homepage = true;
        request({
            url: 'https://movie2see.herokuapp.com/api/movie',
            json: true
        }, (error, response, body) => {
            res.render('adminIndex.hbs', {
                datas: body,
                ss_homepage: req.session.homepage,
                login: req.session.alertLogin,
                uname: req.session.uname
            });
    
        });
        req.session.homepage = false;
    }else{
        req.session.plsLogin = true;
        res.redirect('/login');
    }
    
});

app.get('/login', (req, res) => {
    res.render('login.hbs', {
        regisComplete: req.session.regisComplete,
        loginIncorrect: req.session.loginIncorrect,
        plslogin: req.session.plsLogin
    });
    req.session.plsLogin = null;
    req.session.loginIncorrect = null;
    req.session.regisComplete = null;
});

app.post('/checklogin', (req, res) => {
    request({
        url: 'https://movie2see.herokuapp.com/api/user?username='+req.body.uname,
        json: true
    }, (error, response, body) => {
            if(body.length != 0){
                var chkPass = passwordHash.verify(req.body.password, body[0].password);
                if (chkPass) {
                    req.session.alertLogin = true;
                    req.session.uname = req.body.uname;
                    req.session.loginComplete = true;
                    if(body[0].status=="admin"){
                        res.redirect('/admin');
                    }else{
                        res.redirect('/');
                    }
                    
                } else {
                    req.session.loginIncorrect = true;
                    req.session.alertLogin = false;
                    res.redirect('/login');
                }
            }else{
                req.session.loginIncorrect = true;
                req.session.alertLogin = false;
                res.redirect('/login');
            }

    });
});

app.get('/signup', (req, res) => {
    res.render('signup.hbs');
});

app.post('/registoDB', (req, res) => {
    var password = passwordHash.generate(req.body.password);
    var dateTime = date.format('MMMM Do YYYY, h:mm:ss a');
    request.post(
        'https://movie2see.herokuapp.com/api/user',
        { json: { 
            id: null,
            email: req.body.email,
            username: req.body.uname,
            password: password,
            status: "user",
            registerDate: dateTime
        } },
        function (error, response, body) {
            if (response.statusCode == "201") {
                req.session.regisComplete = true;
                res.redirect('login');
            }
        }
    );
});

app.get('/logout', (req, res) => {
    req.session.alertLogin = false;
    req.session.loginComplete = false;
    res.redirect('/');
});

app.get('/thaimovie', (req, res) => {
    req.session.thaimovie = true;
    req.session.othermovie = false;
    req.session.cartoon = false;

    request({
        url: 'https://movie2see.herokuapp.com/api/movie/?type=thaimovie',
        json: true
    }, (error, response, body) => {
        res.render('thaimovie.hbs', {
            datas: body,
            ss_thaimovie: req.session.thaimovie,
            ss_othermovie: req.session.othermovie,
            ss_cartoon: req.session.cartoon,
            login: req.session.alertLogin,
            uname: req.session.uname
        });
    });
});

app.get('/othermovie', (req, res) => {
    req.session.thaimovie = false;
    req.session.othermovie = true;
    req.session.cartoon = false;

    request({
        url: 'https://movie2see.herokuapp.com/api/movie/?type=othermovie',
        json: true
    }, (error, response, body) => {
        res.render('thaimovie.hbs', {
            datas: body,
            ss_thaimovie: req.session.thaimovie,
            ss_othermovie: req.session.othermovie,
            ss_cartoon: req.session.cartoon,
            login: req.session.alertLogin,
            uname: req.session.uname
        });
    });
});

app.get('/cartoon', (req, res) => {
    req.session.thaimovie = false;
    req.session.othermovie = false;
    req.session.cartoon = true;

    request({
        url: 'https://movie2see.herokuapp.com/api/movie/?type=cartoon',
        json: true
    }, (error, response, body) => {
        res.render('thaimovie.hbs', {
            datas: body,
            ss_thaimovie: req.session.thaimovie,
            ss_othermovie: req.session.othermovie,
            ss_cartoon: req.session.cartoon,
            login: req.session.alertLogin,
            uname: req.session.uname
        });
    });
});

app.get('/seemovie/:id', (req, res) => {
    if(req.session.loginComplete){
        request({
            url: 'https://movie2see.herokuapp.com/api/movie/'+req.params.id,
            json: true
        }, (error, response, body) => {
            res.render('seemovie.hbs',{
                informationmovie: body,
                login: req.session.alertLogin,
                uname: req.session.uname
            });
        });
    }else{
        req.session.plsLogin = true;
        res.redirect('/login');
    }
});

//--------------------------- Admin -----------------------------------------------------------------
app.get('/addmovie', (req, res) => {
    if(req.session.loginComplete){
        req.session.ss_addmovie = true;
        req.session.ss_showlistmovie = false;
        req.session.alertLogin = true;
        res.render('addmovie.hbs', {
            login: req.session.alertLogin,
            addmoviecomplete: req.session.addmoviecomplete,
            ss_addmovie: req.session.ss_addmovie,
            ss_showlistmovie: req.session.ss_showlistmovie,
            login: req.session.alertLogin,
            uname: req.session.uname
        });
        req.session.addmoviecomplete = false;
    }else{
        req.session.plsLogin = true;
        res.redirect('/login');
    }
});

app.post('/addmovietodb', (req, res) => {
    var dateTime = date.format('MMMM Do YYYY, h:mm:ss a');
    request.post(
        'https://movie2see.herokuapp.com/api/movie',
        { json: { 
            id: null,
            title: req.body.title,
            img: req.body.image,
            year: req.body.year,
            type: req.body.type,
            detail: req.body.detail,
            trailer: req.body.trailer,
            movieLink: req.body.movieLink,
            createMovieDate: dateTime,
            lastEdit: dateTime
        } },
        function (error, response, body) {
            if (response.statusCode == "201") {
                req.session.addmoviecomplete = true;
                res.redirect('/addmovie');
            }
        }
    );
});

app.get('/getinformation/:id', (req, res) => {
    request({
        url: 'https://movie2see.herokuapp.com/api/movie/'+req.params.id,
        json: true
    }, (error, response, body) => {
        req.session.alertLogin = true;
        res.render('showinformationmovie.hbs',{
            informationmovie: body,
            login: req.session.alertLogin,
            uname: req.session.uname
        });
    });
});

app.get('/editmovieform/:id', (req, res) => {
    req.session.thaimovie = false;
    req.session.othermovie = false;
    req.session.cartoon = false;
    request({
        url: 'https://movie2see.herokuapp.com/api/movie/'+req.params.id,
        json: true
    }, (error, response, body) => {
        if (body.type == "thaimovie"){
            req.session.thaimovie = true
        }else if (body.type == "othermovie"){
            req.session.othermovie = true
        }else if (body.type == "cartoon"){
            req.session.cartoon = true
        }
        req.session.alertLogin = true;
        res.render('editmovieform.hbs',{
            informationmovie: body,
            ss_type_thaimovie: req.session.thaimovie,
            ss_type_othermovie: req.session.othermovie,
            ss_type_cartoon: req.session.cartoon,
            login: req.session.alertLogin,
            uname: req.session.uname
        });
    });
});

app.post('/editmovie/:id', (req, res) => {
    var dateTime = date.format('MMMM Do YYYY, h:mm:ss a');
    request.put(
        'https://movie2see.herokuapp.com/api/movie/'+req.params.id,
        { json: { 
            
            title: req.body.title,
            img: req.body.image,
            year: req.body.year,
            type: req.body.type,
            detail: req.body.detail,
            trailer: req.body.trailer,
            movieLink: req.body.movieLink,
            createMovieDate: req.body.createMovieDate,
            lastEdit: dateTime,
            id: req.body.id
        } },
        function (error, response, body) {
            if (response.statusCode == "200") {
                res.redirect('/showlistmovie');
            }
        }
    );
});

app.get('/delete/:id', (req, res) => {
    request.delete(
        'https://movie2see.herokuapp.com/api/movie/'+req.params.id,
        
        function (error, response, body) {
            res.redirect('/showlistmovie');
        }
    );
});

app.get('/showlistmovie', (req, res) => {
    if(req.session.loginComplete){
        request({
            url: 'https://movie2see.herokuapp.com/api/movie',
            json: true
        }, (error, response, body) => {
            req.session.ss_addmovie = false;
            req.session.ss_showlistmovie = true;
            req.session.alertLogin = true;
            res.render('showlistmovie.hbs', {
                datas: body,
                login: req.session.alertLogin,
                ss_addmovie: req.session.ss_addmovie,
                ss_showlistmovie: req.session.ss_showlistmovie,
                login: req.session.alertLogin,
                uname: req.session.uname
            });
        });
    }else{
        req.session.plsLogin = true;
        res.redirect('/login');
    }
});

app.get('/getDateTime', (req, res) => {
    var dateTime = date.format('MMMM Do YYYY, h:mm:ss a');
});

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
