# Flow Forge

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.1-646CFF?logo=vite&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-7.15.1-339AF0?logo=mantine&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5.62.3-FF4154?logo=reactquery&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.1-010101?logo=socket.io&logoColor=white)

A modern, feature-rich task management application that helps teams organize work efficiently. Flow Forge provides an intuitive drag-and-drop interface for managing tasks across customizable boards, columns, and workflows, enhanced with AI-powered assistance.

## 🚀 Features

- **Rich Kanban Board Experience**: Create, customize, and manage boards with drag-and-drop functionality
- **Task Management**: Create, edit, and organize tasks with detailed information and real-time updates
- **Subtask Support**: Break down complex tasks into manageable subtasks for better tracking
- **Rich Text Editor**: Format task descriptions with bold, italic, links, and other formatting options
- **User Authentication**: Secure login/signup with support for both permanent and temporary user sessions
- **Persistent Temporary Sessions**: Temporary users can resume their work across browser sessions using secure localStorage persistence
- **AI Chat Assistant**: Get real-time help and guidance with the integrated chat assistant
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices
- **Dark Mode Support**: Built-in dark theme for comfortable viewing in all environments
- **Smart UX**: Contextual confirmation dialogs that only appear when changes are actually made

## 🛠️ Technology Stack

### Frontend

- **React 18**: For building the component-based UI
- **TypeScript**: For type-safe code and better developer experience
- **Vite**: For fast development and optimized production builds
- **React Router**: For client-side routing with protected routes
- **@hello-pangea/dnd**: For drag-and-drop functionality
- **Mantine UI**: For modern, accessible UI components
- **TanStack React Query**: For efficient server state management
- **@mantine/tiptap**: For rich text editing capabilities
- **DOMPurify**: For secure HTML sanitization
- **Socket.IO**: For real-time chat communications
- **Zod**: For runtime validation

### Development Tools

- **ESLint & Prettier**: For consistent code style and quality
- **Husky & lint-staged**: For pre-commit hooks and automated code quality checks
- **Commitlint**: For conventional commit message enforcement
- **TypeScript**: For static type checking

## 🏗️ Architecture

Flow Forge follows a feature-based architecture with clean separation of concerns:

```
src/
├── assets/       # Static assets like images and icons
├── components/   # Reusable UI components
├── data/         # Mock data and constants
├── features/     # Feature modules (auth, boards, columns, tasks, subtasks)
├── layouts/      # Layout components
├── models/       # TypeScript interfaces and type definitions
├── pages/        # Page components
├── router/       # Routing configuration
├── shared/       # Shared utilities and hooks
├── styles/       # Global styles and CSS modules
├── themes/       # Theme configuration
└── utils/        # Utility functions
```

## 🔧 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flow-forge.git
cd flow-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally

## 🌟 Best Practices Implemented

- **Modern React Patterns**: Custom hooks, context API, and functional components
- **Optimized Performance**: Proper state management and memoization
- **Type Safety**: Comprehensive TypeScript types throughout the codebase
- **Consistent Data Fetching**: React Query with proper cache invalidation strategies instead of manual cache updates
- **Clean Code**: Component composition, separation of concerns, and code reusability
- **Security**: Consistent HTML sanitization for user-generated content using DOMPurify
- **Responsive Design**: Mobile-first approach with responsive components
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Real-time Communication**: WebSocket integration for instant messaging

## 📝 Development Approach

This project demonstrates:

- **Attention to Detail**: Smart UX decisions like showing confirmation dialogs only when actual changes are made
- **Security Focus**: Proper sanitization of user input with DOMPurify applied consistently
- **Performance Optimization**: Efficient state management and API caching with optimized invalidation patterns
- **Clean Architecture**: Feature-based organization with clear separation of concerns
- **Persistence Strategy**: Secure and seamless user session management using JWT tokens and localStorage
- **Real-time Capabilities**: Socket-based communications for instant assistance

## 📚 Learning Outcomes

Building Flow Forge has strengthened my skills in:

- Modern React development patterns
- TypeScript best practices
- State management with React Query
- Component design and reusability
- Frontend security practices
- Responsive UI development
- Git workflow and conventional commits

## 📄 License

MIT

---

© 2025 Flow Forge - Crafted with ❤️ by Alkin Maystorov
