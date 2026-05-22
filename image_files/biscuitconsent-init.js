// obtain plugin
var cc = initCookieConsent();

const $cookieContent = $('.js-cookie-content');

// run plugin with your configuration
cc.run({
    current_lang: 'en',
    autoclear_cookies: true,                   // default: false
    page_scripts: true,                        // default: false

    // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
    // delay: 0,                               // default: 0
    // auto_language: null                     // default: null; could also be 'browser' or 'document'
    // autorun: true,                          // default: true
    // force_consent: false,                   // default: false
    // hide_from_bots: false,                  // default: false
    // remove_cookie_tables: false             // default: false
    // cookie_name: 'cc_cookie',               // default: 'cc_cookie'
    // cookie_expiration: 182,                 // default: 182 (days)
    // cookie_necessary_only_expiration: 182   // default: disabled
    // cookie_domain: location.hostname,       // default: current domain
    // cookie_path: '/',                       // default: root
    // cookie_same_site: 'Lax',                // default: 'Lax'
    // use_rfc_cookie: false,                  // default: false
    // revision: 0,                            // default: 0

    onFirstAction: function(user_preferences, cookie){
        // callback triggered only once
    },

    onAccept: function (cookie) {
        // ...
    },

    onChange: function (cookie, changed_preferences) {
        // ...
    },

    gui_options: {
        consent_modal: {
            layout: 'bar',               // box/cloud/bar
            position: 'bottom center',     // bottom/middle/top + left/right/center
            transition: 'slide',           // zoom/slide
            swap_buttons: false            // enable to invert buttons
        },
        settings_modal: {
            layout: 'box',                 // box/bar
            // position: 'left',           // left/right
            transition: 'slide'            // zoom/slide
        }
    },

    languages: {
        'en': {
            consent_modal: {
                title: $cookieContent.data('title-main'),
                description: $cookieContent.data('description-main') + ' <button type="button" data-cc="c-settings" class="cc-link">' + $cookieContent.data('button-choose') + '</button>',
                primary_btn: {
                    text: $cookieContent.data('button-accept'),
                    role: 'accept_all'              // 'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text: $cookieContent.data('button-reject'),
                    role: 'accept_necessary'        // 'settings' or 'accept_necessary'
                }
            },
            settings_modal: {
                title: $cookieContent.data('title-cookie-preferences'),
                save_settings_btn: $cookieContent.data('button-save'),
                accept_all_btn: $cookieContent.data('button-accept'),
                reject_all_btn: $cookieContent.data('button-reject'),
                close_btn_label: $cookieContent.data('button-close'),
                cookie_table_headers: [
                    {col1: $cookieContent.data('table-header-name')},
                    {col2: $cookieContent.data('table-header-domain')},
                    {col3: $cookieContent.data('table-header-expiration')},
                    {col4: $cookieContent.data('table-header-description')}
                ],
                blocks: [
                    {
                        title: $cookieContent.data('title-cookie-usage'),
                        description: $cookieContent.data('description-cookie-usage') + ' <a href="https://www.assetbank.co.uk/privacy-policy/" class="cc-link" target="_blank">' + $cookieContent.data('link-privacy-policy') + '</a>.'
                    }, {
                        title: $cookieContent.data('title-strictly-necessary'),
                        description: $cookieContent.data('description-strictly-necessary'),
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true          // cookie categories with readonly=true are all treated as "necessary cookies"
                        },
                        cookie_table: [             // list of all expected cookies
                            {
                                col1: 'JSESSIONID',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-session'),
                                col4: $cookieContent.data('jsessionid'),
                            },
                            {
                                col1: 'cc_cookie',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('cc-cookie'),
                            },
                            {
                                col1: 'sessionid',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-session'),
                                col4: $cookieContent.data('sessionid'),
                            },
                            {
                                col1: 'mp__origin_referrer',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-nine-months'),
                                col4: $cookieContent.data('mp-origin-referrer'),
                            },
                            {
                                col1: 'mp__origin',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-nine-months'),
                                col4: $cookieContent.data('mp-origin'),
                            },
                            {
                                col1: '__mpq_*_ev',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('mpq-ev'),
                            },
                            {
                                col1: 'mp_*_mixpanel',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('mp-mixpanel'),
                            },
                            {
                                col1: '_mkto_trk',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-two-years'),
                                col4: $cookieContent.data('mkto-trk'),
                            },
                            {
                                col1: '__mp_opt_in_out_cookies_metrics-1',
                                col2: '.mixpanel.com',
                                col3: $cookieContent.data('expiry-nine-months'),
                                col4: $cookieContent.data('mp-opt-in-out-cookies-metrics-1'),
                            },
                            {
                                col1: 'hasDismissedAIBanner',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('ai-results-banner'),
                            },
                            {
                                col1: '__zlcmid',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('zlcmid'),
                            },
                            {
                                col1: '_ugeuid',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-three-months'),
                                col4: $cookieContent.data('ugeuid'),
                            },
                            {
                                col1: '___ug___',
                                col2: $cookieContent.data('local-storage'),
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('ug'),
                            },
                            {
                                col1: 'persist:userguiding',
                                col2: $cookieContent.data('local-storage'),
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('persist-userguiding'),
                            },
                            {
                                col1: 'ug-guide-events',
                                col2: $cookieContent.data('local-storage'),
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('ug-guide-events'),
                            },
                            {
                                col1: 'ZD-suid',
                                col2: $cookieContent.data('local-storage'),
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('zd-suid'),
                            },
                            {
                                col1: 'ZD-buid',
                                col2: $cookieContent.data('local-storage'),
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('zd-buid'),
                            },
                        ]
                    }, {
                        title: $cookieContent.data('title-functional'),
                        description: $cookieContent.data('description-functional'),
                        toggle: {
                            value: 'functional',
                            enabled: false,
                            readonly: false
                        },
                        cookie_table: [
                            {
                                col1: 'mfa-remember-me',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-thirty-days'),
                                col4: $cookieContent.data('mfa-remember-me'),
                            },
                            {
                                col1: 'trialBannerViewed',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-day'),
                                col4: $cookieContent.data('trialbannerviewed'),
                            },
                        ]
                    }, {
                        title: $cookieContent.data('title-analytics'),
                        description: $cookieContent.data('description-analytics'),
                        toggle: {
                            value: 'analytics',
                            enabled: false,
                            readonly: false
                        },
                        cookie_table: [             // list of all expected cookies
                            {
                                col1: 'g_state',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-six-months'),
                                col4: $cookieContent.data('g-state'),
                            },
                            {
                                col1: 'G_AUTHUSER_H',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-session'),
                                col4: $cookieContent.data('g-authuser-h'),
                            },
                            {
                                col1: 'G_ENABLED_IDPS',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-two-years'),
                                col4: $cookieContent.data('g-enabled-idps'),
                            },
                            {
                                col1: '_hjSession_*',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-session'),
                                col4: $cookieContent.data('hjsession'),
                            },
                            {
                                col1: '_hjAbsoluteSessionInProgress',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-thirty-minutes'),
                                col4: $cookieContent.data('hjabsolutesessioninprogress'),
                            },
                            {
                                col1: '_hjDonePolls',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('hjdonepolls'),
                            },
                            {
                                col1: '_hjMinimizedPolls',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('hjminimizedpolls'),
                            },
                            {
                                col1: 'OptanonAlertBoxClosed',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('optanonalertboxclosed'),
                            },
                            {
                                col1: 'HSID',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-two-years'),
                                col4: $cookieContent.data('hsid'),
                            },
                            {
                                col1: 'SIDCC',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('sidcc'),
                            },
                            {
                                col1: '_ga',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-two-years'),
                                col4: $cookieContent.data('ga'),
                            },
                            {
                                col1: '_ga_*',
                                col2: '.assetbank-server.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('ga-star'),
                            },
                            {
                                col1: '_clck',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('clck'),
                            },
                            {
                                col1: '_ga',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-two-years'),
                                col4: $cookieContent.data('ga'),
                            },
                            {
                                col1: '_gcl_au',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-persistent'),
                                col4: $cookieContent.data('gcl-au'),
                            },
                            {
                                col1: '_hjid',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('hjid'),
                            },
                            {
                                col1: '_hjKB',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('hjkb'),
                            },
                            {
                                col1: '_hjIncludedInSessionSample',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-thirty-minutes'),
                                col4: $cookieContent.data('hjincludedinsessionsample'),
                            },
                            {
                                col1: '_hjIncludedInPageviewSample',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-session'),
                                col4: $cookieContent.data('hjincludedinpageviewsample'),
                            },
                            {
                                col1: '_hjSessionUser_*',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('hjsessionuser'),
                            },
                            {
                                col1: '_hjFirstSeen*',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-session'),
                                col4: $cookieContent.data('hjfirstseen'),
                            },
                            {
                                col1: '_scid',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('scid'),
                            },
                            {
                                col1: '_uetvid',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-sixteen-days'),
                                col4: $cookieContent.data('uetvid'),
                            },
                            {
                                col1: '_uetsid',
                                col2: 'vars.hotjar.com',
                                col3: $cookieContent.data('expiry-sixteen-days'),
                                col4: $cookieContent.data('uetsid'),
                            },
                            {
                                col1: '__Secure-1PAPISID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('secure-1papisid'),
                            },
                            {
                                col1: '__Secure-1PSID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('secure-1psid'),
                            },
                            {
                                col1: '__Secure-3PAPISID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('secure-3papisid'),
                            },
                            {
                                col1: '__Secure-3PSID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('secure-3psid'),
                            },
                            {
                                col1: '__Secure-3PSIDCC',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('secure-3psidcc'),
                            },
                            {
                                col1: 'APISID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('apisid'),
                            },
                            {
                                col1: 'NID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('nid'),
                            },
                            {
                                col1: 'SAPISID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('sapisid'),
                            },
                            {
                                col1: 'SID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('sid'),
                            },
                            {
                                col1: 'SSID',
                                col2: 'google.com',
                                col3: $cookieContent.data('expiry-one-year'),
                                col4: $cookieContent.data('ssid'),
                            }
                        ]
                    }, {
                        title: $cookieContent.data('title-more-info'),
                        description: $cookieContent.data('description-more-info') + ' <a class="cc-link" href="mailto: support@assetbank.co.uk">' + $cookieContent.data('link-contact-us') + '</a>.',
                    }
                ]
            }
        }
    }
});
