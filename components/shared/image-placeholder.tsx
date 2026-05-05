import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

interface ImagePlaceholderProps {
  alt: string
  aspectRatio?: "square" | "video" | "portrait" | "wide"
  className?: string
  showIcon?: boolean
  label?: string
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[2/1]",
}

export function ImagePlaceholder({
  alt,
  aspectRatio = "square",
  className,
  showIcon = true,
  label,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center bg-muted rounded-lg overflow-hidden",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        {showIcon && <ImageIcon className="h-8 w-8" aria-hidden="true" />}
        {label && (
          <span className="text-xs font-medium text-center px-2">{label}</span>
        )}
      </div>
      {/* Screen reader text for accessibility */}
      <span className="sr-only">{alt}</span>
    </div>
  )
}

interface ProductImagePlaceholderProps {
  productName: string
  className?: string
}

export function ProductImagePlaceholder({
  productName,
  className,
}: ProductImagePlaceholderProps) {
  return (
    <ImagePlaceholder
      alt={`Image of ${productName}`}
      aspectRatio="square"
      className={className}
      showIcon={true}
    />
  )
}

interface HeroImagePlaceholderProps {
  className?: string
}

export function HeroImagePlaceholder({ className }: HeroImagePlaceholderProps) {
  return (
    <ImagePlaceholder
      alt="Hero banner image"
      aspectRatio="wide"
      className={cn("w-full min-h-[300px] md:min-h-[400px]", className)}
      showIcon={true}
      label="Hero Image"
    />
  )
}
