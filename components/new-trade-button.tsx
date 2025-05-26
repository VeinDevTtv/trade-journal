"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TradeForm } from "@/components/trade-form"

interface NewTradeButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function NewTradeButton({ variant = "default", size = "default", className }: NewTradeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Trade
      </Button>
      <TradeForm open={open} onOpenChange={setOpen} />
    </>
  )
}
