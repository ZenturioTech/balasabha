import React, { useState, useEffect } from 'react';

const posterData = [
  { id: 1, src: '/images/bsp (1).jpeg', alt: 'Dream Vibes poster with illustrations of children' },
  { id: 2, src: 'images/bsp (2).jpeg', alt: 'Dream Vibes poster with claymation children' },
  { id: 3, src: '/images/bsp (3).jpeg', alt: 'Dream Vibes poster with children reading outdoors' },
  { id: 4, src: '/images/bsp (4).jpeg', alt: 'Dream Vibes poster with illustrations of children' },
  { id: 5, src: '/images/bsp (2).jpeg', alt: 'Dream Vibes poster with claymation children' },
  { id: 6, src: '/images/bsp (3).jpeg', alt: 'Dream Vibes poster with children reading outdoors' },
  { id: 7, src: '/images/WhatsApp Image 2025-09-25 at 15.56.16.jpeg', alt: 'Dream Vibes poster with children reading outdoors' },
];

const Posters: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postersPerPage, setPostersPerPage] = useState(3);

  useEffect(() => {
    const getPostersPerPage = () => {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 768) return 2;
      return 3;
    };

    const handleResize = () => {
      setPostersPerPage(getPostersPerPage());
      setCurrentIndex(0); // Reset index on resize to avoid issues
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = posterData.length > postersPerPage ? posterData.length - postersPerPage : 0;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? maxIndex : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };
  
  const posterItemWidth = 100 / postersPerPage;

  return (
    <section className="py-8 px-6 ">
      <div className="bg-teal-100/70 rounded-[2.5rem] p-4 sm:p-6 relative max-w-5xl mx-auto flex items-center gap-2 sm:gap-4 ">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="flex-shrink-0 transition-opacity"
          aria-label="Previous posters"
        >
          <svg width="24" height="42" viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 hover:text-teal-500 transition-colors h-8 w-auto sm:h-10">
            <path d="M24 0L0 21L24 42V0Z" fill="currentColor"/>
          </svg>
        </button>

        <div className="overflow-hidden w-full">
          <div
            className="flex -mx-2 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * posterItemWidth}%)` }}
          >
            {posterData.map((poster) => (
              <div 
                key={poster.id} 
                className="flex-shrink-0 px-2"
                style={{ flexBasis: `${posterItemWidth}%` }}
              >
                <img src={poster.src} alt={poster.alt} className="w-full rounded-lg shadow-lg aspect-[3/4] object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="flex-shrink-0 transition-opacity"
          aria-label="Next posters"
        >
           <svg width="24" height="42" viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 hover:text-teal-500 transition-colors h-8 w-auto sm:h-10">
            <path d="M0 42L24 21L0 0V42Z" fill="currentColor"/>
           </svg>
        </button>
      </div>
    </section>
  );
};

export default Posters;