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

.controller('AccountsCtrl', function ($scope, $ionicModal, $ionicPopup, Accounts) {
    // Show accounts
    $scope.accounts = Accounts.get();

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