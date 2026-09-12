import { Component } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaced to the console so a blank page always has a diagnosable
    // trail instead of failing silently.
    console.error('Console crashed while rendering:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Auto-recover when navigating away from the page that crashed.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-danger-bg text-danger">
            <AlertTriangle size={22} />
          </span>
          <p className="font-bold text-brand-900 dark:text-white">This page hit a snag</p>
          <p className="max-w-sm text-sm text-brand-900/55 dark:text-white/50">
            {this.state.error?.message || 'Something went wrong while rendering this page.'}
          </p>
          <Button size="sm" icon={RefreshCcw} onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
