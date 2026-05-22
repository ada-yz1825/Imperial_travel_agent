/*
--------------------------------------------------------------------------
Truncate form value fields
- Handles show more/less links
-------------------------------------------------------------------------
*/

const truncateAttributeValues = (function() {
    'use strict';

    var $formControlValues,
        $attributeHeadings,
        $moreLessLinks,
        topPadding,
        maxFieldHeight,
        maxInitialTags;

    function init() {
        $formControlValues = $('.js-truncation-value');
        $moreLessLinks = $('.js-more-less-link');
        $attributeHeadings = $('.js-attribute-heading');
        maxFieldHeight = 256;
        topPadding = 1;
        maxInitialTags = 10;
        checkFieldsForOverflow();

        $moreLessLinks.click( function() {
            toggleExpanded($(this));
        });

        $attributeHeadings.click( function() {
            checkFieldsForOverflow();
        });
    }

    function checkFieldsForOverflow() {
        $formControlValues.each( function() {
            if (isTagsField($(this).parent())) {
                truncateTagsField($(this));
            } else {
                if ($(this).outerHeight() > maxFieldHeight + topPadding) {
                    $(this).parent().addClass('is-truncated');
                }
            }
        });
    }

    function toggleExpanded($toggleLink) {
        let $parentFormGroup = $toggleLink.parent();

        $parentFormGroup.toggleClass('is-expanded');

        if (isTagsField($parentFormGroup)) {

            if ($parentFormGroup.hasClass('is-expanded')) {
                showAllTags($parentFormGroup);
            } else {
                hideTags($parentFormGroup);
            }
        }
    }

    function truncateTagsField($formControl) {
        hideTags($formControl);

        if (tagFieldNeedsToBeTruncated(getTagCount($formControl))) {
            $formControl.parent().addClass('tags-are-truncated');
        }
    }

    function showAllTags($formGroup) {
        let $tagsWithinField = $formGroup.find('.js-tag');

        $tagsWithinField.each( function(){
            $(this).show();
            $(this).next('.js-delimiter').show();
        });
    }

    function hideTags($formControl) {
        let $tagsWithinField = $formControl.find('.js-tag');
        let totalTags = $tagsWithinField.length;
        let tagCount = 0;

        if (tagFieldNeedsToBeTruncated(totalTags)) {
            $tagsWithinField.each( function(){
                tagCount = tagCount + 1;
                if (tagFieldNeedsToBeTruncated(tagCount)) {
                    $(this).hide();
                    $(this).next('.js-delimiter').hide();
                }
            });
        }
    }

    function isTagsField($formGroup) {
        return $formGroup.hasClass('is-tags-field');
    }

    function getTagCount($formControl) {
        return $formControl.find('.js-tag').length;
    }

    function tagFieldNeedsToBeTruncated(tagCount) {
        return tagCount > maxInitialTags;
    }

    return {
        init: init
    };

}());
