import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="card max-w-lg w-full text-center space-y-5 p-8 border-rose-200 dark:border-rose-900/60 shadow-xl bg-white dark:bg-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Something Went Wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                An unexpected interface rendering error occurred while loading this view.
              </p>
              {this.state.error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-left font-mono text-[11px] text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 overflow-x-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
              </button>
              <a
                href="/dashboard"
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" /> Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
