// //
// calendar.js
// 
// This script assumes that a global Rafael variable R has
// been initialized.

(function () {
  
  var months = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var dayCount = [31,28,31,30,31,30,31,31,30,31,30,31];
  
  window.CalendarView = Backbone.View.extend({
    
    el: $('#container'),
    
    initialize: function (options) {
      _.bindAll(this,'addMark','addAllMarks','renderMarks');
      
      this.width = options.width;
      this.height = options.height;
      this.paddingTop = options.paddingTop;
      this.date = util.cleanseDate(options.date || new Date());
      
      // always set to first day (we only care about the month)
      this.date.setDate(1);
      
      this.calSet = R.set();
      this.render();
      
      this.marks = options.marks;
      this.marks.bind('add', this.addMark);
      this.marks.bind('refresh', this.addAllMarks);
      this.marks.fetch();
    },
    
    addMark: function (mark) {
      var view = new MarkView({ model:mark, cal:this });
      view.render();
    },
    
    addAllMarks: function () {
      this.marks.each(this.addMark);
    },
    
    onDayBoxClick: function (dayBox) {
      this.marks.toggleDate(dayBox.date);
    },
    
    timeTravel: function (amount) {
      this.date.setMonth(this.date.getMonth() + amount);
      this.render();
      this.marks.each(function (m) { m.view.render(); });
    },
    
    render: function () {
      
      this.calSet.remove();
      
      var self = this
        , today = util.cleanseDate(new Date())
        , w = this.width
        , h = this.height
        , paddingTop = this.paddingTop
        , centerX = w / 2
        , centerY = h / 2
        , _min = Math.min(w,h-paddingTop)
        , cx = (_min == w) ? 0 : (w - _min) / 2   // calendar x
        , cy = paddingTop                         // calendar y
        , cw = _min
        , ch = _min
        , boxDim = cw / 7
        , font = R.getFont('Helvetica')
      ;
      // save for later use
      this.boxDim = boxDim;
      this.c = {x:cx,y:cy,w:cw,h:ch};
      
      // main title
      var title = R.print(-7,38,'PowerMotivate.me',font,_min/15)
                   .attr({ fill:'#080C0C' })
      ;
      title.translate((w - title.getBBox().width) / 2,0);
      this.calSet.push(title);
      
      // month header
      var monthYear = months[this.date.getMonth()] + ' ' + this.date.getFullYear()
        , monthHeader = R.print(cx-9,paddingTop+boxDim/3.13,monthYear,font,_min/17.5)
                         .attr({ fill:'#080C0C' })
      ;
      monthHeader.translate((cw - monthHeader.getBBox().width) / 2,0);
      this.calSet.push(monthHeader);
      
      // day name headers
      for (var i = 0; i < 7; i++) {
        var dayBox = R.rect(cx + boxDim * i,cy,boxDim,boxDim)
                      .attr({ fill:'#668FAD', 'stroke-width':0 })
        ;
        var dayText = R.print(cx + boxDim * i - 7,cy + boxDim/1.28,days[i],font,_min/26)
                       .attr({ fill:'#080C0C' })
        ;
        // center the text
        dayText.translate((boxDim - dayText.getBBox().width) / 2,0);
        this.calSet.push(dayText,dayBox);
      }
      // day numbers
      for (var i = 0; i < 42; i++) {
        var monthBegin = this.date.getDay()
          , month = this.date.getMonth()
          , prevMonth = (month > 0) ? month - 1 : 11
          , boxX = cx + boxDim * (i%7)
          , boxY = cy + boxDim * parseInt(i/7+1)
        ;
        var dayBox = R.rect(boxX,boxY,boxDim,boxDim).attr({ fill:'#AAB4BB' });
        // this date is properly set later
        dayBox.date = util.cloneDate(this.date);
        dayBox.click(function () { self.onDayBoxClick(this); });

        var dayNum = -1
          , dayNumText = null
          , fontColor = '#080C0C'
        ;
        if (i < monthBegin) {
          dayNum = dayCount[prevMonth] - (monthBegin - i) + 1;
          fontColor = '#939BA1';
          dayBox.date.setMonth(prevMonth);
        }
        else if (i - monthBegin < dayCount[month]) {
          dayNum = i - monthBegin + 1;
        }
        else if (dayCount[month] < i) {
          dayNum = i - dayCount[month] - monthBegin + 1;
          fontColor = '#939BA1';
          dayBox.date.setMonth(month + 1);
        }

        // used in onDayBoxClick()
        dayBox.date.setDate(dayNum);
        
        if (dayBox.date.getTime() === today.getTime())
          dayBox.attr({ fill:'#3B5246' });

        // print & center
        dayNumText = R.print(boxX-boxDim/9.3,boxY+boxDim/2.03,""+dayNum,font,boxDim/2.03)
                  .attr({ fill:fontColor })
        ;
        dayNumText.translate((boxDim - dayNumText.getBBox().width) / 2,0);

        // this is needed for better user experience
        _.each(dayNumText, function (char) {
          char.date = util.cloneDate(dayBox.date);
          char.click(function () { self.onDayBoxClick(this); });
        });

        this.calSet.push(dayBox,dayNumText);
      }
      
      // previous & next buttons
      var prevX = cx
        , prevY = cy + boxDim/4
        , nextX = cx + _min - (boxDim*5/6)
        , nextY = cy + boxDim/4
        
        , prev = R.print(prevX,prevY,"< prev",font,boxDim/4)
                  .attr({ fill:'#3B5246' })
        , next = R.print(nextX,nextY,"next >",font,boxDim/4)
                  .attr({ fill:'#3B5246' })
        
        , bbox = prev.getBBox()
        , prevBtn = R.rect(bbox.x,bbox.y,bbox.width,bbox.height)
                     .attr({ 'fill':'#000000', 'opacity':0, 'cursor':'pointer' })
                     .click(function () { self.timeTravel(-1); })
        , bbox = next.getBBox()
        , nextBtn = R.rect(bbox.x,bbox.y,bbox.width,bbox.height)
                     .attr({ 'fill':'#000000', 'opacity':0, 'cursor':'pointer' })
                     .click(function () { self.timeTravel(1); })
        
      ;
      this.calSet.push(prev,next,prevBtn,nextBtn);
      monthHeader.toFront();
    }
    
  });
  
})();
