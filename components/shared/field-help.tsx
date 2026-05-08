"use client"

import { Question } from "@phosphor-icons/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { POLICY_GLOSSARY, type PolicyGlossaryKey } from "@/lib/policy-glossary"

interface FieldHelpProps {
  termKey: PolicyGlossaryKey
}

export function FieldHelp({ termKey }: FieldHelpProps) {
  const term = POLICY_GLOSSARY[termKey]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-faint transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`Help: ${term.title}`}
          >
            <Question size={12} weight="bold" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 space-y-1">
          <p className="text-label font-semibold text-foreground">{term.title}</p>
          <p className="text-label text-muted-foreground">{term.body}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
