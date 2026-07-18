import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './ui/data-state'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page render failed', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState message="This page hit an unexpected display problem. Please try opening it again." />
    }

    return this.props.children
  }
}
