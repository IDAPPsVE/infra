$(document).ready(function () {

    function readImage(input) {
    if ( input.files && input.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
             $('#img').attr( "src", e.target.result );
             $('#base').attr("value", e.target.result );
             console.log(e.target.result);
        };       
        FR.readAsDataURL( input.files[0] );
    }
    };

    $("#uploadImage").change(function(){
        readImage( this );
    })
});
