import React, { useState } from 'react';

const panchayathData = [
    { 
        name: 'Varkala Block Panchayath', 
        videos: [
            { seed: 'acc1', name: 'Bhargav S', age: 18, location: 'Varkala', district: 'Trivandrum' },
            { seed: 'acc2', name: 'Neha N', age: 18, location: 'Varkala', district: 'Trivandrum' },
            { seed: 'acc3', name: 'Adithya V', age: 17, location: 'Varkala', district: 'Trivandrum' },
            { seed: 'acc4', name: 'Sreya P', age: 16, location: 'Varkala', district: 'Trivandrum' },
        ] 
    },
    { name: 'Kilimanoor Block Panchayath', videos: [] },
    { name: 'Chirayinkeezh Block Panchayath', videos: [] },
    { name: 'Vamanapuram Block Panchayath', videos: [] },
    { name: 'Vellanad Block Panchayath', videos: [] },
    { name: 'Nedumangad Block Panchayath', videos: [] },
    { name: 'Pothencode Block Panchayath', videos: [] },
    { name: 'Nemom Block Panchayath', videos: [] },
    { name: 'Perumkadavila Block Panchayath', videos: [] },
    { name: 'Athiyannoor Block Panchayath', videos: [] },
    { name: 'Parassala Block Panchayath', videos: [] },
];

const PanchayathAccordion: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {panchayathData.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
                    <button
                        onClick={() => handleToggle(index)}
                        className={`w-full flex justify-between items-center p-4 text-left font-semibold text-lg transition-colors duration-300 ${
                            openIndex === index
                                ? 'bg-teal-500 text-white'
                                : 'bg-white text-teal-700 hover:bg-teal-50'
                        }`}
                        aria-expanded={openIndex === index}
                        aria-controls={`accordion-content-${index}`}
                    >
                        <span>{item.name}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={openIndex === index ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                    </button>
                    <div
                        id={`accordion-content-${index}`}
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                            openIndex === index ? 'max-h-[1000px]' : 'max-h-0'
                        }`}
                    >
                        <div className="p-4 border-t border-gray-200">
                            {item.videos.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {item.videos.map(video => (
                                        <div key={video.seed} className="group relative">
                                            <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg bg-white">
                                                <img src={`https://picsum.photos/seed/${video.seed}/300/500`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Spotlight video thumbnail" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                                 <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 p-3 text-white">
                                                    <h3 className="font-bold text-sm">{video.name}</h3>
                                                    <p className="text-xs">Age {video.age}, {video.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No videos available for this panchayath.</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PanchayathAccordion;