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
        if (v.includes('Municipal Corporation')) return { base: v.replace(' Municipal Corporation', ''), kind: 'corporation' };
        if (v.includes(' Corporation')) return { base: v.replace(' Corporation', ''), kind: 'corporation' };
        if (v.includes('Municipality')) return { base: v.replace(' Municipality', ''), kind: 'municipality' };
        if (v.includes(' Block Panchayat')) return { base: v.replace(' Block Panchayat', ''), kind: 'block' };
        return { base: v, kind: 'panchayath' };
    };

    // Reuse the static list from Spotlight logic for suggestions (lightweight)
    const locationPool = useMemo(() => {
        // Lightweight list tailored for district page: blocks, municipalities, corporations, and panchayaths labels
        // For simplicity, we include generic labels; can be scoped by district later
        const list: string[] = [];
        // Block labels example (user can type exact names)
        list.push('Block Panchayat');
        // Users typically type proper names; suggestions are optional here
        return list;
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

    // Auto-search for ULB content when district is Urban Localbodies or when it's a ULB district
    React.useEffect(() => {
        if (districtName === 'Urban Localbodies') {
            // Auto-search for ULB content
            runSearch('Urban Localbodies');
        } else {
            // For other districts, try to search for ULB content with the district name
            // This will help find ULB stories for districts like Alappuzha
            runSearch(districtName);
        }
    }, [districtName]);

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
                                if (q.length > 1 && locationPool.length > 0) {
                                    setSuggestions(locationPool.filter(l => l.toLowerCase().includes(q.toLowerCase())));
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
                                        <li key={i} className="px-4 py-3 cursor-pointer hover:bg-teal-50 text-left text-gray-700" onClick={() => { setQuery(s); setSuggestions([]); runSearch(s); }}>{s}</li>
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {results.map(video => (
                                    <div key={video.id} className="group relative" onClick={() => openModal(video)}>
                                        <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                            <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Media thumbnail" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                            <div className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs bg-black/30 px-2 py-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                <span>{video.district}</span>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                                    {video.mediaType === 'video' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
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
                        className={`bg-white rounded-2xl md:rounded-3xl overflow-hidden max-w-4xl w-full relative transition-all duration-200 ${isModalClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'} md:h-[90vh] max-h-screen flex flex-col`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button type="button" aria-label="Close" className="absolute z-20 top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center text-3xl leading-none" onClick={closeModal}>
                            <span className="-mt-2" aria-hidden>
                                ×
                            </span>
                        </button>
                        <div className="w-full bg-black flex-1 flex items-center justify-center relative">
                            {selectedVideo.mediaType === 'video' && (
                                <video controls preload="metadata" poster={selectedVideo.thumbnailUrl} className="max-w-full max-h-full w-auto h-auto object-contain">
                                    <source src={selectedVideo.videoUrl} />
                                </video>
                            )}
                            {selectedVideo.mediaType === 'image' && (
                                <img 
                                    src={selectedVideo.imageUrl || selectedVideo.thumbnailUrl} 
                                    alt={selectedVideo.name}
                                    className="max-w-full max-h-full w-auto h-auto object-contain"
                                />
                            )}
                            {(selectedVideo.mediaType === 'story' || selectedVideo.mediaType === 'poem') && selectedVideo.storyImages && (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img 
                                        key={`${selectedVideo.id}-${currentPage}`}
                                        src={selectedVideo.storyImages[currentPage]?.url || selectedVideo.thumbnailUrl} 
                                        alt={`${selectedVideo.name} - Page ${currentPage + 1}`}
                                        className="max-w-full max-h-full w-auto h-auto"
                                        style={{ 
                                            objectFit: 'contain',
                                            width: 'auto',
                                            height: 'auto',
                                            maxWidth: '100%',
                                            maxHeight: '100%'
                                        }}
                                        onLoad={(e) => {
                                            // Ensure consistent sizing for all images
                                            const img = e.target as HTMLImageElement;
                                            img.style.objectFit = 'contain';
                                            img.style.width = 'auto';
                                            img.style.height = 'auto';
                                        }}
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
                        <div className="p-4 sm:p-5 bg-white/15 backdrop-blur-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                .filter(v => v.videoUrl || v.imageUrl || (v.storyImages && v.storyImages.length > 0))
                .filter(v => {
                    if (districtName === 'Urban Localbodies') return true;
                    const normalize = (s: string) => s.trim().toLowerCase();
                    return normalize(v.district) === normalize(districtName);
                });

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