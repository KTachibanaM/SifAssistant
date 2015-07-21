angular.module('sif-assistant.controllers', [])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function(e) {
//})

.controller('AppCtrl', function($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/add-account.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.addAccountModal = modal;
    });
        
    $scope.regions = [
        {
            id: "jp",
            name: "Japan",
            timezone: "JST"
        },
        {
            id: "cn",
            name: "China",
            timezone: "CST"
        },
        {
            id: "int",
            name: "International",
            timezone: "CST"
        },
        {
            id: "kr",
            name: "Korea",
            timezone: "CST"
        },
        {
            id: "tw",
            name: "Taiwan",
            timezone: "CST"
        }
    ];

    $scope.addAccount = function (account) {
        console.log(account);
        $scope.closeAddAccount();
    };

    $scope.openAddAccount = function () {
        $scope.addAccountModal.show();
    };

    $scope.closeAddAccount = function () {
        $scope.addAccountModal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
})

.controller('AccountsCtrl', function ($scope) {
    $scope.hello = "Hello from AccountsCtrl"
});