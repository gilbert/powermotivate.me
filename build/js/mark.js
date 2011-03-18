(function ($) {

  var dayCount = [31,28,31,30,31,30,31,31,30,31,30,31];

  window.Mark = Backbone.Model.extend({

    initialize: function (attributes) {
      _.bindAll(this,'clear');
      if (typeof attributes.date === "string") {
        this.set({ date:new Date(attributes.date) });
      }
    },

    clear: function () {
      this.view.clear();
      this.destroy();
    }
  });
  
  window.Marks = Backbone.Collection.extend({
    
    model: Mark,
    
    localStorage: new Store("Marks"),
    
    toggleDate: function (date) {
      // search for existing mark
      var mark = this.find(function (m) {
        return m.get('date').getTime() == date.getTime();
      });

      if (mark) mark.clear();
      else      this.create({ date:date });
    }
  });
  
  window.MarkView = Backbone.View.extend({

    initialize: function (options) {
      this.model = options.model;
      this.cal = options.cal;
      this.el = this.model.node;

      this.model.view = this;
    },

    clear: function () {
      if (this.xMark) {
        this.xMark.remove();
        delete this.xMark;
      }
    },

    render: function () {

      this.clear();
      
      var self = this
        , date = this.model.get('date')
        
        , cal = this.cal
        , calYear       = cal.date.getFullYear()
        , calMonth      = cal.date.getMonth()
        , calMonthBegin = cal.date.getDay()
        , calPrevMonth  = (calMonth > 0)  ? calMonth - 1 : 11
        , calNextMonth  = (calMonth < 11) ? calMonth + 1 : 0

        , year  = date.getFullYear()
        , month = date.getMonth()
        , day   = date.getDate()
        
        , markAttrs = {}
        , dayOffset = calMonthBegin
      ;
      if (Math.abs(calMonth + calYear*12 - (month + year*12)) >= 2) return;
      
      if (month === calPrevMonth) {
        if (dayCount[calPrevMonth] - day >= calMonthBegin) return;
        markAttrs['stroke'] = markAttrs['fill'] = '#6E0000';
        dayOffset -= dayCount[calPrevMonth];
      }
      
      if (month === calNextMonth) {
        if (day - dayCount[calMonth] - calMonthBegin >= 42) return;
        markAttrs['stroke'] = markAttrs['fill'] = '#6E0000';
        dayOffset += dayCount[calMonth];
      }
      
      var boxX = cal.c.x + cal.boxDim * ((dayOffset+day-1) % 7)
        , boxY = cal.c.y + cal.boxDim * parseInt((dayOffset+day-1) / 7 + 1)
        , boxCX = boxX + cal.boxDim / 2
        , boxCY = boxY + cal.boxDim / 2
        
        , xMark = svg.create(R,'x-mark')
        , scale = cal.boxDim / xMark.getBBox().width
      ;

      xMark.scale(scale,scale,0,0).attr(markAttrs);

      var markCX = xMark.getBBox().width / 2
        , markCY = xMark.getBBox().height / 2
        , destX  = boxCX - markCX * (2/3)
        , destY  = boxCY - markCY
      ;
      // this works because xMark gets created at 0,0
      xMark.translate(destX,destY);

      _.each(xMark, function (svgObj) {
        svgObj.click(self.model.clear);
      });
      this.xMark = xMark;
      return this;
    }
  });
  
})();
