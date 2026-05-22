/* global renditions, dataTrackingMain, disableRightClick */

/*
 ----------------------------------------------------------------------
 Asset Zoom
 Zoom in on an image on the asset detail page
 ----------------------------------------------------------------------
 */

var assetZoom;

assetZoom = (function () {
    'use strict';

    var assetId,
        assetFileLastModified,
        prevLink,
        nextLink,
        $zoomImg,
        $zoomTrigger,
        openOnInit,
        fallbackImageUrl;

    function init(zoomShouldBeOpenInitially, prev, next, aId, aFileLastModified, fallbackUrl) {
        assetId = aId;
        assetFileLastModified = aFileLastModified;
        prevLink = prev;
        nextLink = next;
        fallbackImageUrl = fallbackUrl;
        openOnInit = zoomShouldBeOpenInitially;

        initDomReferences();
        initZoomEventHandlers();
        initZoomViewer();

        if (openOnInit) {
            openZoomViewer();
        }
    }

    function initZoomEventHandlers(){
        $zoomTrigger.on('click', function() {
            openZoomViewer();
        });
    }

    function initDomReferences(){
        $zoomTrigger = $('.js-asset-modal-trigger');
        $zoomTrigger.addClass('is-ready');
        $zoomImg = $('.js-zoom-wrapper .js-asset-thumbnail');
    }

    function initZoomViewer() {
        $zoomImg.viewer({
            toolbar: getToolbarOptions(),
            navbar: false
        });
        $zoomImg.on('viewed', getLargeImageURL);
    }

    function openZoomViewer() {
        $zoomImg.viewer('show');
        dataTrackingMain.logEvent('Zoomed in on asset', 'Asset', 'Details page', {'Zoom opened on page load': openOnInit});
    }

    function getLargeImageURL(event) {
        renditions.renditionForElement(
            'assetZoom',
            event.detail.image,
            fallbackImageUrl,
            {
                assetId: assetId,
                timestamp: assetFileLastModified,
                preset: 'FULL_SIZE'
            },
            () => {},
            () => {},
            () => {}
        );

        if (shouldDisableRightClick()) {
            setTimeout(() => {
                disableRightClick($('.js-disable-right-click').data('disable-text'));
            });
        }
    }

    function getToolbarOptions() {
        var defaultButtonOptions = {show: 6, size: 'large'};
        var toolbarOptions = {
            prev: false,
            zoomIn: defaultButtonOptions,
            zoomOut: defaultButtonOptions,
            oneToOne: defaultButtonOptions,
            reset: defaultButtonOptions,
            rotateLeft: defaultButtonOptions,
            rotateRight: defaultButtonOptions,
            next: false
        };

        if (prevLink) {
            toolbarOptions.prev = {
                click: function () {
                    window.location.href = prevLink;
                },
                size: 'large',
                show: true
            };
        }

        if (nextLink) {
            toolbarOptions.next = {
                click: function () {
                    window.location.href = nextLink;
                },
                size: 'large',
                show: true
            };
        }

        return toolbarOptions;
    }

    function shouldDisableRightClick() {
        return $('.js-disable-right-click').length > 0;
    }

    return {
        init: init
    };

}());
