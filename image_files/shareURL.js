/* global dataTrackingMain */

var shareURL;

// -----------------------------------------------
//  This module takes care of the functionality
//  needed once the share by email form has been loaded
//  into the modal.
//  It is called by modals.js
// -----------------------------------------------

shareURL = (function () {
    'use strict';

    var $modal,
        $form,
        $shareLink,
        $copyToClipboardButton,
        $termsCheckboxes,
        $shareLinkLoading;

    function init($shareModal) {
        // init some DOM references
        $modal = $shareModal;
        $form = $modal.find('#shareForm');
        $shareLink = $modal.find('.js-sharing-url');
        $copyToClipboardButton = $modal.find('.js-sharing-url-copy-button');
        $termsCheckboxes = $modal.find('.js-terms-checkboxes input[type="checkbox"]');
        $shareLinkLoading = $modal.find('.js-sharing-url-loading');

        $copyToClipboardButton.on('click', function (e) {
            e.preventDefault();
            if ($('.allow-autofocus').length > 0) {
                $shareLink.focus();
            }
            dataTrackingMain.logEvent('Asset shared by URL', 'Asset share', 'Share modal');

            $shareLink.select();
            document.execCommand('Copy');
            onCopyToClipBoard($modal);
        });

        $shareLink.on('click', function () {
            dataTrackingMain.logEvent('Asset shared by URL', 'Asset share', 'Share modal');
            this.select();
        });

        $termsCheckboxes.on('click', function () {
            var allChecked = true;
            $termsCheckboxes.each(function () {
                allChecked = allChecked && this.checked;
            });
            if(allChecked) {
                $termsCheckboxes.prop('disabled', true);
                generateSharingUrl();
            }
        });
    }

    function onCopyToClipBoard($modal) {
        $modal.find('.js-share-inline-url').addClass('was-copied');
        setTimeout(() => {
            $modal.find('.js-share-inline-url').removeClass('was-copied');
        }, 1000);
    }

    function generateSharingUrl() {
        setLoadingStatus();
        $form.ajaxSubmit({
            success: populateSharingUrl,
            error: onGenerateSharingUrlFailure
        });
    }

    function setLoadingStatus() {
        $shareLinkLoading.show();
        $shareLink.val('...');
    }

    function populateSharingUrl(response) {
        $shareLinkLoading.hide();
        $copyToClipboardButton.removeClass('is-disabled');
        $shareLink.removeClass('disabled');
        $shareLink.val(JSON.parse(response).sharingUrl);
    }

    function onGenerateSharingUrlFailure(xhr, status, message) {
        $modal.find('.modal-body').html('<div class="msg-error">Error: ' + xhr.status + ' ' + message + '</div>');
    }


    return {
        init: init
    };

}());
