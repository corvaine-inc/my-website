"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play, Pause, Volume2, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, likely due to browser restrictions
        setIsPlaying(false)
      })
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero-poster.jpg"
      >
        <source src={siteConfig.images.heroVideo} type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Gradient Overlay for depth - stronger bottom fade for contrast with next section */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Content - padding-top accounts for header height, z-index lower than header */}
      <div className="relative z-0 container flex flex-col items-center text-center px-4 pt-24">
        {/* BLAZEHAZE Logo - Light version for dark background */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Image
            src={siteConfig.images.blazehazeLogoLight}
            alt="BLAZEHAZE"
            width={400}
            height={160}
            className="w-72 md:w-96 lg:w-[28rem] h-auto drop-shadow-2xl"
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-wide max-w-4xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Premium Hardwood Charcoal for the Ultimate Grilling Experience
        </h1>

        {/* Subheadline */}
        <p className="mt-8 text-base md:text-lg lg:text-xl text-white/70 font-sans font-light max-w-2xl text-pretty leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          Long-lasting burn. Intense heat. Pure, smoky flavor. 
          Crafted for professionals who demand excellence.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" asChild>
            <Link href="/products">
              Catalog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white px-8 backdrop-blur-sm"
            asChild
          >
            <Link href="/portal">Distributor Portal</Link>
          </Button>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        <button
          onClick={togglePlay}
          className={cn(
            "p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/80",
            "hover:bg-white/20 hover:text-white transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary"
          )}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleMute}
          className={cn(
            "p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/80",
            "hover:bg-white/20 hover:text-white transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary"
          )}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-white/60 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
