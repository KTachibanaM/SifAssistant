# SIF Assistant

## Local

```
npm install -g cordova ionic
bower install
ionic serve
```

## Prepare for mobile
```
ionic state reset
```

## Android

```
ionic run android
```

## iOS

```
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
# Edit template.pot along with **.po and save **.po
gulp translations
```