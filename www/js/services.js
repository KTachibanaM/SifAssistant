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

.factory('Accounts', ['$localStorage', 'Calculators', 'Regions', function ($localStorage, Calculators, Regions) {
    const ACCOUNTS_KEY = "accounts";
    const LP_INCREMENTAL_MINUTES = 6;
    return {
        set: function (accounts) {
            $localStorage.set(ACCOUNTS_KEY, accounts)
        },
        get: function () {
            var now = this.refreshAllDataWithTiming();
            var data_with_extra = this.getRaw().map(function (account) {
                account.max_lp = Calculators.getMaxLpByLevel(account.level);
                return account;
            });
            data_with_extra.map(function (account) {
                if (account.lp === account.max_lp) {
                    account.lp_time_remaining = "Full";
                }
                else
                {
                    var last_lp_update = account.last_lp_update;
                    var ms_passed = now - last_lp_update;
                    ms_passed = ms_passed % (moment.duration(LP_INCREMENTAL_MINUTES, "minutes").asMilliseconds());
                    var ms_left = moment.duration(LP_INCREMENTAL_MINUTES, "minutes").asMilliseconds() - ms_passed;
                    var minutes_left = moment.duration(ms_left).minutes();
                    var seconds_left = moment.duration(ms_left).seconds();
                    account.lp_time_remaining = minutes_left + ":" + seconds_left;
                }
            });
            return data_with_extra;
        },
        getRaw: function () {
            return $localStorage.getArray(ACCOUNTS_KEY);
        },
        getAccountIndex: function (account) {
            var current_accounts = this.getRaw();
            var current_aliases = current_accounts.map(function (item) {
                return item.alias
            });
            return current_aliases.indexOf(account.alias);
        },
        addAccount: function (new_account) {
            if (new_account !== undefined) {
                new_account.has_claimed_bonus = false;
                new_account.last_lp_update = Date.now();
                new_account.last_bonus_update = Date.now();
                var current_accounts = this.getRaw();
                current_accounts.push(new_account);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        deleteAccount: function (account) {
            if (account !== undefined) {
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);
                current_accounts.splice(index, 1);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        updateAccount: function (account, key, newData) {
            if (account !== undefined && key !== undefined && newData !== undefined) {
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);
                current_accounts[index][key] = newData;
                if (key === "lp" || key === "level") {
                    current_accounts[index].last_lp_update = Date.now();
                }
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        refreshAllDataWithTiming: function () {
            var now = Date.now();
            this.incrementAllLp(now);
            this.checkAllBonus(now);
            return now;
        },
        incrementAllLp: function (now) {
            var current_accounts = this.getRaw().map(function (account) {
                var last_lp_update = account.last_lp_update;
                var ms_passed = now - last_lp_update;
                var minutes_passed = Math.floor(moment.duration(ms_passed).asMinutes());
                var lp_incremented = Math.floor(minutes_passed / LP_INCREMENTAL_MINUTES);
                if (lp_incremented > 0) {
                    account.last_lp_update = now;
                    var new_lp = account.lp + lp_incremented;
                    var max_lp = Calculators.getMaxLpByLevel(account.level);
                    if (new_lp >= max_lp) {
                        new_lp = max_lp;
                    }
                    account.lp = new_lp;
                }
                return account;
            });
            this.set(current_accounts);
        },
        checkAllBonus: function (now) {
            var current_accounts = this.getRaw().map(function (account) {
                var timezone = Regions.getTimeZoneById(account.region);
                var last_bonus_update = account.last_bonus_update;
                var last_bonus_update_tz = moment(last_bonus_update).tz(timezone);
                var now_tz = moment(now).tz(timezone);
                if (!now_tz.isSame(last_bonus_update_tz, "day")) {
                    account.last_bonus_update = now;
                    account.has_claimed_bonus = false;
                }
                return account;
            });
            this.set(current_accounts);
        }
    }
}])

.factory('Regions', function () {
    const DATA = [
        {
            id: "jp",
            name: "Japan",
            timezone: "Asia/Tokyo"
        },
        {
            id: "cn",
            name: "China",
            timezone: "Asia/Shanghai"
        },
        {
            id: "us",
            name: "United States",
            timezone: "Etc/UTC"
        },
        {
            id: "kr",
            name: "Korea",
            timezone: "Asia/Seoul"
        },
        {
            id: "tw",
            name: "Taiwan",
            timezone: "Asia/Taipei"
        }
    ];

    return {
        get: function () {
            return DATA.map(function (region) {
                region.local_time = moment().tz(region.timezone).format("YYYY/MM/DD HH:mm:ss");
                return region;
            })
        },
        getTimeZoneById: function (id) {
            var ids = this.get().map(function (region) {
                return region.id;
            });
            var index = ids.indexOf(id);
            return this.get()[index].timezone;
        }
    }
});