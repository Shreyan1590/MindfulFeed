# Flutter Libraries & Dependencies

This document provides a summary of the libraries and dependencies used in the Flutter project now located in `f:\Codex\MindfulfeedFigmamake\flutter_app`.

## Core UI & Theming
- **cupertino_icons**: Standard iOS-style icons.
- **google_fonts**: Modern typography (Inter, Roboto, etc.).
- **animate_do**: Entrance animations (Fade, Zoom, etc.).
- **shimmer**: Loading placeholder effects.

## State Management & Logic
- **provider**: Lightweight and robust state management.
- **intl**: Internationalization and date/number formatting.
- **shared_preferences**: Local disk storage for settings.

## Data & Networking
- **http**: Handle REST API calls to Cloudflare Workers.
- **cached_network_image**: Optimized image loading and caching.

## Media & Interaction
- **video_player**: High-performance video streaming.
- **confetti**: Celebratory visual effects for gamification.
- **fl_chart**: Dynamic attention score and analytics charts.

## System & Files
- **path_provider**: Access to device filesystem paths.
- **image_picker**: Interface for selecting images from gallery/camera.

---

## Build Commands
To build the app from the new location, navigate to the folder and run:
```powershell
cd f:\Codex\MindfulfeedFigmamake\flutter_app
flutter pub get
flutter build apk --release
```
