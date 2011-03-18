(function ($) {

  // TODO: remove jQuery dependency
  var pageWidth = $(window).width()
    , pageHeight = $(window).height()
  ;
  
  window.R = new Raphael('container','100%','100%');

  window.cal = new CalendarView({
    marks: new Marks(),
    width: pageWidth,
    height: pageHeight,
    paddingTop: 80
  });
})(jQuery);
