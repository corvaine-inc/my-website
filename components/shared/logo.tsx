import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"

interface LogoProps {
  className?: string
  href?: string
  variant?: "corvaine" | "blazehaze"
  size?: "sm" | "md" | "lg" | "xl"
  /** Use light version for dark backgrounds */
  colorScheme?: "dark" | "light"
}

const sizeClasses = {
  sm: { width: 100, height: 40 },
  md: { width: 140, height: 56 },
  lg: { width: 180, height: 72 },
  xl: { width: 240, height: 96 },
}

export function Logo({
  className,
  href = "/",
  variant = "corvaine",
  size = "md",
  colorScheme = "dark",
}: LogoProps) {
  const dimensions = sizeClasses[size]
  
  // Select the appropriate logo based on variant and color scheme
  let logoSrc: string
  if (variant === "corvaine") {
    logoSrc = colorScheme === "light" 
      ? siteConfig.images.corvaineLogoLight 
      : siteConfig.images.corvaineLogo
  } else {
    logoSrc = colorScheme === "light" 
      ? siteConfig.images.blazehazeLogoLight 
      : siteConfig.images.blazehazeLogo
  }
  
  const altText = variant === "corvaine" ? "CORVAINE" : "BLAZEHAZE"

  const content = (
    <Image
      src={logoSrc}
      alt={altText}
      width={dimensions.width}
      height={dimensions.height}
      className={cn("object-contain", className)}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
