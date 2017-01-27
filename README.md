# SIF Assistant

A new app based on Ionic 2 is being developed [here](https://gitlab.com/KTachibanaM/sif-assistant).

The new app will be cut over to this repo once it's finished.

Maintenance to this repo will be paused until then.

## Initialize
```
npm install
```

## Browser

### Run

```
ionic serve
```

### Edit translations
```
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