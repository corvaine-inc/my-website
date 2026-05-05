export interface NavItem {
  title: string
  href: string
  description?: string
  disabled?: boolean
  external?: boolean
  icon?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// Public site navigation
export const publicNavigation: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
]

// Distributor portal navigation
export const portalNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/portal",
  },
  {
    title: "Orders",
    href: "/portal/orders",
  },
  {
    title: "Products",
    href: "/portal/products",
  },
  {
    title: "Account",
    href: "/portal/account",
  },
]

// Admin panel navigation
export const adminNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: "LayoutDashboard",
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: "BarChart3",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: "Users",
      },
      {
        title: "Distributors",
        href: "/admin/distributors",
        icon: "Building2",
      },
      {
        title: "Products",
        href: "/admin/products",
        icon: "Package",
      },
      {
        title: "Orders",
        href: "/admin/orders",
        icon: "ShoppingCart",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: "Settings",
      },
    ],
  },
]
