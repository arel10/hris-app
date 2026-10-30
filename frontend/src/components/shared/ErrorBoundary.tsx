import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Terjadi Kesalahan</h2>
              <p className="mt-2 text-sm text-gray-500">
                {this.state.error?.message ?? 'Silakan refresh halaman'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Refresh Halaman
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

