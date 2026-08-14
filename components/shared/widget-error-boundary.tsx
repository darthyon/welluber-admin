"use client"

import React, { Component, type ReactNode } from "react"
import { WarningCircle, ArrowsCounterClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface WidgetErrorBoundaryProps {
  children: ReactNode
  title?: string
  fallbackMessage?: string
}

interface WidgetErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("WidgetErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <WarningCircle size={20} weight="fill" />
          </div>
          <h4 className="mt-3 text-body font-semibold text-foreground">
            {this.props.title ?? "Unable to load widget"}
          </h4>
          <p className="mt-1 max-w-xs text-label text-muted-foreground">
            {this.props.fallbackMessage ??
              "An unexpected error occurred while rendering this visualization."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="mt-4 gap-1.5 rounded-4xl text-xs"
          >
            <ArrowsCounterClockwise size={14} />
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
