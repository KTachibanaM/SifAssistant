String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

String.prototype.contains = function(it) {
    return this.indexOf(it) != -1;
};

String.prototype.containsIgnoreCase = function(it) {
    return this.toUpperCase().contains(it.toUpperCase());
};

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

.factory('NativeNotification', function (isBrowser) {
    return {
        schedule: function (id, text, time, every) {
            id = this.processId(id);
            var options = {
                id: id,
                title: "SIF Assistant",
                text: text
            };
            if (time) {
                options.at = time;
            }
            if (every) {
                options.every = every;
            }
            if (isBrowser) {
                console.log("Schedule native notification");
                console.log(options)
            }
            else
            {
                cordova.plugins.notification.local.schedule(options);
            }
        },
        cancel: function (id) {
            id = this.processId(id);
            if (isBrowser) {
                console.log("Cancel native notification");
                console.log(id)
            }
            else
            {
                cordova.plugins.notification.local.cancel(id);
            }
        },
        cancelByRawHashedId: function (id) {
            if (isBrowser) {
                console.log("Cancel native notification");
                console.log(id)
            }
            else
            {
                cordova.plugins.notification.local.cancel(id);
            }
        },
        isPresent: function (id, callback) {
            id = this.processId(id);
            if (isBrowser) {
                console.log("isPresent is unimplemented, always return true");
                callback(true);
            }
            else
            {
                cordova.plugins.notification.local.isPresent(id, callback);
            }
        },
        getAll: function (callback) {
            if (isBrowser) {
                console.log("getAll is unimplemented, always return empty array");
                callback([]);
            }
            else
            {
                cordova.plugins.notification.local.getAll(function (notifications) {
                    callback(notifications);
                });
            }
        },
        processId: function (id) {
            //if (isBrowser) return id;
            //if (ionic.Platform.isIOS()) return id;
            return id.hashCode();
        }
    }
})

.factory('Calculators', function (Regions) {
    const BELOW_LEVEL_33_TO_EXP_MAPPING = {
        1: 11,
        2: 13,
        3: 16,
        4: 20,
        5: 26,
        6: 32,
        7: 39,
        8: 48,
        9: 57,
        10: 67,
        11: 79,
        12: 91,
        13: 105,
        14: 120,
        15: 135,
        16: 152,
        17: 170,
        18: 189,
        19: 208,
        20: 229,
        21: 251,
        22: 274,
        23: 298,
        24: 323,
        25: 349,
        26: 376,
        27: 405,
        28: 434,
        29: 464,
        30: 495,
        31: 528,
        32: 561,
        33: 596
    };
    return {
        getMaxLpByLevel: function (account) {
            var level = account.level;
            return 25 + Math.floor(Math.min(level, 300) / 2) + Math.floor(Math.max((level - 300), 0) / 3);
        },
        getMaxExpByLevel: function(account) {
            var level = account.level;
            var base_exp = level <= 33 ? BELOW_LEVEL_33_TO_EXP_MAPPING[level] : Math.round(34.45 * level - 551);
            if (Regions.getById(account.region).half_exp_before_100) {
                return level < 100 ? Math.round(base_exp / 2) : base_exp;
            }
            else
            {
                return base_exp;
            }
        },
        updateAccountSongsPlayed: function (account, songs) {
            console.log(songs);
            while (songs.length !== 0) {
                var song = songs.shift();
                var exp = song.expAddition;
                var lp = song.lpSubtraction;
                var not_leveling_up = true;
                while (exp > 0) {
                    var exp_left_for_this_level = this.getMaxExpByLevel(account) - account.exp;
                    var exp_remainder = exp - exp_left_for_this_level;
                    if (exp_remainder < 0) {
                        account.exp = account.exp + exp;
                        if (not_leveling_up) {
                            account.lp = account.lp - lp;
                        }
                    }
                    else
                    {
                        account.level = account.level + 1;
                        account.exp = 0;
                        account.lp = this.getMaxLpByLevel(account);
                        not_leveling_up = false;
                    }
                    exp = exp_remainder;
                }
            }
            return account;
        }
    }
})

.factory('Accounts', ['$localStorage', 'Calculators', 'Regions', 'NativeNotification', function ($localStorage, Calculators, Regions, NativeNotification) {
    const ACCOUNTS_KEY = "accounts";
    const LP_INCREMENTAL_MINUTES = 6;
    const LP_INCREMENTAL_MS = moment.duration(LP_INCREMENTAL_MINUTES, "minutes").asMilliseconds();
    return {
        set: function (accounts) {
            $localStorage.set(ACCOUNTS_KEY, accounts)
        },
        get: function () {
            return this.getRaw().map(function (account) {
                account.max_exp = Calculators.getMaxExpByLevel(account);
                account.max_lp = Calculators.getMaxLpByLevel(account);
                return account;
            });
        },
        getFrequentRefreshData: function () {
            var self = this;
            var now = Date.now();
            return this.getRaw().map(function (account) {
                var one_lp_time_remaining = self.calculateOneLpTimeRemaining(account, now);
                if (one_lp_time_remaining === -1) {
                    account.one_lp_time_remaining = "Full";
                }
                else
                {
                    account.one_lp_time_remaining = moment.duration(one_lp_time_remaining).format("mm:ss");
                }
                return account;
            });
        },
        getRaw: function () {
            return $localStorage.getArray(ACCOUNTS_KEY);
        },
        getAccountIndex: function (account) {
            var current_aliases = this.getRaw().map(function (item) {
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
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);
                current_accounts[index][key] = newData;
                this.syncNativeNotificationState(current_accounts[index], key);
                this.set(current_accounts);
                return true;
            }
            return false;
        },
        syncNativeNotificationState: function (account, key) {
            if (key === "alerts_lp" || key === "alerts_lp_value" || key === "lp") {
                const lp_notification_id = this.getNativeNotificationId(account, "lp");
                if (account.alerts_lp) {
                    if (account.lp < account.alerts_lp_value) {
                        var self = this;
                        NativeNotification.isPresent(lp_notification_id, function (present) {
                            if (present) {
                                NativeNotification.cancel(lp_notification_id);
                            }
                            var now = Date.now();
                            var ms_one_lp_time_remaining = self.calculateOneLpTimeRemaining(account, now);
                            var current_lp = account.lp;
                            var target_lp = account.alerts_lp_value;
                            var ms_rest_lp_time_remaining = moment.duration(LP_INCREMENTAL_MINUTES * (target_lp - current_lp - 1), "minutes").asMilliseconds();
                            var ms_total_lp_time = ms_one_lp_time_remaining + ms_rest_lp_time_remaining;
                            NativeNotification.schedule(
                                lp_notification_id,
                                account.alias + ": LP has reached " + account.alerts_lp_value,
                                now + ms_total_lp_time
                            )
                        })
                    }
                }
                else
                {
                    NativeNotification.isPresent(lp_notification_id, function (present) {
                        if (present) {
                            NativeNotification.cancel(lp_notification_id);
                        }
                    })
                }
            }

            if (key === "alerts_bonus") {
                const bonus_notification_id = this.getNativeNotificationId(account, "bonus");
                if (account.alerts_bonus) {
                    var now = Date.now();
                    var timezone = Regions.getById(account.region).timezone;
                    var now_tz = moment(now).tz(timezone);
                    var start_of_next_day_tz = now_tz.add(1, "days").tz(timezone);
                    start_of_next_day_tz.millisecond(0);
                    start_of_next_day_tz.second(0);
                    start_of_next_day_tz.minute(0);
                    start_of_next_day_tz.hour(0);
                    NativeNotification.schedule(
                        bonus_notification_id,
                        account.alias + ": Daily bonus is available!",
                        start_of_next_day_tz.valueOf(),
                        "day"
                    );
                }
                else
                {
                    NativeNotification.isPresent(bonus_notification_id, function (present) {
                        if (present) {
                            NativeNotification.cancel(bonus_notification_id);
                        }
                    })
                }
            }
        },
        refreshInfrequentData: function () {
            var now = Date.now();
            this.incrementAllLp(now);
            this.checkAllBonus(now);
        },
        incrementAllLp: function (now) {
            var current_accounts = this.getRaw().map(function (account) {
                var current_lp = account.lp;
                var max_lp = Calculators.getMaxLpByLevel(account);
                if (current_lp === max_lp) {
                    account.last_lp_update = now;
                    return account;
                }
                var last_lp_update = account.last_lp_update;
                var ms_passed = now - last_lp_update;
                var minutes_passed = Math.floor(moment.duration(ms_passed).asMinutes());
                var lp_incremented = Math.floor(minutes_passed / LP_INCREMENTAL_MINUTES);
                if (lp_incremented > 0) {
                    if (current_lp + lp_incremented > max_lp) {
                        lp_incremented = max_lp - current_lp;
                    }
                    account.lp = current_lp + lp_incremented;
                    account.last_lp_update = last_lp_update + lp_incremented * LP_INCREMENTAL_MS;
                }
                return account;
            });
            this.set(current_accounts);
        },
        checkAllBonus: function (now) {
            var current_accounts = this.getRaw().map(function (account) {
                var timezone = Regions.getById(account.region).timezone;
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
            var current_lp = account.lp;
            var max_lp = Calculators.getMaxLpByLevel(account);
            if (current_lp === max_lp) {
                return -1;
            }
            var ms_passed = (now - account.last_lp_update) % LP_INCREMENTAL_MS;
            return LP_INCREMENTAL_MS - ms_passed;
        },
        getNativeNotificationId: function (account, type) {
            return account.alias + ":" + type;
        }
    }
}])

.factory('Regions', ['gettextCatalog', function (gettextCatalog) {
    return {
        getRaw: function () {
            return [
                {
                    id: "jp",
                    name: gettextCatalog.getString("Japan"),
                    timezone: "Asia/Tokyo",
                    half_exp_before_100: true
                },
                {
                    id: "cn",
                    name: gettextCatalog.getString("China"),
                    timezone: "Asia/Shanghai",
                    half_exp_before_100: false
                },
                {
                    id: "us",
                    name: gettextCatalog.getString("United States"),
                    timezone: "Etc/UTC",
                    half_exp_before_100: false
                },
                {
                    id: "kr",
                    name: gettextCatalog.getString("Korea"),
                    timezone: "Asia/Seoul",
                    half_exp_before_100: false
                },
                {
                    id: "tw",
                    name: gettextCatalog.getString("Taiwan"),
                    timezone: "Asia/Taipei",
                    half_exp_before_100: true
                }
            ];
        },
        get: function () {
            return this.getRaw().map(function (region) {
                region.local_time = moment().tz(region.timezone).format("YYYY/MM/DD HH:mm:ss");
                return region;
            })
        },
        getIndexById: function (id) {
            var ids = this.get().map(function (region) {
                return region.id;
            });
            return ids.indexOf(id);
        },
        getById: function (id) {
            return this.get()[this.getIndexById(id)];
        }
    }
}])

.factory('SongTypes', ['gettextCatalog', 'EventTypes', function (gettextCatalog, EventTypes) {
    const BASE_SONG_TYPES = [
        {
            id: "easy",
            name: gettextCatalog.getString("Easy"),
            expAddition: 12,
            lpSubtraction: 5
        },
        {
            id: "medium",
            name: gettextCatalog.getString("Medium"),
            expAddition: 26,
            lpSubtraction: 10
        },
        {
            id: "hard",
            name: gettextCatalog.getString("Hard"),
            expAddition: 46,
            lpSubtraction: 15
        },
        {
            id: "expert",
            name: gettextCatalog.getString("Expert"),
            expAddition: 83,
            lpSubtraction: 25
        }
    ];
    return {
        get: function () {
            var song_types = BASE_SONG_TYPES;
            BASE_SONG_TYPES.forEach(function (base_song_type) {
                EventTypes.get().forEach(function (event_type) {
                    event_type.songMultipliers.forEach(function (song_multiplier) {
                        song_types.push({
                            id: base_song_type.id + "inEvent" + event_type.id + "withMultiplier" + song_multiplier,
                            name: base_song_type.name + " (" + event_type.name + ")" + " x" + song_multiplier,
                            expAddition: base_song_type.expAddition * song_multiplier,
                            lpSubtraction: base_song_type.lpSubtraction * event_type.lpMultiplier * song_multiplier
                        })
                    })
                });
            });
            return song_types;
        }
    }
}])

.factory("EventTypes", function (gettextCatalog) {
    return {
        get: function () {
            return [
                /**
                {
                    id: "tokenCollection",
                    name: gettextCatalog.getString("Token collection"),
                    songMultipliers: [1],
                    lpMultiplier: 0
                },
                {
                    id: "scoreMatch",
                    name: gettextCatalog.getString("Score Match"),
                    songMultipliers: [1],
                    lpMultiplier: 1
                },
                **/
                {
                    id: "medleyFestival",
                    name: gettextCatalog.getString("Medley Festival"),
                    songMultipliers: [1, 2, 3],
                    lpMultiplier: 0.8
                }
            ]
        }
    }
})

.factory("Platform", function () {
    const LOCALE_CONVERSION_MAP = [
        {
            if_contains: ["zh", "CN"],
            maps_to: "zh_CN"
        }
    ];
    return {
        getLocale: function () {
            var raw_locale_string = (navigator.language || navigator.userLanguage).toUpperCase();
            if (!raw_locale_string) {
                return undefined;
            }
            var locale_matches = function (if_contains, locale) {
                return if_contains.reduce(function (prev, cur) {
                    if (typeof prev === "string") {
                        prev = locale.containsIgnoreCase(prev);
                    }
                    return prev && locale.containsIgnoreCase(cur);
                })
            };
            var matched_locale = undefined;
            LOCALE_CONVERSION_MAP.forEach(function (item) {
                if (locale_matches(item.if_contains, raw_locale_string)) {
                    matched_locale = item.maps_to;
                }
            });
            return matched_locale;
        }
    }
});