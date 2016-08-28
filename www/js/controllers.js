angular.module('sif-assistant.controllers', ['sif-assistant.services'])

    .controller('AppCtrl', function ($scope, Settings) {
        $scope.settings = {};
        $scope.settings.show_debug = Settings.getItem('show_debug');
    })

    .controller('AddAccountCtrl', function ($scope, $rootScope, $ionicHistory, Accounts, Regions, gettextCatalog) {
        $scope.regions = Regions.get();

        $scope.newAccount = {
            alias: "",
            region: "jp",
            level: 1,
            exp: 0,
            lp: 0,
            loveca: 0
        };

        $scope.addAccount = function (account) {
            if (Accounts.ifAccountExists(account)) {
                alert(gettextCatalog.getString("Cannot have duplicate alias"))
            } else {
                if (Accounts.addAccount(account)) {
                    $rootScope.$broadcast('reload', {});
                    $ionicHistory.goBack();
                }
            }
        };
    })

    .controller('AccountsCtrl', function ($scope, $rootScope, $interval, update_interval_in_ms, $timeout, $ionicPopup, Accounts, Calculators, gettextCatalog) {
        /**
         * Timers
         */
        $scope.updateTimingRemainingTillNextLp = function () {
            $scope.time_remaining_till_next_lp = Accounts.calculateAllTimeRemainingTillNextLp();
        };

        $interval($scope.updateTimingRemainingTillNextLp, update_interval_in_ms);

        /**
         * Computed attributes
         */
        $scope.updateComputedAttributes = function () {
            $scope.computed_attributes = Accounts.getComputedAttributes();
        };

        /**
         * Show accounts
         */
        $scope.reload = function () {
            $scope.accounts = Accounts.getAndUpdateTimedAttributes();
            $scope.updateComputedAttributes();
            $scope.accounts.forEach(function (account) {
                if (account.time_remaining_till_next_lp.ms !== -1) {
                    $timeout($scope.reload, account.time_remaining_till_next_lp.ms);
                }
                $timeout($scope.reload, account.time_remaining_till_next_daily_bonus.ms);
            });
            $scope.updateTimingRemainingTillNextLp();
        };

        $scope.reload();

        $rootScope.$on('reload', function () {
            $scope.reload();
        });

        /**
         * Update bonus
         */
        $scope.toggleBonus = function (account) {
            $scope.updateAccountPersistent(account, "has_claimed_bonus", account.has_claimed_bonus);
        };

        /**
         * Update alerts
         */
        $scope.toggleLpAlerts = function (account) {
            $scope.updateAccountPersistent(account, "alerts_lp", account.alerts_lp);
        };

        $scope.saveLpAlertsValue = function (account) {
            $scope.updateAccountPersistent(account, "alerts_lp_value", account.alerts_lp_value);
        };

        $scope.toggleBonusAlerts = function (account) {
            $scope.updateAccountPersistent(account, "alerts_bonus", account.alerts_bonus);
        };

        /**
         * Update account
         */
        $scope.updateAccount = function (account, key, new_value) {
            $scope.updateAccountLocal(account, key, new_value);
            $scope.updateAccountPersistent(account, key, new_value);
        };

        $scope.updateAccountLocal = function (account, key, new_value) {
            var index = Accounts.getAccountIndex(account);
            $scope.accounts[index][key] = new_value;
        };

        $scope.updateAccountPersistent = function (account, key, new_value) {
            Accounts.updateAccount(account, key, new_value);
            $scope.updateComputedAttributes();
        };

        /**
         * Delete account
         */
        $scope.openDeleteAccount = function (account) {
            $ionicPopup.confirm({
                title: gettextCatalog.getString('Delete account'),
                templateUrl: 'templates/delete-account.html',
                scope: $scope,
                buttons: [
                    {
                        text: gettextCatalog.getString('Cancel')
                    },
                    {
                        text: sprintf('<b>%s</b>', gettextCatalog.getString("Delete")),
                        type: 'button-positive',
                        onTap: function (e) {
                            return true;
                        }
                    }
                ]
            }).then(function (yes) {
                if (yes) {
                    $scope.deleteAccount(account);
                }
            });
        };

        $scope.deleteAccount = function (account) {
            if (Accounts.deleteAccount(account)) {
                $scope.reload();
            }
        };
    })

    .controller('UpdateCtrl', function ($scope, $rootScope, $ionicHistory, $stateParams, Accounts, Songs, Calculators) {
        $scope.updatingAccount = Accounts.getAccountByAlias($stateParams.alias);
        $scope.songs = Songs.get();

        // Added song
        $scope.resetAddedSong = function () {
            $scope.addedSong = {
                difficulty: 'easy',
                category: 'regular'
            };
        };
        $scope.resetAddedSong();

        // When current category changes, available multipliers change
        // When available multipliers change, added song multiplier change
        $scope.$watch('addedSong.category', function () {
            $scope.multipliers = $scope.songs.categories[$scope.addedSong.category].songMultipliers;
            $scope.addedSong.multiplier = $scope.multipliers[0];
        });

        function objectToArrayWithIdField(object) {
            return Object.keys(object).map(function (key) {
                var newObject = object[key];
                newObject.id = key;
                return newObject;
            })
        }

        // Available difficulties and categories
        $scope.difficulties = objectToArrayWithIdField($scope.songs.difficulties);
        $scope.categories = objectToArrayWithIdField($scope.songs.categories);

        // Buffer
        $scope.buffer = [];
        $scope.addToBuffer = function () {
            var difficulty = $scope.addedSong.difficulty;
            var category = $scope.addedSong.category;
            var multiplier = $scope.addedSong.multiplier;
            var legacySongType = {
                name: sprintf(
                    '%s %s x %d',
                    $scope.songs.difficulties[difficulty].name,
                    $scope.songs.categories[category].name,
                    multiplier),
                expAddition:
                    $scope.songs.difficulties[difficulty].expAddition
                        * $scope.songs.categories[category].expMultiplier
                        * multiplier,
                lpSubtraction:
                    $scope.songs.difficulties[difficulty].lpSubtraction
                    * $scope.songs.categories[category].lpMultiplier
                    * multiplier
            };
            $scope.buffer.push(legacySongType);
        };

        $scope.removeFromBuffer = function (index) {
            $scope.buffer.splice(index, 1);
        };

        // Save
        $scope.save = function () {
            var updated_account = Calculators.updateAccountSongsPlayed($scope.updatingAccount, $scope.buffer);
            Accounts.updateAccount($scope.updatingAccount, "level", updated_account.level);
            Accounts.updateAccount($scope.updatingAccount, "exp", updated_account.exp);
            Accounts.updateAccount($scope.updatingAccount, "lp", updated_account.lp);
            $rootScope.$broadcast('reload', {});
            $ionicHistory.goBack();
        };
    })

    .controller('UpdateLovecaCtrl', function ($scope, $rootScope, $ionicHistory, $stateParams, Accounts) {
        $scope.updatingAccount = Accounts.getAccountByAlias($stateParams.alias);

        $scope.lovecaBuffer = {
            subtraction: 0,
            subtractionMultiplier: 1,
            addition: 0,
            additionMultiplier: 1
        };

        $scope.saveLoveca = function () {
            var current_loveca = $scope.updatingAccount.loveca;
            var loveca_delta
                = $scope.lovecaBuffer.addition
                * $scope.lovecaBuffer.additionMultiplier
                - $scope.lovecaBuffer.subtraction
                * $scope.lovecaBuffer.subtractionMultiplier;
            var new_loveca = current_loveca + loveca_delta;
            Accounts.updateAccount($scope.updatingAccount, 'loveca', new_loveca);
            $rootScope.$broadcast('reload', {});
            $ionicHistory.goBack();
        };
    })

    .controller('RegionsCtrl', function ($scope, $interval, Regions, update_interval_in_ms) {
        $scope.reload = function () {
            $scope.regions = Regions.get();
        };

        $scope.reload();

        $interval($scope.reload, update_interval_in_ms);
    })

    .controller('EventsCtrl', function ($scope, $interval, Events, update_interval_in_ms) {
        Events.getByRegion('jp').then(function (data) {
            $scope.jp = data;
            $interval(function () {
                $scope.jp.event_status_strings = Events.getEventStatusStrings($scope.jp);
            }, update_interval_in_ms)
        }, function (err) {
            $scope.error = err;
        });

        Events.getByRegion('us').then(function (data) {
            $scope.us = data;
            $interval(function () {
                $scope.us.event_status_strings = Events.getEventStatusStrings($scope.us);
            }, update_interval_in_ms)
        }, function (err) {
            $scope.error = err;
        });
    })

    .controller('DebugCtrl', function ($scope, $interval, NativeNotification, NativeSchedule, Events, update_interval_in_ms, Settings, locales) {
        // Fire test notifications
        $scope.reload = function () {
            NativeNotification.getAll(function (notifications) {
                $scope.all_notifications = notifications;
            });
        };

        $interval($scope.reload, update_interval_in_ms);

        $scope.reload();

        $scope.immediately = function () {
            NativeNotification.schedule(
                "_immediately",
                "Notification scheduled immediately"
            );
        };

        $scope.five_seconds = function () {
            NativeNotification.schedule(
                "_five_seconds_later",
                "Notification scheduled five seconds later",
                Date.now() + 5 * 1000
            )
        };

        $scope.one_minute = function () {
            NativeNotification.schedule(
                "_one_minute_later",
                "Notification scheduled one minute later",
                Date.now() + 60 * 1000
            )
        };

        $scope.every_second = function () {
            NativeNotification.schedule(
                "_every_second",
                "Notification scheduled every second",
                0,
                "second"
            )
        };

        $scope.cancel = function (id) {
            NativeNotification.cancelByRawHashedId(id);
        };

        // Fire test schedule
        $scope.download_every_second = function () {
            NativeSchedule.schedule(
                "_every_second_download",
                "Downloading JP event scheduled every second",
                0,
                "second",
                function () {
                    Events.getNetworkedRawByRegion('jp').then(function (data) {
                        NativeNotification.schedule(
                            "_every_second_download_succeeded",
                            JSON.stringify(data)
                        )
                    }, function (error) {
                        NativeNotification.schedule(
                            "_every_second_download_failed",
                            error.message
                        )
                    })
                }
            )
        };

        // Debug force locale
        $scope.locales = locales.concat(undefined);

        $scope.settings = {};
        $scope.settings.debug_force_locale = Settings.getItem('debug_force_locale');
        $scope.save_forced_locale = function () {
            Settings.setItem('debug_force_locale', $scope.settings.debug_force_locale)
        }
    })

    .controller('AboutCtrl', function ($scope) {
        if (window.cordova) {
            window.cordova.getAppVersion(function (version) {
                $scope.app_version = version;
            });
        }
        $scope.platform = ionic.Platform.platform();
        $scope.platform_version = ionic.Platform.version();
        $scope.locale = navigator.language || navigator.userLanguage;
    })

    .controller('SettingsCtrl', function ($scope, Settings) {
        $scope.settings = {};
        $scope.settings.show_debug = Settings.getItem('show_debug');
        $scope.toggle = function () {
            Settings.setItem('show_debug', $scope.settings.show_debug);
        }
    });