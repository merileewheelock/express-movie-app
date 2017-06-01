var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

console.log(config);

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl,(error, response, movieData)=>{
		var movieData = JSON.parse(movieData);
		// console.log(movieData);
		res.render('index', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl
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
		res.render('search', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl
		});
	});

});

module.exports = router;
