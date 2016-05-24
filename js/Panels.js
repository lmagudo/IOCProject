//#region Paneles Draggables
$(".draggablePanel").each(function () {
    $(this).hasClass("panel") ? $(this).draggable({        
        handle: ".panel-heading"
    }): $(this).draggable({
        handle: ".modal-header"
    });
});
//#endregion
