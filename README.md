# SIF Assistant

## Initialize
```
npm install -g cordova ionic
bower install
```

## Browser

### Run

```
ionic serve
```

### Edit translations
```
npm install -g gulp
npm install
gulp pot # get template.pot under ./po
# In software such as PoEdit, edit per-language **.po files along with template.pot, and save **.po files
gulp translations
```

## Mobile

### Initialize
```
ionic state reset
```

### Generate resources (icon, splash screen)
```
ionic resources
```

### Run on Android

```
ionic run android
```

### Run on iOS

```
ionic run ios
```

### Build for Android
```
ionic build android
```

### Build for iOS
```
ionic build ios
```