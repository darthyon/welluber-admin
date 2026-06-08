"use client"

import { useMemo, useState } from "react"
import { Buildings, CaretRight, MagnifyingGlass } from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ServiceProvider } from "@/types/provider"

interface ServiceProviderSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (serviceProvider: ServiceProvider) => void
  providers: ServiceProvider[]
}

export function ServiceProviderSelectionModal({
  isOpen,
  onClose,
  onSelect,
  providers,
}: ServiceProviderSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) =>
        [provider.name, provider.id, provider.registrationNo].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ),
    [providers, searchQuery]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-heading font-semibold">
            Select Service Provider
          </DialogTitle>
          <DialogDescription className="text-body text-subtle">
            Choose the service provider that should own this voucher package.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <DataFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search providers by name, ID, or registration number..."
          />
        </div>

        <div className="max-h-[360px] space-y-1 overflow-y-auto px-2 pb-4">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => onSelect(provider)}
                className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition-all hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-full border border-border/60 bg-background shadow-sm">
                    {provider.logo ? (
                      <AvatarImage
                        src={provider.logo}
                        className="object-contain p-1"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-body font-semibold text-primary">
                      {provider.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-0.5">
                    <p className="text-body font-semibold text-foreground transition-colors group-hover:text-primary">
                      {provider.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 text-label text-muted-foreground">
                      <span>{provider.id}</span>
                      <span>•</span>
                      <span>{provider.vouchers.length} Voucher Packages</span>
                    </div>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:opacity-100">
                  <CaretRight size={16} weight="bold" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-40">
                <MagnifyingGlass size={24} weight="light" />
              </div>
              <p className="text-body font-medium text-subtle">
                No Service Providers Found
              </p>
              <p className="mt-1 text-label text-faint">
                Try a different search term.
              </p>
            </div>
          )}
        </div>

        {providers.length === 0 ? (
          <div className="mx-6 mb-6 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Buildings size={18} weight="fill" />
              </div>
              <div className="space-y-1">
                <p className="text-body font-semibold text-foreground">
                  No Service Providers Available
                </p>
                <p className="text-label text-muted-foreground">
                  Add a service provider first before creating a voucher
                  package.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
