/* global Vue, csrfToken, contextUrl, AbortSignal, fetchForRedirect, fetchWithInterruptibleRetry, getParam, Cropper, assetToolbar, brightNotify, callRestEndpoint, alert, springCsrfToken, niceBytes, renditions, formatDimensions, dataTrackingMain, primevue, inputNavigation, tippy */
const ROOT_USAGE_TYPE = {id: -1, hasChildren: true};
const PERFORM_DOWNLOAD_STEP = 'PERFORM_DOWNLOAD';
const REQUEST_HIGH_RES_APPROVAL_STEP = 'REQUEST_HIGH_RES_APPROVAL';


class DownloadSource {
    static VIDEO_MEDIA_TYPE = 3;
    static IMAGE_MEDIA_TYPE = 2;
    static FILE_MEDIA_TYPE = 1;

    constructor(assets, sourceCategoryId, sourceCategoryTypeId, allSelected) {
        this.assets = assets;
        this.sourceCategoryId = sourceCategoryId;
        this.sourceCategoryTypeId = sourceCategoryTypeId;
        this.allSelected = allSelected;
    }
    approvalState() {
        if (this.userRequiresHighResApproval) {
            if (this.assets.every(asset => asset.approvalStatusId === 2 || asset.approvalStatusId === 4)) {
                return 'APPROVED';
            } else if (this.assets.some(asset => asset.approvalStatusId === 3)) {
                return 'DENIED';
            }
        }
        return 'INFO';
    }
    userNeedsHighResApprovalOnSome() {
        return this.assets.some(asset => asset.requiresHighResPermission && !asset.hasHighResPermission);
    }
    assetIds() {
        return this.assets.map(asset => asset.id);
    }
    fileExtensionsString() {
        return this.assets.map(asset => asset.fileExtension).join(', ');
    }
    isSingleAsset() {
        return this.assets.length === 1;
    }
    firstAsset() {
        return this.assets[0];
    }
    allAssetsAreVideos() {
        return this.assets.every(asset => asset.typeId === DownloadSource.VIDEO_MEDIA_TYPE);
    }
    allAssetsAreImages() {
        return this.assets.every(asset => asset.typeId === DownloadSource.IMAGE_MEDIA_TYPE);
    }
    allAssetsHaveVideoPreviewUrl() {
        return this.assets.every(asset => asset.videoPreviewUrl);
    }
    someAssetsAreImages() {
        return this.assets.some(asset => asset.typeId === DownloadSource.IMAGE_MEDIA_TYPE);
    }
    someAssetsAreVideos() {
        return this.assets.some(asset => asset.typeId === DownloadSource.VIDEO_MEDIA_TYPE);
    }
    noAssetsAreImages() {
        return !this.someAssetsAreImages();
    }
    mediaTypeIds() {
        return this.assets.map(asset => asset.typeId);
    }
    termsMediaType() {
        if (this.allAssetsAreImages()) {
            return DownloadSource.IMAGE_MEDIA_TYPE;
        } else if (this.allAssetsAreVideos()) {
            return DownloadSource.VIDEO_MEDIA_TYPE;
        }
        return DownloadSource.FILE_MEDIA_TYPE;
    }
    hasSubtitles() {
        return this.assets.some(asset => asset.hasSubtitles);
    }
    hasAgreement() {
        return this.assets.some(asset => asset.hasAgreement);
    }
    agreements() {
        return this.assets.map(asset => asset.agreement);
    }
    downloadAttributes() {
        return this.assets.flatMap(asset => asset.downloadAttributes);
    }
    cameFromBrowse() {
        return this.sourceCategoryId !== undefined && this.sourceCategoryId > 0;
    }
    usageTypeMaxHeight() {
        return this.assets.length > 0 ? Math.max(...this.assets.map(asset => asset.height)) : 0;
    }
    usageTypeMaxWidth() {
        return this.assets.length > 0 ? Math.max(...this.assets.map(asset => asset.width)) : 0;
    }
    isStale(newAssetIds) {
        return !(newAssetIds.every(id => this.assetIds().includes(id)) && this.assets.length === newAssetIds.length);
    }
}


const QuickDownloadApp = {
    props: {
        config: Object,
        assetIds: Array
    },
    data() {
        return {
            downloadSource: undefined,
            currentModal: 'NONE',
            currentUsageTypeFormat: undefined,
            currentUsageType: ROOT_USAGE_TYPE,
            usageTypeFormatsFromApi: [],
            usageTypesFromApi: [],
            currentCropData: undefined,
            currentDetails: undefined,
            showTsAndCs: true,
            isLastStep: false,
            modalOrder: [],
            clippingInProgress: false,
            isLoaded: false
        };
    },
    mounted() {
        this.listenForResize();
        this.isLoaded = true;
    },
    computed: {
        showVideoClipping() {
            return this.config.showDownloadOriginal &&
                this.config.showVideoClipping &&
                this.config.hasUser &&
                this.downloadSource.isSingleAsset() &&
                this.downloadSource.allAssetsAreVideos() &&
                this.downloadSource.allAssetsHaveVideoPreviewUrl() &&
                (this.promotedUsageType.id > 0 || this.currentUsageType.id > 0);
        },
        showSubtitleExtension() {
            return this.config.subtitlesEnabled && this.downloadSource.allAssetsAreVideos() && this.downloadSource.hasSubtitles();
        },
        downloadOriginalUsageTypesExist() {
            return this.usageTypes.findIndex(type => type.downloadOriginal) >= 0;
        },
        nonImagesWithNoDownloadOriginalOption() {
            return this.downloadSource.noAssetsAreImages() && this.promotedUsageType.id <= 0 && !this.downloadOriginalUsageTypesExist;
        },
        promotedUsageType() {
            const promotedType = this.usageTypesFromApi.find(usageType => usageType.isPromotedInQuickDownload);
            return promotedType ? {...promotedType, downloadImmediately: true} : {id: -1};
        },
        termsAndConditionsType() {
            if (this.downloadSource.allAssetsAreVideos()) {
                return 'VIDEO';
            } else if (this.downloadSource.allAssetsAreImages()) {
                return 'IMAGE';
            }
            return 'FILE';
        },
        usageTypesOpen() {
            return this.currentUsageType.id > 0;
        },
        shouldShowBlockButton() {
            return this.config.inToolbar === 'false';
        },
        usageTypes() {
            return this.usageTypesFromApi.filter(usageType => {
                const isMultiAssetDownload = !this.downloadSource.isSingleAsset();
                const isSingleImageAndUsageTypeHasChildren = this.downloadSource.firstAsset().typeId === 2 && usageType.hasChildren;
                const isDownloadOriginalUsageTypeWithoutChildren = usageType.downloadOriginal && this.config.showDownloadOriginal && !usageType.hasChildren;
                const isPromoted = usageType.id === this.promotedUsageType.id;
                return (isMultiAssetDownload || isSingleImageAndUsageTypeHasChildren || isDownloadOriginalUsageTypeWithoutChildren) && !isPromoted;
            });
        },
    },
    methods: {
        getAssetsAndSetupDownloadSource() {
            if (this.downloadSource === undefined || this.downloadSource.isStale(this.assetIds)) {
                return callGetDownloadParams(this.assetIds).then(response => {
                    this.downloadSource = new DownloadSource(response.assets, response.sourceCategoryId, response.sourceCategoryTypeId, response.allSelected);
                    this.showTsAndCs = !response.termsViewed;
                    this.setupModalOrdering();
                });
            }
            return Promise.resolve();
        },
        navigateToOldDownload() {
            navigateToOldDownload(undefined, this.downloadSource);
        },
        setupModalOrdering() {
            this.modalOrder = [];
            if (this.downloadSource.userNeedsHighResApprovalOnSome() || this.downloadSource.approvalState() === 'APPROVED') {
                this.modalOrder.push('HIGH_RES_APPROVAL_STATUS');
            }
            if (this.showTsAndCs) {
                this.modalOrder.push('TERMS');
            }
            if (this.downloadSource.hasAgreement()) {
                this.modalOrder.push('AGREEMENTS');
            }
            if (this.downloadSource.downloadAttributes().length > 0) {
                this.modalOrder.push('ATTRIBUTES');
            }
            this.modalOrder.push('DOWNLOAD');
            if (this.currentUsageType.id > 0 && this.currentUsageType.downloadMessage) {
                this.modalOrder.push('DOWNLOAD_MESSAGE');
            }
            if (this.currentUsageType.id > 0 && this.currentUsageType.canEnterDetails) {
                this.modalOrder.push('ENTER_DETAILS');
            }
            if (this.downloadSource.isSingleAsset() && this.currentUsageTypeFormat && this.currentUsageTypeFormat.cropToFit) {
                this.modalOrder.push('CROP_TO_FIT');
            }
            if (this.downloadSource.userNeedsHighResApprovalOnSome() && this.currentUsageType.id > 0 && this.currentUsageType.highRes) {
                this.modalOrder.push(REQUEST_HIGH_RES_APPROVAL_STEP);
                this.modalOrder.push('HIGH_RES_APPROVAL_REQUESTED_MESSAGE');
            } else {
                this.modalOrder.push(PERFORM_DOWNLOAD_STEP);
            }
        },
        listenForResize() {
            window.addEventListener('resize', () => {
                if (this.currentModal !== 'NONE') {
                    this.closeModal();
                }
            });
        },
        toggleModal() {
            if (this.currentModal !== 'NONE') {
                this.closeModal();
            } else {
                this.getAssetsAndSetupDownloadSource().then(_ => {
                    this.initialiseUsageTypes().then(_ => {
                        if (this.downloadSource.allSelected || this.nonImagesWithNoDownloadOriginalOption) {
                            navigateToOldDownload(undefined, this.downloadSource);
                        } else {
                            this.openFirstModal();
                        }
                    });
                });
            }
        },
        openFirstModal() {
            this.openModal(this.modalOrder[0]);
            inputNavigation.toggleKeyboardNavigation();
        },
        closeModal() {
            this.currentModal = 'NONE';
            this.currentUsageType = ROOT_USAGE_TYPE;
            this.currentUsageTypeFormat = undefined;
            this.currentCropData = undefined;
            this.currentDetails = undefined;
            inputNavigation.toggleKeyboardNavigation();
            this.setupModalOrdering();
        },
        getNextModal() {
            const currentModalIndex = this.modalOrder.findIndex(modal => modal === this.currentModal);
            return this.modalOrder[currentModalIndex+1];
        },
        openNextModal() {
            this.openModal(this.getNextModal());
        },
        openModal(type) {
            if (type === PERFORM_DOWNLOAD_STEP) {
                this.performDownload(this.currentUsageType);
            } else {
                this.currentModal = type;
                this.isLastStep = this.getNextModal() === PERFORM_DOWNLOAD_STEP;
                positionPanelCorrectlyOnPage();

                if (type === REQUEST_HIGH_RES_APPROVAL_STEP) {
                    this.requestHighResApproval();
                }
            }
        },
        openVideoClippingModal(currentlyClipping) {
            this.currentModal = 'VIDEO_CLIPPING';
            this.clippingInProgress = currentlyClipping ? true : false;
        },
        selectUsageType(usageType) {
            return this.loadUsageTypes(this.downloadSource.mediaTypeIds(), usageType).then(_ => {
                this.currentUsageType = usageType;
                this.setupModalOrdering();
            });
        },
        selectUsageTypeFormat(usageTypeFormat) {
            this.currentUsageTypeFormat = usageTypeFormat;
            this.setupModalOrdering();
        },
        enterDetails(details) {
            this.currentDetails = details;
            this.openNextModal();
        },
        performDownload(usageType) {
                        if (this.currentUsageTypeFormat) {
                let fileExtension = this.currentUsageTypeFormat.supportedExtensions.split(';')[0];
                dataTrackingEvent('Asset downloaded', {
                    'Is original': false,
                    'Number downloaded': this.downloadSource.assets.length,
                    'FileFormat': fileExtension,
                    'Was cropped': this.currentCropData ? true : false,
                    'Was masked': false,
                    'Usage type format': this.currentUsageTypeFormat.name
                });
                callDownloadUsageTypeFormat(this.downloadSource.assetIds(), this.currentUsageTypeFormat.id, this.currentDetails, this.config.errorMessagePrefix, this.currentCropData)
                    .then(_ => this.closeModal());
            } else if (usageType.id > 0) {
                dataTrackingEvent('Asset downloaded', {
                    'Is original': true,
                    'Number downloaded': this.downloadSource.assets.length,
                    'FileFormat': this.downloadSource.fileExtensionsString(),
                    'Was cropped': false,
                    'Was masked': false,
                    'Has subtitles': this.downloadSource.hasSubtitles(),
                    'Usage type': usageType.name
                });

                callDownloadOriginal(this.downloadSource.assetIds(), this.config.errorMessagePrefix, usageType.id, this.currentDetails)
                    .then(_ => {
                        if (this.config.subtitlesEnabled && this.downloadSource.someAssetsAreVideos()) {
                            setTimeout(() => {return callDownloadSubtitles(this.downloadSource.assetIds());}, 1000);
                        }
                    })
                    .catch(error => {
                        console.error('Download failed:', error);
                    })
                    .finally(() => {
                        this.closeModal();
                    });
            }
        },
        performClipDownload(startOffset, endOffset, resolution){
            const duration = endOffset - startOffset;
            const usageType = this.currentUsageType.id > 0 ? this.currentUsageType : this.promotedUsageType;
            dataTrackingEvent('Asset downloaded', {'Is original': false, 'FileFormat': this.downloadSource.firstAsset().fileExtension, 'Is custom clip': true, 'Duration': duration.toFixed(2)});
            callDownloadVideoClip(this.downloadSource.firstAsset().id, this.config.errorMessagePrefix, usageType.id, startOffset, endOffset, this.currentDetails, resolution)
                .then(_ => this.closeModal());
        },
        markTermsAsViewedAndOpenNextModal() {
            callSetTermsAsViewedEndpoint(this.downloadSource.termsMediaType());
            this.showTsAndCs = false;
            this.openNextModal();
        },
        usageTypeClicked(usageType) {
            const isEnterMoreDetail = usageType.canEnterDetails;
            const isHighResApproval = usageType.highRes && this.downloadSource.userNeedsHighResApprovalOnSome();
            if (isEnterMoreDetail) {
                this.selectUsageType(usageType).then(_ => {
                    if (usageType.downloadImmediately) {
                        this.openNextModal();
                    }
                });
            } else if  (usageType.downloadImmediately) {
                if (isHighResApproval) {
                    this.openNextModal();
                } else {
                    this.performDownload(usageType);
                }
            } else {
                this.selectUsageType(usageType);
            }
        },
        usageTypeFormatClicked(usageTypeFormat) {
            this.selectUsageTypeFormat(usageTypeFormat);
            this.openNextModal();
        },
        requestHighResApproval() {
            if (this.currentUsageType.id > 0) {
                callHighResPermission(this.downloadSource.assetIds(), this.currentUsageType.id, this.currentDetails, this.config.errorMessagePrefix);
            }
            this.openNextModal();
        },
        cropRequested() {
            this.openNextModal();
        },
        downloadCroppedFormat($event) {
            this.currentCropData = calculateOriginalCropData($event.cropData, this.downloadSource.firstAsset().width, this.downloadSource.firstAsset().height);
            this.openNextModal();
        },
        initialiseUsageTypes() {
            return this.loadUsageTypes(this.downloadSource.mediaTypeIds(), this.currentUsageType);
        },
        loadUsageTypes(mediaTypeIds, usageType) {
            if (usageType.id !== this.currentlySelectedUsageTypeId) {
                return Promise.all([
                    callUsageTypeFormatsEndpoint(usageType.id, this.downloadSource.usageTypeMaxHeight(), this.downloadSource.usageTypeMaxWidth()).then(result => {
                        this.usageTypeFormatsFromApi = result.pending ? [] : result;
                    }),
                    callUsageTypesEndpoint(mediaTypeIds, usageType.id, this.downloadSource.usageTypeMaxHeight(), this.downloadSource.usageTypeMaxWidth()).then(result => {
                        this.usageTypesFromApi = result.pending ? [] : result;
                    })]
                );
            }
            return Promise.resolve();
        }
    },
};

const qdApp = Vue.createApp(QuickDownloadApp, getQuickDownloadPropsFromPage());
qdApp.use(primevue.config.default);
qdApp.component('p-slider', primevue.slider);

qdApp.component('download-modal', {
    template: '#v-download-modal',
    emits: ['usageTypeClicked', 'usageTypeFormatClicked', 'navigateToOldDownload', 'openVideoClippingModal', 'close'],
    props: {
        originalHeight: Number,
        originalWidth: Number,
        originalFileExtension: String,
        showImageOptions: Boolean,
        showDownloadOriginal: Boolean,
        showFileInfoOnOriginal: Boolean,
        showAdvancedOptions: Boolean,
        showBackLink: Boolean,
        showVideoClipping: Boolean,
        userNeedsHighResApproval: Boolean,
        approvalState: String,
        usageTypes: Array,
        usageTypeFormats: Array,
        selectedUsageType: Object,
        originalLabel: String
    },
    data() {
        return {
            openUsageTypeBreadcrumb: [ROOT_USAGE_TYPE]
        };
    },
    methods: {
        usageTypeClicked(usageType) {
            this.openUsageTypeBreadcrumb.push(usageType);
            this.$emit('usageTypeClicked', usageType);
        },
        usageTypeFormatClicked(usageTypeFormat) {
            this.$emit('usageTypeFormatClicked', usageTypeFormat);
        },
        back() {
            this.openUsageTypeBreadcrumb.pop(); //currentType
            const typeToReturnTo = this.openUsageTypeBreadcrumb.pop();
            this.usageTypeClicked(typeToReturnTo);
        },
        close() {
            this.$emit('close');
        }
    }
});

qdApp.component('download-message-modal', {
    template: '#v-download-message-modal',
    props: {
        message: String,
        isLastStep: Boolean
    },
    data() {
        return {
            isLoading: false
        };
    },
    emits: ['next'],
    methods: {
        next() {
            this.isLoading = true;
            this.$emit('next');
        }
    }
});

qdApp.component('download-request-message-modal', {
    template: '#v-download-request-message-modal',
    emits: ['close'],
    methods: {
        close() {
            this.$emit('close');
        }
    }
});


qdApp.component('enter-details-modal', {
    template: '#v-enter-details-modal',
    props: {
        mandatory: Boolean,
        isLastStep: Boolean
    },
    data() {
        return {
            details: '',
            isLoading: false
        };
    },
    emits: ['detailsEntered'],
    computed: {
        shouldDisableDownload() {
            return this.mandatory ? this.details === '' : false;
        }
    },
    methods: {
        enterDetails() {
            if (!this.shouldDisableDownload) {
                this.isLoading = true;
                this.$emit('detailsEntered', this.details);
            }
        }
    }
});

qdApp.component('terms-and-conditions-modal', {
    props: {
        termsType: String
    },
    template: '#v-terms-and-conditions-modal',
    emits: ['termsAndConditionsAgreed'],
    data() {
        return {
            hasReachedBottom: false
        };
    },
    mounted () {
        document.getElementById('scrollPanel').addEventListener('scroll', this.checkScroll);
        this.checkScroll();
    },
    beforeDestroy () {
        document.getElementById('scrollPanel').removeEventListener('scroll', this.checkScroll);
    },
    methods: {
        agreeToTermsAndConditions() {
            this.$emit('termsAndConditionsAgreed');
        },
        checkScroll() {
            const scrollPanel = document.getElementById('scrollPanel');
            const scrollPadding = 16;
            this.hasReachedBottom = scrollPanel.scrollTop + scrollPanel.clientHeight >= scrollPanel.scrollHeight - scrollPadding;
        },
    }
});

qdApp.component('agreements-modal', {
    props: {
        agreements: Array,
    },
    template: '#v-agreements-modal',
    emits: ['agreement'],
    methods: {
        agreement() {
            this.$emit('agreement');
        }
    }
});

qdApp.component('require-approval-message-modal', {
    props: {
        approverMessage: String,
        approvalState: String,
    },
    template: '#v-require-approval-message-modal',
    emits: ['message-accepted'],
    methods: {
        approvalMessageNext() {
            this.$emit('message-accepted');
        }
    }
});

qdApp.component('attributes-modal', {
    props: {
        showAdvancedOptions: Boolean,
        downloadAttributes: Array
    },
    template: '#v-attributes-modal',
    emits: ['next', 'navigateToOldDownload']
});

qdApp.component('crop-to-fit-modal', {
    props: {
        asset: Object,
        usageTypeFormat: Object,
        userNeedsHighResApproval: Boolean
    },
    data() {
        return {
            imageUrl: '',
            maxCropperWidth: 0,
            maxCropperHeight: 0,
            maxCropDimension: 0,
            isLoading: false,
            cropper: undefined,
            cropImageRef: undefined
        };
    },
    mounted() {
        this.initCropper();
        this.cropImageRef = this.$refs.cropImage;
        this.listenForResize();

        const cropModal = document.getElementById('quick-download-crop-modal');
        document.body.appendChild(cropModal);
    },
    template: '#v-crop-to-fit-modal',
    emits: ['download', 'close'],
    methods: {
        download() {
            this.isLoading = true;
            const maxCropDimension = Math.max(this.maxCropperWidth, this.maxCropperHeight);
            this.$emit('download', {cropData: {maxCropperDimension: maxCropDimension, ...this.cropper.getData()}, usageTypeFormatId: this.usageTypeFormat.id});
        },
        resetCrop() {
            this.cropper.reset();
        },
        closeModal() {
            this.$emit('close');
        },
        listenForResize() {
            window.addEventListener('resize', () => {
                this.closeModal();
            });
        },
        initCropper() {
            const maxModalWidth = Math.round(window.innerWidth * 0.7);
            const maxModalHeight = Math.round(window.innerHeight * 0.7);
            this.maxCropperWidth = this.asset.width < maxModalWidth ? this.asset.width : maxModalWidth;
            this.maxCropperHeight = this.asset.height < maxModalHeight ? this.asset.height : maxModalHeight;
            const cropRatio = this.usageTypeFormat.width / this.usageTypeFormat.height;
            const scaleFactor = Math.min(this.maxCropperWidth / this.asset.width, this.maxCropperHeight / this.asset.height);
            const viewportWidth = Math.round(this.asset.width * scaleFactor);
            const viewportHeight = Math.round(this.asset.height * scaleFactor);
            const minCropBoxWidth = this.usageTypeFormat.width * scaleFactor;
            const minCropBoxHeight = this.usageTypeFormat.height * scaleFactor;
            const pollDelay = 500;
            const maxResizeDimensions = this.maxCropperWidth;

            const cropperOptions = {
                cropBoxResizable: true,
                guides: true,
                highlight: false,
                viewMode: 1,
                autoCropArea: 1,
                checkCrossOrigin: false,
                zoomable: false,
                center: false,
                minCropBoxWidth: minCropBoxWidth,
                minCropBoxHeight: minCropBoxHeight,
                width: viewportWidth,
                height: viewportHeight,
                aspectRatio: cropRatio,
                dragMode: 'move'
            };

            renditions.getAssetRendition(
                {
                    assetType: 'STANDARD',
                    priority: 'HIGH',
                    assetId: this.asset.id,
                    maxHeight: maxResizeDimensions,
                    maxWidth: maxResizeDimensions,
                    imageFormat: 'webp',
                    transformation: 'RESIZE',
                    watermark: true
                },
                (data, textStatus, xhr) => {
                    if (xhr.status === 200) {
                        this.imageUrl = data.url;

                        this.$nextTick(() => {
                            this.cropper = new Cropper(this.cropImageRef, cropperOptions);
                        });
                    }

                    if (xhr.status === 202) {
                        setTimeout(() => {
                            this.initCropper();
                        }, pollDelay);
                    }
                },
                () => {},
                () => {}
            );
        }
    }
});


qdApp.component('video-clipping-link', {
    template: '#v-video-clipping-link',
    emits: ['openVideoClippingModal']
});

qdApp.component('video-clipping-modal', {
    template: '#v-video-clipping-modal',
    emits: ['close', 'downloadVideoClip'],
    props: {
        videoPreviewUrl: String,
        confirmExitMessage: String,
        originalFileExtension: String,
        originalWidth: Number,
        originalHeight: Number,
    },
    data() {
        return {
            clipTime: [0, 0],
            sliderStep: 0.01,
            previewLength: 0,
            elapsedTime: '00:00:00.00',
            defaultTimeFormat: '00:00:00.00',
            isMuted: true,
            playingClip: false,
            playerInitalised: false,
            isLoading: false,
            showEmailMessage: false,
            tippyInstance: '',
            resolutions: [
                { label: 'Original', value: 'null' },
                { label: '1080p (1920 x 1080px)', value: '1080' },
                { label: '720p (1280 x 720px)', value: '720' },
                { label: '480p (854 x 480px)', value: '480' },
                { label: '360p (640 x 360px)', value: '360' },
                { label: '240p (426 x 240px)', value: '240' }
            ],
            selectedResolution: null,

            sliderPassThrough: {
                startHandle: { onMousedown: () => this.activeHandle = 0 },
                endHandle: { onMousedown: () => this.activeHandle = 1 }
            }
        };
    },
    mounted() {
        this.shiftModalToBaseOfPage();
        this.$emit('openCustomModal');
        window.addEventListener('show-email-message', this.toggleEmailMessage);
    },
    beforeUnmount() {
        window.removeEventListener('show-email-message', this.toggleEmailMessage);
    },
    watch: {
        clipTime(newClipTime, oldClipTime) {
            const [newStart, newEnd] = newClipTime;
            const [oldStart, oldEnd] = oldClipTime;

            if (this.leftHandMoved(newStart, oldStart)) {
                this.setPlayerThumbnailAtTime(newStart);
            } else if (this.rightHandMoved(newEnd, oldEnd)) {
                this.setPlayerThumbnailAtTime(newEnd);
            }
        }
    },
    computed: {
        clipLength() {
            return this.formatTime(Math.abs(this.clipTime[1] - this.clipTime[0]));
        },
        hasLoadedPreview() {
            return this.previewLength > 0;
        },
        startTimeDisplay: {
            get() {
                return this.formatTime(this.clipTime[0]);
            },
            set(value) {
                const seconds = this.timeInSeconds(value);
                if (seconds !== null && seconds >= 0 && seconds <= this.clipTime[1]) {
                    this.clipTime[0] = seconds;
                    this.setPlayerThumbnailAtTime(seconds);
                }
            }
        },
        endTimeDisplay: {
            get() {
                return this.formatTime(this.clipTime[1]);
            },
            set(value) {
                const seconds = this.timeInSeconds(value);
                if (seconds !== null && seconds <= this.previewLength && seconds >= this.clipTime[0]) {
                    this.clipTime[1] = seconds;
                    this.setPlayerThumbnailAtTime(seconds);
                }
            }
        },
        filteredResolutions() {
            const originalHeight = this.originalHeight;
            if (!originalHeight) {return this.resolutions;}
            return this.resolutions.filter(r => {
                if (r.value === 'null') {return true;}  // Needed to show "original" option
                return Number(r.value) <= Number(originalHeight);
            });
        }
    },
    methods: {
        updateElapsedTime(){
            const clampedTime = Math.min(this.$refs.videoPlayer.currentTime, this.clipTime[1])
            this.elapsedTime = this.formatTime(clampedTime)
        },
        shiftModalToBaseOfPage() {
            const videoClippingModal = document.getElementById('quick-download-video-clipping-modal');
            document.body.appendChild(videoClippingModal);
        },
        onLoadedMetadata() {
            this.previewLength = this.$refs.videoPlayer.duration;
            this.clipTime = [0, this.previewLength];

            setTimeout(() => {
                this.playerInitalised = true;
                this.setupTooltips();
            });
        },
        setupTooltips() {
            this.tippyInstance = tippy('.js-video-tooltip[data-tippy-content]', {
                arrow: true,
                appendTo: document.body,
                placement: 'top',
                delay: 300,
                theme: 'ab-tips',
                trigger: 'mouseenter',
                boundary: document.body,
                distance: 8
            });
        },
        setPlayerThumbnailAtTime(time) {
            // Prevent video poster being replaced
            if (this.playerInitalised) {
                this.$refs.videoPlayer.currentTime = time;
            }
        },
        adjustTime(inputName, direction) {
            const whichInput = inputName === 'START' ? 0 : 1;
            const timeChange = direction === 'UP' ? this.sliderStep : -this.sliderStep;

            this.clipTime[whichInput] = this.clipTime[whichInput] + timeChange;
            this.clampToDurationBoundaries(whichInput, this.formatTime(this.clipTime[whichInput]));

            this.focusTimeInput(whichInput);
        },
        focusTimeInput(inputName) {
            const $whichInput = inputName === 0 ? this.$refs.startInput : this.$refs.endInput;
            $whichInput.focus();
        },
        toggleEmailMessage() {
            this.showEmailMessage = !this.showEmailMessage;
        },
        checkBeforeClosing() {
            if(this.isLoading) {
                if(window.confirm(this.confirmExitMessage)) {
                    this.$emit('close');
                }
            } else {
                this.$emit('close');
            }
        },
        emailTheClip() {
            stopRetryingClipFetch();
        },
        shouldDisableDownload() {
            return this.shouldShowWarning() || this.isLoading;
        },
        shouldShowWarning() {
            return this.clipTime[0] >= this.clipTime[1];
        },
        playClip() {
            const video = this.$refs.videoPlayer;
            video.currentTime = this.clipTime[0];
            video.play();
            this.playingClip = true;

            const stopAtEnd = () => {
                if (video.currentTime >= this.clipTime[1]) {
                    video.pause();
                    this.playingClip = false;
                    video.removeEventListener('timeupdate', stopAtEnd);
                }
            };
            video.addEventListener('timeupdate', stopAtEnd);
        },
        pauseClip() {
            this.$refs.videoPlayer.pause();
            this.playingClip = false;
        },
        toggleMute() {
            this.isMuted = !this.isMuted;
        },
        downloadClip() {
            this.isLoading = true;
            var resolution =
                (this.selectedResolution !== null)
                    ? this.selectedResolution
                    : undefined;

            this.$emit('downloadVideoClip', this.clipTime[0].toFixed(2), this.clipTime[1].toFixed(2), resolution);
        },
        padZero(timeUnit, numZeros) {
            return timeUnit.toString().padStart(numZeros, '0');
        },
        formatTime(totalSeconds) {
            if (isNaN(totalSeconds)) {
                return this.defaultTimeFormat;
            }

            let total = Math.max(0, totalSeconds);
            const hours = Math.floor(total / 3600);
            total %= 3600;
            const minutes = Math.floor(total / 60);
            const seconds = total % 60;
            return `${this.padZero(hours, 2)}:${this.padZero(minutes, 2)}:${this.padZero(seconds.toFixed(2), 5)}`;
        },
        timeInSeconds(str) {
            const timeFormatting = str.match(/^(\d{1,2}):(\d{2}):(\d{2}(?:\.\d{1,2})?)$/);
            if (!timeFormatting) {
                return null;
            }

            const [, hours, minutes, seconds] = timeFormatting;
            return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseFloat(seconds);
        },
        overwriteInput(event, index) {
            const input = event.target;
            const key = event.key;
            let inputValue = input.value || this.defaultTimeFormat;
            let charIndex = input.selectionStart;
            let inputName = index === 0 ? 'START' : 'END';

            if (this.digitsWereEntered(key)) {
                // Skip over separators
                if (this.charIsColonOrPoint(inputValue[charIndex])) {
                    charIndex = charIndex + 1;
                }

                if (charIndex >= inputValue.length) {
                    event.preventDefault();
                    return;
                }

                // Replace at cursor
                inputValue = inputValue.substring(0, charIndex) + key + inputValue.substring(charIndex + 1);
                input.value = inputValue;
                this.clampToDurationBoundaries(index, inputValue);

                // Move cursor forward
                charIndex = charIndex + 1;
                if (this.charIsColonOrPoint(inputValue[charIndex])) {
                    charIndex = charIndex + 1;
                }
                input.setSelectionRange(charIndex, charIndex);

                event.preventDefault();
                return;
            }

            if (this.backspaceWasEntered(key)) {
                event.preventDefault();
                if (charIndex > 0) {
                    // skip separators backwards
                    if (this.charIsColonOrPoint(inputValue[charIndex - 1])) {
                        charIndex = charIndex - 1;
                    }
                    if (charIndex > 0) {
                        inputValue = inputValue.substring(0, charIndex - 1) + '0' + inputValue.substring(charIndex);
                        input.value = inputValue;
                        this.clampToDurationBoundaries(index, inputValue);
                        input.setSelectionRange(charIndex - 1, charIndex - 1);
                    }
                }
                return;
            }

            if (this.navigationKeyEntered(key)) {
                return; // Let browser handle
            }

            if (this.arrowUpKeyEntered(key)) {
                this.adjustTime(inputName, 'UP');
            }

            if (this.arrowDownKeyEntered(key)) {
                this.adjustTime(inputName, 'DOWN');
            }

            // Block other actions
            event.preventDefault();
        },
        clampToDurationBoundaries(index, value) {
            const seconds = this.timeInSeconds(value);
            const clampedTime = Math.min(Math.max(seconds, 0), this.previewLength);

            if (this.isStartInput(index)) {
                this.clipTime[0] = clampedTime;
                this.startTimeDisplay = this.formatTime(clampedTime);
            } else {
                this.clipTime[1] = clampedTime;
                this.endTimeDisplay = this.formatTime(clampedTime);
            }
        },
        charIsColonOrPoint(charAtIndex) {
            return [':', '.'].includes(charAtIndex);
        },
        navigationKeyEntered(key) {
            return ['ArrowLeft', 'ArrowRight', 'Tab'].includes(key);
        },
        digitsWereEntered(key) {
            return /^\d$/.test(key);
        },
        leftHandMoved(newStart, oldStart) {
            return newStart !== oldStart;
        },
        rightHandMoved(newEnd, oldEnd) {
            return newEnd !== oldEnd;
        },
        backspaceWasEntered(key) {
            return key === 'Backspace';
        },
        containsLetters(inputValue) {
            return /[a-zA-Z]/.test(inputValue);
        },
        isStartInput(index){
            return index === 0;
        },
        isEndInput(index){
            return index === 1;
        },
        arrowUpKeyEntered(key) {
            return key === 'ArrowUp';
        },
        arrowDownKeyEntered(key) {
            return key === 'ArrowDown';
        },
        resetTimeInput(index, timeInput) {
            if (this.isStartInput(index)) {
                this.startTimeDisplay = this.formatTime(0);
                timeInput.value = this.startTimeDisplay;
            }

            if (this.isEndInput(index)) {
                this.endTimeDisplay = this.formatTime(this.previewLength);
                timeInput.value = this.endTimeDisplay;
            }
        },
        selectResolution($event) {
            this.selectedResolution = $event.target.value;
        },
    }
});

qdApp.component('advanced-options-link', {
    template: '#v-advanced-options-link',
    emits: ['navigateToOldDownload']
});


qdApp.component('download-original', {
    props: {
        displayFileExtension: String,
        displayHeight: Number,
        displayWidth: Number,
        displaySizeInBytes: Number,
        showFileInfo: Boolean,
        showDisplayDimensions: Boolean,
        showSubtitleExtension: Boolean,
        userNeedsHighResApproval: Boolean,
        withSubtitlesText: String,
        usageTypeName: String
    },
    template: '#v-download-original',
    emits: ['originalClicked'],
    data() {
        return {
            isLoading: false,
        };
    },
    methods: {
        originalClicked() {
            if (!this.userNeedsHighResApproval) {
                this.isLoading = true;
            }
            this.$emit('originalClicked');
        }
    },
    computed: {
        upperCaseFileExtension() {
            return this.displayFileExtension.toString().toUpperCase();
        },
        displayFileSize() {
            return niceBytes(this.displaySizeInBytes);
        },
        displayDimensions() {
            return formatDimensions(this.displayWidth, this.displayHeight);
        }
    }
});


qdApp.component('download-usage-type-list-row', {
    props: {
        target: Object,
        downloading: Boolean,
        displayWidth: Number,
        displayHeight: Number,
        displayFileExtension: String,
        showFileInfo: Boolean,
        cropToFit: Boolean,
        forceDownload: Boolean,
        approvalState: String,
        userNeedsHighResApproval: Boolean,
        nameOverride: String
    },
    template: '#v-download-usage-type-list-row',
    emits: ['rowClicked'],
    computed: {
        name() {
            return this.nameOverride ? this.nameOverride : this.target.name;
        },
        upperCaseFileExtension() {
            return this.displayFileExtension ? this.displayFileExtension.toString().toUpperCase() : '';
        },
        canStepIn() {
            return !this.forceDownload && (this.target.hasChildren || this.target.downloadOriginal) && !this.cropToFit;
        },
        hasDetailsToShow() {
            return this.displayFileExtension || this.showDisplayDimensions || (this.userNeedsHighResApproval && this.approvalState !== 'APPROVED' && this.target.highRes) || (this.approvalState === 'APPROVED' && this.target.highRes);
        },
        showDisplayDimensions() {
            return this.displayWidth && this.displayHeight;
        },
        displayDimensions() {
            return formatDimensions(this.displayWidth, this.displayHeight);
        }
    },
    methods: {
        rowClicked() {
            this.$emit('rowClicked');
        }
    }
});

qdApp.component('download-usage-type-list', {
    props: {
        usageTypes: Array,
        usageTypeFormats: Array,
        currentUsageType: Object,
        originalWidth: Number,
        originalHeight: Number,
        showFileInfoOnOriginal: Boolean,
        showImageOptions: Boolean,
        originalFileExtension: String,
        originalLabel: String,
        approvalState: String,
        showDownloadOriginal: Boolean,
        userNeedsHighResApproval: Boolean
    },
    template: '#v-download-usage-type-list',
    emits: ['usageTypeClicked', 'usageTypeFormatClicked'],
    data() {
        return {
            downloadingFormatId: 0,
            downloadingOriginalType: false
        };
    },
    methods: {
        displayFileExtensionForUsageTypeFormat(usageTypeFormat) {
            if (usageTypeFormat.supportedExtensions.includes(this.originalFileExtension)) {
                return this.originalFileExtension.toString().toUpperCase();
            } else {
                return usageTypeFormat.supportedExtensions.split(';')[0].toString().toUpperCase();
            }
        },
        usageTypeClicked(usageType, downloadImmediately) {
            this.downloadingOriginalType = downloadImmediately;
            this.$emit('usageTypeClicked', {...usageType, downloadImmediately});
        },
        usageTypeFormatClicked(usageTypeFormat) {
            this.downloadingFormatId = usageTypeFormat.id;
            this.$emit('usageTypeFormatClicked', usageTypeFormat);
        }
    },
    computed: {
        originalDisplayFileExtension() {
            return this.originalFileExtension.toString().toUpperCase();
        },
        usageTypeIsSelected() {
            return this.currentUsageType.id > 0;
        },
        isCropToFit() {
            return usageTypeFormat => usageTypeFormat.cropToFit;
        }
    }
});

qdApp.mount('#v-quick-download-app');

function getQuickDownloadPropsFromPage() {
    const appWrapper = document.getElementById('v-quick-download-app');

    const data = {
        assetIds: JSON.parse(appWrapper.getAttribute('data-asset-ids')),
        config: {
            hasUser: appWrapper.getAttribute('data-config-has-user') === 'true',
            adminUser: appWrapper.getAttribute('data-config-admin-user') === 'true',
            showDownloadOriginal: appWrapper.getAttribute('data-config-show-download-original') === 'true',
            showAdvancedOptions: appWrapper.getAttribute('data-config-show-advanced-options') === 'true',
            showVideoClipping: appWrapper.getAttribute('data-config-show-video-clipping') === 'true',
            errorMessagePrefix: appWrapper.getAttribute('data-config-error-message-prefix'),
            originalLabel: appWrapper.getAttribute('data-config-original-label'),
            inToolbar: appWrapper.getAttribute('data-config-in-toolbar'),
            confirmExitMessage: appWrapper.getAttribute('data-config-confirm-exit-message'),
            withSubtitlesText: appWrapper.getAttribute('data-config-with-subtitles-text'),
            subtitlesEnabled: appWrapper.getAttribute('data-config-subtitles-enabled') === 'true'
        }
    };
    return data;
}

function positionPanelCorrectlyOnPage() {
    const onDetailsPage = document.getElementsByClassName('js-view-page').length > 0;
    const $closeTrigger = document.getElementById('quick-download-close-trigger');
    const $downloadPanel = document.getElementById('quick-download-panel');
    const $downloadTrigger = document.getElementById('download');
    const viewingOnMobile = window.innerWidth <= 1024;
    const buttonToTop = $downloadTrigger.getBoundingClientRect().top;
    const buttonToLeft = $downloadTrigger.getBoundingClientRect().left;
    const dropdownOffsetHeight = onDetailsPage ? 60 : 44;

    document.body.appendChild($closeTrigger);
    document.body.appendChild($downloadPanel);
    $downloadPanel.style.top = buttonToTop + dropdownOffsetHeight + 'px';

    if (!onDetailsPage && !viewingOnMobile) {
        $downloadPanel.style.left = buttonToLeft + 'px';
    }
}

function callHighResPermission(assetIds, usageTypeId, otherDetails, errorMessagePrefix, fileExtension) {
    return callRestEndpoint(`${contextUrl}/go/download/permission-for-high-res?_csrf=${springCsrfToken}`,
        'POST',
        JSON.stringify({assetIds: assetIds, usageTypeId: usageTypeId, otherUsageNotes: otherDetails}));
}

function callDownloadOriginal(assetIds, errorMessagePrefix, usageTypeId, details) {
    return callDownloadEndpoint(`${contextUrl}/go/download/original?_csrf=${springCsrfToken}`,
        JSON.stringify({assetIds: assetIds, usageTypeId: usageTypeId, details: details}), errorMessagePrefix);
}

function callDownloadSubtitles(assetIds) {
    return callDownloadEndpoint(`${contextUrl}/go/download/original/subtitles?_csrf=${springCsrfToken}`,
        JSON.stringify({assetIds: assetIds})
    );
}

function callGetDownloadParams(assetIdsProvidedToApp) {
    const sourceCategoryId = getParam('categoryId');
    const sourceCategoryTypeId = getParam('categoryTypeId');
    var assetIds, allSelected;
    if (assetIdsProvidedToApp !== undefined && assetIdsProvidedToApp.length > 0) {
        assetIds = assetIdsProvidedToApp;
        allSelected = false;
    } else {
        assetIds = assetToolbar.getSelectedAssetIds();
        allSelected = assetToolbar.allResultsSelected();
    }
    if (allSelected || assetIds === undefined || assetIds.length === 0) {
        return Promise.resolve({assets: [], allSelected, sourceCategoryId, sourceCategoryTypeId, termsViewed: false});
    }
    return callRestEndpoint(
        `${contextUrl}/go/download/asset-metadata?_csrf=${springCsrfToken}`,
        'POST',
        JSON.stringify({assetIds: assetIds}
    )).then(data => {
        return {assets: data.assets, termsViewed: data.termsViewed, allSelected, sourceCategoryId, sourceCategoryTypeId};
    });
}

let keepTryingClipFetch = true;
function stopRetryingClipFetch() {
    keepTryingClipFetch = false;
}

function callDownloadVideoClip(assetId, errorMessagePrefix, usageTypeId, startOffset, endOffset, details, resolution) {
    const requestBody ={
        assetId: assetId,
        usageTypeId: usageTypeId,
        startOffset: startOffset,
        endOffset: endOffset,
        details: details
    };

    if (resolution !== undefined && resolution !== null && resolution !== '') {
        requestBody.resolution = resolution;
    }
    const body = JSON.stringify(requestBody);
    return fetchForRedirect(0, errorMessagePrefix, `${contextUrl}/go/download/video-clip?_csrf=${springCsrfToken}`,
        {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            redirect: 'follow',
            body: body,
            signal: AbortSignal.timeout(600000)
        }).then(downloadId => {
            if (downloadId) {
                const statusBody = JSON.stringify({
                    downloadId: downloadId
                });
                return fetchWithInterruptibleRetry(
                    errorMessagePrefix,
                    `${contextUrl}/go/download/video-clip-status?_csrf=${springCsrfToken}`,
                    `${contextUrl}/go/download/video-clip-email?_csrf=${springCsrfToken}`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        redirect: 'follow',
                        body: statusBody,
                        signal: AbortSignal.timeout(600000)
                    }, false, 'show-email-message', () => keepTryingClipFetch
                );
            }
        });
}

function callDownloadUsageTypeFormat(assetIds, usageTypeFormatId, otherDetails, errorMessagePrefix, cropData) {
    return callDownloadEndpoint(`${contextUrl}/go/download/usage-type-format?_csrf=${springCsrfToken}`,
        JSON.stringify({
            assetIds: assetIds,
            usageTypeFormatId: usageTypeFormatId,
            otherDetails: otherDetails,
            cropInfo: cropData
        }), errorMessagePrefix);
}

function callUsageTypesEndpoint(mediaTypeIds, usageTypeId, height, width) {
    const ids = mediaTypeIds.join(',');
    return callRestEndpoint(
        `${contextUrl}/go/download/usage-types?mediaTypeIds=${ids}&id=${usageTypeId}&height=${height}&width=${width}&_csrf=${springCsrfToken}`,
        'GET'
    );
}

function callSetTermsAsViewedEndpoint(mediaTypeId) {
    return callRestEndpoint(
        `${contextUrl}/go/terms-and-conditions/set-as-viewed?mediaTypeId=${mediaTypeId}&_csrf=${springCsrfToken}`,
        'POST'
    );
}

function callUsageTypeFormatsEndpoint(id, height, width) {
    return callRestEndpoint(
        `${contextUrl}/go/download/usage-type-formats?id=${id}&height=${height}&width=${width}&_csrf=${springCsrfToken}`,
        'GET'
    );
}


function navigateToOldDownload(usageTypeFormat, downloadSource) {
    dataTrackingEvent('Navigate to old download');

    if (downloadSource.isSingleAsset()) {
        let action;
        switch (downloadSource.firstAsset().typeId) {
            case 2:
                action = usageTypeFormat ? 'downloadImage' : 'viewDownloadImage';
                break;
            case 3:
                action = usageTypeFormat ? 'downloadVideo' : 'viewDownloadVideo';
                break;
            case 4:
                action = usageTypeFormat ? 'downloadAudio' : 'viewDownloadAudio';
                break;
            default:
                action = usageTypeFormat ? 'downloadFile' : 'viewDownloadFile';
                break;
        }
        if (usageTypeFormat) {
            window.location.href = '../action/' + action + '?CSRF=' + csrfToken + '&advanced=false&conditionsAccepted=1&asset.id=' + downloadSource.firstAsset().id + '&showTabs=true&b_usageTypeFormat=Go&assetUse.usageTypeId=' + usageTypeFormat.usageTypeId + '&usageTypeFormatId=' + usageTypeFormat.id;
        } else {
            window.location.href = '../action/' + action + '?id=' + downloadSource.firstAsset().id + '&advanced=true';
        }
    } else {
        const assetIdString = downloadSource.allSelected ? '' : downloadSource.assetIds().join(',');
        const allSelectedString = downloadSource.allSelected ? '1' : '0';
        if (downloadSource.cameFromBrowse()) {
            window.location.href = '../action/viewDownloadBrowseAssets?includeImplicitCategoryMembers=off&categoryTypeId=' + downloadSource.sourceCategoryTypeId + '&selectedAssetIds=' + assetIdString + '&categoryId=' + downloadSource.sourceCategoryId + '&allSelected=' + allSelectedString + '&advanced=true';
        } else {
            window.location.href = '../action/viewDownloadSearchAssets?categoryTypeId=null&categoryId=null&selectedAssetIds=' + assetIdString + '&allSelected=' + allSelectedString + '&advanced=true';
        }
    }
}

function dataTrackingEvent(name, eventProperties) {

    let pageSource = '';
    const pages = {
        detailsPage: 'Details page',
        browsePage: 'Browse page',
        resultsPage: 'Search page',
        lightboxPage: 'Collections page'
    };

    for (const [id, label] of Object.entries(pages)) {
      if (document.getElementById(id)) {
        pageSource = label;
        break;
      }
    }

    dataTrackingMain.logEvent(name, 'Download', pageSource, eventProperties);
}

function callDownloadEndpoint(url, body, errorMessagePrefix) {
    return fetchForRedirect(5, errorMessagePrefix, url,
        {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            redirect: 'follow',
            body: body,
            signal: AbortSignal.timeout(600000)
        });
}


function calculateOriginalCropData(cropperData, originalWidth, originalHeight) {
    let cropperHeight, cropperWidth;

    if (originalWidth > originalHeight) {
        cropperWidth = cropperData.maxCropperDimension;
        cropperHeight = (cropperData.maxCropperDimension * originalHeight) / originalWidth;
    } else {
        cropperHeight = cropperData.maxCropperDimension;
        cropperWidth = (cropperData.maxCropperDimension * originalWidth) / originalHeight;
    }

    return {
        cropX: (cropperData.x * originalWidth) / cropperWidth,
        cropY: (cropperData.y * originalHeight) / cropperHeight,
        cropWidth: (cropperData.width * originalWidth) / cropperWidth,
        cropHeight: (cropperData.height * originalHeight) / cropperHeight
    };
}






