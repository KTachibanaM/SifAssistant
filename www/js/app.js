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
        if (Settings.get().debug_force_locale) {
            locale = Settings.get().debug_force_locale
        } else {
            locale = Platform.getLocale();
        }
        if (locale) {
            gettextCatalog.loadRemote("js/translations/" + locale + ".json");
            gettextCatalog.setCurrentLanguage(locale);
        }
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
