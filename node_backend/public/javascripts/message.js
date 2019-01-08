$(document).ready(function(){
    $( "#datepicker" ).datepicker({
        showOn: "button",
        buttonImage: "images/calendar.gif",
        buttonImageOnly: true,
        buttonText: "Select date",
        minDate: +1,
      });
    $( "#checkbox-1" ).checkboxradio();

    setInterval(function(){
        $('#current_time').text((new Date(Date.now())));
    },200)

    $('.schaduled_time').each(function(index,elem){
        $(elem).text( (new Date($(elem).text())) );
    })

    Globalize.culture("de-DE");
    $.widget( "ui.timespinner", $.ui.spinner, {
        options: {
          // seconds
          step: 60 * 1000,
          // hours
          page: 60
        },
   
        _parse: function( value ) {
          if ( typeof value === "string" ) {
            // already a timestamp
            if ( Number( value ) == value ) {
              return Number( value );
            }
            return +Globalize.parseDate( value );
          }
          return value;
        },

        _format: function( value ) {
            return Globalize.format( new Date(value), "t" );
        }
      });

    $( "#spinner" ).timespinner();
    
    $('#send').click(function(){
        $('#check_message').hide();
        $('#error_message').hide();
        var text = $('#textarea').val();
        var schadule = $( "#checkbox-1" ).is( ":checked" );
        var time = $( "#spinner" ).timespinner('value');
        var date = $( "#datepicker" ).val();
        var appid = $("#apps_selected").val();
        
        if(check(text,schadule,time,date,appid)){
            var sended = 'false';
            if(schadule){
                date = new Date(date);
                time = new Date(time);
                date.setHours(time.getHours());
                date.setMinutes(time.getMinutes());
            } else {
                sended = 'true';
                date = (new Date(Date.now()+60*1000));
            }
            sendMessage(text,schadule,date,appid,sended);
        } else {
            $('#check_message').show();
        }
    })

    function sendMessage(text,schadule,date,appid,sended){
        var data = {
            id : Date.now(),
            text : text,
            schadule : schadule,
            date : date.toJSON(),
            sended : sended,
            appid : appid
        }

        $.ajax({
            url: '/message/add',
            method : 'POST',
            data : data,
            async : true
        })
        .done(function(data){
            console.log('message:',data);
            setTimeout(() => {
                window.location.href = window.location.href.toString();
            }, 1000);
        })
        .fail(function(error){
            console.error("error:",error);
            $("#error_message").show();
        })
    }

    function check(text,schadule,time,date,appid){
        if(!appid || appid.length == 0 )
            return false;

        if(!text || text.length == 0 )
            return false;

        if(schadule){
            if(!date || date.length == 0)
                return false;
            if(!time || time.length == 0)
                return false;
            try{
                var date1 = new Date(date);
                var time1 = new Date(time);
                date1.setHours(time1.getHours());
                date1.setMinutes(time1.getMinutes());
                if(!date1.toJSON() || date1.toJSON().length == 0)
                    return false;
            }catch(e){
                return false;
            }
        }
        return true;
    }

    $('.main_buttom').click(function(event){
        var action = $(this).attr('id');
        var $target = $("input[name='radio-1']:checked");
        if($target.length == 1 || action == "create"){
            openModal(action,$target.attr('data'));
        }
    })

    function openModal(action,data){
        try{
            data = data? JSON.parse(data) : {};
        }catch(e){}
        
        switch (action) {
            case 'edit':
                openEditModal(data);
                break;
            case 'delete':
                openDeleteModal(data);
                break;
            default:
                break;
        }
    }

    function openDeleteModal(data) {
        $("#dialog_delete" ).dialog({
            width: 400,
            title : 'Delete message',
            modal: true
        });

        $('#delete_cancel').click(function(){
            $('#dialog_delete').dialog('close');
        });

        $('#delete_notif').click(function(){
            del(data);
        });

        $('#delete_error_info').hide();
        $('#delete_progressbar').progressbar({
            value: false
        }).hide();
    }

    function openEditModal(data) {
        $("#dialog_edit" ).dialog({
            width: 400,
            title : 'Edit message',
            modal: true
        });

        $('#cancel_edit').click(function(){
            $('#dialog_edit').dialog('close');
        });

        $('#edit_textarea').val(data.text);
        // $( "#edit_datepicker" ).val(data.date);
        var edit_date = new Date(data.date);
        $('#edit_date').text(data.date);
        // $( "#edit_spinner" ).timespinner('value');

        $('#save_edit').click(function(){
            clear();
            var text = $('#edit_textarea').val();
            var schadule = true;
            var time = data.date;//$( "#edit_spinner" ).timespinner('value');
            var date = data.date;//$( "#edit_datepicker" ).val();
            var appid = data.appid;//$("#edit_apps_selected").val();
            
            if(check(text,schadule,time,date,appid)){
                if(schadule){
                    date = new Date(date);
                    time = new Date(time);
                    date.setHours(time.getHours());
                    date.setMinutes(time.getMinutes());
                } else {
                    date = (new Date(Date.now()+60*1000));
                }
                editMessage(data.id,text,schadule,date,appid);
            } else {
                $('#check_message').show();
            }
        });

        function clear(){
            $('#edit_progressbar').progressbar({
                value: false
            }).hide();
            $('#edit_okey_info').hide();
            $('#edit_fill_fields').hide();
            $('#edit_error_info').hide();
        }

        $('#edit_user').text(' ');
        $('#edit_email').text(' ');

        clear();

        getUser(data.userid,function(user){
            $('#edit_user').text(' '+user.name);
            $('#edit_email').text(' '+user.email);
        });
    }

    function getUser(userid, success ){
        $.ajax({
            url : '/_api/Users/id/'+userid,
            method : 'GET',
            async : true
        })
        .done(function(user){
            success(user[0]);
        })
        .fail(function(error){
            console.log('Get user error');
        })
    }

    function del(data) {
        $('#delete_progressbar').show();

        $.ajax({
            url: '/message/delete',
            method : 'POST',
            data : {id : data.id},
            async : true
        })
        .done(function(data){
            setTimeout(() => {
                window.location.href = window.location.href.toString();
            }, 1000);
            $('#delete_progressbar').hide();
        })
        .fail(function(error){
            console.error("error:",error);
            $("#delete_error_info").show();
            $('#delete_progressbar').hide();
        })
    }

    function editMessage(id,text,date){
        var data = {
            id : id,
            text : text,
            date : date.toJSON()
        }
        $('#edit_progressbar').show();
        $.ajax({
            url: '/message/edit',
            method : 'POST',
            data : data,
            async : true
        })
        .done(function(data){
            setTimeout(() => {
                window.location.href = window.location.href.toString();
            }, 1000);
            $('#edit_progressbar').hide();
        })
        .fail(function(error){
            console.error("error:",error);
            $("#edit_error_info").show();
            $('#edit_progressbar').hide();
        })
    }

});