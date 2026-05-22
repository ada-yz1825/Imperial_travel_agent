/*
--------------------------------------------------------------------
Handling logic operators for search e.g. NOT checkboxes
--------------------------------------------------------------------
*/

const searchOperatorControls = (function() {
    'use strict';

    let $logicNOTCheckboxes;

    function init() {
        $logicNOTCheckboxes = $('.js-logic-not-checkbox');
        $logicNOTCheckboxes.change( function(){
            toggleActiveState($(this));
        });
    }

    function toggleActiveState($checkbox){
        if ($checkbox.prop('checked')) {
            setActiveStateOnGroup($checkbox);
        } else {
            setNormalStateOnGroup($checkbox);
        }
    }

    function setActiveStateOnGroup($checkbox){
        $checkbox.closest('.js-logic-form-group').addClass('is-active');
    }

    function setNormalStateOnGroup($checkbox) {
        $checkbox.closest('.js-logic-form-group').removeClass('is-active');
    }

    return {
        init:init,
    };
}());
