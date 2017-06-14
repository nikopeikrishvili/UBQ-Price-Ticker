var Notification=(function(){
    var notification=null;
  
    return {
        display:function(opt){
            notification=chrome.notifications.create(opt);
            notification.show();
            return false;
        },
        hide:function(){
            notification.close();
        }
    };
})();