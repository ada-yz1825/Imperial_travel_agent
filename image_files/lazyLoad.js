/*
--------------------------------------------------------------------------
Lazy loads images
-------------------------------------------------------------------------
*/

const lazyLoad = (function() {
    'use strict';

    function loadThumbs($container) {
        let lazyThumbnails = $container.find('.js-asset-thumbnail');

        lazyThumbnails.each( function(){
            if (hasNotBeenLoaded($(this))) {
                $(this).attr('src', $(this).data('src'));
                $(this).addClass('was-lazy-loaded');
            }
        });
    }

    function hasNotBeenLoaded($preview) {
        return $preview.hasClass('was-lazy-loaded') === false;
    }

    return {
        loadThumbs: loadThumbs
    };

}());
