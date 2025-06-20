# Task Manager Pro

A modern, feature-rich task management application built with React, TypeScript, Redux Toolkit, and Tailwind CSS. This application provides a comprehensive solution for organizing tasks with advanced filtering, sorting, and bulk operations.

![Task Manager Pro](https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### Core Functionality
- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Task Completion**: Toggle task completion status with visual feedback
- **Priority Management**: Set and modify task priorities (Low, Medium, High)
- **Due Date Tracking**: Set due dates with overdue and due-today indicators
- **Task Duplication**: Quickly duplicate existing tasks

### Advanced Features
- **Smart Filtering**: Filter tasks by status (All, Active, Completed)
- **Real-time Search**: Search tasks by title and description
- **Multiple Sorting**: Sort by creation date, title, priority, or due date
- **Bulk Operations**: Select multiple tasks for batch actions
- **Statistics Dashboard**: Comprehensive task analytics and completion rates
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### User Experience
- **Keyboard Shortcuts**: Quick task creation with Ctrl+N
- **Visual Feedback**: Smooth animations and micro-interactions
- **Error Handling**: Comprehensive form validation and error messages
- **Loading States**: Visual indicators for async operations
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run test` | Run the test suite |
| `npm run test:ui` | Run tests with interactive UI |
| `npm run test:coverage` | Generate test coverage report |

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── __tests__/       # Component test files
│   ├── TaskForm.tsx     # Task creation/editing form
│   ├── TaskItem.tsx     # Individual task display
│   ├── TaskList.tsx     # Task list with bulk operations
│   ├── TaskFilters.tsx  # Search and filter controls
│   └── TaskStats.tsx    # Statistics dashboard
├── store/               # Redux store configuration
│   ├── index.ts         # Store setup
│   └── taskSlice.ts     # Task state management
├── types/               # TypeScript type definitions
│   └── task.ts          # Task-related types
├── test/                # Test utilities and setup
│   ├── setup.ts         # Test environment configuration
│   └── test-utils.tsx   # Custom testing utilities
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## 🧪 Testing

The application includes comprehensive test coverage with:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: Keyboard navigation and screen reader support
- **Edge Case Testing**: Error handling and boundary conditions

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage Areas

- ✅ Component rendering and props
- ✅ User interactions and event handling
- ✅ Form validation and submission
- ✅ State management and Redux actions
- ✅ Search and filtering functionality
- ✅ Bulk operations and selection
- ✅ Statistics calculations
- ✅ Accessibility and keyboard navigation
- ✅ Error handling and edge cases

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and highlights
- **Success**: Green for completed tasks and positive actions
- **Warning**: Yellow/Orange for medium priority and due dates
- **Error**: Red for high priority and overdue tasks
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: 120% line height, bold weights
- **Body Text**: 150% line height, regular weight
- **Small Text**: 140% line height for better readability

### Spacing System
- **Base Unit**: 8px grid system
- **Consistent Margins**: Multiples of 8px (8, 16, 24, 32, 48, 64)
- **Component Padding**: Standardized internal spacing

## 🔧 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with full IntelliSense
- **Redux Toolkit**: Efficient state management with RTK
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

### Development Tools
- **ESLint**: Code quality and consistency
- **Vitest**: Fast unit testing framework
- **Testing Library**: Component testing utilities
- **PostCSS**: CSS processing and optimization

### Build & Deployment
- **Vite Build**: Optimized production builds
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Lazy loading for better performance
- **Asset Optimization**: Image and CSS optimization

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: 320px - 768px (Stack layout, touch-friendly)
- **Tablet**: 768px - 1024px (Adaptive grid, mixed interaction)
- **Desktop**: 1024px+ (Full feature layout, keyboard shortcuts)

### Mobile Optimizations
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for task actions
- Optimized form layouts for mobile keyboards
- Reduced animation complexity for better performance

## ♿ Accessibility Features

- **Keyboard Navigation**: Full application control via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Create new task
- `Escape`: Close modals and forms
- `Tab/Shift+Tab`: Navigate between elements
- `Enter/Space`: Activate buttons and checkboxes

## 🚀 Performance Optimizations

- **React.memo**: Prevent unnecessary re-renders
- **Lazy Loading**: Code splitting for route-based chunks
- **Debounced Search**: Optimized search input handling
- **Virtual Scrolling**: Efficient rendering for large task lists
- **Image Optimization**: WebP format with fallbacks

## 🔮 Future Enhancements

### Planned Features
- [ ] Drag and drop task reordering
- [ ] Task categories and tags
- [ ] Recurring task templates
- [ ] Team collaboration features
- [ ] Data export/import functionality
- [ ] Dark mode theme
- [ ] Offline support with PWA
- [ ] Push notifications for due dates

### Technical Improvements
- [ ] Backend API integration
- [ ] Real-time synchronization
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing pipeline

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper tests
4. **Run the test suite**: `npm run test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features and bug fixes
- Update documentation for API changes
- Ensure accessibility compliance
- Test across different browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Redux Team** for predictable state management
- **Tailwind CSS** for the utility-first approach
- **Vite Team** for the lightning-fast build tool
- **Testing Library** for excellent testing utilities
- **Pexels** for providing high-quality stock images

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide your environment details (OS, browser, Node version)

---

**Built with ❤️ using React, TypeScript, and modern web technologies**