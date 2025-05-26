"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { DataSettings } from "@/components/settings/data-settings"
import { TradingSettings } from "@/components/settings/trading-settings"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
        <TabsTrigger value="trading">Trading</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-6 pt-6">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="accounts" className="space-y-6 pt-6">
        <AccountSettings />
      </TabsContent>
      <TabsContent value="trading" className="space-y-6 pt-6">
        <TradingSettings />
      </TabsContent>
      <TabsContent value="appearance" className="space-y-6 pt-6">
        <AppearanceSettings />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-6 pt-6">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="data" className="space-y-6 pt-6">
        <DataSettings />
      </TabsContent>
    </Tabs>
  )
}
