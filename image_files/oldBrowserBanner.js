
/*
---------------------------------------------------------------------------------------
    oldBrowserBanner
---------------------------------------------------------------------------------------
    Show old browser banner if they are using an old browser
    If they have closed it we can save it locally so it doesn't keep popping up
---------------------------------------------------------------------------------------
*/

var oldBrowserBanner;

oldBrowserBanner = (function() {
    'use strict';

    var $closeTriggers,
        $banner;

    function init() {

        $closeTriggers = $('.js-browser-banner-close');
        $banner = $('.js-old-browser-banner');

        $closeTriggers.click( function(event){
            event.preventDefault();
            hideBanner();
            saveBannerClose();
        });

        if (usingInternetExplorer() && !hasSeenBannerBefore()) {
            $banner.addClass('is-visible');
        } else {
            preventScreenReaderFromReading();

        }
    }

    function hideBanner() {
        $banner.removeClass('is-visible');
    }

    function preventScreenReaderFromReading() {
        $banner.html('');
    }

    function saveBannerClose() {
        localStorage.hasClosedOldBrowser = true;
    }

    function hasSeenBannerBefore() {
        return localStorage.hasClosedOldBrowser !== undefined;
    }

    function usingInternetExplorer() {
      var userAgent = navigator.userAgent;
      /* MSIE used to detect old browsers and Trident used to newer ones*/
      return userAgent.indexOf('MSIE ') > -1 || userAgent.indexOf('Trident/') > -1;
    }

    return {
        init:init
    };

}());
