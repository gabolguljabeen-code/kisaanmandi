import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('KisanMandi Unhandled Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBF6EA] dark:bg-[#1B1A17] p-6 text-[#3B2F24] dark:text-[#F3E6C4]">
          <div className="max-w-md w-full bg-white dark:bg-[#26241F] rounded-2xl p-6 shadow-xl border border-[#F3E6C4] dark:border-[#3B2F24] text-center space-y-4">
            <h2 className="text-xl font-black text-[#1F4D2B] dark:text-[#5C8A3C]">
              KisanMandi / کسان منڈی
            </h2>
            <p className="text-sm opacity-80">
              The application encountered a display issue. Please reload to restore mandi rates.
            </p>
            <p className="text-xs text-red-600 font-mono bg-red-50 dark:bg-red-950/40 p-2 rounded-lg break-words">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1F4D2B] text-white font-bold hover:bg-[#1F4D2B]/90 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
