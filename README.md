# CookMate AI - React Native Recipe App

CookMate AI is a feature-rich recipe management application built with React Native, Expo, and GluestackUI. The app helps users discover recipes, manage grocery lists, scan receipts, and track their cooking preferences.

## Features

- **Beautiful UI with GluestackUI**: Modern, responsive UI components enhanced with LinearGradient effects
- **Recipe Discovery**: Browse recipes by category, search, and explore trending options
- **Grocery List Management**: Maintain grocery lists with easy addition and removal of items
- **Receipt Scanning**: Scan grocery receipts to automatically add items to your grocery list
- **User Profiles**: Set dietary preferences, allergies, and favorite cuisines
- **Dark Mode Support**: Toggle between light and dark modes for comfortable viewing

## Technology Stack

- React Native
- Expo
- GluestackUI (UI component library)
- Linear Gradient effects
- Tailwind CSS (via NativeWind)
- React Navigation

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- Yarn or npm
- Expo CLI
- Android Studio or Xcode (for emulation)

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/react-native-recipes-app.git
cd react-native-recipes-app
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Run on a simulator or device:
```
npm run android
# or
npm run ios
```

## Project Structure

```
react-native-recipes-app/
├── assets/                 # Images, fonts, and other static files
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # GluestackUI enhanced components
│   │   └── ...
│   ├── data/               # Mock data for recipes and categories
│   ├── navigations/        # React Navigation setup
│   └── screens/            # App screens
│       ├── Home/           # Home screen
│       ├── Profile/        # User profile screen
│       ├── GroceryList/    # Grocery list management
│       └── ...
├── App.js                  # Main entry point
└── tailwind.config.js      # Tailwind CSS configuration
```

## Planned Enhancements

- Recipe recommendations based on user preferences
- Voice commands for hands-free cooking
- Social sharing capabilities
- Nutrition tracking
- Meal planning calendar

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
