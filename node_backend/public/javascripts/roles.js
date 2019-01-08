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
            title : 'Edit role: '+ (data.name || 'none' ),
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
        $('#select_edit_role').val(data.type || 0);

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
            if(data.id && data.type)
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
            url : '/roles/create',
            method : 'POST',
            data : data
        })
        .done(function(){
            $('#create_progressbar').hide();
            $('#create_dialog').dialog('close');
            reset_view();
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
            url : '/roles/edit',
            method : 'POST',
            data : data
        })
        .done(function(){
            $('#edit_progressbar').hide();
            $('#edit_dialog').dialog('close');
            reset_view();
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
            url : '/roles/delete',
            method : 'POST',
            data : data
        })
        .done(function(){
            console.log('delete role send')
            $('#delete_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Delete role> error:',error);
            $('#delete_error_info').show().find('p').text('There are users with this role!');
        })
    }

    function reset_view(){
        setTimeout(function(){
            window.location.href = window.location.href.toString();
        }, 1000);
    }

    function checkCreateInput(){
        var $name = $('#create_name').val(),
            $type = $('#select_create_role').val();

        var data = {};

        var disp = function(text){
            $('#create_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        // if( $type == 0){
        //     disp('Select role for user');
        //     return false;
        // }
        data.type = $type;

        return data;
    }

    function checkEditInput() {
        var $name = $('#edit_name').val(),
            $type = $('#select_edit_role').val();

        var data = {};

        var disp = function(text){
            $('#edit_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        // if( $type == 0){
        //     disp('Select role for user');
        //     return false;
        // }
        data.type = $type;
    
        return data;
    }

    init_items();

});