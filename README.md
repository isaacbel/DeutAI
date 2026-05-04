<div align="center">
  <h1>🇩🇪 DeutAI</h1>
  <p><strong>Advanced AI-Powered German Language Learning Platform</strong></p>
</div>

<br />

DeutAI is an intelligent, modern application designed to help users master the German language. By leveraging advanced Large Language Models (LLMs), DeutAI analyzes student inputs, provides highly detailed error corrections, bilingual explanations, and generates personalized exercises to target specific weaknesses.

## ✨ Key Features

* **🧠 Advanced Text Analysis**: Real-time detection of grammar, syntax, vocabulary, and spelling errors using state-of-the-art AI (OpenAI, Anthropic, Gemini, Groq).
* **🌍 Bilingual Explanations**: Understand complex German grammar rules with clear explanations provided in both German and Arabic.
* **📊 Performance Dashboard**: A comprehensive statistics page (`/stats`) built with Recharts, categorizing errors based on the Kleppin methodology to track progress over time.
* **🎯 Targeted Exercises**: Automatically generated practice questions derived directly from the user's specific mistakes.
* **📱 Premium UI/UX**: A beautifully crafted, fully responsive dark-mode interface featuring glassmorphism, subtle gradients, and smooth animations (Framer Motion).
* **🔲 QR Code Management**: Built-in QR code scanner for quick quiz access, alongside a protected Admin Dashboard for generating and downloading offline QR codes.

## 🛠️ Tech Stack

### Frontend
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router) & React 19
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Data Visualization**: [Recharts](https://recharts.org/)
* **QR Codes**: `jsqr` & `qrcode`

### Backend
* **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database**: [PostgreSQL](https://www.postgresql.org/) (via `pg`)
* **AI Integration**: Official SDKs for OpenAI, Google GenAI, Anthropic, and Groq.
* **Security**: `bcrypt`, `jsonwebtoken`

## 🚀 Getting Started

### Prerequisites
* Node.js (v20 or higher)
* PostgreSQL database

### 1. Backend Setup
```bash
cd deutai-backend
npm install

# Copy the example environment variables and configure them
cp .env.example .env

# Start the development server
npm run dev
```

### 2. Frontend Setup
```bash
cd deutai-frontend
npm install

# Configure environment variables (Base URL, Admin Password, etc.)
# Create a .env.local file

# Start the frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📂 Project Structure

* `/deutai-frontend`: Next.js frontend application containing all UI components, pages (`/analyze`, `/stats`, `/questions`), and state management.
* `/deutai-backend`: Node.js/Express backend API responsible for database interactions, user authentication, and AI provider routing.

## 📝 License

This project is licensed under the MIT License.
