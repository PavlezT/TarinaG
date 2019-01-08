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
            case 'reset':
                openResetModal(data);
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
        $('#generate_pass').unbind('click').click(function(){
            var str= 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567894';
            str = str.split('').sort(function(){return 0.5-Math.random()}).join('').substring(0,12);
            $('#create_password').val(str);
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
            title : 'Edit user: '+ (data.name || 'none' ),
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
        $('#edit_name').val(data.name || '');
        $('#edit_email').val(data.email || '');
        $('#select_edit_role').val(data.roleid || 0);
        $('#old_password').val('');
        $('#new_password').val('');
        $('#new_copy_password').val('');

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
            title : 'Delete user: '+data.name,
            modal: true
        });

        $('#delete_user_name').text(data.name || ' ');

        $('#cancel_delete').unbind('click').click(function(){
            $('#delete_dialog').dialog('close');
        })

        $('#delete_dialog > #delete_user_button').unbind('click').click(function(event){
            if(data.id && data.email)
                del(data);
            else 
                alert('Can not identify user to delete!');
        })
    }

    function openResetModal(data){
        $('#reset_dialog').dialog({
            width: 400,
            title : 'Reset password for user: '+data.name,
            modal: true
        });

        $('#reset_user_name').text(data.name || ' ');

        $('#cancel_reset').unbind('click').click(function(){
            $('#reset_dialog').dialog('close');
        })

        $('#reset_dialog > #reset').unbind('click').click(function(event){
            if(data.email && data.email.length > 1)
                reset(data);
            else
                alert('Present incorrect email');
        })
    }

    function create(data,clear){
        $( "#create_progressbar" ).progressbar({
            value: false
        }).show();

        $.ajax({
            url : '/users/create',
            method : 'POST',
            data : data
        })
        .done(function(){
            $('#create_progressbar').hide();
            $('#create_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Add user> error:',error);
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
            url : '/users/edit',
            method : 'POST',
            data : data
        })
        .done(function(){
            $('#edit_progressbar').hide();
            $('#edit_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Edit user> error:',error);
            clear && clear();
            $('#edit_error_info').show();
            error && error.responseJSON && error.responseJSON.message && $('#edit_error_info').find('p').text(error.responseJSON.message);
        });
    }

    function del(data){
        $.ajax({
            url : '/users/delete',
            method : 'POST',
            data : data
        })
        .done(function(){
            console.log('delete user send')
            $('#delete_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Delete user> error:',error);
            alert('Error in deleting user!');
        })
    }

    function reset(data){
        $.ajax({
            url : '/reset_password',
            method : 'POST',
            data : { email : data.email }
        })
        .done(function(){
            console.log('reset pass send')
            $('#reset_dialog').dialog('close');
        })
        .fail(function(error){
            console.error('<Reset password> error:',error);
            alert('Error in resetting user password!');
        })
    }

    function reset_view(){
        setTimeout(function(){
            window.location.href = window.location.href.toString();
        }, 1000);
    }

    function checkCreateInput(){
        var $name = $('#create_name').val(),
            $email = $('#create_email').val(),
            $new_pass = $('#create_password').val(),
            $roleid = $('#select_create_role').val(),
            $rolename = $('#select_create_role > option[value="'+$roleid+'"]').text();

        var data = {};

        var disp = function(text){
            $('#create_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        if( !($email && $email.length > 1 && /^\w+([\.-]?\ w+)*@\w+([\.-]?\ w+)*(\.\w{2,7})+$/.test($email)) ){
            disp('Entered email is invalid');
            return false;
        }
        data.email = $email;

        if( $roleid == 0){
            disp('Select role for user');
            return false;
        }
        data.roleid = $roleid;
        data.role = $rolename;
        
        if($new_pass.length < 6 ){
            disp('Enter valid password');
            return false;
        }
    
        data.password = $new_pass;

        return data;
    }

    function checkEditInput() {
        var $name = $('#edit_name').val(),
            $email = $('#edit_email').val(),
            $old_pass = $('#old_password').val(),
            $new_pass = $('#new_password').val(),
            $ret_pass = $('#new_copy_password').val(),
            $roleid = $('#select_edit_role').val(),
            $rolename = $('#select_edit_role > option[value="'+$roleid+'"]').text();

        var data = {};

        var disp = function(text){
            $('#edit_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        if( !($email && $email.length > 1 && /^\w+([\.-]?\ w+)*@\w+([\.-]?\ w+)*(\.\w{2,7})+$/.test($email)) ){
            disp('Entered email is invalid');
            return false;
        }
        data.email = $email;

        if( $roleid == 0){
            disp('Select role for user');
            return false;
        }
        data.roleid = $roleid;
        data.role = $rolename;
        
        if( $old_pass.length > 0 || $new_pass.length > 0 || $ret_pass.length > 0){
            if( $old_pass.length < 6 ){
                disp('Enter old password');
                return false;
            }

            if($new_pass.length < 6 ){
                disp('Enter new password');
                return false;
            }

            if($ret_pass.length < 6 || $new_pass != $ret_pass){
                disp('Repeat new password correctly');
                return false;
            }

            data.old_pass = $old_pass;
            data.new_pass = $new_pass;
        }

        return data;
    }

    init_items();

});