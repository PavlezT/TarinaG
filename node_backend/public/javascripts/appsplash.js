$(document).ready(function(){

    $('input#create_back_color').ColorPicker({
        onSubmit: function(hsb, hex, rgb, el) {
            $(el).val('#'+hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($(this).val());
        }
    })

    function init_items(){
        $('.main_buttom').click(function(event){
            var action = $(this).attr('id');
            var $target = $(this);
            if($target.length == 1 || action ){
                openModal(action,$target.attr('data'));
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

    function openCreateModal(){
        $('#create_dialog').dialog({
            width: 400,
            modal: true
        });
    
        $('#create_cancel').unbind('click').click(function(){
            $('#create_dialog').dialog('close');
        });
        
        $('#create_logo').unbind('click').click(function(){
            openModal('image',{logourl : $(this).val(),callback : function(imgurl){
                $('#create_logo').attr('src',imgurl);
            }});
        })

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
            url : '/apps/appsplash/'+$('#appid').val(),
            method : 'POST',
            data : data
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

    function reset_view(url){
        setTimeout(function(){
            window.location.href = window.location.href + (url? url : '');
        }, 1000);
    }

    function checkCreateInput(){
        var $timer = $('#create_timer').val(),
            $backcolor = $('#create_back_color').val(),
            $imageUrl = $('#create_logo').attr('src'),
            $link = $('#create_link').val();

        var data = {};

        var disp = function(text){
            $('#create_fill_fields').show().find('p').text(text);
        }

        if(!($timer && $timer > 0) ){
            disp('Entered time is incorrect');
            return false;
        }
        data.timer = $timer;

        if(!($backcolor && $backcolor.length > 0) ){
            disp('Entered background color is incorrect');
            return false;
        }
        data.backcolor = $backcolor;

        if(!($imageUrl && $imageUrl.length > 0) ){
            disp('Entered image url is incorrect');
            return false;
        }
        data.imageUrl = $imageUrl;

        if(!($link && $link.length > 0) ){
            disp('Entered link is incorrect');
            return false;
        }
        data.link = $link;

        return data;
    }

    init_items();

});