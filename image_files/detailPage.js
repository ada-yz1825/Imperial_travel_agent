/* global contextUrl, callRestEndpoint, loadOnDemandImages, dataTrackingMain, lazyLoad */
/*
--------------------------------------------------------------------------
Controls for the detail page
-------------------------------------------------------------------------
*/

const detailPage = (function() {
    'use strict';

    var $viewPage,
        $columnToggle,
        maxNumberOfRelatedInStrip,
        $relatedAssetLinks,
        $backToPreviousLink,
        $stripOfAssets,
        defaultPlaceholders;

    function init() {
        $viewPage = $('.js-view-page');
        $columnToggle = $('.js-column-toggle');
        $stripOfAssets = $('.js-related-strip');
        $backToPreviousLink = $('.js-details-back-link');
        defaultPlaceholders = $stripOfAssets.html();
        maxNumberOfRelatedInStrip = 12;

        $columnToggle.click( function() {
            const panelIsClosed = $viewPage.hasClass('hiding-right-column');
            callToggleViewAssetPanelEndpoint(panelIsClosed)
                .then(_ => {
                    $viewPage.toggleClass('hiding-right-column');
                });
        });

        $backToPreviousLink.click( function(event) {
            event.preventDefault();
            window.history.go(-1);
        });

        if (relatedAssetsArePresent()) {
            cloneRelatedAssetsToPlaceholders();
            loadOnDemandImages.init();
        }

        setupAssetUsageModalsForAdmins();
        hideAddLinkIfNoRelations();
    }

    function setupAssetUsageModalsForAdmins() {
        if ($('.js-stats-block-admin').length > 0 && $('.js-asset-usage-trigger').length > 0) {
            $('.js-stats-block-non-admin').hide();
            $('.js-stats-block-admin').show();
        }
    }

    function cloneRelatedAssetsToPlaceholders() {
        $relatedAssetLinks = $('.js-panel-link');

        $('.js-related-asset-holder').each(function(index) {
            $(this).append($relatedAssetLinks.eq(index).clone());
        });

        lazyLoad.loadThumbs($('.js-related-asset-holder'));

        $('.js-panel-link').click( function(){
            dataTrackingMain.logEvent('Related asset viewed', 'Asset', 'Details page');
        });
    }

    function relatedAssetsArePresent() {
        return $('.js-panel-link').length > 0;
    }

    function refreshListOfRelatedAssets() {
        $stripOfAssets.html(defaultPlaceholders);
        cloneRelatedAssetsToPlaceholders();
    }

    function hideAddLinkIfNoRelations() {
        if ($('.js-related-assets-tab').length < 1 && $('.js-add-related-link').length > 0) {
            $('.js-add-related-link').hide();
        }
    }

    return {
        init: init,
        refreshListOfRelatedAssets: refreshListOfRelatedAssets
    };

}());

function callToggleViewAssetPanelEndpoint(currentlyClosed) {
    const open = currentlyClosed ? 1 : 0;
    return callRestEndpoint(
        `${contextUrl}/action/toggleViewAssetPanel?switch=${open}`,
        'GET'
    );
}
