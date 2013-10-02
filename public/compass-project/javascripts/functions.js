
$(window).load(function(){
	scrollster();
	goto_top();
});

function scrollster(){
	$("ul.nav a").click(function (e){
		e.preventDefault();
		console.log(this.rel)
        $('html, body').animate({
            scrollTop: $("#"+this.rel).offset().top-40
        }, 1000);
    });
}
function goto_top(){
	$(".goto_top").click(function (){
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });
}