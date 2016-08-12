# SIF Assistant

## Init
```
npm install -g cordova ionic
bower install
```

## Run on browser

```
ionic serve
```

## Edit and save translations
```
npm install -g gulp
npm install
gulp pot # get template.pot under ./po
# In software such as PoEdit, edit per-language **.po files along with template.pot, and save **.po files
gulp translations
```

## Init for mobile
```
ionic state reset
```

## Run on Android

```
ionic run android
```

## Run on iOS

```
ionic run ios
```

## Build for mobile
```
ionic build
```

## Generate resources (icon, splash screen)
```
ionic resources
```
