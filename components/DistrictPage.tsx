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
};

const DistrictPage: React.FC<DistrictPageProps> = ({ districtName, imageUrl, onBack }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [results, setResults] = useState<ResultVideo[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const toTitleCase = (input: string): string => input
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

    const classify = (label: string): { base: string; kind: 'panchayath' | 'block' | 'municipality' | 'corporation' } => {
        const v = label.trim();
        if (v.includes('Municipal Corporation')) return { base: v.replace(' Municipal Corporation', ''), kind: 'corporation' };
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
                                    <div key={video.id} className="group relative">
                                        <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                            <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Video thumbnail" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
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

            const mapped: ResultVideo[] = (data as any[])
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
                    return {
                        id: String(row.id),
                        name: (m.name || row.username || 'Participant').toString(),
                        district,
                        panchayath: panch,
                        wardLabel,
                        thumbnailUrl: (m.thumbnailUrl || '/images/girlw.png').toString(),
                        videoUrl: (m.videoUrl || '').toString(),
                    };
                })
                .filter(v => v.videoUrl)
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