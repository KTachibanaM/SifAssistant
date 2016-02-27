# SIF Assistant

## Local

```
npm install -g cordova ionic
bower install
ionic serve
```

## Android

```
ionic platform add android
ionic run android
```


## iOS

```
ionic platform add ios
ionic run ios
```

## Resources (icon, splash screen)
```
ionic resources
```

## Translations
```
npm install -g gulp
npm install
gulp pot # get template.pot under ./po
# Edit template.pot along witht **.po and save **.po
gulp translations
```