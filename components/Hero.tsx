import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="relative h-[70vh] sm:h-[85vh] w-full text-white overflow-hidden shadow-lg">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src="/images/hawaii-beach.webp" alt="Coastal landscape at sunset" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Header Bar */}
            <header className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-3xl">
                <div className="bg-white rounded-full shadow-lg px-4 sm:px-6 py-2 flex items-center justify-between">
                    <img src="/images/kerala final emblem_0.jpg" alt="Kerala Government Emblem" className="h-8 sm:h-10" />
                    <img src="/images/Layer 2 copy (1).png" alt="Dream Vibes Logo" className="h-10 sm:h-12" />
                    <img src="/images/kudumbasree.png" alt="Balasabha Logo" className="h-8 sm:h-10" />
                </div>
            </header>

            {/* Main Hero Content Container */}
            <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-12">
                
                {/* Flex container for alignment */}
                <div className="w-full h-full flex items-center justify-center lg:justify-start">

                    {/* Text Content with Glass Effect */}
                    {/* On mobile, it's centered with max-width. On desktop, it aligns right and is wider. */}
                    <div className="relative z-10 md:ml-60 bg-black/20 backdrop-blur-md rounded-3xl p-6 sm:p-10  shadow-xl max-w-lg lg:max-w-none lg:w-[75%] text-center lg:-translate-x-20 lg:pr-32 lg:py-20">
                        <p className="text-3xl sm:text-5xl font-serif " style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>Welcome to</p>
                        <h1 className="text-5xl sm:text-7xl font-bold font-serif" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>Dream Vibes</h1>
                    </div>
                </div>

                {/* Character Image */}
                {/* Absolutely positioned relative to the max-w-7xl container */}
                <div className="absolute z-20 bottom-0 right-0  w-40 sm:w-80 md:w-[28rem] md:h-[28rem]lg:w-[35rem] max-w-[90vw] lg:max-w-none lg:right-10 xl:right-1">
                    <img src="/images/gb.png" alt="Cartoon boy and girl with backpacks" className="w-full h-auto " />
                </div>
            </div>
        </section>
    );
}

export default Hero;