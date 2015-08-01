# SIF Assistant

## Local Dev (in a browser)

```
npm install -g cordova ionic
bower install
ionic serve
```

## Mobile Dev (in Android/iOS, replace "android" with "ios")

```
ionic platform add android
cordova plugin add https://github.com/katzer/cordova-plugin-local-notifications.git
ionic run android
```