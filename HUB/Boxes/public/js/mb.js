$(document).ready(function () {
    
    //Agregar Imagen base64
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
    });
    
    //Agrega y elimina warm up al wod
    $('#addwu').on('click', function(e) {
        e.preventDefault();
        $('.warmup:first').clone().appendTo("#wug");
        $("#wug").append('<input type="text" id="cwu" name="cwu[]"/>');
        return false;
    });

    $('#remwu').on('click', function(e) { 
        if ($('.warmup').size() > 1)
        {
            $(".warmup:last").remove();
            $("#cwu:last").remove();
        }
        return false;
    });
    $('#addwd').on('click', function() {
        $('.wod:first ').clone().appendTo("#wdg");
        $("#wdg").append('<input type="text" id="cwd" name="cwd[]"/>');
        return false;
    });

    $('#remwd').on('click', function(e) { 
        if ($('.wod').size() > 1)
        {
            $(".wod:last").remove();
            $("#cwd:last").remove();
        }
        return false;
    });
    $('#addbo').on('click', function() {
        $('.buyout:first').clone().appendTo("#bog");
        $("#bog").append('<input type="text" id="cbo" name="cbo[]"/>');
        return false;
    });

    $('#rembo').on('click', function(e) { 
        if ($('.buyout').size() > 1)
        {
            $(".buyout:last").remove();
            $("#cbo:last").remove();
        }
        return false;
    });
});
