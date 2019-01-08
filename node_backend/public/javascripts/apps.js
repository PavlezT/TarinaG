$(document).ready(function(){

    function init_items(){
        $('.main_buttom').click(function(event){
            var action = $(this).attr('id');
            var $target = $("input[name='radio-1']:checked");
            if($target.length == 1 || action == "create"){
                openModal(action,$target.attr('data'));
            }
        })
    }

    function openModal(action,data){
        try{
            data = data? JSON.parse(data) : {};
        }catch(e){}
        
        switch (action) {
            case 'create':
                openCreateModal();
                break;
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

    function openCreateModal(){
        $('#create_dialog').dialog({
            width: 400,
            modal: true
        });

        $('#cancel_create').unbind('click').click(function(){
            $('#create_dialog').dialog('close');
        });
    
        $('#create_user').unbind('click').click(function(){
            clear();
            if(checkCreateInput())
                create(checkCreateInput(), clear);
            else {

            }
        });

        function clear(){
            $('#create_okey_info').hide();
            $('#create_fill_fields').hide();
            $('#create_error_info').hide();
            $('#create_progressbar').hide();
        }

        clear();
    }

    function openEditModal(data){
        $('#edit_dialog').dialog({
            width: 400,
            title : 'Edit app: '+ (data.name || 'none' ),
            modal: true
        });

        $('#cancel_edit').unbind('click').click(function(){
            $('#edit_dialog').dialog('close');
        });
        $('#edit_user').unbind('click').click(function(){
            clear();
            var result = checkEditInput();
            if(result){
                result.id = data.id;
                edit(result, clear);
            } else {

            }
        });
        $('#edit_app_name').val(data.app_name || '');
        $('#edit_name').val(data.name || '');
        $('#edit_teetimes').val(data.teetimes_href || '');
        $('#edit_lat').val(data.latitude || '');
        $('#edit_long').val(data.longitude || '');
        $('#edit_weather_apikey').val(data.weather_apikey || '');
        $('#select_edit_role').val(data.roleid || 0);

        function clear(){
            $('#edit_okey_info').hide();
            $('#edit_fill_fields').hide();
            $('#edit_error_info').hide();
            $('#edit_progressbar').hide();
        }

        clear();
    }

    function openDeleteModal(data){
        $('#delete_dialog').dialog({
            width: 400,
            title : 'Delete role: '+data.name,
            modal: true
        });

        $('.delete_user_name').each(function(){
            $(this).text(data.name || ' ');
        });

        $('#cancel_delete').unbind('click').click(function(){
            $('#delete_dialog').dialog('close');
        })

        $('#delete_error_info').hide();

        $('#delete_dialog > #delete_user_button').unbind('click').click(function(event){
            $('#delete_error_info').hide();
            if(data.id && data.name)
                del(data);
            else 
                alert('Can not identify role to delete!');
        })
    }

    function create(data,clear){
        $( "#create_progressbar" ).progressbar({
            value: false
        }).show();

        $.ajax({
            url : '/apps/create',
            method : 'POST',
            data : data
        })
        .done(function(res){
            $('#create_progressbar').hide();
            $('#create_dialog').dialog('close');
            reset_view(res.url);
        })
        .fail(function(error){
            console.error('<Add role> error:',error);
            clear && clear();
            $('#create_error_info').show();
            error && error.responseJSON && error.responseJSON.message && $('#create_error_info').find('p').text(error.responseJSON.message);
        });
    }

    function edit(data, clear){
        $( "#edit_progressbar" ).progressbar({
            value: false
        }).show();

        $.ajax({
            url : '/apps/edit',
            method : 'POST',
            data : data
        })
        .done(function(res){
            $('#edit_progressbar').hide();
            $('#edit_dialog').dialog('close');
            reset_view(res.url);
        })
        .fail(function(error){
            console.error('<Edit role> error:',error);
            clear && clear();
            $('#edit_error_info').show();
            error && error.responseJSON && error.responseJSON.message && $('#edit_error_info').find('p').text(error.responseJSON.message);
        });
    }

    function del(data){
        $.ajax({
            url : '/apps/delete',
            method : 'POST',
            data : data
        })
        .done(function(res){
            console.log('delete role send')
            $('#delete_dialog').dialog('close');
            reset_view('');
        })
        .fail(function(error){
            console.error('<Delete role> error:',error);
            $('#delete_error_info').show().find('p').text('There are users with this role!');
        })
    }

    function reset_view(url){
        setTimeout(function(){
            window.location.href = window.location.href + url;
        }, 1000);
    }

    function checkCreateInput(){
        var $name = $('#create_name').val(),
            $app_name = $('#create_app_name').val(),
            $role = $('#select_create_role').val();
            $teetimes_href = $('#create_teetimes').val(),
            $lat = $('#create_lat').val(),
            $long = $('#create_long').val(),
            $weather_apikey = $('#create_weather_apikey').val();

        var data = {};

        var disp = function(text){
            $('#create_fill_fields').show().find('p').text(text);
        }

        if(!($app_name && $app_name.trim().length > 1) ){
            disp('Entered app id is incorrect');
            return false;
        }
        data.app_name = $app_name.trim();

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        if( $role == 0){
            disp('Select role for app');
            return false;
        }
        data.roleid = $role;

        if(!($teetimes_href && $teetimes_href.length > 1) ){
            disp('Enter teetimes page url for app');
            return false;
        }
        data.teetimes_href = $teetimes_href;

        if(!($lat && $lat.length > 1) ){
            disp('Enter geographical latitude for app');
            return false;
        }
        data.latitude = $lat;

        if(!($long && $long.length > 1) ){
            disp('Enter geographical longitude for app');
            return false;
        }
        data.longitude = $long;

        if(!($weather_apikey && $weather_apikey.length > 1) ){
            disp('Enter OpenWeather Api Key for app. It could be same as in other apps.');
            return false;
        }
        data.weather_apikey = $weather_apikey;

        return data;
    }

    function checkEditInput() {
        var $name = $('#edit_name').val(),
            $app_name = $('#edit_app_name').val(),
            $role = $('#select_edit_role').val(),
            $teetimes_href = $('#edit_teetimes').val(),
            $lat = $('#edit_lat').val(),
            $long = $('#edit_long').val(),
            $weather_apikey = $('#edit_weather_apikey').val();

        var data = {};

        var disp = function(text){
            $('#edit_fill_fields').show().find('p').text(text);
        }

        if(!($app_name && $app_name.trim().length > 1) ){
            disp('Entered app id is incorrect');
            return false;
        }
        data.app_name = $app_name.trim();

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        if( $role == 0){
            disp('Select role for app');
            return false;
        }
        data.roleid = $role;

        if(!($teetimes_href && $teetimes_href.length > 1) ){
            disp('Enter teetimes page url for app');
            return false;
        }
        data.teetimes_href = $teetimes_href;

        if(!($lat && $lat.length > 1) ){
            disp('Enter geographical latitude for app');
            return false;
        }
        data.latitude = $lat;

        if(!($long && $long.length > 1) ){
            disp('Enter geographical longitude for app');
            return false;
        }
        data.longitude = $long;

        if(!($weather_apikey && $weather_apikey.length > 1) ){
            disp('Enter OpenWeather Api Key for app. It could be same as in other apps.');
            return false;
        }
        data.weather_apikey = $weather_apikey;

        return data;
    }

    init_items();

});