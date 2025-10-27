"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react"
import Link from "next/link"

interface CarouselItem {
  id: string
  title: string
  poster: string
  rating?: number
  year?: number
  description?: string
  subjectId?: string
  detailPath?: string
  backdrop?: string
}

interface TrendingCarouselProps {
  items: CarouselItem[]
  title: string
}

export function TrendingCarousel({ items, title }: TrendingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  if (!items || items.length === 0) return null

  return (
    <div className="relative group">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex-[0_0_300px] min-w-0">
                <Link href={`/movies/${item.detailPath}`}>
                  <div className="relative group/card cursor-pointer rounded-lg overflow-hidden bg-slate-800 transition-transform hover:scale-105">
                    <div className="relative aspect-[2/3]">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <span className="text-slate-400">No Image</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {item.year && (
                              <span className="text-slate-300 text-sm">{item.year}</span>
                            )}
                            {item.rating && (
                              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{item.rating}</span>
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-slate-300 text-sm line-clamp-2 mb-3">{item.description}</p>
                          )}
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Play className="w-4 h-4 mr-1" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {canScrollPrev && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollPrev}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {canScrollNext && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  )
}
