import { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Settings",
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="siteName">Site Name</FieldLabel>
                      <Input id="siteName" placeholder="YourBrand" />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="siteDescription">Site Description</FieldLabel>
                      <Textarea
                        id="siteDescription"
                        placeholder="Brief description of your platform"
                        rows={3}
                      />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="supportEmail">Support Email</FieldLabel>
                      <Input
                        id="supportEmail"
                        type="email"
                        placeholder="support@yourbrand.com"
                      />
                    </Field>
                  </FieldGroup>

                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>
                  Configure business-related settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="currency">Default Currency</FieldLabel>
                      <Input id="currency" placeholder="USD" />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                      <Input id="timezone" placeholder="America/New_York" />
                    </Field>
                  </FieldGroup>

                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure which notifications are sent via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Orders</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new orders are placed
                  </p>
                </div>
                <Switch id="newOrders" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Distributors</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new distributors register
                  </p>
                </div>
                <Switch id="newDistributors" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Inventory Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when product inventory is low
                  </p>
                </div>
                <Switch id="lowInventory" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary reports
                  </p>
                </div>
                <Switch id="weeklyReports" />
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Admin Password</CardTitle>
                <CardDescription>
                  Update your administrator password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                      <Input id="currentPassword" type="password" />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                      <Input id="newPassword" type="password" />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                      <Input id="confirmPassword" type="password" />
                    </Field>
                  </FieldGroup>

                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch id="twoFactor" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch id="sessionTimeout" defaultChecked />
                </div>

                <Button>Save Security Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
