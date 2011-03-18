window.util = {
  
  debug: true,

  cleanseDate: function (d) {
    return new Date(d.getFullYear(),d.getMonth(),d.getDate());
  },

  cloneDate: function (date) {
    return new Date(date.getTime());
  },
  
  log: function () {
    if(!this.debug) return;
    if(!window.console || !window.console.log) return;
    
    console.log.apply(console,arguments);
  }
};
