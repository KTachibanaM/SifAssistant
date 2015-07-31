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

.factory('NativeNotification', ['$cordovaLocalNotification', function ($cordovaLocalNotification) {
    const isBrowser = window.cordova === undefined;
    return {
        schedule: function (options) {
            options.title = "SIF Assistant";
            if (isBrowser) {
                console.log("Schedule native notification");
                console.log(options)
            }
            else
            {
                $cordovaLocalNotification.schedule(options);
            }
        },
        cancel: function (id) {
            if (isBrowser) {
                console.log("Cancel native notification");
                console.log(id)
            }
            else
            {
                $cordovaLocalNotification.cancel(id);
            }
        },
        isPresent: function (id, callback) {
            if (isBrowser) {
                console.log("isPresent is unimplemented, always return true");
                callback(true);
            }
            else
            {
                $cordovaLocalNotification.isPresent(id, callback);
            }
        }
    }
}])

.factory('Calculators', function () {
    return {
        getMaxLpByLevel: function (level) {
            return 25 + Math.floor(Math.min(level, 300) / 2) + Math.floor(Math.max((level - 300), 0) / 3);
        },
        getMaxExpByLevel: function(level) {
            return level < 100 ? Math.round(34.45 * level - 551) / 2 : Math.round(34.45 * level - 551);
        }
    }
})

.factory('Accounts', ['$localStorage', 'Calculators', 'Regions', 'NativeNotification', function ($localStorage, Calculators, Regions, NativeNotification) {
    const ACCOUNTS_KEY = "accounts";
    const LP_INCREMENTAL_MINUTES = 6;
    return {
        set: function (accounts) {
            $localStorage.set(ACCOUNTS_KEY, accounts)
        },
        get: function () {
            var self = this;
            var now = this.refreshAllDataWithTiming();
            var data_with_extra = this.getRaw().map(function (account) {
                account.max_lp = Calculators.getMaxLpByLevel(account.level);
                return account;
            });
            data_with_extra.map(function (account) {
                account.max_exp = Calculators.getMaxExpByLevel(account.level);
                return account;
            });
            data_with_extra.map(function (account) {
                var one_lp_time_remaining = self.calculateOneLpTimeRemaining(account, now);
                if (one_lp_time_remaining === -1) {
                    account.one_lp_time_remaining_literal = "Full";
                }
                else
                {
                    account.one_lp_time_remaining_literal = moment.duration(one_lp_time_remaining).format("mm:ss");
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
                new_account.alerts_lp = false;
                new_account.alerts_lp_value = 0;
                new_account.alerts_bonus = false;
                var current_accounts = this.getRaw();
                current_accounts.push(new_account);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        deleteAccount: function (account) {
            if (account !== undefined) {
                this.cancelAllNativeNotification(account);
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);
                current_accounts.splice(index, 1);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        cancelAllNativeNotification: function (account) {
            var self = this;
            const ALL_TYPES_OF_NATIVE_NOTIFICATIONS = ["lp", "bonus"];
            var all_ids = ALL_TYPES_OF_NATIVE_NOTIFICATIONS.map(function (type) {
                return self.getNativeNotificationId(account, type);
            });
            all_ids.forEach(function (id) {
                NativeNotification.isPresent(id, function (present) {
                    console.log(id, present);
                    if (present) {
                        NativeNotification.cancel(id);
                    }
                });
            });
        },
        updateAccount: function (account, key, newData) {
            if (account !== undefined && key !== undefined && newData !== undefined) {
                const ALERTS_KEYS = ["alerts_lp", "alerts_lp_value", "alerts_bonus"];
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);
                current_accounts[index][key] = newData;
                if (ALERTS_KEYS.indexOf(key) !== -1) {
                    this.syncNativeNotificationState(current_accounts[index]);
                }
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        syncNativeNotificationState: function (account) {
            var lp_notification_id = this.getNativeNotificationId(account, "lp");
            NativeNotification.isPresent(lp_notification_id, function (present) {
                if (account.alerts_lp) {

                }
                else
                {
                    if (present) {
                        NativeNotification.cancel(lp_notification_id);
                    }
                }
            });

            var bonus_notification_id = this.getNativeNotificationId(account, "bonus");
            if (account.alerts_bonus) {
                var now = Date.now();
                var timezone = Regions.getTimeZoneById(account.region);
                var now_tz = moment(now).tz(timezone);
                var start_of_next_day_tz = now_tz.add(1, "days").tz(timezone);
                start_of_next_day_tz.millisecond(0);
                start_of_next_day_tz.second(0);
                start_of_next_day_tz.minute(0);
                start_of_next_day_tz.hour(0);
                NativeNotification.schedule({
                    id: bonus_notification_id,
                    text: "Daily bonus for " + account.alias + " is available!",
                    firstAt: start_of_next_day_tz.valueOf(),
                    every: "day"
                });
            }
            else
            {
                NativeNotification.cancel(bonus_notification_id);
            }
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
        },
        calculateOneLpTimeRemaining: function (account, now) {
            if (account.lp === account.max_lp) {
                return -1;
            }
            var last_lp_update = account.last_lp_update;
            var ms_passed = now - last_lp_update;
            ms_passed = ms_passed % (moment.duration(LP_INCREMENTAL_MINUTES, "minutes").asMilliseconds());
            return moment.duration(LP_INCREMENTAL_MINUTES, "minutes").asMilliseconds() - ms_passed;
        },
        getNativeNotificationId: function (account, type) {
            return account.alias + ":" + type;
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