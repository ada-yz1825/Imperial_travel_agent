/*global brightNotify, buttonStates, brightModal, dataTrackingMain */

/*
--------------------------------------------------------------------
    Featured Asset
    - Handles the featured asset cropping modal:
    If initalised with 'true' then the modal is open so also initialises the cropping tool
    If initialised without 'true', then it will just handle the unfeature button

--------------------------------------------------------------------
*/

var featuredAsset;

featuredAsset = (function() {
    'use strict';
    var $formUnfeature,
        $buttonUnfeature,
        $buttonFeatureSubmit,
        $featureModal,
        $cropImage,
        formUnfeatureAction,
        assetId,
        csrfName,
        csrfValue,
        targetUrl,
        callbackFunction,
        canvasWidth,
        canvasHeight,
        conversionQuality,
        viewportWidth,
        viewportHeight,
        boundaryWidth,
        boundaryHeight,
        featuredAddedMsg,
        featuredRemovedMsg;

    const UNABLE_TO_ADD_ERROR = 'Unable to feature this asset at this time - please try again later, or contact support.';
    const UNABLE_TO_REMOVE_ERROR = 'Unable to unfeature this asset at this time - please try again later, or contact support.';

    function init(featureModalOpen, callbackFun) {
        initVars(callbackFun);

        // Initialise external modules
        brightNotify.init();
        buttonStates.init();

        if(featureModalOpen === true){
            // Initialise image cropper
            imageCropperInit();
            // Add a loading state to the croppie modal
            $featureModal.addClass('modal--loading-croppie');
        }
        else {
            $buttonUnfeature.click( function(e){
                e.preventDefault();
                $(this).trigger('state.loading');
                unfeatureAsset();
            });
        }

        $buttonFeatureSubmit.click( function(e){
            e.preventDefault();
            $(this).trigger('state.loading');
            submitFeatureAsset();
        });
    }

    function initVars(callbackFun) {
        // Setup vars
        $formUnfeature = $('.js-unfeature-form');
        $buttonUnfeature = $('.js-button-unfeature');
        $buttonFeatureSubmit = $('.js-feature-submit');
        $featureModal = $('#utilityModal');
        $cropImage = $('.js-image-to-crop');
        formUnfeatureAction = $formUnfeature.attr('action');
        assetId = $('.js-asset-id').val();
        csrfName = $('.js-csrf').attr('name');
        csrfValue = $('.js-csrf').val();
        targetUrl = $('.js-featured-target').val();
        canvasWidth = $('.js-canvas-width').val();
        canvasHeight = $('.js-canvas-height').val();
        conversionQuality = $('.js-conversion-quality').val();
        featuredAddedMsg = $('.js-featured-msg-success').val();
        featuredRemovedMsg = $('.js-featured-msg-remove').val();
        viewportWidth =700;
        viewportHeight = 278;
        boundaryWidth = 950;
        boundaryHeight = 500;
        callbackFunction = callbackFun;
    }

    function imageCropperInit() {
        window.imageCropper = $cropImage.croppie({
            viewport: { width: viewportWidth, height: viewportHeight },
            boundary: { width: boundaryWidth, height: boundaryHeight }
        });

        $cropImage.on('load', function(){
            // Wait for the image to load before enabling the button
            $buttonFeatureSubmit.attr('disabled', false);
            // Remove loading class
            setTimeout(function(){ $featureModal.removeClass('modal--loading-croppie'); }, 500);
        });

    }

    function unfeatureAsset(){
        $.ajax({
            type: 'POST',
            url: formUnfeatureAction+'?id='+assetId+'&'+csrfName+'='+csrfValue,
            success: function() {
                $buttonUnfeature.hide();
                brightNotify.notifyMessage('confirm', featuredRemovedMsg);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest, textStatus, errorThrown);
                brightNotify.notifyMessage('error', UNABLE_TO_REMOVE_ERROR);
            }
        });
    }

    function sendFeaturedAssetResponse(data){
        if (data.featuredAssetIsValid) {
            brightModal.closeModal($('#utilityModal'));
            brightNotify.notifyMessage('confirm', featuredAddedMsg);
        }
        else {
            brightNotify.notifyMessage('warning', data.errorMessage);
        }
    }

    function submitFeatureVideoAsset(){
        var assetId = $('.js-asset-id').val();
        var csrfName = $('.js-csrf').attr('name');
        var csrfValue = $('.js-csrf').val();

        $.ajax({
            type: 'POST',
            url: '../go/featuredAsset/add?id='+assetId+'&'+csrfName+'='+csrfValue,
            success: function(data) {
                sendFeaturedAssetResponse(data);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest, textStatus, errorThrown);
                brightNotify.notifyMessage('error', UNABLE_TO_ADD_ERROR);
            }
        });
    }

    function submitFeatureAsset(){
        const args = {
            type: 'canvas',
            size: { width: canvasWidth, height: canvasHeight },
            backgroundColor: '#ffffff',
            format: 'jpeg',
            quality: conversionQuality
        };
        return window.imageCropper.croppie('result', args).then(function(blob) {
            const stringData = blob.replace(/data:.*;base64,/, '');
            if (targetUrl) {
                fetch(targetUrl,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        body: JSON.stringify({stringData: stringData})
                    }
                )
                .then(response => {
                    if (!response.ok) {
                        brightNotify.notifyMessage('error', UNABLE_TO_ADD_ERROR);
                        return;
                    }
                    return response.json();
                })
                .then(response => {
                    dataTrackingMain.logEvent('Asset was featured', 'Asset', 'Details page');
                    sendFeaturedAssetResponse(response);
                });
            } else {
                callbackFunction(stringData);
            }
        });
    }

    return {
        init: init,
        imageCropperInit: imageCropperInit,
        submitFeatureAsset: submitFeatureAsset,
        submitFeatureVideoAsset: submitFeatureVideoAsset
    };

}());
