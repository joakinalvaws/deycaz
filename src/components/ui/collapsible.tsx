"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn(className)} {...props} />
}

function CollapsibleTrigger({ className, children, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn("group flex w-full cursor-pointer items-center justify-between gap-4 text-left", className)}
      {...props}
    >
      {children}
      <ChevronDown className="text-muted-2 size-4 shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-180" />
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsiblePanel({ className, ...props }: CollapsiblePrimitive.Panel.Props) {
  return <CollapsiblePrimitive.Panel data-slot="collapsible-panel" className={cn("overflow-hidden", className)} {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel }
