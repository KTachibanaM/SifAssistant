// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('sif-assistant', ['ionic', 'ngCordova', 'gettext', 'ionic-cache-src', 'sif-assistant.controllers'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            if (ionic.Platform.isIOS()) {
                window.plugin.notification.local.promptForPermission();
            }
        });
    })

    .run(function (gettextCatalog, Platform, Settings) {
        var locale;
        if (Settings.getItem('debug_force_locale')) {
            locale = Settings.getItem('debug_force_locale');
        } else {
            locale = Platform.getLocale();
        }
        if (locale) {
            gettextCatalog.loadRemote("js/translations/" + locale + ".json");
            gettextCatalog.setCurrentLanguage(locale);
        }
    })

    .run(function (NativeSchedule, gettextCatalog, Events) {
        // todo: run twice, why?

        // daily event check callback
        var daily_event_check = function () {
            // check jp
            Events.getByRegion("jp").then(function (event) {
                if (!Events.ifEventExpired(event) && Events.getEventStatus(event).status === 'before') {
                    // notify if before jp event
                    NativeNotification.schedule(
                        "_daily_event_check_jp_succeed",
                        sprintf(
                            gettextCatalog.getString('Japan event will start in: %s'), Events.getEventStatusInStrings(event).left
                        )
                    )
                }
            }, function (error) {
                NativeNotification.schedule(
                    "_daily_event_check_jp_fail",
                    sprintf(gettextCatalog.getString('Failed to check Japan event, reason: %s'), error.message)
                )
            });

            // check us
            Events.getByRegion("us").then(function (event) {
                if (!Events.ifEventExpired(event) && Events.getEventStatus(event).status === 'before') {
                    // notify if before us event
                    NativeNotification.schedule(
                        "_daily_event_check_us_succeed",
                        sprintf(
                            gettextCatalog.getString('US event will start in: %s'), Events.getEventStatusInStrings(event).left
                        )
                    )
                }
            }, function (error) {
                NativeNotification.schedule(
                    "_daily_event_check_us_fail",
                    sprintf(gettextCatalog.getString('Failed to check US event, reason: %s'), error.message)
                )
            });
        };

        NativeSchedule.isPresent("_daily_event_check", function (present) {
            if (!present) {
                // if daily event check is not present, schedule one
                NativeSchedule.schedule(
                    "_daily_event_check",
                    gettextCatalog.getString("Checking events"),
                    0,
                    "day",
                    daily_event_check)
            }
        })
    })

    .constant("update_interval_in_ms", 1000)

    .constant("locales", ['zh_CN'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

            .state('app.accounts', {
                url: '/accounts',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/accounts.html',
                        controller: 'AccountsCtrl'
                    }
                }
            })

            .state('app.regions', {
                url: '/regions',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/regions.html',
                        controller: 'RegionsCtrl'
                    }
                }
            })

            .state('app.events', {
                url: '/events',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/events.html',
                        controller: 'EventsCtrl'
                    }
                }
            })

            .state('app.debug', {
                url: '/debug',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/debug.html',
                        controller: 'DebugCtrl'
                    }
                }
            })

            .state('app.about', {
                url: '/about',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/about.html',
                        controller: 'AboutCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('app.add-account', {
                url: '/add-account',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/add-account.html',
                        controller: 'AddAccountCtrl'
                    }
                }
            })

            .state('app.update-loveca', {
                url: '/update-loveca/:alias',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/update-loveca.html',
                        controller: 'UpdateLovecaCtrl'
                    }
                }
            })

            .state('app.update', {
                url: '/update/:alias',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/update.html',
                        controller: 'UpdateCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/accounts');
    });
