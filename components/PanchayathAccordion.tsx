import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface PanchayathAccordionProps {
    districtName: string;
}

interface AccordionItem {
    name: string;
    blockName: string;
    videos: any[];
    loading: boolean;
    error: string | null;
}

const PanchayathAccordion: React.FC<PanchayathAccordionProps> = ({ districtName }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [blocks, setBlocks] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const loadCsv = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/panchayath.csv', { cache: 'force-cache' });
                if (!res.ok) throw new Error('Failed to load panchayath.csv');
                const text = await res.text();
                const lines = text.split(/\r?\n/).filter(Boolean);
                // Expect header: no,Panchayaths,Block,District
                const header = lines.shift() || '';
                const cols = header.split(',');
                const districtIdx = cols.findIndex(c => c.trim().toLowerCase() === 'district');
                const blockIdx = cols.findIndex(c => c.trim().toLowerCase() === 'block');
                if (districtIdx === -1 || blockIdx === -1) throw new Error('Invalid CSV format');
                const normalize = (d: string) => {
                    const v = d.trim().toLowerCase();
                    if (v === 'trivandrum') return 'thiruvananthapuram';
                    return v;
                };
                const target = normalize(districtName);
                const blockSet = new Set<string>();
                for (const line of lines) {
                    const parts = line.split(',');
                    if (parts.length <= Math.max(districtIdx, blockIdx)) continue;
                    const district = (parts[districtIdx] || '').trim();
                    const block = (parts[blockIdx] || '').trim();
                    if (!district || !block) continue;
                    if (normalize(district) === target) {
                        blockSet.add(block);
                    }
                }
                if (!cancelled) {
                    setBlocks(Array.from(blockSet).sort());
                }
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Failed to load blocks');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadCsv();
        return () => { cancelled = true; };
    }, [districtName]);

    const [items, setItems] = useState<AccordionItem[]>([]);

    useEffect(() => {
        setItems(blocks.map(b => ({ 
            name: `${b} Block Panchayath`, 
            blockName: b,
            videos: [], 
            loading: false, 
            error: null 
        })));
    }, [blocks]);

    const fetchBlockVideos = async (blockName: string, index: number) => {
        if (items[index]?.videos.length > 0) return; // Already loaded
        
        // Update loading state
        setItems(prev => prev.map((item, i) => 
            i === index ? { ...item, loading: true, error: null } : item
        ));
        
        try {
            const { data, error: fetchError } = await supabase
                .from('metadata')
                .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                .or(`metadata->>block.ilike.%${blockName}%,block_ulb.ilike.%${blockName}%`)
                .order('created_at', { ascending: false })
                .limit(100);

            if (fetchError) throw fetchError;

            const mapped = (data as any[]).map((row) => {
                const m = row.metadata ?? {};
                const district = (m.district || row.district || '').toString();
                const panch = (m.panchayath || row.panchayath || '').toString();
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
            }).filter(v => v.videoUrl);

            // Update the specific item with videos
            setItems(prev => prev.map((item, i) => 
                i === index ? { 
                    ...item, 
                    videos: mapped, 
                    loading: false, 
                    error: null 
                } : item
            ));
        } catch (e: any) {
            setItems(prev => prev.map((item, i) => 
                i === index ? { 
                    ...item, 
                    loading: false, 
                    error: e?.message || 'Failed to load videos' 
                } : item
            ));
        }
    };

    const handleToggle = async (index: number) => {
        const newOpenIndex = openIndex === index ? null : index;
        setOpenIndex(newOpenIndex);
        
        // If opening, fetch videos for this block
        if (newOpenIndex === index) {
            await fetchBlockVideos(items[index].blockName, index);
        }
    };

    return (
        <div className="space-y-2">
            {loading && (
                <div className="text-gray-600 text-center py-6">Loading blocks...</div>
            )}
            {error && (
                <div className="text-red-600 text-center py-6">{error}</div>
            )}
            {!loading && !error && items.length === 0 && (
                <div className="text-gray-500 text-center py-6">No blocks found for this district.</div>
            )}
            {!loading && !error && items.map((item, index) => (
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
                            {item.loading && (
                                <div className="text-gray-600 text-center py-4">Loading videos...</div>
                            )}
                            {item.error && (
                                <div className="text-red-600 text-center py-4">{item.error}</div>
                            )}
                            {!item.loading && !item.error && item.videos.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {item.videos.map(video => (
                                        <div key={video.id} className="group relative">
                                            <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg bg-white">
                                                <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Video thumbnail" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                                 <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 p-3 text-white">
                                                    <h3 className="font-bold text-sm">{video.name}</h3>
                                                    <p className="text-xs">{video.wardLabel}{video.wardLabel ? ', ' : ''}{video.panchayath}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!item.loading && !item.error && item.videos.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No videos available for this block.</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PanchayathAccordion;