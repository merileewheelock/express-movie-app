$(document).ready(function(){
	var tallestPoster = 0;
	$('.movies .col-sm-12').each(function(){
		var curElement = $(this);
		if (curElement.height() > tallestPoster){
			tallestPoster = curElement.height();
		}
		// console.log(curElement.height());
	});
	$('.movies .col-sm-12').height(tallestPoster);
});