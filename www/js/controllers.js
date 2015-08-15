angular.module('sif-assistant.controllers', ['sif-assistant.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function(e) {
//})

.controller('AppCtrl', function($scope, $ionicModal, Accounts, Regions) {
    $scope.regions = Regions.get();

    /**
     * Add account
     */
    $scope.reset_new_account = function () {
        $scope.newAccount = {
            alias: "",
            region: "jp",
            level: 1,
            exp: 0,
            lp: 0,
            loveca: 0
        };
    };

    $scope.reset_new_account();

    $ionicModal.fromTemplateUrl('templates/add-account.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.addAccountModal = modal;
    });

    $scope.refresh = function () {
        $scope.$broadcast('refresh', {});
    };

    $scope.addAccount = function (account) {
        if (Accounts.addAccount(account)) {
            $scope.refresh();
        }
        $scope.closeAddAccount();
    };

    $scope.openAddAccount = function () {
        $scope.reset_new_account();
        $scope.addAccountModal.show();
    };

    $scope.closeAddAccount = function () {
        $scope.addAccountModal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.addAccountModal.remove();
    });
})

.filter('accountsFilter', function ($filter) {
    return function (value, option) {
        var name = option.name;
        if (name !== "All") {
            return $filter(name)(value);
        }
        else
        {
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

.controller('AccountsCtrl', function
        ($scope, $interval, $ionicModal, $ionicPopup, Accounts, Calculators, FREQUENT, INFREQUENT, SongTypes, gettext)
    {
    $scope.currentFilter = "All";

    /**
     * Show frequently refreshed data
     */
    $scope.refreshFrequent = function () {
        $scope.frequentRefreshData = Accounts.getFrequentRefreshData();
    };

    $scope.refreshFrequent();

    $interval($scope.refreshFrequent, FREQUENT);

    /**
     * Show infrequently refreshed data
     */
    $scope.refreshInfrequent = function () {
        Accounts.refreshInfrequentData();
        $scope.refresh();
    };

    $scope.refreshInfrequent();

    $interval($scope.refreshInfrequent, INFREQUENT);

    /**
     * Show accounts
     */
    $scope.refresh = function () {
        $scope.accounts = Accounts.get();
    };

    $scope.refresh();

    $scope.$on('refresh', function () {
        $scope.refresh();
    });

    /**
     * Update accounts
     */
    $scope.updateAccount = function (account, key, newData) {
        if (Accounts.updateAccount(account, key, newData)) {
            $scope.refresh();
        }
    };
    $scope.updatingAccount = {};

    /**
     * Update level/exp/lp
     */
    $scope.song_types = SongTypes.get();

    $scope.reset_buffer = function () {
        $scope.buffer = [];
    };

    $scope.reset_buffer();

    $scope.addToBuffer = function (song_type) {
        $scope.buffer.push(song_type);
    };

    $scope.removeFromBuffer = function (index) {
        $scope.buffer.splice(index, 1);
    };

    $ionicModal.fromTemplateUrl('templates/update.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.updateModal = modal;
    });

    $scope.openUpdate = function (account) {
        $scope.reset_buffer();
        $scope.updatingAccount = account;
        $scope.updateModal.show();
    };

    $scope.closeUpdate = function () {
        $scope.updateModal.hide();
    };

    $scope.save = function () {
        var updated_account = Calculators.updateAccountSongsPlayed($scope.updatingAccount, $scope.buffer);
        $scope.updateAccount($scope.updatingAccount, "level", updated_account.level);
        $scope.updateAccount($scope.updatingAccount, "exp", updated_account.exp);
        $scope.updateAccount($scope.updatingAccount, "lp", updated_account.lp);

        $scope.closeUpdate();
    };

    $scope.$on('$destroy', function() {
        $scope.updateModal.remove();
    });

    /**
     * Update loveca
     */
    $scope.reset_loveca_buffer = function () {
        $scope.lovecaBuffer = {
            subtraction: 0,
            subtractionMultiplier: 0,
            addition: 0,
            additionMultiplier: 0
        };
    };

    $scope.reset_loveca_buffer();

    $ionicModal.fromTemplateUrl('templates/update-loveca.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.updateLovecaModal = modal;
    });

    $scope.openUpdateLoveca = function (account) {
        $scope.reset_loveca_buffer();
        $scope.updatingAccount = account;
        $scope.updateLovecaModal.show();
    };

    $scope.closeUpdateLoveca = function () {
        $scope.updateLovecaModal.hide();
    };

    $scope.saveLoveca = function () {
        var current_loveca = $scope.updatingAccount.loveca;
        var loveca_delta
            = $scope.lovecaBuffer.addition
            * $scope.lovecaBuffer.additionMultiplier
            - $scope.lovecaBuffer.subtraction
            * $scope.lovecaBuffer.subtractionMultiplier;
        var new_loveca = current_loveca + loveca_delta;
        $scope.updateAccount(
            $scope.updatingAccount,
            "loveca",
            new_loveca
        );
        $scope.closeUpdateLoveca();
    };

    $scope.$on('$destroy', function() {
        $scope.updateLovecaModal.remove();
    });

    /**
     * Update bonus
     */
    $scope.toggleBonus = function (account) {
        $scope.updateAccount(account, "has_claimed_bonus", account.has_claimed_bonus);
    };

    /**
     * Delete account
     */
    $scope.openDeleteAccount = function (account) {
        $ionicPopup.confirm({
            title: gettext('Delete account'),
            templateUrl: 'templates/delete-account.html'
        }).then(function (yes) {
            if (yes) {
                $scope.deleteAccount(account);
            }
        });
    };

    $scope.deleteAccount = function (account) {
        if (Accounts.deleteAccount(account)) {
            $scope.refresh();
        }
    };
})

.controller('RegionsCtrl', function ($scope, $interval, Regions, FREQUENT) {
    $scope.refresh = function () {
        $scope.regions = Regions.get();
    };

    $scope.refresh();

    $interval($scope.refresh, FREQUENT);
})

.controller('AlertsCtrl', function ($scope, Accounts) {
    /**
     * Show accounts
     */
    $scope.refresh = function () {
        $scope.accounts = Accounts.get();
    };

    $scope.$on('refresh', function () {
        $scope.refresh();
    });

    $scope.refresh();

    /**
     * Update accounts
     */
    $scope.toggleLpAlerts = function (account) {
        $scope.updateAccount(account, "alerts_lp", account.alerts_lp);
    };

    $scope.saveLpAlertsValue = function (account) {
        $scope.updateAccount(account, "alerts_lp_value", account.alerts_lp_value);
    };

    $scope.toggleBonusAlerts = function (account) {
        $scope.updateAccount(account, "alerts_bonus", account.alerts_bonus);
    };

    $scope.updateAccount = function (account, key, newData) {
        Accounts.updateAccount(account, key, newData);
    };
})

.controller('DebugCtrl', function ($scope, $interval, NativeNotification, FREQUENT) {
    $scope.refresh = function () {
        NativeNotification.getAll(function (notifications) {
            $scope.all_notifications = notifications;
        });
    };

    $interval($scope.refresh, FREQUENT);

    $scope.refresh();

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
        window.cordova.getAppVersion(function(version) {
            $scope.app_version = version;
        });
    }
    $scope.platform = ionic.Platform.platform();
    $scope.platform_version = ionic.Platform.version();
    $scope.locale = navigator.language || navigator.userLanguage;
});