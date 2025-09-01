# ComicScoutUK - Comic Collection Manager

A modern, responsive web application for managing comic book collections, tracking market values, and staying updated with the latest comic news. Built with React, TypeScript, and Tailwind CSS with a unique vintage comic book aesthetic.

## 🚀 Features

- **Collection Management**: Track and organize your comic collection
- **Price Alerts**: Set custom alerts for price changes
- **Market Tracking**: Real-time market values and trends
- **News Hub**: Latest comic industry news and updates
- **User Accounts**: Personalized profiles and preferences
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Comic Book Themed UI**: Unique vintage comic aesthetic

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

## 🛠️ Installation & Setup

### 1. Clone from GitHub (if you've pushed to a repo)

```bash
git clone https://github.com/YOUR_USERNAME/ComicScoutUK.git
cd ComicScoutUK
```

### 2. Local Setup (using the files created)

Navigate to the project directory:
```bash
cd "C:\Users\cammy\Desktop\My Database\ComicScoutUK_Refactored"
```

### 3. Install Dependencies

```bash
npm install
```

or if you prefer yarn:

```bash
yarn install
```

### 4. Start Development Server

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

The application will open automatically in your browser at `http://localhost:3000`

## 🧪 Testing the Application

### Pages to Test:

1. **Home Page** (`/`)
   - Hero section with call-to-action buttons
   - Statistics dashboard
   - Trending comics carousel
   - Latest news section

2. **Collection Page** (`/collection`)
   - Grid/List view toggle
   - Search and filter functionality
   - Sort options
   - Pagination

3. **Alerts Page** (`/alerts`)
   - Alert management table
   - Active/Inactive toggle
   - Bulk actions

4. **Account Page** (`/account`)
   - Profile settings
   - Subscription management
   - Notification preferences
   - Security settings

5. **News Page** (`/news`)
   - News article grid
   - Category filters
   - Search functionality
   - Newsletter signup

6. **Comic Detail Page** (`/comic/:id`)
   - Comic information display
   - Price by condition
   - Add to wishlist/alerts
   - Market values

7. **Auth Page** (`/auth`)
   - Sign in/Sign up toggle
   - Form validation
   - Password visibility toggle

### Features to Test:

- **Navigation**: Click through all menu items
- **Responsive Design**: Resize browser window to test mobile view
- **Hover Effects**: Mouse over buttons and cards for comic-style animations
- **Form Interactions**: Try submitting forms with valid/invalid data
- **Search & Filters**: Test search bars and filter panels
- **Pagination**: Navigate through pages
- **User Dropdown**: Click user avatar for dropdown menu

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 📁 Project Structure

```
ComicScoutUK_Refactored/
├── src/
│   ├── components/
│   │   ├── features/     # Feature-specific components
│   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   └── ui/            # Reusable UI components
│   ├── pages/             # Page components
│   ├── lib/               # Type definitions
│   ├── utils/             # Constants and utilities
│   ├── styles/            # Global styles
│   ├── App.tsx            # Main app component with routing
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🎨 Design System

### Colors
- **Parchment**: `#FDF6E3` (Background)
- **Ink Black**: `#1C1C1C` (Text/Borders)
- **Stan Lee Blue**: `#003049` (Headers)
- **Kirby Red**: `#D62828` (Buttons/CTAs)
- **Golden Age Yellow**: `#F7B538` (Highlights)

### Typography
- **Headings**: Super Squad / Impact
- **Body Text**: Persona Aura / System UI

### Components
- Comic-style borders (3px solid with offset shadows)
- Hover animations (subtle 2px movement)
- Responsive grid layouts
- Custom form inputs with validation

## 🚢 Deploying to GitHub Pages

1. Add to `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/ComicScoutUK"
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add deploy scripts to `package.json`:
```json
"scripts": {
  ...
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. Deploy:
```bash
npm run deploy
```

## 🐛 Troubleshooting

### Common Issues:

1. **Fonts not loading**: Ensure you have an internet connection for Google Fonts
2. **Port already in use**: Change the port in `vite.config.ts`
3. **Module not found**: Delete `node_modules` and run `npm install` again
4. **Build errors**: Check TypeScript errors with `npm run lint`

## 📝 License

This project is created for ComicScoutUK. All rights reserved.

## 🤝 Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 💬 Support

For support, email support@comicscout.uk or open an issue in the GitHub repository.

---

**Created with ❤️ and comic book passion**

POW! 💥 BAM! 💥 WHAM! 💥
