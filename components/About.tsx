import React from 'react';

const About: React.FC = () => {
    return (
        <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl md:text-6xl font-bold text-teal-600 mb-4 font-serif">About Dream Vibes</h2>
                    <p className="text-gray-600 leading-relaxed md:text-justify  ">
                        Dream Vibe creates a platform where children can independently share their thoughts, dreams and vision for a better society. By encouraging critical thinking about their communities' strengths, challenges and possibilities, the initiative ensures that children's voices become an integral part of future development. The ideas expressed through this program can also guide local institutions in preparing inclusive, child-friendly development plans.
                    </p>
                </div>
                
                <div className="mt-12 flex justify-center items-center gap-4 md:gap-8 px-4">
                    {/* Left Icons Column */}
                    <div className="flex flex-col gap-8 md:gap-16">
                        <div className="w-20 h-20 md:w-28 md:h-28">
                           <img src="public/images/cicons (1).png" alt="Community Growth Icon" className="w-full h-full object-contain" />
                        </div>
                        <div className="w-20 h-20 md:w-28 md:h-28">
                           <img src="public/images/cicons (2).png" alt="Critical Thinking Icon" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    
                    {/* Central Image */}
                    <img src="public/images/girlw.png" alt="Girl with a lightbulb idea" className="w-48 sm:w-56 md:w-72 h-auto" />
                    
                    {/* Right Icons Column */}
                    <div className="flex flex-col gap-8 md:gap-16">
                        <div className="w-20 h-20 md:w-28 md:h-28">
                           <img src="public/images/cicons (3).png" alt="Local Institutions Icon" className="w-full h-full object-contain" />
                        </div>
                        <div className="w-20 h-20 md:w-28 md:h-28">
                            <img src="public/images/cicons (4).png" alt="Social Awareness Icon" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;