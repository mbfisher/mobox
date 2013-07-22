$(document).ready(function() {
  function setNavView(view) {
    $('#nav li').removeClass('active');
    $('#nav li[data-nav-view='+view+']').addClass('active');
  }

  $('#nav li a').click(function() {
    setNavView($(this).parent('li').attr('data-nav-view'));
  });

  setNavView(window.location.pathname.replace(/^\//, '') || 'queue');
});
