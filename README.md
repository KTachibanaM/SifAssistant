# SIF Assistant

## Local

```
npm install -g cordova ionic
bower install
ionic serve
```

## Translations
```
npm install -g gulp
npm install
gulp pot # get template.pot under ./po
# In software such as PoEdit, edit per-language **.po files along with template.pot, and save **.po files
gulp translations
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
