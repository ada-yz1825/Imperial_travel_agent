/*
--------------------------------------------------------------------------
Fixed height columns
Due to the fixed header/nav layout and variable header height
some columns need a calculated height in order to have overflow scroll.
-------------------------------------------------------------------------
*/

const fixedHeightColumns = (function() {
    'use strict';

    var $columns,
        $header,
        $pageNotification,
        resizeThrottleTimeout,
        responsiveThreshold,
        minColumnHeight,
        resizeTimer;

    function init() {
        $columns = $('.js-fixed-height-column');
        $header = $('.js-header');
        $pageNotification = $('.js-page-notifications');
        resizeThrottleTimeout = 100;
        responsiveThreshold = 1024;
        minColumnHeight = '512px';

        $(window).on('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                setHeightOfColumns();
            }, resizeThrottleTimeout);
        });

        setHeightOfColumns();
    }

    function setHeightOfColumns() {
        $columns.each( function(){
            if (shouldUseMobileLayout()) {
                if ($(this).hasClass('js-min-height')) {
                    $(this).css('min-height', minColumnHeight).css('height', minColumnHeight);
                } else {
                    $(this).css('height', 'auto');
                }
            } else {
                let headerHeight = getHeaderHeight();
                let notificationHeight = hasPageNotifications() ? getNotificationsHeight() : 0;
                let offsetHeight = headerHeight + notificationHeight;
                $(this).css('height', 'calc(100vh - ' + offsetHeight + 'px)');
            }
        });
    }

    function getHeaderHeight() {
        return $header.outerHeight();
    }

    function getNotificationsHeight() {
        return $pageNotification.outerHeight();
    }

    function hasPageNotifications() {
        return $('.js-page-notifications').length > 0;
    }

    function shouldUseMobileLayout() {
        return $(window).innerWidth() <= responsiveThreshold || $('.js-is-article').length > 0;
    }

    return {
        init: init
    };

}());
