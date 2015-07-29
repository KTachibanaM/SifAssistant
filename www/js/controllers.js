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

.controller('AccountsCtrl', function ($scope, $interval, $ionicPopup, Accounts, Calculators) {
    // Show accounts
    $scope.refresh = function () {
        $scope.accounts = Accounts.get();
    };

    $scope.$on('refresh', function (event, args) {
        $scope.refresh();
    });

    $interval($scope.refresh, 500);

    $scope.refresh();

    // Update Account
    $scope.updateAccountData = {
        updatedLevel: 0,
        updatedExp: 0,
        updatedLp: 0,
        updatedLoveca: 0,
        updatedBonus: true
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
            template: '<input type="number" ng-model="updateAccountData.updatedLp">',
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
            template: '<input type="number" ng-model="updateAccountData.updatedLoveca">',
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

.controller('RegionsCtrl', function ($scope, $interval, Regions) {
    $scope.refresh = function () {
        $scope.regions = Regions.get();
    };

    $scope.refresh();

    $interval($scope.refresh, 500);
})

.controller('AlertsCtrl', function ($scope, $interval, Accounts) {
    // Show accounts
    $scope.refresh = function () {
        $scope.accounts = Accounts.get();
    };

    $scope.$on('refresh', function (event, args) {
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
});