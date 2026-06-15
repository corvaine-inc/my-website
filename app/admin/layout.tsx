import { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export const metadata: Metadata = {
  title: {
    default: "Admin Panel",
    template: "%s | Admin",
  },
  description: "Administration dashboard for managing the platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:p-8 p-4">{children}</main>
    </div>
  )
}
