angular.module('sif-assistant.services', [])

.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        getArray: function(key) {
            return JSON.parse($window.localStorage[key] || '[]');
        }
    }
}])

.factory('Accounts', ['$localStorage', function ($localStorage) {
    const ACCOUNTS_KEY = "accounts";
    return {
        addAccount: function (new_account) {
            new_account.has_claimed_bonus = false;
            var current_accounts = $localStorage.getArray(ACCOUNTS_KEY);
            current_accounts.push(new_account);
            $localStorage.set(ACCOUNTS_KEY, current_accounts)
        },
        getAccounts: function () {
            return $localStorage.getArray(ACCOUNTS_KEY);
        }
    }
}])

.factory('Regions', function () {
    const DATA = [
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

    return {
        get: function () {
            return DATA;
        }
    }
});