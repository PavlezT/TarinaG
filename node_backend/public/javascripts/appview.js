$(document).ready(function(){

    function init_items(){
        $('.main_buttom').click(function(event){
            var action = $(this).attr('id');
            var $target = $("input[name='radio-1']:checked");
            if($target.length == 1 || action ){
                openModal(( !action ? 'edit' : action),$target.attr('data'));// != 'create' 
            }
        })

        $('.list_button').click(function(event){
            var data = $(this).attr('data');
            openModal('edit',data);
        })

        $('#logo').click(function(){
            openModal('image',{logourl : $(this).children('img').attr('src'), callback : function(imageurl){
                if($('#logo > img').attr('src') != imageurl){ 
                    $('#logo > img').attr('src',imageurl);
                    changeAppLogo(imageurl);
                    alert('App logo image changed');
                }
            }});
        })
        
        $('input#create_text_color,#create_notif_color, #create_back_color, #create_border_color').ColorPicker({
            onSubmit: function(hsb, hex, rgb, el) {
                $(el).val('#'+hex);//'rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
                $(el).ColorPickerHide();
            },
            onBeforeShow: function () {
                $(this).ColorPickerSetColor($(this).val());
            }
        })

        $('input#edit_text_color,#edit_notif_color, #edit_app_back_color, #edit_back_color, #edit_border_color').ColorPicker({
            onSubmit: function(hsb, hex, rgb, el) {
                $(el).val('#'+hex);//'rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
                $(el).ColorPickerHide();
            },
            onBeforeShow: function () {
                $(this).ColorPickerSetColor($(this).val());
            }
        })
    }

    function openModal(action,data){
        try{
            data = data? ( typeof data == 'string' ? JSON.parse(data) : data ): {};
        }catch(e){}
        
        switch (action) {
            case 'create':
                openCreateModal();
                break;
            case 'edit':
                openEditModal(data);
                break;
            case 'edit_app':
                openEditAppModal(data);
                break;
            case 'delete':
                openDeleteModal(data);
                break;
            case 'image':
                openImagesModal(data);
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
    
        $('#create_cancel').unbind('click').click(function(){
            $('#create_dialog').dialog('close');
        });

        var orders = '';

        for(var i = 0; i <= $('.list_button').length; i++){
            orders+='<option value="'+(i+1)+'">'+(i+1)+'</option>';
        }

        $('#create_order').html(orders);
        $('#create_order').val($('.list_button').length+1);
        $('#create_logo').unbind('click').click(function(){
            openModal('image',{logourl : $(this).val(),callback : function(imgurl){
                $('#create_logo').attr('src',imgurl);
            }});
        })
        
        $('#create_border').unbind('click').click(function(){
            $('#create_border_color').prop('disabled',!$(this).prop('checked'));
            $('#create_border_width').prop('disabled',!$(this).prop('checked'));
        }).click();

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
            title : 'Edit button',
            modal: true
        });

        $('#edit_cancel').unbind('click').click(function(){
            $('#edit_dialog').dialog('close');
        });
        $('#edit_delete').unbind('click').click(function(){
            openModal('delete',data);
        })
        var old_order = data.order.toString();
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
        $('#edit_name').val(data.text || '');
        $('#edit_name_fin').val(data.text_fin || '');
        $('#edit_text_color').val(data.text_color);
        $('#edit_back_color').val(data.back_color);
        $('#edit_link').val(data.link);
        $('#edit_notification').val(data.notificationid);
        $('#edit_logo').attr('src',data.logourl);
        $('#edit_logo').unbind('click').click(function(){
            openModal('image',{logourl : data.logourl, callback : function(imageurl){
                $('#edit_logo').attr('src',imageurl);
                data.logourl = imageurl;
            }});
        })
        
        if(data.border == 'true'){
            $('#edit_border').prop('checked','checked');
        }
        $('#edit_border_color').val(data.border_color);
        $('#edit_border_width').val(data.border_width);
        $('#edit_border_radius').val(data.border_radius);
        $('#edit_notif_color').val(data.notif_color);
        $('#edit_box_shadow').prop('checked',( (!data.box_shadow || data.box_shadow == 'none') ? false : true) );
        $('#edit_animation').prop('checked',( (!data.animation || data.animation == 'false') ? false : true) );
        $('#edit_order').val(data.order);

        function clear(){
            $('#edit_okey_info').hide();
            $('#edit_fill_fields').hide();
            $('#edit_error_info').hide();
            $('#edit_progressbar').hide();
        }

        clear();
    }

    function openEditAppModal(){
        var data = {};
        try{
            data = JSON.parse($('#buttons_list').attr('data-app'));
        }catch(e){console.log('error: no background data;')}
         
        $('#edit_app_dialog').dialog({
            width: 400,
            title : 'Edit app background',
            modal: true
        });

        $('#edit_app_cancel').unbind('click').click(function(){
            $('#edit_app_dialog').dialog('close');
        });
        $('#edit_app_button').unbind('click').click(function(){
            clear();
            var result = checkEditAppInput();
            if(result){
                result.id = data.id;
                editApp(result, clear);
            } else {

            }
        });
        $('#edit_back_image_check').prop('checked',( !data.back_image || data.back_image == '/' ? false : true ));
        $('#edit_back_image_check').click(function(){
            $('#edit_app_logo').prop('disabled',!$(this).prop('checked'));
            $('#edit_app_logo').attr('src','/')
        })
        $('#edit_app_logo').prop('disabled',!$('#edit_back_image_check').prop('checked'));

        $('#edit_app_back_color').val(data.back_color);
        $('#edit_app_logo').attr('src',data.back_image);
        $('#edit_app_logo').unbind('click').click(function(){
            openModal('image',{logourl : data.back_image, callback : function(imageurl){
                $('#edit_app_logo').attr('src',imageurl);
                data.back_image = imageurl;
            }});
        })
        
        function clear(){
            $('#edit_app_okey_info').hide();
            $('#edit_app_fill_fields').hide();
            $('#edit_app_error_info').hide();
            $('#edit_app_progressbar').hide();
        }

        clear();
    }

    function openDeleteModal(data){
        $('#delete_dialog').dialog({
            width: 400,
            title : 'Delete role: '+data.text,
            modal: true
        });

        $('.delete_user_name').each(function(){
            $(this).text(data.text || ' ');
        });

        $('#cancel_delete').unbind('click').click(function(){
            $('#delete_dialog').dialog('close');
        })

        $('#delete_error_info').hide();

        $('#delete_dialog > #delete_user_button').unbind('click').click(function(event){
            $('#delete_error_info').hide();
            if(data.id)
                del(data);
            else 
                alert('Can not identify button to delete!');
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
            url : '/apps/appview/'+$('#appid').val(),
            method : 'POST',
            data : {button : JSON.stringify(data), old_order : $('.list_button').length+1 }
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
            url : '/apps/appview/',
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

    function editApp(data, clear){
        $( "#edit_app_progressbar" ).progressbar({
            value: false
        }).show();

        $.ajax({
            url : '/apps/edit',
            method : 'POST',
            data : data
        })
        .done(function(res){
            $('#edit_app_progressbar').hide();
            $('#edit_app_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Edit app background> error:',error);
            clear && clear();
            $('#edit_app_error_info').show();
            error && error.responseJSON && error.responseJSON.message && $('#edit_app_error_info').find('p').text(error.responseJSON.message);
        });
    }

    function del(data){
        $.ajax({
            url : '/apps/appview/',
            method : 'DELETE',
            data : data
        })
        .done(function(res){
            $('#delete_dialog').dialog('close');
            reset_view();
        })
        .fail(function(error){
            console.error('<Delete role> error:',error);
            $('#delete_error_info').show().find('p').text('There are users with this role!');
        })
    }

    function reset_view(url){
        setTimeout(function(){
            window.location.href = window.location.href + (url? url : '');
        }, 1000);
    }

    function changeAppLogo(imageurl){
        $.ajax({
            method : 'POST',
            url : '/apps/edit',
            data : {id : $('#appid').val(),logourl : imageurl}
        })
        .done(function(){
            
        })
        .fail(function(error){
            console.error('<App logo change> error:',error);
            alert('App logo has not been changed!');
        })
    }

    function checkCreateInput(){
        var $text = $('#create_name').val(),
            $text_fin = $('#create_name_fin').val(),
            $text_color = $('#create_text_color').val(),
            $back_color = $('#create_back_color').val(),
            $link = $('#create_link').val(),
            $notificationid = $('#create_notification').val(),
            $logourl = $('#create_logo').attr('src'),
            $border = $('#create_border'),
            $border_color = $('#create_border_color').val(),
            $border_width = $('#create_border_width').val(),
            $border_radius = $('#create_border_radius').val(),
            $box_shadow = $('#create_box_shadow').prop('checked'),
            $animation = $('#create_animation').prop('checked'),
            $notif_color = $('#create_notif_color').val(),
            $order = $('#create_order').val()

        var data = {};
        data.order = $('#create_order').val();

        var disp = function(text){
            $('#create_fill_fields').show().find('p').text(text);
        }

        if(!($text && $text.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.text = $text;

        if(!($text_fin && $text_fin.length > 1) ){
            disp('Entered name (Finnish) is incorrect');
            return false;
        }
        data.text_fin = $text_fin;

        if( !( $text_color && $text_color.length > 1)){
            disp('Select text color for button');
            return false;
        }
        data.text_color = $text_color;

        if( !($back_color && $back_color.length > 1)){
            disp('Select background color for button');
            return false;
        }
        data.back_color = $back_color;

        if( !($notif_color && $notif_color.length > 1)){
            disp('Select notification icon color for button');
            return false;
        }
        data.notif_color = $notif_color;

        if(!( $logourl && $logourl.length > 1)){
            disp('Select logourl for button');
            return false;
        }
        data.logourl = $logourl;

        if(!( $link && $link.length > 1)){
            disp('Select link for button');
            return false;
        }
        data.link = $link;

        if( !($notificationid && $notificationid.length > 1)){
            disp('Select notification for button');
            return false;
        }
        data.notificationid = $notificationid;

        if($border && $border.prop('checked')){
            data.border = 'true';
            if( !($border_color && $border_color.length > 1)){
                disp('Select border color for app');
                return false;
            }
            data.border_color = $border_color;

            if( !($border_width && $border_width.length > 1)){
                disp('Select border width for app');
                return false;
            }
            data.border_width = $border_width;

            if( !($border_radius && $border_radius.length > 1)){
                disp('Select border radius for app');
                return false;
            }
            data.border_radius = $border_radius;
        }

        if( $box_shadow )
            data.box_shadow = '7px 8px 14px 1px black';
        else 
            data.box_shadow = 'none';

        data.animation = $animation;

        return data;
    }

    function checkEditInput() {
        var $text = $('#edit_name').val(),
            $text_fin = $('#edit_name_fin').val(),
            $text_color = $('#edit_text_color').val(),
            $back_color = $('#edit_back_color').val(),
            $link = $('#edit_link').val(),
            $notificationid = $('#edit_notification').val(),
            $logourl = $('#edit_logo').attr('src'),
            $border = $('#edit_border'),
            $border_color = $('#edit_border_color').val(),
            $border_width = $('#edit_border_width').val(),
            $border_radius = $('#edit_border_radius').val(),
            $box_shadow = $('#edit_box_shadow').prop('checked'),
            $animation = $('#edit_animation').prop('checked'),
            $notif_color = $('#edit_notif_color').val(),
            $order = $('#edit_order').val()

        var data = {};
        data.order = $order;
        var disp = function(text){
            $('#edit_fill_fields').show().find('p').text(text);
        }

        if(!($text && $text.length > 1) ){
            disp('Entered name is incorrect');
            return false;
        }
        data.text = $text;

        if(!($text_fin && $text_fin.length > 1) ){
            disp('Entered name (Finnish) is incorrect');
            return false;
        }
        data.text_fin = $text_fin;

        if( !( $text_color && $text_color.length > 1)){
            disp('Select text color for button');
            return false;
        }
        data.text_color = $text_color;

        if( !($back_color && $back_color.length > 1)){
            disp('Select background color for button');
            return false;
        }
        data.back_color = $back_color;

        if( !($notif_color && $notif_color.length > 1)){
            disp('Select notification icon color for button');
            return false;
        }
        data.notif_color = $notif_color;

        if( $logourl && $logourl.length > 1){
            // disp('Select logourl for button');
            data.logourl = $logourl;
            // return false;
        }

        if(!( $link && $link.length > 1)){
            disp('Select link for button');
            return false;
        }
        data.link = $link;

        if( !($notificationid && $notificationid.length > 1)){
            disp('Select notification for button');
            return false;
        }
        data.notificationid = $notificationid;

        if($border && $border.prop('checked')){
            data.border = 'true';
            if( !($border_color && $border_color.length > 1)){
                disp('Select border color for app');
                return false;
            }
            data.border_color = $border_color;

            if( !($border_width && $border_width.length > 1)){
                disp('Select border width for app');
                return false;
            }
            data.border_width = $border_width;

            if( !($border_radius && $border_radius.length > 1)){
                disp('Select border radius for app');
                return false;
            }
            data.border_radius = $border_radius;
        }

        if( $box_shadow )
            data.box_shadow = '7px 8px 14px 1px black';
        else 
            data.box_shadow = 'none';

        data.animation = $animation;

        return data;
    }

    function checkEditAppInput() {
        var $back_color = $('#edit_app_back_color').val(),
            $back_image = $('#edit_app_logo').attr('src');
            
        var data = {};
    
        var disp = function(text){
            $('#edit_app_fill_fields').show().find('p').text(text);
        }

        if(!($back_color && $back_color.length > 1) ){
            disp('Entered background color is incorrect');
            return false;
        }
        data.back_color = $back_color;

        data.back_image = "/";
        if(($back_image && $back_image.length > 1) ){
            data.back_image = $back_image;
        }

        return data;
    }

    init_items();

});