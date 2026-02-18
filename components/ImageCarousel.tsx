import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselImage {
    src: string;
    alt: string;
}

interface ImageCarouselProps {
    images: CarouselImage[];
    title?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = useCallback(() => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);

    const goToNext = useCallback(() => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    useEffect(() => {
        const slideInterval = setInterval(goToNext, 5000); // Auto-advance every 5 seconds
        return () => clearInterval(slideInterval);
    }, [goToNext]);


    if (!images || images.length === 0) {
        return null;
    }

    return (
        <section className="py-8">
            {title && <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>}
            <div className="h-[250px] md:h-[400px] w-full relative group">
                {/* Carousel Image */}
                <div
                    style={{ backgroundImage: `url(${images[currentIndex].src})` }}
                    className="w-full h-full rounded-lg bg-center bg-cover duration-500"
                ></div>
                <div className="absolute inset-0 bg-black/20 rounded-lg"></div>


                {/* Left Arrow */}
                <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
                    <ChevronLeft onClick={goToPrevious} size={30} />
                </div>
                {/* Right Arrow */}
                <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
                    <ChevronRight onClick={goToNext} size={30} />
                </div>

                {/* Dots */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex justify-center py-2 space-x-2">
                    {images.map((_, slideIndex) => (
                        <div
                            key={slideIndex}
                            onClick={() => goToSlide(slideIndex)}
                            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                                currentIndex === slideIndex ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                        ></div>
                    ))}
                </div>
            </div>
        </section>
    );
};