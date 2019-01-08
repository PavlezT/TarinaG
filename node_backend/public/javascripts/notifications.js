$(document).ready(function(){

    $('.main_buttom').click(function(event){
        var action = $(this).attr('id');
        var $target = $("input[name='radio-1']:checked");
        if($target.length == 1 || action == "create"){
            openModal(action,$target.attr('data'));
        }
    })

    $('#selected_app').change(function(event){
        var app_id = $(this).val();
        $('.live_users').each(function(mass,item){
            if( app_id == (JSON.parse($(item).find('input').attr('data'))).app_id)
                $(item).show();
            else
                $(item).hide();
        })
    }).change();

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
        $("#dialog" ).dialog({
            width: 400,
            modal: true}
        );
        $('#cancel').show();
        $('#add').show();
        $("#progressbar" ).hide();
        $('#okey_info').hide();
        $('#error_info').hide();
        $('#fill_fields').hide();
        $('#name').val('');
        $('#link').val('');

        $("#add").click(function(event){
            var link = $('#link').val();
            var name = $('#name').val();
            $('#fill_fields').hide();
            if( (name && name.length > 1) && ( link && link.length > 1)){
                $('#cancel').hide();
                $('#add').hide();
                $( "#progressbar" ).progressbar({
                    value: false
                }).show();
                addNewFeed(name,link);
            } else {
                $('#fill_fields').show();
            }
                
            event.preventDefault();
        })    

        $('#cancel').click(function(event){
            $("#dialog" ).dialog('close');
            event.preventDefault();
        });
    }

    function openDeleteModal(data){
        $("#delete_dialog" ).dialog({
            width: 400,
            title : "Delete notification: "+ data.name,
            modal: true}
        );

        $('#delete_error_info').hide();
        $('#delete_progressbar').hide();

        $('#delete_cancel').click(function(event){
            $("#delete_dialog" ).dialog('close');
            event.preventDefault();
        })

        $('#delete_notif').click(function(){
            $('#delete_progressbar').show();
            del(data);
        });

        function del(incom) {
            var id = incom.id;
            $.ajax({
                url: "/notifications/delete",
                method: "POST",
                data: { id: id },
                async: false
            })
            .done(function (res) {
                console.log('deleting done', res);
                $('#delete_progressbar').hide();
                window.location.href = window.location.href.toString();
            })
            .fail(function(error) {
                $('#delete_progressbar').hide();
                console.error('error deleting :', error);
                $('#delete_error_info').show();
            });
        }
    }

    function openEditModal(data) { 
        $('#edit_dialog').dialog({
            width: 400,
            title : "Edit notification: "+ data.name,
            modal: true
        });

        $('#edit_name').val(data.name || '');
        $('#edit_link').val(data.link || '');

        $('#edit_okey_info').hide();
        $('#edit_fill_fields').hide();
        $('#edit_error_info').hide();
        $('#progressbar_edit').hide();

        $('#cancel_edit').click(function(){
            $('#edit_dialog').dialog('close');
        })

        $('#edit_yes').click(function(){
            var link = $('#edit_link').val();
            var name = $('#edit_name').val();
            $('#edit_fill_fields').hide();
            if( (name && name.length > 1) && ( link && link.length > 1)){
                $( "#progressbar_edit" ).progressbar({
                    value: false
                }).show();
                editFeed(data.id,name,link);
            } else {
                $('#edit_fill_fields').show();
            }
                
            event.preventDefault();
        })

    }

    function addNewFeed(name,link){
        var url = "/notifications";
        var feed = {
            id : (new Date(Date.now())).getTime().toString(),
            name : name,
            link : link,
            app_id : $('#selected_app').val()
        };

        $.ajax({
            url : url,
            method : "POST",
            data : feed,
            async : false
        })
        .done(function(data){
            console.log('feed added:',data)
            $("#progressbar" ).hide();
            endloading(false);
        })
        .fail(function(error){
            console.error('error adding feed:',error)
            $("#progressbar" ).hide();
            endloading(true);
        })

        function endloading(error){
            if(error){
                $('#error_info').show();
            } else {
                $('#okey_info').show();
                $("#dialog" ).effect( "fade", 1000,function(){
                    $(this).dialog('close');
                    window.location.href = window.location.href.toString();
                })
            }
        }
    }

    function editFeed(id,name,link){
        var url = "/notifications/edit";
        var feed = {
            id : id,
            name : name,
            link : link,
            app_id : $('#selected_app').val()
        };

        $.ajax({
            url : url,
            method : "POST",
            data : feed,
            async : false
        })
        .done(function(data){
            console.log('feed added:',data)
            $("#progressbar_edit" ).hide();
            $('#edit_okey_info').show();
            window.location.href = window.location.href.toString();
        })
        .fail(function(error){
            console.error('error adding feed:',error)
            $("#progressbar_edit" ).hide();
            $('#edit_error_info').show();
        })
    }

});