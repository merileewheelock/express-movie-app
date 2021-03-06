var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');
var bcrypt = require('bcrypt-nodejs');

var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
});

connection.connect();

// console.log(config);

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';


/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl,(error, response, movieData)=>{
		var movieData = JSON.parse(movieData);
		// console.log(movieData);
		console.log(req.session);
		res.render('movie_list', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Movie Database",
			sessionInfo: req.session
		});
	});
});

// router.get('/search', (req,res)=>{
// 	// .get request is refreshing the search page
// 	res.send("The get search page!");
// });

router.post('/search', (req,res)=>{
	// .post request is coming here from the form
	// res.send("The post search page!");
	// req.body is available because of the body-parser module
	// body-parser module was installed when you created he express app
	// req.body is where POSTED data will live
	// res.json(req.body);
	var termUserSearchedFor = req.body.searchString; // We get searchString from the name property of the input
	var searchUrl = apiBaseUrl + '/search/movie?query='+termUserSearchedFor+'&api_key='+config.apiKey;
	request.get(searchUrl,(error, response, movieData)=>{
		// res.json(JSON.parse(movieData));
		var movieData = JSON.parse(movieData);
		res.render('movie_list', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: `Search results for ${termUserSearchedFor}:`
		});
	});
});

router.get('/movie/:id', (req, res)=>{
	// The route has a :id in it. A : means WILD CARD. A wildcard is ANYTHING in that slot.
	// All wildcards in routes are available in req.params
	var thisMovieId = req.params.id;
	// Build the URL per the API docs
	var thisMovieUrl = `${apiBaseUrl}/movie/${thisMovieId}?api_key=${config.apiKey}`;
	// Use the request module to make an HTTP get request
	request.get(thisMovieUrl, (error, response, movieData)=>{
		// Parse the response into JSON
		var movieData = JSON.parse(movieData);
		// First arg: the view file
		// Second arg: obj to send the view fild
		// res.json(movieData);
		res.render('single_movie', {
			movieData: movieData,
			imageBaseUrl: imageBaseUrl
		});
	});
	// res.send(req.params.id);
});

router.get('/register', (req, res)=>{
	// res.send("This is the register page");
	var message = req.query.msg;
	if (message == "badEmail"){
		message = "This email is already registered";
	}
	res.render('register', { message: message });
});

router.post('/registerProcess', (req, res)=>{
	// res.json(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var hash = bcrypt.hashSync(password);
	console.log(hash);

	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery,[email],(error, results)=>{
		if (results.length == 0){
			// User is not in the db. Insert them.
			var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
			connection.query(insertQuery, [name,email,hash], (error, results)=>{
				// Add session vars -- name, email, loggedin, id
				req.session.name = name;
				req.session.email = email;
				req.session.loggedin = true;
				res.redirect('/?msg=registered');
			});
		}else{
			// User is in the db. Send them back to register with a message.
			res.redirect('/register?msg=badEmail');
		}
	});
});

router.get('/login', (req, res)=>{
	// res.send("This is the login page");
	res.render('login', {});
});

router.post('/processLogin', (req, res)=>{
	// res.json(req.body);
	var email = req.body.email;
	var password = req.body.password;
	// var selectQuery = "SELECT * FROM users WHERE email = ? AND password = ?";
	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery, [email], (error,results)=>{
		if (results.length == 1){
			// Match found!
			// Check to see if the password matches
			var match = bcrypt.compareSync(password, results[0].password); // true
			if (match == true){
					// We passed the english pass and hash thrugh compareSync, and they match
				req.session.loggedin = true;
				req.session.name = results[0].name;
				req.session.email = results[0].email;
				res.redirect('/?msg=loggedin')
			}else{
				res.redirect('/login?msg=badLogin');
			}
		}else{
			// This isn'tthe droid we are looking for.
			res.redirect('/login?msg=badLogin');
		}
	});
});

module.exports = router;
