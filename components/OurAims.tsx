import React from 'react';

const OurAims: React.FC = () => {
    return (
        <section className="py-16 md:pt-32 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                {/* This container becomes relative only on desktop to contain the absolute image */}
                <div className="lg:relative">
                    
                    {/* Image Container: In flow on mobile, absolute on desktop */}
                    <div className="relative z-10 w-[70%] max-w-xs sm:w-64 mx-auto lg:absolute lg:left-12 lg:top-1/2 lg:-translate-y-1/2 lg:z-20 lg:w-72">
                        <div className="bg-white p-3 rounded-xl shadow-2xl">
                            <img 
                                src="/images/kids.png" 
                                alt="Children participating in a Balasabha activity" 
                                className="rounded-lg filter grayscale w-full h-96 lg:h-[450px] object-cover"
                            />
                        </div>
                    </div>

                    {/* Teal Box Content */}
                    {/* On mobile, it's pulled up to overlap with the image above it */}
                    <div className="relative bg-teal-600 text-white rounded-3xl shadow-2xl -mt-24 lg:mt-0">
                        {/* Inner Content */}
                        {/* Mobile has top padding to clear the image; Desktop has left padding */}
                        <div className="relative p-8 pt-32 pb-12 lg:py-12 lg:pl-96 lg:pr-16 text-center lg:text-left">
                            
                            <div className="bg-white text-teal-600 font-semibold py-3 px-8 rounded-full inline-block mb-6 shadow-lg">
                                Our aim is to provide children with:
                            </div>
                            
                            <ul className="space-y-4 inline-block text-left max-w-md lg:max-w-none">
                                <li className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium leading-relaxed">
                                        Opportunity to present their vision of an equal, safe and inclusive society.
                                    </span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium leading-relaxed">
                                        Creative and innovative thinking through various activities.
                                    </span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium leading-relaxed">
                                        A chance to take part in social and developmental activities.
                                    </span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium leading-relaxed">
                                        A stage to showcase their talents, skills, and ideas.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurAims;