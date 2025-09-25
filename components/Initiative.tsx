import React, { useState } from 'react';

const Initiative: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <section className="py-12 px-6">
             <div className="max-w-5xl mx-auto text-center">
                <button 
                    onClick={toggleExpansion} 
                    className="inline-flex items-center justify-center gap-3 mb-2 focus:outline-none group"
                    aria-expanded={isExpanded}
                    aria-controls="initiative-description"
                >
                    <h2 className="text-3xl font-bold text-teal-600 font-serif group-hover:text-teal-700 transition-colors">Initiative by Balasabha</h2>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 text-teal-600 transform transition-transform duration-300 group-hover:text-teal-700 ${isExpanded ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div
                    id="initiative-description"
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
                >
                    <div className="pt-2">
                        <p className="text-gray-600 leading-relaxed">
                            Balasabha is a children's social forum within the Kudumbashree program in Kerala, India, designed to develop leadership skills, democratic awareness, and personal growth in children from underprivileged families. These forums meet regularly, elect leaders, and are organized into higher tiers (Balasamities and Bala panchayats) to promote social awareness, cooperative spirit, and other values through activities like talent camps and forums for children.
                        </p>
                    </div>
                </div>
             </div>
        </section>
    );
}

export default Initiative;