import React from 'react';

const focusAreas = [
    'Capacity Building',
    'Holistic Health',
    'Skill Development Training',
    'Child Parliament',
    'Science Festival',
    'Child Agriculture',
    'Child Library',
    'Building Resilience',
];

const Objectives: React.FC = () => {
    return (
        <section className="py-8 px-6">
            {/* Changed to flex-row and adjusted gap for all screen sizes */}
            <div className="max-w-5xl mx-auto flex flex-row items-center gap-4 md:gap-12">
                
                {/* Left Image: Width now applies to all screen sizes */}
                <div className="w-5/12 md:translate-x-20">
                    <img 
                        src="public/images/Gemini_Generated_Image_807mnz807mnz807m-removebg-preview.png" 
                        alt="Cartoon of a boy and a girl in school uniform walking"
                        className="w-full max-w-sm mx-auto" 
                    />
                </div>

                {/* Right Content: Width, padding, and text sizes are now responsive */}
                <div className="w-7/12 pl-2 sm:pl-4 md:pl-8 lg:pl-16">
                    <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-teal-600 mb-1 sm:mb-2">
                        Key Focus Areas of
                    </h2>
                    <div className="mb-2 sm:mb-6">
                        <img 
                            src="public/images/balasabha new.jpg" 
                            alt="Balasabha Logo" 
                            className="h-8 sm:h-12 md:h-16" 
                        />
                    </div>
                    <ul className="space-y-1 sm:space-y-3">
                        {focusAreas.map((area, index) => (
                            <li key={index} className="flex items-center gap-2 sm:gap-3">
                                <span className="flex-shrink-0 w-2 h-2 sm:w-4 sm:h-4 bg-teal-400 rounded-full"></span>
                                <span className="text-base sm:text-lg text-gray-700">{area}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Objectives;