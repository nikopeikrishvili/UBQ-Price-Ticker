(function() {
    /**
     * Extension Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 15000,
        'default_market': 'bittrex'
    };

    var markets = [
        'bittrex'
    ];

    var OptionsPage = {

        init: function () {
            this.initFormOptions();
            this.bindSaveBtnEvent();
            this.bindNotificationsSaveBtnEvent();
            this.renderNotificationTable();
            this.registerRemoveButton();
        },

        /**
         * Get current settings from localStorage
         * @return {[object]} 
         */
        getCurrentVals: function () {
            var currentVals = {};
            for (var key in defaultVals) {
                currentVals[key] = localStorage[key] || defaultVals[key];
            }
            return currentVals;
        },

        /**
         * Set Values to Form Elements.
         * @return {void} 
         */
        initFormOptions: function () {
            var formVals = this.getCurrentVals();

            for (var key in formVals) {

                var elemInput = $('input[name="' + key + '"]'),
                    elemVal = formVals[key];

                // only got two types of input here, text, radio, maybe more.
                // only dealing with input[type="radio"] here, ignorance of select, checkbox...
                if (elemInput.length > 1) {
                    for (var i = elemInput.length - 1; i >= 0; i--) {
                        var childInput = elemInput[i];
                        if (childInput.value != elemVal) {
                            childInput.removeAttribute('checked');   
                        } else {
                            childInput.checked = 'checked';
                        }
                    }
                } else {
                    elemInput.val(elemVal);
                }
            }
        },

        /**
         * First function to be called after clicked the "Save Options" button
         * @return {[type]} [description]
         */
        bindSaveBtnEvent: function () {
            var btnSaveOptions = $('#btnSaveOptions'),
                self = this;

            btnSaveOptions.click(function () {
                self.showFormInfoAlert(self.handleFormOptionsSubmit());
                return false;
            });
        },

        /**
         * Showing message according to the user input
         * @param  {[object]} args [message config, must has property: type, msg]
         * @return {[type]}      [description]
         */
        showFormInfoAlert: function (args) {
            $('#formInfo').removeClass()
                          .addClass('alert alert-' + args.type)
                          .html(args.msg)
                          .show();
        },

        /**
         * Handle form submit, returns message args to show (with validation)
         * @return {[type]} [description]
         */
        handleFormOptionsSubmit: function () {
            var elemForm = $('#formOptions'),
                formData = elemForm.serializeArray(),
                res = { 
                    type: 'danger', 
                    msg: 'Exception' 
                },
                requirements = { 
                    default_market: {
                        required: true,
                        dataType: 'string',
                        dataList: markets,
                        msg: 'You should select one of the following markets as default: ' + markets.join(', ')
                    },
                    refresh_time: {
                        required: true,
                        dataType: 'number',
                        dataRange: true,
                        dataRangeMin: 1000,
                        dataRangeMax: 3000000,
                        msg: 'You should set the refresh time between 1000ms and 3000000ms. '
                    }
                };

            for (var i = formData.length - 1; i >= 0; i--) {
                var inputName = formData[i].name,
                    inputVal = formData[i].value,
                    flag = false,
                    requirement = requirements[inputName];

                if (!requirement) {
                    break;
                }

                switch (requirement.dataType) {
                    case 'string':
                        flag = $.inArray(inputVal, requirement.dataList);
                        break;
                    case 'number':
                        flag = (parseInt(inputVal) >= requirement.dataRangeMin && 
                                parseInt(inputVal) <= requirement.dataRangeMax);
                        break;
                    default:
                        break;
                }

                if (flag === false) {
                    res.msg = requirement.msg;
                    break;
                }

                localStorage[inputName] = inputVal;
                res.flag = true;
            }

            if (!!res.flag) {
                res.type = 'success';
                res.msg = 'Options Saved!';
            }

            return res;
        },
        /**
         * Render Notifications list
         * @return {[type]} [description]
         */
        renderNotificationsList: function(){

        },
        /**
         * 
         *
         */
        bindNotificationsSaveBtnEvent: function(){
            self=this;
            $("#btnSaveNotification").click(function(){
                var type = $("#selectType").val();
                var value = $("#rate").val();
                self.saveNotification(type,value);
                self.renderNotificationTable();
                return false;
            });
            
         },
         /**
          *
          *
          */
        saveNotification: function(type,value){
            this.SaveDataToLocalStorage("notifications",{type:type,value:value});
        }, 
         /**
          *
          *
          */
        getNotivications: function(){
            return localStorage.getItem("notifications");
        },
        SaveDataToLocalStorage: function (name,data)
        {
            if(localStorage.getItem(name) === null || localStorage.getItem(name)==="")
            {
                localStorage.setItem(name, '[]');
            }
            var a = [];
            // Parse the serialized data back into an aray of objects
            a = JSON.parse(localStorage.getItem(name));
            // Push the new data (whether it be an object or anything else) onto the array
            a.push(data);
            // Alert the array value
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem(name, JSON.stringify(a));
        },
        renderNotificationTable: function()
        {
            $("#notificationsList").html("");
            if(localStorage.getItem("notifications") === null || localStorage.getItem("notifications")==="")
            {
                $("#notificationsList").html("<tr><td colspan=\"3\">Empty List</td></tr>");
            }
            else
            {
                var a = JSON.parse(localStorage.getItem("notifications"));
                Object.keys(a).forEach(function(key){
                    $("#notificationsList").append("<tr><td>"+a[key].type+"</td><td>"+a[key].value+"</td><td><button class=\"btn btn-danger removeKey\" data-id=\""+key+"\">Remove</button></td></tr>");
                    
                });
                
            }
        },
        removeNotification:function(id)
        {
            if(localStorage.getItem("notifications") !== null || localStorage.getItem("notifications")!=="")
            {
               var a = JSON.parse(localStorage.getItem("notifications"));
               a.splice(id,1); 
               localStorage.setItem("notifications",JSON.stringify(a));
            }
        },
        registerRemoveButton: function()
        {
            self = this;
            $(".removeKey").click(function(){
                var id = $(this).data('id');
                self.removeNotification(id);
                self.renderNotificationTable();

            })
        }

    };

    return OptionsPage;

})().init();
