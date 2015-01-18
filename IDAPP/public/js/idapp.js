$(document).ready(function () {
  //Agrega y elimina warm up al wod
  $('#addfi').on('click', function(e) {
    e.preventDefault();
    $('#fi:first').clone().appendTo("#fi");
    return false;
  });

  $('#remfi').on('click', function(e) {
    if ($('.warmup').size() > 1)
    {
      $("#fi:last").remove();
    }
    return false;
  });
});
