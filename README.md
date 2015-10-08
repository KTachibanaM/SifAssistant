# SIF Assistant

## Local Dev (in a browser)

```
npm install -g cordova gulp
npm install
cordova platform add browser
gulp build
cordova run browser
```

## Mobile Dev (Run "Local Dev" above, in Android/iOS, replace "android" with "ios")

```
cordova platform add android
cordova plugin add https://github.com/whiteoctober/cordova-plugin-app-version.git
cordova plugin add https://github.com/katzer/cordova-plugin-local-notifications.git
cordova run android
```