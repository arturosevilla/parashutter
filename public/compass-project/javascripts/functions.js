
$(window).load(function(){
	scrollster();
	goto_top();
    home_floater();
});

function scrollster(){
	$("ul.nav a").click(function (e){
		e.preventDefault();
        $('html, body').animate({
            scrollTop: $("#"+this.rel).offset().top -40
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
function home_floater(){
    $('#how-floater').scrollToFixed({ 
        marginTop: 70,
        limit: $('#nav_contactus').offset().top -350

    });
}