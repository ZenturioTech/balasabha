import React, { useMemo, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Footer from './Footer';
import PanchayathAccordion from './PanchayathAccordion';

interface DistrictPageProps {
    districtName: string;
    imageUrl: string;
    onBack: () => void;
}

type ResultVideo = {
    id: string;
    name: string;
    district: string;
    panchayath: string;
    wardLabel: string;
    thumbnailUrl: string;
    videoUrl: string;
    mediaType: string;
    imageUrl?: string;
    storyImages?: Array<{
        page: number;
        url: string;
        filename: string;
    }>;
};

const DistrictPage: React.FC<DistrictPageProps> = ({ districtName, imageUrl, onBack }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [results, setResults] = useState<ResultVideo[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<ResultVideo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isModalClosing, setIsModalClosing] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [showSlideHint, setShowSlideHint] = useState<boolean>(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const toTitleCase = (input: string): string => input
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

    const classify = (label: string): { base: string; kind: 'panchayath' | 'block' | 'municipality' | 'corporation' } => {
        const v = label.trim();
        // Handle formatted suggestions (e.g., "Adimaly - Block")
        if (v.includes(' - Corporation')) return { base: v.replace(' - Corporation', ''), kind: 'corporation' };
        if (v.includes(' - Municipality')) return { base: v.replace(' - Municipality', ''), kind: 'municipality' };
        if (v.includes(' - Block')) return { base: v.replace(' - Block', ''), kind: 'block' };
        // Handle original format (e.g., "Adimaly Block Panchayat")
        if (v.includes('Municipal Corporation')) return { base: v.replace(' Municipal Corporation', ''), kind: 'corporation' };
        if (v.includes(' Corporation')) return { base: v.replace(' Corporation', ''), kind: 'corporation' };
        if (v.includes('Municipality')) return { base: v.replace(' Municipality', ''), kind: 'municipality' };
        if (v.includes(' Block Panchayat')) return { base: v.replace(' Block Panchayat', ''), kind: 'block' };
        return { base: v, kind: 'panchayath' };
    };

    // Comprehensive list of Kerala's Local Self Government Institutions for suggestions
    const keralaLocations = [
        // Urban Localbodies - Municipal Corporations
        'Thiruvananthapuram Corporation',
        'Kollam Corporation',
        'Kochi Corporation',
        'Thrissur Corporation',
        'Kozhikode Corporation',
        'Kannur Corporation',
        // Municipalities
        'Varkala Municipality',
        'Attingal Municipality',
        'Nedumangad Municipality',
        'Neyyattinkara Municipality',
        'Punalur Municipality',
        'Paravur Municipality',
        'Karunagappally Municipality',
        'Kottarakkara Municipality',
        'Adoor Municipality',
        'Thiruvalla Municipality',
        'Pathanamthitta Municipality',
        'Alappuzha Municipality',
        'Cherthala Municipality',
        'Kayamkulam Municipality',
        'Mavelikkara Municipality',
        'Chengannur Municipality',
        'Kottayam Municipality',
        'Changanassery Municipality',
        'Vaikom Municipality',
        'Thodupuzha Municipality',
        'Kattappana Municipality',
        'Aluva Municipality',
        'Angamaly Municipality',
        'Eloor Municipality',
        'Kalamassery Municipality',
        'Kothamangalam Municipality',
        'Maradu Municipality',
        'Muvattupuzha Municipality',
        'Paravur Municipality',
        'Perumbavoor Municipality',
        'Thrikkakara Municipality',
        'Thrippunithura Municipality',
        'Chalakudy Municipality',
        'Guruvayoor Municipality',
        'Irinjalakuda Municipality',
        'Kodungallur Municipality',
        'Chittur-Thathamangalam Municipality',
        'Ottappalam Municipality',
        'Palakkad Municipality',
        'Shoranur Municipality',
        'Kondotty Municipality',
        'Kottakkal Municipality',
        'Malappuram Municipality',
        'Manjeri Municipality',
        'Nilambur Municipality',
        'Perinthalmanna Municipality',
        'Ponnani Municipality',
        'Tirur Municipality',
        'Valanchery Municipality',
        'Koyilandy Municipality',
        'Vadakara Municipality',
        'Payyannur Municipality',
        'Taliparamba Municipality',
        'Iritty Municipality',
        'Mattannur Municipality',
        'Anthoor Municipality',
        'Panoor Municipality',
        'Sreekandapuram Municipality',
        'Kuthuparamba Municipality',
        'Mananthavady Municipality',
        'Sulthan Bathery Municipality',
        'Kanhangad Municipality',
        'Kasaragod Municipality',
        'Nileshwar Municipality',
        'Koothattukulam Municipality',
        'Piravom Municipality',
        'Feroke Municipality',
        'Mukkam Municipality',
        'Payyoli Municipality',
        'Ramanattukara Municipality',
        'Parappanangadi Municipality',
        'Cherpulassery Municipality',
        'Shoranur Municipality',
        'Kunnamkulam Municipality',
        // Block Panchayats (exact names from block-username.csv)
        'Varkala Block Panchayat',
        'Kilimanoor Block Panchayat',
        'Chirayinkeezhu Block Panchayat',
        'Vamanapuram Block Panchayat',
        'Vellanad Block Panchayat',
        'Nedumangad Block Panchayat',
        'Pothencode Block Panchayat',
        'Nemom Block Panchayat',
        'Perumkadavila Block Panchayat',
        'Athiyannoor Block Panchayat',
        'Parassala Block Panchayat',
        'Oachira Block Panchayat',
        'Sasthamcotta Block Panchayat',
        'Vettikavala Block Panchayat',
        'Pathanapuram Block Panchayat',
        'Anchal Block Panchayat',
        'Kottarakara Block Panchayat',
        'Chittumala Block Panchayat',
        'Chavara Block Panchayat',
        'Mukhathala Block Panchayat',
        'Ithikkara Block Panchayat',
        'Chadayamangalam Block Panchayat',
        'Mallappally Block Panchayat',
        'Pulikeezhu Block Panchayat',
        'Koipuram Block Panchayat',
        'Elanthoor Block Panchayat',
        'Ranni Block Panchayat',
        'Konni Block Panchayat',
        'Pandalam Block Panchayat',
        'Parakkode Block Panchayat',
        'Thycattussery Block Panchayat',
        'Pattanakkad Block Panchayat',
        'Kanjikuzhy Block Panchayat',
        'Aryad Block Panchayat',
        'Ambalappuzha Block Panchayat',
        'Champakulam Block Panchayat',
        'Veliyanad Block Panchayat',
        'Chengannur Block Panchayat',
        'Haripad Block Panchayat',
        'Mavelikara Block Panchayat',
        'Bharanickavu Block Panchayat',
        'Muthukulam Block Panchayat',
        'Vaikom Block Panchayat',
        'Kaduthuruthy Block Panchayat',
        'Ettumanoor Block Panchayat',
        'Uzhavoor Block Panchayat',
        'Lalam Block Panchayat',
        'Erattupetta Block Panchayat',
        'Pampady Block Panchayat',
        'Pallom Block Panchayat',
        'Madappally Block Panchayat',
        'Vazhoor Block Panchayat',
        'Kanjirappally Block Panchayat',
        'Adimaly Block Panchayat',
        'Devikulam Block Panchayat',
        'Nedumkandam Block Panchayat',
        'Elemdesam Block Panchayat',
        'Idukki Block Panchayat',
        'Kattappana Block Panchayat',
        'Thodupuzha Block Panchayat',
        'Azhutha Block Panchayat',
        'Paravur Block Panchayat',
        'Alangad Block Panchayat',
        'Angamaly Block Panchayat',
        'Koovappady Block Panchayat',
        'Vazhakulam Block Panchayat',
        'Edappally Block Panchayat',
        'Vypin Block Panchayat',
        'Palluruthy Block Panchayat',
        'Mulanthuruthy Block Panchayat',
        'Vadavucode Block Panchayat',
        'Kothamangalam Block Panchayat',
        'Pampakuda Block Panchayat',
        'Parakkadavu Block Panchayat',
        'Muvattupuzha Block Panchayat',
        'Chavakkad Block Panchayat',
        'Chowannur Block Panchayat',
        'Wadakanchery Block Panchayat',
        'Pazhayannur Block Panchayat',
        'Ollukkara Block Panchayat',
        'Puzhakkal Block Panchayat',
        'Mullassery Block Panchayat',
        'Thalikulam Block Panchayat',
        'Anthikad Block Panchayat',
        'Cherpu Block Panchayat',
        'Kodakara Block Panchayat',
        'Irinjalakuda Block Panchayat',
        'Vellangallur Block Panchayat',
        'Mathilakam Block Panchayat',
        'Mala Block Panchayat',
        'Chalakudy Block Panchayat',
        'Trithala Block Panchayat',
        'Pattambi Block Panchayat',
        'Ottapalam Block Panchayat',
        'Sreekrishnapuram Block Panchayat',
        'Mannarkad Block Panchayat',
        'Attappady Block Panchayat',
        'Palakkad Block Panchayat',
        'Kuzhalmannam Block Panchayat',
        'Chittur Block Panchayat',
        'Kollengode Block Panchayat',
        'Nemmara Block Panchayat',
        'Alathur Block Panchayat',
        'Malampuzha Block Panchayat',
        'Nilambur Block Panchayat',
        'Kalikavu Block Panchayat',
        'Wandoor Block Panchayat',
        'Kondotty Block Panchayat',
        'Areacode Block Panchayat',
        'Malappuram Block Panchayat',
        'Perinthalmanna Block Panchayat',
        'Mankada Block Panchayat',
        'Kuttippuram Block Panchayat',
        'Vengara Block Panchayat',
        'Tirurangadi Block Panchayat',
        'Tanur Block Panchayat',
        'Tirur Block Panchayat',
        'Ponnani Block Panchayat',
        'Perumpadappa Block Panchayat',
        'Vatakara Block Panchayat',
        'Tuneri Block Panchayat',
        'Kunnummal Block Panchayat',
        'Thodannur Block Panchayat',
        'Melady Block Panchayat',
        'Perambra Block Panchayat',
        'Balussery Block Panchayat',
        'Panthalayani Block Panchayat',
        'Chelannur Block Panchayat',
        'Koduvally Block Panchayat',
        'Kunnamangalam Block Panchayat',
        'Kozhikkode Block Panchayat',
        'Mananthavady Block Panchayat',
        'Panamaram Block Panchayat',
        'Sulthan Bathery Block Panchayat',
        'Kalpetta Block Panchayat',
        'Payyannur Block Panchayat',
        'Kalliasseri Block Panchayat',
        'Thalipparamba Block Panchayat',
        'Irikkur Block Panchayat',
        'Kannur Block Panchayat',
        'Edakkad Block Panchayat',
        'Thalassery Block Panchayat',
        'Panoor Block Panchayat',
        'Kuthuparamba Block Panchayat',
        'Iritty Block Panchayat',
        'Peravoor Block Panchayat',
        'Manjesaram Block Panchayat',
        'Karadka Block Panchayat',
        'Kasaragod Block Panchayat',
        'Kanhangad Block Panchayat',
        'Parappa Block Panchayat',
        'Nileswaram Block Panchayat'
    ];

    const classifyLocation = (label: string): { baseName: string; kind: 'panchayath' | 'block' | 'municipality' | 'corporation' } => {
        const v = label.trim();
        if (v.includes('Municipal Corporation')) return { baseName: v.replace(' Municipal Corporation', ''), kind: 'corporation' };
        if (v.includes(' Corporation')) return { baseName: v.replace(' Corporation', ''), kind: 'corporation' };
        if (v.includes('Municipality')) return { baseName: v.replace(' Municipality', ''), kind: 'municipality' };
        if (v.includes(' Block Panchayat')) return { baseName: v.replace(' Block Panchayat', ''), kind: 'block' };
        return { baseName: v, kind: 'panchayath' };
    };

    const formatSuggestion = (raw: string): string => {
        const c = classifyLocation(raw);
        if (c.kind === 'corporation') return `${c.baseName} - Corporation`;
        if (c.kind === 'municipality') return `${c.baseName} - Municipality`;
        if (c.kind === 'block') return `${c.baseName} - Block`;
        return `${c.baseName} - Panchayath`;
    };

    const locationPool = useMemo(() => {
        return keralaLocations;
    }, []);

    const openModal = (video: ResultVideo) => {
        setSelectedVideo(video);
        setCurrentPage(0);
        setIsModalClosing(false);
        setIsModalOpen(true);
        
        // Show slide hint for stories/poems with multiple pages
        if ((video.mediaType === 'story' || video.mediaType === 'poem') && video.storyImages && video.storyImages.length > 1) {
            setShowSlideHint(true);
            setTimeout(() => setShowSlideHint(false), 3000);
        }
    };

    const closeModal = () => {
        setIsModalClosing(true);
        setCurrentPage(0);
        setShowSlideHint(false);
        // Allow transition to play before unmounting
        window.setTimeout(() => {
            setIsModalOpen(false);
            setSelectedVideo(null);
            setIsModalClosing(false);
        }, 200);
    };

    const nextPage = () => {
        if (selectedVideo?.storyImages && currentPage < selectedVideo.storyImages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Add keyboard navigation
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
            if (isModalOpen && selectedVideo && (selectedVideo.mediaType === 'story' || selectedVideo.mediaType === 'poem')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevPage();
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    nextPage();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen, selectedVideo, currentPage]);

    // Removed auto-search to show block dropdowns immediately when district is clicked

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

                <button 
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-black/40 text-white hover:bg-black/90 shadow-lg rounded-full w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center transition-colors"
                    onClick={onBack}
                    aria-label="Back to home"
                    title="Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        {districtName === 'Urban Localbodies' ? 'Urban Localbodies' : `${districtName} District`}
                    </h1>
                    <div className="relative w-full mt-4" ref={searchRef}>
                        <input 
                            type="text"
                            placeholder="Search Block/Urban Local Body(ULB)"
                            className="w-full text-sm sm:text-base pl-4 sm:pl-6 pr-24 sm:pr-32 py-3 sm:py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500"
                            value={query}
                            onChange={(e) => {
                                const q = e.target.value;
                                setQuery(q);
                                if (q.length > 1) {
                                    const filteredSuggestions = keralaLocations
                                        .filter(location => {
                                            const matchesQuery = location.toLowerCase().includes(q.toLowerCase());
                                            if (districtName === 'Urban Localbodies') {
                                                // For ULB district, only suggest ULB (Corporations and Municipalities)
                                                return matchesQuery && (location.includes('Corporation') || location.includes('Municipality'));
                                            } else {
                                                // For regular districts, only suggest blocks
                                                return matchesQuery && location.includes(' Block Panchayat');
                                            }
                                        })
                                        .map(formatSuggestion);
                                    setSuggestions(filteredSuggestions);
                                } else {
                                    setSuggestions([]);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    runSearch(query);
                                }
                            }}
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 text-white font-semibold text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-8 rounded-full hover:bg-teal-600 transition-colors shadow-lg"
                            onClick={() => runSearch(query)}
                        >
                            Search
                        </button>
                        {suggestions.length > 0 && (
                            <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <ul className="divide-y divide-gray-100">
                                    {suggestions.slice(0, 10).map((s, i) => (
                                        <li key={i} className="px-4 py-3 cursor-pointer hover:bg-teal-50 text-left text-gray-700" onClick={() => { 
                                            setQuery(s); 
                                            setSuggestions([]); 
                                            runSearch(s); // Pass the full formatted suggestion
                                        }}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Page Content */}
            <main className="py-16 px-4">
                {showResults && (
                    <section className="max-w-6xl mx-auto bg-white mb-12">
                        <div className="flex items-center justify-between mb-6 px-2 sm:px-0">
                            <h3 className="text-2xl sm:text-3xl font-semibold text-teal-700">Search Results</h3>
                            <button className="text-teal-600 hover:text-teal-800 font-semibold" onClick={() => { setShowResults(false); setResults([]); }}>Close</button>
                        </div>
                        {loading && <div className="text-gray-600 mb-6">Searching...</div>}
                        {error && <div className="text-red-600 mb-6">{error}</div>}
                        {!loading && !error && results.length === 0 && (
                            <div className="text-gray-600 mb-6">No matching videos found.</div>
                        )}
                        {!loading && !error && results.length > 0 && (
                            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-gray-100 hover:scrollbar-thumb-teal-400">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
                                    {results.map(video => (
                                    <div key={video.id} className="group relative" onClick={() => openModal(video)}>
                                        <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg aspect-[9/16]">
                                            <img 
                                                src={video.thumbnailUrl} 
                                                className={`w-full h-full transition-transform duration-300 group-hover:scale-110 ${
                                                    (video.mediaType === 'story' || video.mediaType === 'poem') ? 'object-contain' : 'object-cover'
                                                }`}
                                                alt="Media thumbnail" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                            <div className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs bg-black/30 px-2 py-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                <span>{video.district}</span>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                                    {video.mediaType === 'video' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                    ) : video.mediaType === 'image' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                                    ) : (video.mediaType === 'story' || video.mediaType === 'poem') ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                                <h3 className="font-bold">{video.name}</h3>
                                                <p className="text-xs">{video.wardLabel}{video.wardLabel ? ', ' : ''}{video.panchayath}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}
                {/* Panchayath Accordion Section */}
                {!showResults && (
                    <section className="max-w-3xl mx-auto">
                        <PanchayathAccordion districtName={districtName === 'Urban Localbodies' ? 'Urban Localbodies' : districtName} />
                    </section>
                )}
            </main>

            <Footer />

            {/* Media Modal */}
            {isModalOpen && selectedVideo && (
                <div 
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-200 ${isModalClosing ? 'bg-black/0' : 'bg-black/70'}`}
                    onClick={closeModal}
                >
                    <div 
                        className={`bg-white rounded-2xl md:rounded-3xl overflow-hidden max-w-4xl w-full relative transition-all duration-200 ${isModalClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'} h-[80vh] md:h-[90vh] max-h-screen flex flex-col`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button type="button" aria-label="Close" className="absolute z-20 top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center text-3xl leading-none" onClick={closeModal}>
                            <span className="-mt-2" aria-hidden>
                                ×
                            </span>
                        </button>
                        <div className="w-full bg-black flex-1 flex items-center justify-center relative overflow-hidden">
                            {selectedVideo.mediaType === 'video' && (
                                <video 
                                    controls 
                                    preload="metadata" 
                                    poster={selectedVideo.thumbnailUrl} 
                                    className="max-w-full max-h-full object-contain"
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <source src={selectedVideo.videoUrl} />
                                </video>
                            )}
                            {selectedVideo.mediaType === 'image' && (
                                <img 
                                    src={selectedVideo.imageUrl || selectedVideo.thumbnailUrl} 
                                    alt={selectedVideo.name}
                                    className="max-w-full max-h-full object-contain"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            )}
                            {(selectedVideo.mediaType === 'story' || selectedVideo.mediaType === 'poem') && selectedVideo.storyImages && (
                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                    <img 
                                        key={`${selectedVideo.id}-${currentPage}`}
                                        src={selectedVideo.storyImages[currentPage]?.url || selectedVideo.thumbnailUrl} 
                                        alt={`${selectedVideo.name} - Page ${currentPage + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                    
                                    {/* Navigation arrows for multi-page content */}
                                    {selectedVideo.storyImages.length > 1 && (
                                        <>
                                            {currentPage > 0 && (
                                                <button 
                                                    onClick={prevPage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                            {currentPage < selectedVideo.storyImages.length - 1 && (
                                                <button 
                                                    onClick={nextPage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            {/* Page indicator */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                                                {currentPage + 1} / {selectedVideo.storyImages.length}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Slide hint */}
                                    {showSlideHint && selectedVideo.storyImages.length > 1 && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
                                            Swipe or use arrows to navigate pages
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4 sm:p-5 bg-white text-black shrink-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <div className="font-semibold text-xl sm:text-xl">{selectedVideo.name}</div>
                            <div className="text-sm sm:text-base opacity-90">{selectedVideo.district}</div>
                            <div className="text-sm sm:text-base opacity-95">{selectedVideo.wardLabel}{selectedVideo.wardLabel ? ', ' : ''}{selectedVideo.panchayath}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    async function runSearch(raw: string) {
        const trimmed = raw.trim();
        if (!trimmed) return;
        try {
            setLoading(true);
            setShowResults(false);
            setError(null);
            // Determine kind and base name
            const cls = classify(trimmed);
            const base = cls.base;
            const kind = cls.kind;

            let query = supabase
                .from('metadata')
                .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                .order('created_at', { ascending: false })
                .limit(100);

            if (kind === 'panchayath') {
                query = query.or(`metadata->>panchayath.ilike.%${base}%,panchayath.ilike.%${base}%`);
            } else if (kind === 'block') {
                query = query.or(`metadata->>block.ilike.%${base}%,block_ulb.ilike.%${base}%`);
            } else {
                const pattern = `${base.toLowerCase()}ulb`;
                query = query.ilike('block_ulb', `%${pattern}%`);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            
            // Debug: log search results
            console.log('[DistrictPage] Search results', { 
                districtName, 
                base, 
                kind, 
                pattern: kind === 'municipality' ? `${base.toLowerCase()}ulb` : 'N/A',
                resultCount: data?.length,
                sampleResults: data?.slice(0, 3)
            });

            const mapped: ResultVideo[] = (data as any[])
                .filter((row) => {
                    const mt = (row.metadata as any)?.mediaType;
                    const isValid = mt && ['video', 'image', 'story', 'poem'].includes(String(mt).toLowerCase());
                    if (mt) {
                        console.log('[DistrictPage] Media type found:', { mediaType: mt, isValid, name: row.metadata?.name });
                    }
                    return isValid;
                })
                .map(row => {
                    const m = row.metadata ?? {};
                    const district = (m.district || row.district || '').toString();
                    const basePanch = (m.panchayath || row.panchayath || '').toString();
                    const blockUlbRaw = (row.block_ulb || m.block || '').toString();
                    const blockUlbLc = blockUlbRaw.toLowerCase();
                    const isUlb = !!blockUlbLc && blockUlbLc.endsWith('ulb');
                    let panch = basePanch;
                    if (isUlb) {
                        const ulbBase = blockUlbLc.replace(/ulb$/i, '').trim();
                        const ulbNameDisplay = toTitleCase(ulbBase);
                        panch = ulbNameDisplay ? `${ulbNameDisplay} ULB` : 'Urban Local Body';
                    }
                    const wardRaw = m.ward ?? '';
                    const wardLabel = wardRaw ? `Ward ${wardRaw}` : '';
                    const mediaType = (m.mediaType || 'video').toString();
                    
                    // Get appropriate thumbnail/display image
                    let thumbnailUrl = '/images/girlw.png';
                    if (mediaType === 'video' && m.thumbnailUrl) {
                        thumbnailUrl = m.thumbnailUrl;
                    } else if (mediaType === 'image' && m.imageUrl) {
                        thumbnailUrl = m.imageUrl;
                    } else if ((mediaType === 'story' || mediaType === 'poem') && m.storyImages && m.storyImages.length > 0) {
                        thumbnailUrl = m.storyImages[0].url;
                    } else if (m.imageUrl) {
                        thumbnailUrl = m.imageUrl;
                    }
                    
                    return {
                        id: String(row.id),
                        name: (m.name || row.username || 'Participant').toString(),
                        district,
                        panchayath: panch,
                        wardLabel,
                        thumbnailUrl,
                        videoUrl: (m.videoUrl || '').toString(),
                        mediaType,
                        imageUrl: m.imageUrl,
                        storyImages: m.storyImages,
                    };
                })
                .filter(v => v.videoUrl || v.imageUrl || (v.storyImages && v.storyImages.length > 0));

            setResults(mapped);
            setShowResults(true);
        } catch (e: any) {
            setError(e?.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    }
};

export default DistrictPage;