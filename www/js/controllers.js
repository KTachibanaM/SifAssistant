angular.module('sif-assistant.controllers', ['sif-assistant.services'])

    .controller('AppCtrl', function ($scope, Settings) {
        $scope.settings = Settings.get();
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

    .filter('accountsFilter', function ($filter) {
        return function (value, option) {
            var name = option.name;
            if (name !== "All") {
                return $filter(name)(value);
            } else {
                return value;
            }
        }
    })

    .filter('hasNotClaimedDailyBonus', function () {
        return function (accounts) {
            var out = [];
            accounts.forEach(function (account) {
                if (!account.has_claimed_bonus) {
                    out.push(account);
                }
            });
            return out;
        }
    })

    .filter('fullLp', function (Calculators) {
        return function (accounts) {
            var out = [];
            accounts.forEach(function (account) {
                if (account.lp === Calculators.getMaxLpByLevel(account)) {
                    out.push(account);
                }
            });
            return out;
        }
    })

    .controller('AccountsCtrl', function ($scope, $rootScope, $interval, ONE_SECOND, $timeout, $ionicPopup, Accounts, Calculators, SongTypes, gettextCatalog) {
        $scope.currentFilter = "All";

        /**
         * Timers
         */
        $scope.updateTimingRemainingTillNextLp = function () {
            $scope.time_remaining_till_next_lp = Accounts.calculateAllTimeRemainingTillNextLp();
        };

        $interval($scope.updateTimingRemainingTillNextLp, ONE_SECOND);

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
                        text: '<b>' + gettextCatalog.getString("Delete") + '</b>',
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

    .controller('UpdateCtrl', function ($scope, $rootScope, $ionicHistory, $stateParams, Accounts, SongTypes, Calculators) {
        $scope.updatingAccount = Accounts.getAccountByAlias($stateParams.alias);

        $scope.song_types = SongTypes.get();

        $scope.buffer = [];

        $scope.addToBuffer = function (song_type) {
            $scope.buffer.push(song_type);
        };

        $scope.removeFromBuffer = function (index) {
            $scope.buffer.splice(index, 1);
        };

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

    .controller('RegionsCtrl', function ($scope, $interval, Regions, ONE_SECOND) {
        $scope.reload = function () {
            $scope.regions = Regions.get();
        };

        $scope.reload();

        $interval($scope.reload, ONE_SECOND);
    })

    .controller('EventsCtrl', function ($scope, Events, Regions) {
        Events.getRawByRegion('jp').then(function (data) {
            $scope.jp = data.data.results[0];
            $scope.jp_name = Regions.getById('jp').name;
        }, function (err) {

        });

        Events.getRawByRegion('us').then(function (data) {
            $scope.us = data.data.results[0];
            $scope.us_name = Regions.getById('us').name;
        }, function (err) {

        });
    })

    .controller('DebugCtrl', function ($scope, $interval, NativeNotification, ONE_SECOND) {
        $scope.reload = function () {
            NativeNotification.getAll(function (notifications) {
                $scope.all_notifications = notifications;
            });
        };

        $interval($scope.reload, ONE_SECOND);

        $scope.reload();

        $scope.immediately = function () {
            NativeNotification.schedule(
                "immediately",
                "Notification scheduled immediately"
            );
        };

        $scope.five_seconds = function () {
            NativeNotification.schedule(
                "five seconds later",
                "Notification scheduled five seconds later",
                Date.now() + 5 * 1000
            )
        };

        $scope.one_minute = function () {
            NativeNotification.schedule(
                "one minute later",
                "Notification scheduled one minute later",
                Date.now() + 60 * 1000
            )
        };

        $scope.every_second = function () {
            NativeNotification.schedule(
                "every second",
                "Notification scheduled every second",
                0,
                "second"
            )
        };

        $scope.cancel = function (id) {
            NativeNotification.cancelByRawHashedId(id);
        };
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
        $scope.settings = Settings.get();

        $scope.toggle = function () {
            Settings.set($scope.settings);
        }
    });