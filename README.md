# SIF Assistant

## Local Dev (in a browser)

```
npm install -g cordova ionic
npm install
bower install
ionic serve
```

## Mobile Dev (Run "Local Dev" above, in Android/iOS, replace "android" with "ios")

```
ionic platform add android
cordova plugin add https://github.com/whiteoctober/cordova-plugin-app-version.git
cordova plugin add https://github.com/katzer/cordova-plugin-local-notifications.git
ionic run android
```