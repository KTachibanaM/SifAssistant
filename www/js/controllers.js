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

    $scope.addAccount = function (account) {
        Accounts.addAccount(account);
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

.controller('AccountsCtrl', function ($scope, $ionicPopup, Accounts) {
    // Show accounts
    $scope.accounts = Accounts.get();

    // Update Account
    $scope.updateAccountData = {
        updatedLevel: 0,
        updatedExp: 0,
        updatedLp: 0,
        updatedLoveca: 0,
        updatedBonus: true
    };

    // Update Level
    $scope.oepnUpdateLevel = function (account) {
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
            console.log(result);
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
            console.log(result);
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
            console.log(result);
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
            console.log(result);
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
            console.log(result);
        })
    };

    // Delete account
    $scope.confirmDeleteAccount = function(confirmation) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete account',
            template: 'Are you sure you want to delete this account?'
        });
        confirmPopup.then(confirmation);
    };

    $scope.deleteAccount = function (account) {
        Accounts.deleteAccount(account);
    };

    $scope.openDeleteAccount = function (account) {
        $scope.confirmDeleteAccount(function (yes) {
            if (yes) {
                $scope.deleteAccount(account);
            }
        });
    };
});