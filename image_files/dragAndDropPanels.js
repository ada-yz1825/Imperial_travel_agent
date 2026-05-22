
/*
--------------------------------------------------------------------
    Drag and drop elements
--------------------------------------------------------------------
*/

var dragAndDropPanels;

dragAndDropPanels = (function() {
    'use strict';

    function init($container, callback) {

        $container.sortable({
            placeholder: 'panel__placeholder',
            start: function(event, ui) {
                //fix the dimensions of the cloned asset panel you are dragging
                ui.helper.height($('.js-panel').first().height());
            },
            update: function(event, ui) {
                const droppedItemId = ui.item.attr('id');
                const droppedAssetId = droppedItemId.replace('draggable', '');
                let nextsiblingId = ui.item.next('li').attr('id');
                let nextSiblingAssetId;

                if (typeof nextsiblingId === 'undefined') {
                    //if moving to last position then just get the id of the last li, which in this case will be the previous one.
                    nextsiblingId = ui.item.prev('li').attr('id');
                    nextSiblingAssetId = -1;
                }
                else {
                    nextSiblingAssetId = nextsiblingId.replace('draggable', '');
                }

                callback(droppedAssetId, nextSiblingAssetId);
            }
        });
    }

    return {
        init:init
    };

}());
