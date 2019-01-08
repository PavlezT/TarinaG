$(document).ready(function(){

    $( ".draggable" ).draggable({
        cursor: "move",
        containment : "#content_links", 
        scroll: false,
        // snap: "#sortable", 
        connectToSortable : "#sortable",
        cursorAt: { top: -1, left: -1 },
        helper: function( event ) {
          return $( `<li class="ui-state-default ui-sortable-handle phone_link_item" link-data='{"sourceId":"`+event.currentTarget.id+`"}'>`+event.currentTarget.id+'</li>' );
        },
        stop : function( event, ui ){
            init_items();
            openModal(ui,true);
        }
      });

    $( "#sortable" ).sortable({
        revert: true
      });

    init_items();

    function init_items(){
        $('.phone_link_item').unbind( "click" ).click(function(event){
            var data = $(this).attr('data');
            openModal(this,false);
        })
    }

    function openModal(ui,add_new){
        var $target = add_new ? $(ui.helper[0]) : $(ui);
        var data = JSON.parse($target.attr('link-data'));
        
        $("#dialog" ).dialog({
            width: 400,
            title: data.sourceId,
            modal: true
        });

        if(add_new){
            $('#delete').hide();
            $('#cancel').unbind('click').click(function(){
                deleteLink($target);
                $("#dialog" ).dialog('close');
            });
        } else {
            $('#delete').show();
            $('#delete').unbind('click').click(function(){
                deleteLink($target);
                $("#dialog" ).dialog('close');
            })
            $('#cancel').unbind('click').click(function(){
                $("#dialog" ).dialog('close');
            });
        }

        $('#add').show();

        $('#okey_info').hide();
        $('#error_info').hide();
        $('#fill_fields').hide();
    }

    function deleteLink($target){
        $target.remove();
    }

    // function sendMessage(text,schadule,date){
    //     var data = {
    //         id : Date.now(),
    //         text : text,
    //         schadule : schadule,
    //         date : date
    //     }

    //     $.ajax({
    //         url: '/message',
    //         method : 'POST',
    //         data : data,
    //         async : true
    //     })
    //     .done(function(data){
    //         console.log('message:',data);
    //         setTimeout(() => {
    //             window.location.href = window.location.href.toString();
    //         }, 1000);
    //     })
    //     .fail(function(error){
    //         console.error("error:",error);
    //     })
    // }

    // function check(text,schadule,time,date){
    //     if(!text || text.length == 0 )
    //         return false;

    //     if(schadule){
    //         if(!date || date.length == 0)
    //             return false;
    //         if(!time || time.length == 0)
    //             return false;
    //         try{
    //             var date1 = new Date(date);
    //             var time1 = new Date(time);
    //             date1.setHours(time1.getHours());
    //             date1.setMinutes(time1.getMinutes());
    //             if(!date1.toJSON() || date1.toJSON().length == 0)
    //                 return false;
    //         }catch(e){
    //             return false;
    //         }
    //     }
    //     return true;
    // }
});