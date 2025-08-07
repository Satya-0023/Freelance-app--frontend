# Freelance App — Frontend

This is the frontend of the Freelance Marketplace web application built using **React**, **TypeScript**, **Vite**, and **TailwindCSS**.

## 🚀 Features

- 🌐 Modern React + Vite setup with TypeScript
- 🎨 TailwindCSS for rapid UI development
- 📂 Component-based architecture
- 🌍 Routing using React Router
- 📦 API integration with backend (Express.js)
- 🔒 User authentication and authorization
- 💼 Gig creation and listing
- 🧾 Order and payment management (via Stripe)

## 📁 Project Structure

```
client/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── services/          # API calls (e.g., Axios)
│   ├── context/           # Auth and global context providers
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component
│   └── main.tsx           # App entry point
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/freelance-app-frontend.git
cd freelance-app-frontend

# Install dependencies
npm install
```

## 🧪 Run Locally

```bash
npm run dev
```

## 🔗 Connect to Backend

Make sure the backend server is running at the expected API base URL. Update your `.env` file (or Axios base URL) accordingly:

```
VITE_API_URL=http://localhost:8000/api
```

## 🛠️ Build for Production

```bash
npm run build
```

## 🧹 Clean and Reinstall (optional)

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## 📝 License

This project is licensed under the MIT License.
