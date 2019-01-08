$(document).ready(function(){

    function init_items(){
        $('.main_buttom').click(function(event){
            var action = $(this).attr('id');
            var $target = $(this);//$("input[name='radio-1']:checked");
            if($target.length == 1 || action ){
                openModal(action,$target.attr('data'));
            }
        })

        $('.icons_list_item').click(function(event){
            var data = $(this).attr('data');
            openModal('edit_partner',data);
        })

        $('.list_button > button').click(function(event){
            $('.list_button > button').removeClass('selected');
            $(this).addClass('selected');
            $('.icons_list').hide();
            $('#icons_'+$(this).attr('id')).show();
        })

        $('.list_button > button').dblclick(function(event){
            var data = $(this).attr('data');
            openModal('edit_tab',data);
        })

        if($('.list_button > button').length > 0 ){
            var $tab = $($('.list_button > button')[0]);
            $tab.toggleClass('selected');
            $('#icons_'+$tab.attr('id')).show();
        }
        
    }

    function openModal(action,data){
        try{
            data = data? ( typeof data == 'string' ? JSON.parse(data) : data ): {};
        }catch(e){}
        
        switch (action) {
            case 'create':
                openCreateModal();
                break;
            case 'edit_tab':
                openEditModal(data);
                break;
            case 'delete':
                openDeleteModal(data);
                break;
            case 'image':
                openImagesModal(data);
                break;
            case 'create_new_partner':
                openCreateIconModal();
                break;
            case 'edit_partner':
                openEditIconModal(data);
                break;
            case 'delete_partner':
                openDeleteIconModal(data);
                break;
            default:
                break;
        }
    }

    function openCreateIconModal(){
        $('#create_icon').dialog({
            width: 400,
            modal: true
        });
    
        $('#create_cancel_icon').unbind('click').click(function(){
            $('#create_icon').dialog('close');
        });

        $('#create_icon_logo').unbind('click').click(function(){
            openModal('image',{logourl : $(this).val(),callback : function(imgurl){
                $('#create_icon_logo').attr('src',imgurl);
            }});
        })

        $('#create_icon_button').unbind('click').click(function(){
            clear();
            if(checkIconCreateInput())
                createIcon(checkIconCreateInput(), clear);
            else {

            }
        });

        function clear(){
            $('#create_icon_okey_info').hide();
            $('#create_icon_fill_fields').hide();
            $('#create_icon_error_info').hide();
            $('#create_icon_progressbar').hide();
        }

        clear();
    }

    function openEditIconModal(data){
        $('#edit_icon_dialog').dialog({
            width: 400,
            title : 'Edit partner',
            modal: true
        });

        $('#edit_icon_cancel').unbind('click').click(function(){
            $('#edit_icon_dialog').dialog('close');
        });
        $('#edit_icon_delete').unbind('click').click(function(){
            openModal('delete_partner',data);
        })
        var icons = '';

        for(var i = 0; i < $('#icons_'+data.tabid).children().length; i++){
            icons+='<option value="'+(i+1)+'">'+(i+1)+'</option>';
        }

        $('#edit_icon_order').html(icons);
        $('#edit_icon_order').val(parseInt(data.order) || 0);
        var icon_old_order = data.order ? data.order.toString() : '0';

        $('#edit_icon').unbind('click').click(function(){
            clear();
            var result = checkIconEditInput();
            if(result){
                result.id = data.id;
                result.old_order = icon_old_order;
                editIcon(result, clear);
            } else {

            }
        });
        $('#edit_icon_name').val(data.name || '');
        $('#edit_icon_link').val(data.href);
        $('#edit_icon_logo').attr('src',data.logourl);
        $('#edit_icon_logo').unbind('click').click(function(){
            openModal('image',{logourl : data.logourl, callback : function(imageurl){
                $('#edit_icon_logo').attr('src',imageurl);
                data.logourl = imageurl;
            }});
        })
        $('#edit_icon_tab').val(data.tabid);

        function clear(){
            $('#edit_icon_okey_info').hide();
            $('#edit_icon_fill_fields').hide();
            $('#edit_icon_error_info').hide();
            $('#edit_icon_progressbar').hide();
        }

        clear();
    }

    function openDeleteIconModal(data){
        $('#delete_icon').dialog({
            width: 400,
            title : 'Delete Partner: '+data.name,
            modal: true
        });

        $('#cancel_icon_delete').unbind('click').click(function(){
            $('#delete_icon').dialog('close');
        })

        $('#delete_icon_error_info').hide();
        $('#delete_icon_okey_info').hide();

        $('#delete_icon_button').unbind('click').click(function(event){
            $('#delete_icon_error_info').hide();
            if(data.id)
                delIcon(data);
            else 
                alert('Can not identify Partner to delete!');
        })
    }

    function openCreateModal(){
        $('#create_dialog').dialog({
            width: 400,
            modal: true
        });
    
        $('#create_cancel').unbind('click').click(function(){
            $('#create_dialog').dialog('close');
        });

        var orders = '';

        for(var i = 0; i <= $('.list_button').length; i++){
            orders+='<option value="'+(i+1)+'">'+(i+1)+'</option>';
        }

        $('#create_order').html(orders);
        $('#create_order').val($('.list_button').length+1);

        $('#create_button').unbind('click').click(function(){
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
            title : 'Edit tab',
            modal: true
        });

        $('#edit_cancel').unbind('click').click(function(){
            $('#edit_dialog').dialog('close');
        });
        $('#edit_delete').unbind('click').click(function(){
            openModal('delete',data);
        })
        
        var old_order = data.order ? data.order.toString() : '0';
        $('#edit_button').unbind('click').click(function(){
            clear();
            var result = checkEditInput();
            if(result){
                result.id = data.id;
                result.old_order = old_order;
                edit(result, clear);
            } else {

            }
        });
        $('#edit_name').val(data.name || '');
        $('#edit_order').val(data.order);

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
            title : 'Delete tab: '+data.name,
            modal: true
        });

        $('#cancel_delete').unbind('click').click(function(){
            $('#delete_dialog').dialog('close');
        })

        $('#delete_error_info').hide();
        $('#delete_okey_info').hide();

        $('#delete_dialog > #delete_user_button').unbind('click').click(function(event){
            $('#delete_error_info').hide();
            if(data.id)
                del(data);
            else 
                alert('Can not identify tab to delete!');
        })
    }

    function openImagesModal(data){
        $('#select_image').dialog({
            width: 700,
            height: 600,
            title : 'Select image',
            modal: true,
            maxHeight: 500,
            close: function(){
                if(data.callback && data.add != true)
                    data.callback(data.logourl || '');
            }
        });

        var newimg = data && data.logourl? data.logourl : '';

        function getImages(){
            $('#image_progressbar').progressbar({
                value: false
            }).show();
            $('#select_image_container').html('');
            $('#image_name').text(' ');

            $.ajax({
                url : '/_api/Images?filter={"appid":"'+$('#appid').val()+'"}',
                method : 'GET',
            })
            .done(function(images){
                $('#image_progressbar').hide();
                var html = '';
                images.map(function(image){
                    if(data.logourl && image.url == data.logourl)
                        $('#image_name').text("Current image is: "+image.name);
                    html +='<div data-id="'+image.id+'" data-name="'+image.name+'" data-url="'+image.url+'" class="selectable_image'+ (data.logourl && image.url == data.logourl ? ' selected' : '')+'"><span>'+image.name+'</span><button class="image_del_button" >X</button><img src="'+image.url+'" /></div>'
                })
                $('#select_image_container').html(html);
                $('#select_image_container').find('.image_del_button').click(function(){
                    delImage($(this).parent().attr('data-id'));
                })
    
                $('.selectable_image').unbind('click').click(function(){
                    imageSelected($(this).attr('data-id'));
                })
            })
            .fail(function(error){
                console.error('<Getting images> error:',error);
                $('#image_progressbar').hide();
            })
        }

        function imageSelected(imageId){
            $('.selectable_image').each(function(){
                if($(this).attr('data-id') == imageId){
                    $(this).addClass('selected');
                    $('#image_name').text("Current image is: "+$(this).attr('data-name'));
                    newimg = $(this).attr('data-url');
                } else {
                    $(this).removeClass('selected');
                }
            })
        }

        function delImage(imageId){
            $.ajax({
                url : '/apps/image',
                method : 'DELETE',
                data : {id : imageId }
            })
            .done(function(res){
                getImages();
            })
            .fail(function(error){
                console.error('<Delete role> error:',error);
                alert('Delete image error.'+ (error && error.responseJSON.message? error.responseJSON.message : ''));
            })
        }

        function uploadImage(file){
            var formdata = new FormData();
            formdata.append('image',file);
            
            $.ajax({
                url : '/apps/image?appid='+$('#appid').val(),
                method:'POST',
                data: formdata,
                cache: false,
                contentType: false,
                processData: false,
            })
            .done(function(){
                getImages();
            })
            .fail(function(error){
                console.error('<Upload image> error:',error);
                alert("Upload Image Error! "+ (error && error.responseJSON.message? error.responseJSON.message : '') );
            })
        }

        $('#new_image_upload').unbind('click').click(function(){
            if($('#new_image_select')[0].files.length == 1)
                uploadImage($('#new_image_select')[0].files[0]);
        })

        $('#save_image_select').unbind('click').click(function(){
            data.add = true;
            if(data.callback)
                data.callback(newimg);
            $('#select_image').dialog('close');
        })
        $('#cancel_image_select').unbind('click').click(function(){
            data.add = false;
            // if(data.callback)
            //     data.callback(data.logourl || '');
            $('#select_image').dialog('close');
        })

        getImages();
        
    }

    function create(data,clear){
        $( "#create_progressbar" ).progressbar({
            value: false
        }).show();

        $.ajax({
            url : '/apps/apppartners/tab/'+$('#appid').val(),
            method : 'POST',
            data : {tab : JSON.stringify(data), old_order : $('.list_button').length+1 }
        })
        .done(function(res){
            $('#create_progressbar').hide();
            $('#create_dialog').dialog('close');
            reset_view();//res.url
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
            url : '/apps/apppartners/tab',
            method : 'PUT',
            data : data
        })
        .done(function(res){
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
            url : '/apps/apppartners/tab',
            method : 'DELETE',
            data : data
        })
        .done(function(res){
            $('#delete_okey_info').show();
            reset_view();
        })
        .fail(function(error){
            console.error('<Delete role> error:',error);
            $('#delete_error_info').show().find('p').text('There are connected Partners to this tab!');
        })
    }

    function createIcon(data,clear){
        $( "#create_icon_progressbar" ).progressbar({
            value: false
        }).show();

        var old_order = $('#icons_'+data.tabid).children().length+1;

        $.ajax({
            url : '/apps/apppartners/icon/'+$('#appid').val(),
            method : 'POST',
            data : {icon : JSON.stringify(data), old_order : old_order }
        })
        .done(function(res){
            $('#create_icon_progressbar').hide();
            $('#create_icon').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Add icon> error:',error);
            clear && clear();
            $('#create_icon_error_info').show();
            error && error.responseJSON && error.responseJSON.message && $('#create_icon_error_info').find('p').text(error.responseJSON.message);
        });
    }

    function editIcon(data, clear){
        $( "#edit_icon_progressbar" ).progressbar({
            value: false
        }).show();

        $.ajax({
            url : '/apps/apppartners/icon',
            method : 'PUT',
            data : data
        })
        .done(function(res){
            $('#edit_icon_progressbar').hide();
            $('#edit_icon_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Edit icon> error:',error);
            clear && clear();
            $('#edit_icon_error_info').show();
            error && error.responseJSON && error.responseJSON.message && $('#edit_icon_error_info').find('p').text(error.responseJSON.message);
        });
    }

    function delIcon(data){
        $.ajax({
            url : '/apps/apppartners/icon',
            method : 'DELETE',
            data : data
        })
        .done(function(res){
            $('#delete_icon_okey_info').show();
            reset_view();
        })
        .fail(function(error){
            console.error('<Delete icon> error:',error);
            $('#delete_icon_error_info').show().find('p').text('Error while deleting!');
        })
    }

    function reset_view(url){
        setTimeout(function(){
            window.location.href = window.location.href + (url? url : '');
        }, 1000);
    }

    function checkCreateInput(){
        var $name = $('#create_name').val(),
            $order = $('#create_order').val()

        var data = {};
        data.order = $('#create_order').val();

        var disp = function(text){
            $('#create_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.trim().length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name.trim();

        return data;
    }

    function checkEditInput() {
        var $name = $('#edit_name').val(),
            $order = $('#edit_order').val()

        var data = {};
        data.order = $order;
        var disp = function(text){
            $('#edit_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        return data;
    }

    function checkIconCreateInput(){
        var $name = $('#create_icon_name').val(),
            $href = $('#create_icon_link').val(),
            $logourl = $('#create_icon_logo').attr('src'),
            $tabid = $('#create_icon_tab').val();

        var data = {};
        
        var disp = function(text){
            $('#create_icon_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        if(!( $logourl && $logourl.length > 1)){
            disp('Select logourl');
            return false;
        }
        data.logourl = $logourl;

        if(!( $href && $href.length > 1)){
            disp('Select link');
            return false;
        }
        data.href = $href;

        if(!($tabid) ){
            disp('Select tab');
            return false;
        }
        data.tabid = $tabid;

        data.order = $('#icons_'+$tabid).children().length+1;

        return data;
    }

    function checkIconEditInput() {
        var $name = $('#edit_icon_name').val(),
            $href = $('#edit_icon_link').val(),
            $logourl = $('#edit_icon_logo').attr('src'),
            $tabid = $('#edit_icon_tab').val(),
            $order = $('#edit_icon_order').val();

        var data = {};

        var disp = function(text){
            $('#edit_icon_fill_fields').show().find('p').text(text);
        }

        if(!($name && $name.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.name = $name;

        if(!( $logourl && $logourl.length > 1)){
            disp('Select logourl');
            return false;
        }
        data.logourl = $logourl;

        if(!( $href && $href.length > 1)){
            disp('Select link');
            return false;
        }
        data.href = $href;

        if(!($tabid) ){
            disp('Select tab');
            return false;
        }
        data.tabid = $tabid;

        if(!($order) ){
            disp('Select order');
            return false;
        }
        data.order = $order;

        return data;
    }

    init_items();

});