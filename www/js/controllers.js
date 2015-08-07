angular.module('sif-assistant.controllers', ['sif-assistant.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function(e) {
//})

.controller('AppCtrl', function($scope, $ionicModal, Accounts, Regions) {
    $scope.regions = Regions.get();

    // Add account
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
        $scope.addAccountModal.show();
    };

    $scope.closeAddAccount = function () {
        $scope.addAccountModal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.addAccountModal.remove();
    });
})

.controller('AccountsCtrl', function ($scope, $interval, $ionicPopup, Accounts, FREQUENT, INFREQUENT) {
    // Show frequently refreshed data
    $scope.refreshFrequent = function () {
        $scope.frequentRefreshData = Accounts.getFrequentRefreshData();
    };

    $scope.refreshFrequent();

    $interval($scope.refreshFrequent, FREQUENT);

    // Show infrequently refreshed data
    $scope.refreshInfrequent = function () {
        Accounts.refreshInfrequentData();
        $scope.refresh();
    };

    $scope.refreshInfrequent();

    $interval($scope.refreshInfrequent, INFREQUENT);

    // Show accounts
    $scope.refresh = function () {
        $scope.accounts = Accounts.get();
    };

    $scope.refresh();

    $scope.$on('refresh', function () {
        $scope.refresh();
    });

    // Update Account
    $scope.updateAccountData = {
        updatedLevel: 0,
        updatedExp: 0,
        updatedLp: 0,
        updatedLoveca: 0,
        updatedBonus: true
    };
    $scope.subtractions = {
        lp: 0,
        loveca: 0
    };

    // Update Level
    $scope.openUpdateLevel = function (account) {
        $scope.updateAccountData.updatedLevel = account.level;
        $ionicPopup.show({
            template: '<input type="number" ng-model="updateAccountData.updatedLevel">',
            title: "Enter your updated Level",
            scope: $scope,
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: "+1",
                    onTap: function (e) {
                        e.preventDefault();
                        $scope.updateAccountData.updatedLevel = $scope.updateAccountData.updatedLevel + 1;
                    }
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function () {
                        return $scope.updateAccountData.updatedLevel;
                    }
                }
            ]
        }).then(function (result) {
            $scope.updateAccount(account, "level", result);
        })
    };

    // Update Exp
    $scope.openUpdateExp = function (account) {
        $scope.updateAccountData.updatedExp = account.exp;
        $ionicPopup.show({
            template: '<input type="number" ng-model="updateAccountData.updatedExp">',
            title: "Enter your updated Exp",
            scope: $scope,
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function () {
                        return $scope.updateAccountData.updatedExp;
                    }
                }
            ]
        }).then(function (result) {
            $scope.updateAccount(account, "exp", result);
        })
    };

    // Update LP
    $scope.openUpdateLp = function (account) {
        $scope.updateAccountData.updatedLp = account.lp;
        $ionicPopup.show({
            templateUrl: "templates/update-lp.html",
            title: "Enter your updated LP",
            scope: $scope,
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: "Clear",
                    onTap: function (e) {
                        e.preventDefault();
                        $scope.updateAccountData.updatedLp = 0;
                    }
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function () {
                        $scope.updateAccountData.updatedLp = $scope.updateAccountData.updatedLp - $scope.subtractions.lp;
                        $scope.subtractions.lp = 0;
                        return $scope.updateAccountData.updatedLp;
                    }
                }
            ]
        }).then(function (result) {
            $scope.updateAccount(account, "lp", result);
        })
    };

    // Update Loveca
    $scope.openUpdateLoveca = function (account) {
        $scope.updateAccountData.updatedLoveca = account.loveca;
        $ionicPopup.show({
            templateUrl: 'templates/update-loveca.html',
            title: "Enter your updated Loveca",
            scope: $scope,
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function () {
                        $scope.updateAccountData.updatedLoveca = $scope.updateAccountData.updatedLoveca - $scope.subtractions.loveca;
                        $scope.subtractions.loveca = 0;
                        return $scope.updateAccountData.updatedLoveca;
                    }
                }
            ]
        }).then(function (result) {
            $scope.updateAccount(account, "loveca", result);
        })
    };

    // Update Bonus
    $scope.openUpdateBonus = function (account) {
        $scope.updateAccountData.updatedBonus = account.has_claimed_bonus;
        $ionicPopup.show({
            template: '<label class="checkbox"><input type="checkbox" ng-model="updateAccountData.updatedBonus"></label>',
            title: 'Has claimed daily bonus',
            scope: $scope,
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function () {
                        return $scope.updateAccountData.updatedBonus;
                    }
                }
            ]
        }).then(function (result) {
            $scope.updateAccount(account, "has_claimed_bonus", result);
        })
    };

    $scope.updateAccount = function (account, key, newData) {
        if (Accounts.updateAccount(account, key, newData)) {
            $scope.refresh();
        }
    };

    // Delete account
    $scope.openDeleteAccount = function (account) {
        $ionicPopup.confirm({
            title: 'Delete account',
            template: 'Are you sure you want to delete this account?'
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
    // Show accounts
    $scope.refresh = function () {
        $scope.accounts = Accounts.get();
    };

    $scope.$on('refresh', function () {
        $scope.refresh();
    });

    $scope.refresh();

    // Update account
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
});