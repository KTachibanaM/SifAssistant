/**
 * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
 *
 * This function was born in http://stackoverflow.com/a/6832721.
 *
 * @param {string} v1 The first version to be compared.
 * @param {string} v2 The second version to be compared.
 * @param {object} [options] Optional flags that affect comparison behavior:
 * <ul>
 *     <li>
 *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
 *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
 *         "1.2".
 *     </li>
 *     <li>
 *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
 *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
 *     </li>
 * </ul>
 * @returns {number|NaN}
 * <ul>
 *    <li>0 if the versions are equal</li>
 *    <li>a negative integer iff v1 < v2</li>
 *    <li>a positive integer iff v1 > v2</li>
 *    <li>NaN if either version string is in the wrong format</li>
 * </ul>
 *
 * @copyright by Jon Papaioannou (["john", "papaioannou"].join(".") + "@gmail.com")
 * @license This function is in the public domain. Do what you want with it, no strings attached.
 */
function version_compare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

String.prototype.containsIgnoreCase = function (it) {
    return this.toUpperCase().contains(it.toUpperCase());
};

angular.module('sif-assistant.services', [])

    .factory('$localStorage', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, theDefault) {
                return JSON.parse($window.localStorage[key] || JSON.stringify(theDefault) || '{}');
            },
            getArray: function (key, theDefault) {
                return JSON.parse($window.localStorage[key] || JSON.stringify(theDefault) || '[]');
            }
        }
    })

    .factory('NativeNotification', function ($ionicPlatform) {
        return {
            schedule: function (id, text, at, every) {
                var processed_id = this.processId(id);
                var options = {
                    id: processed_id,
                    title: "Idol Manager",
                    text: text
                };
                if (at) {
                    options.at = at;
                }
                if (every) {
                    options.every = every;
                }
                if (!window.cordova) {
                    console.log("scheduling native notification in browser, options: ", options);
                }
                else {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.schedule(options);
                    });
                }
                return processed_id
            },
            cancel: function (id) {
                id = this.processId(id);
                if (!window.cordova) {
                    console.log("canceling native notification in browser, id: ", id);
                }
                else {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.cancel(id);
                    });
                }
            },
            cancelByRawHashedId: function (id) {
                if (!window.cordova) {
                    console.log("canceling native notification in browser, raw id: ", id);
                }
                else {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.cancel(id);
                    });
                }
            },
            isPresent: function (id, callback) {
                id = this.processId(id);
                if (!window.cordova) {
                    console.log("isPresent is unimplemented in browser, always return false");
                    callback(false);
                }
                else {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.isPresent(id, callback);
                    });
                }
            },
            getAll: function (callback) {
                if (!window.cordova) {
                    console.log("getAll is unimplemented in browser, always return empty array");
                    callback([]);
                }
                else {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            callback(notifications);
                        });
                    });
                }
            },
            processId: function (id) {
                return id.hashCode();
            }
        }
    })

    .factory('NativeSchedule', function (NativeNotification, $ionicPlatform) {
        return {
            schedule: function (id, text, at, every, callback) {
                var processed_id = this.processId(id);
                var raw_hashed_id = NativeNotification.schedule(processed_id, text, at, every);
                if (!window.cordova) {
                    console.log('not scheduling callback in browser, callback immediately');
                    callback()
                } else {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.on("trigger", function (notification) {
                            if (notification.id == raw_hashed_id) {
                                callback()
                            }
                        });
                    });
                }
            },
            cancel: function (id) {
                var processed_id = this.processId(id);
                NativeNotification.cancel(processed_id);
            },
            isPresent: function (id, callback) {
                var processed_id = this.processId(id);
                NativeNotification.isPresent(processed_id, callback)
            },
            processId: function (id) {
                return "_NativeNotification_" + id
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
            getMaxExpByLevel: function (account) {
                var level = account.level;
                var base_exp = level <= 33 ? BELOW_LEVEL_33_TO_EXP_MAPPING[level] : Math.round(34.45 * level - 551);
                if (Regions.getById(account.region).half_exp_before_100) {
                    return level < 100 ? Math.round(base_exp / 2) : base_exp;
                }
                else {
                    return base_exp;
                }
            },
            updateAccountSongsPlayed: function (account, songs) {
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
                        } else {
                            account.level = account.level + 1;
                            account.exp = 0;
                            if (account.region === 'jp') {
                                account.lp = (account.lp - lp) + this.getMaxLpByLevel(account);
                            } else {
                                account.lp = this.getMaxLpByLevel(account);
                            }
                            not_leveling_up = false;
                        }
                        exp = exp_remainder;
                    }
                }
                return account;
            }
        }
    })

    .factory('Accounts', function ($localStorage, Calculators, Regions, NativeNotification, gettextCatalog) {
        const ACCOUNTS_KEY = "accounts";
        const LP_INCREMENTAL_MINUTES = 6;
        const LP_INCREMENTAL_MS = moment.duration(LP_INCREMENTAL_MINUTES, "minutes").asMilliseconds();
        return {
            /**
             * CRUD
             */
            set: function (accounts) {
                $localStorage.set(ACCOUNTS_KEY, accounts)
            },
            getAndUpdateTimedAttributes: function () {
                var self = this;
                this.getRaw().forEach(function (account) {
                    self.updateLp(account);
                    self.updateBonus(account);
                });
                return this.getRaw().map(function (account) {
                    account.time_remaining_till_next_lp = self.calculateTimeRemainingTillNextLp(account);
                    account.time_remaining_till_next_daily_bonus = self.calculateTimeRemainingTillNextDailyBonus(account);
                    return account;
                });
            },
            getComputedAttributes: function () {
                return this.getRaw().map(function (account) {
                    account.max_lp = Calculators.getMaxLpByLevel(account);
                    account.max_exp = Calculators.getMaxExpByLevel(account);
                    return account;
                })
            },
            getRaw: function () {
                return $localStorage.getArray(ACCOUNTS_KEY);
            },
            ifAccountExists: function (account) {
                return this.getAccountIndex(account) !== -1;
            },
            getAccountByAlias: function (alias) {
                var index = this.getAccountIndex({alias: alias});
                return this.getRaw()[index];
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
            updateAccount: function (account, key, newData) {
                if (account !== undefined && key !== undefined && newData !== undefined && newData !== null) {
                    var current_accounts = this.getRaw();
                    var index = this.getAccountIndex(account);
                    if (key === "lp") {
                        var original_lp = current_accounts[index].lp;
                        if (original_lp === Calculators.getMaxLpByLevel(account)) {
                            current_accounts[index].last_lp_update = Date.now();
                        }
                    }
                    current_accounts[index][key] = newData;
                    this.syncNativeNotificationState(current_accounts[index], key);
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

            /**
             * Native Notification
             */
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
                                NativeNotification.schedule(
                                    lp_notification_id,
                                    account.alias + gettextCatalog.getString(": LP has reached ") + account.alerts_lp_value,
                                    Date.now() + self.calculateTimeRemainingTillTargetLp(account).ms
                                )
                            })
                        }
                    }
                    else {
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
                        NativeNotification.schedule(
                            bonus_notification_id,
                            account.alias + gettextCatalog.getString(": Daily bonus is available!"),
                            this.calculateTimeOfNextDailyBonus(account),
                            "day"
                        );
                    }
                    else {
                        NativeNotification.isPresent(bonus_notification_id, function (present) {
                            if (present) {
                                NativeNotification.cancel(bonus_notification_id);
                            }
                        })
                    }
                }
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
            getNativeNotificationId: function (account, type) {
                return account.alias + ":" + type;
            },

            /**
             * Calculators
             */
            calculateAllTimeRemainingTillNextLp: function () {
                var self = this;
                return this.getRaw().map(function (account) {
                    return self.calculateTimeRemainingTillNextLp(account);
                });
            },
            calculateTimeRemainingTillNextLp: function (account) {
                var now = Date.now();
                var current_lp = account.lp;
                var max_lp = Calculators.getMaxLpByLevel(account);
                if (current_lp === max_lp) {
                    return {
                        ms: -1,
                        literal: gettextCatalog.getString("Full")
                    }
                }
                var ms_passed = (now - account.last_lp_update) % LP_INCREMENTAL_MS;
                var one_lp_time_remaining = LP_INCREMENTAL_MS - ms_passed;
                return {
                    ms: one_lp_time_remaining,
                    literal: moment.duration(one_lp_time_remaining).format("mm:ss")
                };
            },
            calculateTimeRemainingTillTargetLp: function (account) {
                var ms_one_lp_time_remaining = this.calculateTimeRemainingTillNextLp(account).ms;
                var current_lp = account.lp;
                var target_lp = account.alerts_lp_value;
                var ms_rest_lp_time_remaining = moment.duration(LP_INCREMENTAL_MINUTES * (target_lp - current_lp - 1), "minutes").asMilliseconds();
                var time_remaining_till_target_lp = ms_one_lp_time_remaining + ms_rest_lp_time_remaining;
                return {
                    ms: time_remaining_till_target_lp,
                    literal: moment.duration(time_remaining_till_target_lp).format("dd:hh:mm:ss")
                }
            },
            calculateTimeRemainingTillNextDailyBonus: function (account) {
                var time_of_next_day_bonus = this.calculateTimeOfNextDailyBonus(account);
                var time_remaining_till_next_day_bonus = time_of_next_day_bonus - Date.now();
                return {
                    ms: time_remaining_till_next_day_bonus
                }
            },
            calculateTimeOfNextDailyBonus: function (account) {
                var now = Date.now();
                var timezone = Regions.getById(account.region).timezone;
                var now_tz = moment(now).tz(timezone);
                var start_of_next_day_tz = now_tz.add(1, "days").tz(timezone);
                start_of_next_day_tz.millisecond(0);
                start_of_next_day_tz.second(0);
                start_of_next_day_tz.minute(0);
                start_of_next_day_tz.hour(0);
                return start_of_next_day_tz.valueOf();
            },

            /**
             * Update timed attributes
             */
            updateLp: function (account) {
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);

                var now = Date.now();
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

                current_accounts[index].lp = account.lp;
                current_accounts[index].last_lp_update = account.last_lp_update;
                this.set(current_accounts);
            },

            updateBonus: function (account) {
                var current_accounts = this.getRaw();
                var index = this.getAccountIndex(account);

                var now = Date.now();
                var timezone = Regions.getById(account.region).timezone;
                var last_bonus_update = account.last_bonus_update;
                var last_bonus_update_tz = moment(last_bonus_update).tz(timezone);
                var now_tz = moment(now).tz(timezone);
                if (!now_tz.isSame(last_bonus_update_tz, "day")) {
                    account.last_bonus_update = now;
                    account.has_claimed_bonus = false;
                }

                current_accounts[index].last_bonus_update = account.last_bonus_update;
                current_accounts[index].has_claimed_bonus = account.has_claimed_bonus;
                this.set(current_accounts);
            }
        }
    })

    .factory('Regions', function (gettextCatalog) {
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
    })

    .factory('Songs', function (gettextCatalog) {
        const DIFFICULTIES = {
            easy: {
                name: gettextCatalog.getString("Easy"),
                expAddition: 12,
                lpSubtraction: 5
            },
            medium: {
                name: gettextCatalog.getString("Medium"),
                expAddition: 26,
                lpSubtraction: 10
            },
            hard: {
                name: gettextCatalog.getString("Hard"),
                expAddition: 46,
                lpSubtraction: 15
            },
            expert: {
                name: gettextCatalog.getString("Expert"),
                expAddition: 83,
                lpSubtraction: 25
            },
            master: {
                name: gettextCatalog.getString("Master"),
                expAddition: 83,
                lpSubtraction: 25
            }
        };
        const CATEGORIES = {
            regular: {
                name: gettextCatalog.getString("Regular"),
                songMultipliers: [1],
                lpMultiplier: 1,
                expMultiplier: 1
            },
            tokenCollection: {
                name: gettextCatalog.getString("Token collection"),
                songMultipliers: [1],
                lpMultiplier: 0,
                expMultiplier: 1
            },
            scoreMatch: {
                name: gettextCatalog.getString("Score Match"),
                songMultipliers: [1],
                lpMultiplier: 1,
                expMultiplier: 1
            },
            medleyFestival: {
                name: gettextCatalog.getString("Medley Festival"),
                songMultipliers: [1, 2, 3],
                lpMultiplier: 0.8,
                expMultiplier: 1
            },
            challengeFestival: {
                name: gettextCatalog.getString("Challenge Festival"),
                songMultipliers: [1, 2, 3, 4, 5],
                lpMultiplier: 1,
                expMultiplier: 1
            }
        };
        return {
            get: function () {
                return {
                    difficulties: DIFFICULTIES,
                    categories: CATEGORIES
                }
            }
        }
    })

    .factory("Platform", function ($ionicPlatform) {
        const LOCALE_CONVERSION_MAP = [
            {
                if_contains: ["zh", "CN"],
                maps_to: "zh_CN"
            }
        ];
        return {
            getLocale: function () {
                var raw_locale_string = this.getBrowserLocale().toUpperCase();
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
            },
            getBrowserLocale: function () {
                return navigator.language || navigator.userLanguage;
            },
            getAppVersion: function (callback) {
                if (window.cordova) {
                    window.cordova.getAppVersion(function (version) {
                        callback(version)
                    });
                } else {
                    callback('0.0.0')
                }
            },
            getPlatform: function (callback) {
                if (window.cordova) {
                    $ionicPlatform.ready(function () {
                        callback(ionic.Platform.platform())
                    })
                } else {
                    callback('web')
                }
            },
            getPlatformVersion: function (callback) {
                if (window.cordova) {
                    $ionicPlatform.ready(function () {
                        callback(ionic.Platform.version())
                    })
                } else {
                    callback(0)
                }
            }
        }
    })

    .factory("Settings", function ($localStorage) {
        const SETTINGS_KEY = "settings";
        const DEFAULT_SETTINGS = {
            "show_debug": false,
            "debug_force_locale": undefined,
            "check_events": true
        };
        return {
            get: function () {
                return $localStorage.getObject(SETTINGS_KEY, DEFAULT_SETTINGS);
            },
            getItem: function (key) {
                var settings = this.get();
                if (settings.hasOwnProperty(key)) {
                    // do not use settings[key] here!
                    // http://stackoverflow.com/questions/20804163/check-if-a-key-exists-inside-a-json-object
                    return settings[key];
                } else {
                    return DEFAULT_SETTINGS[key];
                }
            },
            set: function (new_settings) {
                $localStorage.set(SETTINGS_KEY, new_settings);
            },
            setItem: function (key, value) {
                var settings = this.get();
                settings[key] = value;
                this.set(settings)
            }
        }
    })

    .factory("Events", function ($http, $q, Regions, $localStorage, gettextCatalog) {
        const EVENTS_CACHE_KEY = 'events_cache';

        return {
            getNetworkedRawByRegion: function (region_id) {
                if (region_id === 'jp') {
                    return $http.get('http://schoolido.lu/api/events/?ordering=-beginning&page_size=1');
                } else if (region_id === 'us') {
                    return $http.get('http://schoolido.lu/api/events/?ordering=-english_beginning&page_size=1');
                } else {
                    return $q.when({});
                }
            },
            getCached: function () {
                return $localStorage.getObject(EVENTS_CACHE_KEY, {})
            },
            getCachedByRegion: function (region_id) {
                return this.getCached()[region_id]
            },
            setCacheByRegion: function (region_id, events) {
                var cached_events = this.getCached();
                cached_events[region_id] = events;
                $localStorage.set(EVENTS_CACHE_KEY, cached_events);
            },
            ifEventExpired: function (event) {
                return Date.now() > event.end;
            },
            getByRegion: function (region_id) {
                var defer = $q.defer();

                var event_factory_this = this;
                if (!this.getCachedByRegion(region_id) || this.ifEventExpired(this.getCachedByRegion(region_id))) {
                    // if not cached OR cached but expired, retrieve from network, parse and cache
                    this.getNetworkedRawByRegion(region_id).then(function (data) {
                        var raw = data.data.results[0];

                        // Retrieve event info
                        var image;
                        var start;
                        var end;
                        if (region_id == 'jp') {
                            image = raw["image"];
                            start = raw["beginning"];
                            end = raw["end"];
                        } else {
                            image = raw["english_image"];
                            start = raw["english_beginning"];
                            end = raw["english_end"];
                        }

                        // Parse to UNIX time
                        start = moment(start).valueOf();
                        end = moment(end).valueOf();

                        // Concat to event
                        var event = {
                            region_name: Regions.getById(region_id).name,
                            image: image,
                            start: start,
                            end: end
                        };

                        // Cache event
                        event_factory_this.setCacheByRegion(region_id, event);

                        // Resolve event
                        defer.resolve(event);
                    }, function (error) {
                        if (event_factory_this.getCachedByRegion(region_id)) {
                            // use cached if fails but cached
                            defer.resolve(event_factory_this.getCachedByRegion(region_id))
                        } else {
                            defer.reject(error);
                        }
                    });
                } else {
                    // otherwise use cached
                    defer.resolve(this.getCachedByRegion(region_id))
                }

                return defer.promise;
            },
            getEventStatus: function (event) {
                var now = Date.now();
                var start = event.start;
                var end = event.end;
                var now_to_start = now - start;
                var end_to_now = end - now;

                if (now_to_start < 0) {
                    now_to_start = -now_to_start;
                    now_to_start = moment.duration(now_to_start);
                    return {
                        status: 'before',
                        left: {
                            days: now_to_start.days(),
                            hours: now_to_start.hours(),
                            minutes: now_to_start.minutes(),
                            seconds: now_to_start.seconds()
                        }
                    };
                } else if (end_to_now < 0) {
                    return {
                        status: 'after'
                    }
                } else {
                    now_to_start = moment.duration(now_to_start);
                    end_to_now = moment.duration(end_to_now);
                    return {
                        status: 'during',
                        past: {
                            days: now_to_start.days(),
                            hours: now_to_start.hours(),
                            minutes: now_to_start.minutes(),
                            seconds: now_to_start.seconds()
                        },
                        left: {
                            days: end_to_now.days(),
                            hours: end_to_now.hours(),
                            minutes: end_to_now.minutes(),
                            seconds: end_to_now.seconds()
                        }
                    };
                }
            },
            getEventStatusInStrings: function (event) {
                var result = this.getEventStatus(event);
                if (result.status === 'before') {
                    return {
                        status: 'before',
                        left: sprintf(gettextCatalog.getString('%s days, %s hours, %s minutes, %s seconds'),
                            result.left.days, result.left.hours, result.left.minutes, result.left.seconds)
                    };
                } else if (result.status === 'during') {
                    return {
                        status: 'during',
                        past: sprintf(gettextCatalog.getString('%s days, %s hours, %s minutes, %s seconds'),
                            result.past.days, result.past.hours, result.past.minutes, result.past.seconds),
                        left: sprintf(gettextCatalog.getString('%s days, %s hours, %s minutes, %s seconds'),
                            result.left.days, result.left.hours, result.left.minutes, result.left.seconds)
                    };
                } else {
                    return {
                        status: 'after'
                    }
                }
            }
        }
    })

    .factory('DailyEventsCheck', function (NativeNotification, NativeSchedule, gettextCatalog, Events) {
        return {
            schedule: function () {
                NativeSchedule.isPresent("_daily_event_check", function (present) {
                    if (!present) {
                        // if daily event check is not present, schedule one
                        NativeSchedule.schedule(
                            "_daily_event_check",
                            gettextCatalog.getString("Checking events"),
                            0,
                            "day",
                            function () {
                                // check jp
                                Events.getByRegion("jp").then(function (event) {
                                    if (!Events.ifEventExpired(event) && Events.getEventStatus(event).status === 'before') {
                                        // notify if before jp event
                                        NativeNotification.schedule(
                                            "_daily_event_check_jp_succeed",
                                            sprintf(
                                                gettextCatalog.getString('Japan event will start in: %s'), Events.getEventStatusInStrings(event).left
                                            )
                                        )
                                    }
                                }, function (error) {
                                    NativeNotification.schedule(
                                        "_daily_event_check_jp_fail",
                                        sprintf(gettextCatalog.getString('Failed to check Japan event, reason: %s'), error.message)
                                    )
                                });

                                // check us
                                Events.getByRegion("us").then(function (event) {
                                    if (!Events.ifEventExpired(event) && Events.getEventStatus(event).status === 'before') {
                                        // notify if before us event
                                        NativeNotification.schedule(
                                            "_daily_event_check_us_succeed",
                                            sprintf(
                                                gettextCatalog.getString('US event will start in: %s'), Events.getEventStatusInStrings(event).left
                                            )
                                        )
                                    }
                                }, function (error) {
                                    NativeNotification.schedule(
                                        "_daily_event_check_us_fail",
                                        sprintf(gettextCatalog.getString('Failed to check US event, reason: %s'), error.message)
                                    )
                                });
                            }
                        )
                    }
                })
            },
            disable: function () {
                NativeSchedule.isPresent("_daily_event_check", function (present) {
                    if (present) {
                        // if daily event check is present, cancel
                        NativeSchedule.cancel("_daily_event_check");
                    }
                })
            }
        }
    })

    .factory('AppUpdate', function (Platform, $http) {
        return {
            isUpdateAvailable: function (callback) {
                Platform.getPlatform(function (platform) {
                    if (platform === 'android' || platform === 'ios') {
                        // get latest release version from GitHub if on mobile
                        $http.get('https://api.github.com/repos/KTachibanaM/SifAssistant/releases').then(function (payload) {
                            // check for version diff
                            var releases = payload.data;
                            var latest_release_version = releases[0]['tag_name'];
                            Platform.getAppVersion(function (app_version) {
                                if (version_compare(app_version, latest_release_version) < 0) {
                                    callback(true)
                                } else {
                                    callback(false)
                                }
                            })
                        }, function (error) {
                            callback(false)
                        })
                    } else if (platform === 'web') {
                        // probably debugging on web, no need to check
                        callback(false)
                    } else {
                        callback(false)
                    }
                });
            },
            getUpdateLink: function (callback) {
                Platform.getPlatform(function (platform) {
                    if (platform === 'android') {
                        // get latest release from GitHub if on Android
                        $http.get('https://api.github.com/repos/KTachibanaM/SifAssistant/releases').then(function (payload) {
                            var releases = payload.data;
                            var android_assets = releases[0]['assets'].filter(function (asset) {
                                return asset['content_type'] === 'application/vnd.android.package-archive'
                            });
                            if (android_assets.length === 1) {
                                callback(android_assets[0]['browser_download_url'])
                            } else {
                                callback('https://github.com/KTachibanaM/SifAssistant/releases')
                            }
                        }, function (error) {
                            callback('https://github.com/KTachibanaM/SifAssistant/releases')
                        })
                    } else if (platform === 'ios') {
                        callback('https://itunes.apple.com/us/app/idol-manager/id1030763734')
                    } else if (platform === 'web') {
                        callback('https://github.com/KTachibanaM/SifAssistant')
                    } else {
                        callback('https://github.com/KTachibanaM/SifAssistant')
                    }
                })
            }
        }
    });