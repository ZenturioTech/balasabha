import React from 'react';
import Footer from './Footer';
import PanchayathAccordion from './PanchayathAccordion';

interface DistrictPageProps {
    districtName: string;
    imageUrl: string;
    onBack: () => void;
}

const DistrictPage: React.FC<DistrictPageProps> = ({ districtName, imageUrl, onBack }) => {

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <header className="relative h-[65vh] w-full flex flex-col items-center justify-end text-white text-center p-4 pb-20">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={imageUrl} 
                        alt={`${districtName} landscape`} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>

                <div 
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-white p-2 sm:p-4 shadow-lg cursor-pointer"
                    onClick={onBack}
                    aria-label="Go back to homepage"
                    role="button"
                >
                    <img 
                        src="https://i.ibb.co/TMnhybB2/Layer-2-copy-1.png" 
                        alt="Dream Vibes Logo" 
                        className="h-8 sm:h-12" 
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        {districtName === 'Urban Localbodies' ? 'Urban Localbodies' : `${districtName} District`}
                    </h1>
                    <div className="relative w-full mt-4">
                        <input 
                            type="text"
                            placeholder="Search Block/Urban Local Body(ULB)"
                            className="w-full text-sm sm:text-base pl-4 sm:pl-6 pr-24 sm:pr-32 py-3 sm:py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 text-white font-semibold text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-8 rounded-full hover:bg-teal-600 transition-colors shadow-lg">
                            Search
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Page Content */}
            <main className="py-16 px-4">
                {/* Panchayath Accordion Section */}
                <section className="max-w-3xl mx-auto">
                    <PanchayathAccordion districtName={districtName === 'Urban Localbodies' ? 'Urban Localbodies' : districtName} />
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default DistrictPage;