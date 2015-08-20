'use strict';

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('sif-assistant', ['ionic', 'sif-assistant.controllers', 'ngCordova', 'gettext'])

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

    .run(function (gettextCatalog, Platform) {
        var locale = Platform.getLocale();
        if (locale) {
            gettextCatalog.loadRemote("js/translations/" + locale + ".json");
            gettextCatalog.setCurrentLanguage(locale);
        }
    })

    .config(function ($ionicConfigProvider, isBrowser) {
        var nativeScrollingApplicable = function () {
            if (isBrowser) {
                return true;
            }
            if (ionic.Platform.isIOS()) {
                return false;
            }
            if (ionic.Platform.isAndroid()) {
                return ionic.Platform.version() >= 4.4;
            }
            return false;
        };
        $ionicConfigProvider.scrolling.jsScrolling(!nativeScrollingApplicable());
    })

    .constant("isBrowser", window.cordova === undefined)

    .constant("FREQUENT", 1000)

    .constant("INFREQUENT", 5 * 1000)

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
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/accounts');
    });
