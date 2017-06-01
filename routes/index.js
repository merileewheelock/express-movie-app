var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

// console.log(config);

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';


/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl,(error, response, movieData)=>{
		var movieData = JSON.parse(movieData);
		// console.log(movieData);
		res.render('movie_list', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Movie Database"
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

module.exports = router;
