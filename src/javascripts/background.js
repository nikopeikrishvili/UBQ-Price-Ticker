(function() {
    /**
     * Extension Config && Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 15000,
        'default_market': 'bittrex'
    };

    var markets = {
        'bittrex': {
            url: 'http://jsonp.herokuapp.com/?callback=cbfunc&url=https%3A%2F%2Fbittrex.com%2Fapi%2Fv1.1%2Fpublic%2Fgetmarketsummary%3Fmarket%3Dbtc-ubq',
            key: 'Last'
        }
    };

    var config = {};

    var SBT = {

        init: function () {
            this.resetCurrentVals();
            this.startRequesting();
            this.bindEvents();
        },

        resetCurrentVals: function () {
            for (var key in defaultVals) {
                config[key] = localStorage[key] || defaultVals[key];
            }
        },

        bindEvents: function() {
            var self = this;
            chrome.browserAction.onClicked.addListener(function() {
                // self.restartRequesting();
                var newURL = "https://bittrex.com/Market/Index?MarketName=BTC-UBQ";
                chrome.tabs.create({ url: newURL });
            });
        },

        handleSingleRequestResult: function (raw) {
            try {
                var jsonString = '';
                jsonString = this.handleJSONP(raw);

                var res = JSON.parse(jsonString);
                
                this.updateLatestInfo(this.getPriceInfo(res));   
            } catch (e) {
                // exception
            }
        },

        handleJSONP: function (raw) {
            return raw.substring(46, raw.length - 4);
        },

        restartRequesting: function () {
            var self = this;
            window.clearInterval(self.globalIntervalId);
            this.startRequesting();
        },

        ReadyStateChange: function (obj, funcScope, funcName) { 
            return function () { 
                if (obj.readyState == 4 && obj.status == 200) { 
                    funcScope[funcName](obj.responseText); 
                }
            };
        },

        startRequesting: function () {
            var self = this;
            this.handleSingleRequest();
            this.globalIntervalId = window.setInterval(function () {
                self.handleSingleRequest();
                self.resetCurrentVals();
            }, config.refresh_time);
        },

        handleSingleRequest: function () {
            var req = new XMLHttpRequest(),
                url = markets[config.default_market].url;
            req.open("GET", url, true);
            req.onreadystatechange = this.ReadyStateChange(req, this, 'handleSingleRequestResult');
            req.send(null);
        },

        getPriceInfo: function (res) {
        		var oldprice = localStorage.price;
        		
        		var color = "";
        		var price = this.getDescendantProp(res, markets[config.default_market].key);
        		price = (!price || isNaN(price)) ? 
                    0 : parseFloat(Math.round(price * 100000000));
        		localStorage.price=price;
                
                
        		if(oldprice > price) {
        			color = {color:[255,0,0,255]};
        		}
        		else if(oldprice < price) {
        			color = {color:[0,186,0,255]};
        		}
        		else{
        			color = {color:[75,75,75,255]};
        		}
            chrome.browserAction.setBadgeBackgroundColor(color);
            this.checkNotifications(res.Last);
            return price;
        },

        getDescendantProp: function (res, desc) {
            chrome.browserAction.setTitle({title:res.Last+''});

            var arr = desc.split(".");
            while(arr.length && (res = res[arr.shift()]));
            return res;
        },

        updateLatestInfo: function (price) {
            this.updateBadge(price);
        },

        updateBadge: function (price) {
            chrome.browserAction.setBadgeText({
                text: '' + price
            });
        },
        renderNotification: function(title,text)
        {
           var opt = {
                type: "basic",
                title: title,
                message: text,
                iconUrl: "images/ubq.png"
            };
            Notification.display(opt);
            return false;
        },
        checkNotifications: function(price) {
            self = this;
            var a = [];
            var notifications = localStorage.getItem("notifications");
            if(notifications!==null && notifications!=='')
            {


            a = JSON.parse(notifications);
            Object.keys(a).forEach(function(key){
                if(a[key].type==='>=' && price >= a[key].value)
                {
                   a.splice(key,1);
                   localStorage.setItem("notifications",JSON.stringify(a));

                   self.renderNotification("Price Alert","Current price : "+price);
                               

                }
                else if(a[key].type==='<=' && price <= a[key].value)
                {
                    a.splice(key,1);
                    localStorage.setItem("notifications",JSON.stringify(a));
                    self.renderNotification("Price Alert","Current price : "+price);
                    
                }
            });
            }
        }
    };

    return SBT;

})().init();
