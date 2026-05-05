import { Metadata } from "next"
import { PortalSidebar } from "@/components/portal/portal-sidebar"

export const metadata: Metadata = {
  title: {
    default: "Distributor Portal",
    template: "%s | Distributor Portal",
  },
  description: "Manage your distributor account, orders, and products",
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <PortalSidebar />
      <main className="flex-1 lg:p-8 p-4">{children}</main>
    </div>
  )
}
