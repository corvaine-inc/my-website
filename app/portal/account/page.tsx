import { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Account Settings",
}

export default function PortalAccountPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                      <Input id="firstName" placeholder="John" />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                      <Input id="lastName" placeholder="Doe" />
                    </Field>
                  </FieldGroup>
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input id="email" type="email" placeholder="john@company.com" />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </Field>
                </FieldGroup>

                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and billing address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                    <Input id="companyName" placeholder="Your Company LLC" />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="taxId">Tax ID / EIN</FieldLabel>
                    <Input id="taxId" placeholder="XX-XXXXXXX" />
                  </Field>
                </FieldGroup>

                <Separator />

                <h3 className="font-semibold">Billing Address</h3>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="address">Street Address</FieldLabel>
                    <Input id="address" placeholder="123 Business Street" />
                  </Field>
                </FieldGroup>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="city">City</FieldLabel>
                      <Input id="city" placeholder="City" />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="state">State</FieldLabel>
                      <Input id="state" placeholder="State" />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="zip">ZIP Code</FieldLabel>
                      <Input id="zip" placeholder="12345" />
                    </Field>
                  </FieldGroup>
                </div>

                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
