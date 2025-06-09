import type { EmblaCarouselType } from 'embla-carousel';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';

type Slide = {
  title?: string;
  image: string;
};

type ImageCarouselProps = {
  slides: Slide[];
};

const ImageCarousel = ({ slides }: ImageCarouselProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const autoplayOptions = {
    delay: 3000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      skipSnaps: false,
      watchDrag: true,
    },
    [AutoPlay(autoplayOptions)],
  );

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onInit);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi, onInit, onSelect]);

  const togglePlay = useCallback(() => {
    if (emblaApi) {
      const autoplay = emblaApi.plugins().autoplay;
      if (autoplay) {
        setIsPlaying(!isPlaying);
        if (isPlaying) {
          autoplay.stop();
        } else {
          autoplay.play();
        }
      }
    }
  }, [emblaApi, isPlaying]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        scrollNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext, togglePlay]);

  return (
    <div
      className="relative rounded-lg shadow-lg overflow-hidden bg-gray-100"
      role="region"
      aria-roledescription="carousel"
      aria-label="Галерея изображений"
    >
      <div className="overflow-hidden" ref={emblaRef} tabIndex={0} aria-live="polite" aria-atomic="true">
        <div className="flex touch-pan-y" role="presentation">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0"
              aria-label={`Слайд ${index + 1} из ${slides.length}`}
              aria-hidden={index !== selectedIndex}
              aria-roledescription="slide"
              role="group"
            >
              <div className="relative pt-[45%]">
                <img
                  src={slide.image}
                  alt="Купить металлический стеллаж в Минске"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent pt-12 pb-8 px-6">
                  {slide.title && <h3 className="text-white text-lg md:text-xl font-medium">{slide.title}</h3>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={scrollPrev}
          className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transform transition-all pointer-events-auto hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Предыдущий слайд"
          aria-controls="embla-carousel"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={scrollNext}
          className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transform transition-all pointer-events-auto hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Следующий слайд"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
        role="tablist"
        aria-label="Навигация по слайдам"
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Перейти к слайду ${index + 1}`}
            role="tab"
            aria-selected={index === selectedIndex}
            aria-controls={`slide-${index}`}
            tabIndex={index === selectedIndex ? 0 : -1}
          />
        ))}
      </div>

      <button
        onClick={togglePlay}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transform transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isPlaying ? 'Остановить слайдшоу' : 'Запустить слайдшоу'}
        title={isPlaying ? 'Остановить слайдшоу' : 'Запустить слайдшоу'}
        aria-pressed={!isPlaying}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default ImageCarousel;
