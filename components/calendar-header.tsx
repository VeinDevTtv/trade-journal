"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"

export function CalendarHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trade Calendar</h1>
        <p className="text-muted-foreground">View your trading activity by date</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Select defaultValue="may">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jan">January 2023</SelectItem>
              <SelectItem value="feb">February 2023</SelectItem>
              <SelectItem value="mar">March 2023</SelectItem>
              <SelectItem value="apr">April 2023</SelectItem>
              <SelectItem value="may">May 2023</SelectItem>
              <SelectItem value="jun">June 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>
    </div>
  )
}
