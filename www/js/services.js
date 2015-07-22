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

.factory('Calculators', function () {
    return {
        getMaxLpByLevel: function (level) {
            return 25 + Math.floor(Math.min(level, 300) / 2) + Math.floor(Math.max((level - 300), 0) / 3);
        }
    }
})

.factory('Accounts', ['$localStorage', 'Calculators', function ($localStorage, Calculators) {
    const ACCOUNTS_KEY = "accounts";
    return {
        KEY_FOR_ALIAS: "alias",
        KEY_FOR_LEVEL: "level",
        KEY_FOR_EXP: "exp",
        KEY_FOR_LP: "lp",
        KEY_FOR_LOVECA: "loveca",
        KEY_FOR_BONUS: "has_claimed_bonus",
        KEY_FOR_MAX_LP: "max_lp",
        set: function (accounts) {
            $localStorage.set(ACCOUNTS_KEY, accounts)
        },
        get: function () {
            return $localStorage.getArray(ACCOUNTS_KEY);
        },
        getAccountIndex: function (account) {
            var current_accounts = this.get();
            var current_aliases = current_accounts.map(function (item) {
                return item.alias
            });
            return current_aliases.indexOf(account[this.KEY_FOR_ALIAS]);
        },
        addAccount: function (new_account) {
            if (new_account !== undefined) {
                new_account[this.KEY_FOR_BONUS] = false;
                var level = new_account[this.KEY_FOR_LEVEL];
                new_account[this.KEY_FOR_MAX_LP] = Calculators.getMaxLpByLevel(level);
                var current_accounts = this.get();
                current_accounts.push(new_account);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        deleteAccount: function (account) {
            if (account !== undefined) {
                var current_accounts = this.get();
                var index = this.getAccountIndex(account);
                current_accounts.splice(index, 1);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        updateAccount: function (account, key, newData) {
            if (account !== undefined && key !== undefined && newData !== undefined) {
                var current_accounts = this.get();
                var index = this.getAccountIndex(account);
                current_accounts[index][key] = newData;
                var level = current_accounts[index][this.KEY_FOR_LEVEL];
                current_accounts[index][this.KEY_FOR_MAX_LP] = Calculators.getMaxLpByLevel(level);
                this.set(current_accounts);
                return true;
            }
            return false;
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
            id: "us",
            name: "United States",
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