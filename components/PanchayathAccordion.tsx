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

    // Modal state for video playback
    const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isModalClosing, setIsModalClosing] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [showSlideHint, setShowSlideHint] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;
        const loadCsv = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if this is Urban Localbodies
                if (districtName === 'Urban Localbodies') {
                    const res = await fetch('/ulb.csv', { cache: 'force-cache' });
                    if (!res.ok) throw new Error('Failed to load ulb.csv');
                    const text = await res.text();
                    const lines = text.split(/\r?\n/).filter(Boolean);
                    // Expect header: SlNo,ULB,ULB Type,District
                    const header = lines.shift() || '';
                    const cols = header.split(',');
                    const ulbIdx = cols.findIndex(c => c.trim().toLowerCase() === 'ulb');
                    const typeIdx = cols.findIndex(c => c.trim().toLowerCase() === 'ulb type');
                    if (ulbIdx === -1 || typeIdx === -1) throw new Error('Invalid ULB CSV format');
                    
                    const ulbSet = new Set<string>();
                    for (const line of lines) {
                        const parts = line.split(',');
                        if (parts.length <= Math.max(ulbIdx, typeIdx)) continue;
                        const ulb = (parts[ulbIdx] || '').trim();
                        const type = (parts[typeIdx] || '').trim();
                        if (!ulb || !type) continue;
                        ulbSet.add(`${ulb} ${type}`);
                    }
                    if (!cancelled) {
                        setBlocks(Array.from(ulbSet).sort());
                    }
                } else {
                    // Regular district - load panchayath.csv
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
                }
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Failed to load data');
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
            name: districtName === 'Urban Localbodies' ? b : `${b} Block Panchayath`, 
            blockName: b,
            videos: [], 
            loading: false, 
            error: null 
        })));
    }, [blocks, districtName]);

    const fetchBlockVideos = async (blockName: string, index: number) => {
        if (items[index]?.videos.length > 0) return; // Already loaded
        
        // Update loading state
        setItems(prev => prev.map((item, i) => 
            i === index ? { ...item, loading: true, error: null } : item
        ));
        
        try {
            let query;
            if (districtName === 'Urban Localbodies') {
                // For ULB entities, filter by municipality name + "ulb" pattern
                let ulbName;
                if (blockName.includes('Municipal Corporation')) {
                    // Remove "Municipal Corporation" (2 words)
                    ulbName = blockName.replace(' Municipal Corporation', '');
                } else if (blockName.includes('Municipality')) {
                    // Remove "Municipality" (1 word)
                    ulbName = blockName.replace(' Municipality', '');
                } else {
                    // Fallback: remove last word
                    ulbName = blockName.split(' ').slice(0, -1).join(' ');
                }
                // Create the ULB pattern: municipality name + "ulb" (e.g., "aluvaulb")
                const ulbPattern = `${ulbName.toLowerCase().replace(/[^a-z0-9]/gi, '')}ulb`;
                console.log('[PanchayathAccordion] ULB filtering:', { blockName, ulbName, ulbPattern });
                query = supabase
                    .from('metadata')
                    .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                    .ilike('block_ulb', `%${ulbPattern}%`)
                    .order('created_at', { ascending: false })
                    .limit(100);
            } else {
                // For regular districts, search by block name
                console.log('[PanchayathAccordion] Block filtering:', { blockName });
                query = supabase
                    .from('metadata')
                    .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                    .or(`metadata->>block.ilike.%${blockName}%,block_ulb.ilike.%${blockName}%`)
                    .order('created_at', { ascending: false })
                    .limit(100);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            console.log('[PanchayathAccordion] Query result:', { 
                districtName, 
                blockName, 
                resultCount: data?.length,
                sampleData: data?.[0] 
            });

            const mapped = (data as any[]).map((row) => {
                const m = row.metadata ?? {};
                const district = (m.district || row.district || '').toString();
                const panch = (m.panchayath || row.panchayath || '').toString();
                const wardRaw = m.ward ?? '';
                const wardLabel = wardRaw ? `Ward ${wardRaw}` : '';
                // Get appropriate thumbnail/display image
                let thumbnailUrl = '/images/girlw.png';
                if (m.mediaType === 'video' && m.thumbnailUrl) {
                    thumbnailUrl = m.thumbnailUrl;
                } else if (m.mediaType === 'image' && m.imageUrl) {
                    thumbnailUrl = m.imageUrl;
                } else if ((m.mediaType === 'story' || m.mediaType === 'poem') && m.storyImages && m.storyImages.length > 0) {
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
                    block_ulb: row.block_ulb || '',
                    imageUrl: m.imageUrl,
                    storyImages: m.storyImages,
                    mediaType: m.mediaType,
                };
            }).filter(v => {
                // Filter out content without any media (video, image, or story)
                const hasVideo = !!v.videoUrl;
                const hasImage = !!v.imageUrl;
                const hasStory = !!(v.storyImages && v.storyImages.length > 0);
                if (!hasVideo && !hasImage && !hasStory) return false;
                
                // For Urban Localbodies, ensure the video actually belongs to the selected ULB
                if (districtName === 'Urban Localbodies') {
                    let ulbName;
                    if (blockName.includes('Municipal Corporation')) {
                        ulbName = blockName.replace(' Municipal Corporation', '');
                    } else if (blockName.includes('Municipality')) {
                        ulbName = blockName.replace(' Municipality', '');
                    } else {
                        ulbName = blockName.split(' ').slice(0, -1).join(' ');
                    }
                    // Create the ULB pattern: municipality name + "ulb" (e.g., "aluvaulb")
                    const ulbPattern = `${ulbName.toLowerCase().replace(/[^a-z0-9]/gi, '')}ulb`;
                    const blockUlb = v.block_ulb?.toLowerCase() || '';
                    const matchesUlb = blockUlb.includes(ulbPattern);
                    console.log('[PanchayathAccordion] ULB match check:', { 
                        ulbName, 
                        ulbPattern,
                        blockUlb, 
                        matchesUlb,
                        videoName: v.name 
                    });
                    return matchesUlb;
                }
                
                return true;
            });

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

    const openModal = (video: any) => {
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

    const closeModal = () => {
        setIsModalClosing(true);
        setCurrentPage(0);
        setShowSlideHint(false);
        window.setTimeout(() => {
            setIsModalOpen(false);
            setSelectedVideo(null);
            setIsModalClosing(false);
        }, 200);
    };

    useEffect(() => {
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

    return (
        <div className="space-y-2">
            {loading && (
                <div className="text-gray-600 text-center py-6">
                    {districtName === 'Urban Localbodies' ? 'Loading Urban Local Bodies...' : 'Loading blocks...'}
                </div>
            )}
            {error && (
                <div className="text-red-600 text-center py-6">{error}</div>
            )}
            {!loading && !error && items.length === 0 && (
                <div className="text-gray-500 text-center py-6">
                    {districtName === 'Urban Localbodies' ? 'No Urban Local Bodies found.' : 'No blocks found for this district.'}
                </div>
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
                                        <div key={video.id} className="group relative" onClick={() => openModal(video)}>
                                            <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg bg-white">
                                                <img 
                                                    src={video.thumbnailUrl} 
                                                    className={`w-full h-full transition-transform duration-300 group-hover:scale-110 ${
                                                        (video.mediaType === 'story' || video.mediaType === 'poem') ? 'object-contain' : 'object-cover'
                                                    }`}
                                                    alt="Video thumbnail" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                                 <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                                        {video.mediaType === 'video' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                                        )}
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
                                <p className="text-gray-500 text-center py-4">
                                    {districtName === 'Urban Localbodies' ? 'No videos available for this Urban Local Body.' : 'No videos available for this block.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        {/* Modal video player */}
        {isModalOpen && selectedVideo && (
            <div 
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-200 ${isModalClosing ? 'bg-black/0' : 'bg-black/70'}`}
                onClick={closeModal}
            >
                <div 
                    className={`bg-white rounded-2xl md:rounded-3xl overflow-hidden max-w-4xl w-full relative transition-all duration-200 ${isModalClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'} h-[80vh] md:h-[90vh] max-h-screen flex flex-col`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button type="button" aria-label="Close" className="absolute z-20 top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl leading-none" onClick={closeModal}>
                        <span className="-mt-px" aria-hidden>×</span>
                    </button>
                    <div className="w-full bg-black flex-1 flex items-center justify-center">
                        {selectedVideo.mediaType === 'video' && (
                            <video controls preload="metadata" poster={selectedVideo.thumbnailUrl} className="w-full h-full object-contain">
                                <source src={selectedVideo.videoUrl} />
                            </video>
                        )}
                        {selectedVideo.mediaType === 'image' && (
                            <img 
                                src={selectedVideo.imageUrl || selectedVideo.thumbnailUrl} 
                                alt={selectedVideo.name}
                                className="w-full h-full object-contain"
                                style={{ 
                                    objectFit: 'contain',
                                    width: '100%',
                                    height: '100%',
                                    maxHeight: '100%'
                                }}
                            />
                        )}
                        {(selectedVideo.mediaType === 'story' || selectedVideo.mediaType === 'poem') && selectedVideo.storyImages && (
                            <div className="relative w-full flex-1 flex items-center justify-center">
                                <img 
                                    key={`${selectedVideo.id}-${currentPage}`}
                                    src={selectedVideo.storyImages[currentPage]?.url || selectedVideo.thumbnailUrl} 
                                    alt={`${selectedVideo.name} - Page ${currentPage + 1}`}
                                    className="w-full h-full object-contain"
                                    style={{ 
                                        objectFit: 'contain',
                                        width: '100%',
                                        height: '100%',
                                        maxHeight: '100%'
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
};

export default PanchayathAccordion;