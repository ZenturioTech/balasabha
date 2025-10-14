import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useI18n } from '../src/cms/lib/i18n';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfMetadata {
  name: string;
  district: string;
  block: string;
  ulb?: string;
  areaType: 'block' | 'ulb';
  panchayath: string;
  ward: string;
  pdfUrl: string;
  createdAt: string;
}

const PdfViewerPage: React.FC = () => {
  const { t } = useI18n();
  const [pdfs, setPdfs] = useState<PdfMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Function to extract filename from URL
  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return decodeURIComponent(fileName.split('?')[0]); // Remove query parameters if any
    } catch (e) {
      return 'Unknown File';
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPdfs() {
      try {
        const { data, error } = await supabase
          .from('metadata')
          .select('metadata')
          .eq('metadata->>mediaType', 'pdf');

        if (error) {
          throw error;
        }

        if (data) {
          const fetchedPdfs: PdfMetadata[] = data.map((item: any) => item.metadata);
          // Sort PDFs by date, newest first
          const sortedPdfs = fetchedPdfs.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPdfs(sortedPdfs);
        }
      } catch (err: any) {
        console.error('Error fetching PDFs:', err);
        setError(err.message || 'Failed to load PDFs');
      } finally {
        setLoading(false);
      }
    }

    fetchPdfs();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const openPdf = (index: number) => {
    setSelectedIndex(index);
  };

  const closePdf = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedIndex(null);
      setIsClosing(false);
    }, 200);
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < pdfs.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (selectedIndex === null) return;
    
    if (direction === 'left' && selectedIndex < pdfs.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (direction === 'right' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const TouchSwipeHandler = () => {
    const [touchStart, setTouchStart] = useState(0);

    const onTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.touches[0].clientX);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleSwipe('left');
        } else {
          handleSwipe('right');
        }
      }
    };

    return { onTouchStart, onTouchEnd };
  };

  const swipeHandlers = TouchSwipeHandler();
  const currentPdf = selectedIndex !== null ? pdfs[selectedIndex] : null;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading PDFs...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      {/* Header Section with Hero-like styling */}
      <div className="bg-teal-600 text-white py-8 px-4 md:px-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700/50 to-teal-500/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <button 
            onClick={handleBack} 
            className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 border border-white/20"
          >
            ← Back
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold font-serif">
            Notifications from Balasabha
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {pdfs.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-teal-100">
            <p className="text-teal-600 text-lg">No PDFs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {pdfs.map((pdf, index) => (
            <button
              key={index}
              onClick={() => openPdf(index)}
              className="group bg-white rounded-xl border border-teal-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all hover:-translate-y-0.5 overflow-hidden text-left w-full"
            >
              <div className="p-3 sm:p-4 h-full flex flex-col relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-3xl"></div>
                <h2 className="text-sm sm:text-base font-semibold text-teal-700 mb-2 line-clamp-2 relative">
                  {getFileNameFromUrl(pdf.pdfUrl)}
                </h2>
                <div className="space-y-1.5 text-xs sm:text-sm flex-1 relative">
                  {pdf.district && (
                    <p className="text-black"><span className="font-medium text-teal-700">District:</span> {pdf.district}</p>
                  )}
                  {pdf.block && pdf.areaType === 'block' && (
                    <p className="text-black"><span className="font-medium text-teal-700">Block:</span> {pdf.block}</p>
                  )}
                  {pdf.ulb && pdf.areaType === 'ulb' && (
                    <p className="text-black"><span className="font-medium text-teal-700">ULB:</span> {pdf.ulb}</p>
                  )}
                  {pdf.panchayath && pdf.areaType === 'block' && (
                    <p className="text-black"><span className="font-medium text-teal-700">Panchayath:</span> {pdf.panchayath}</p>
                  )}
                  {pdf.ward && (
                    <p className="text-black"><span className="font-medium text-teal-700">Ward:</span> {pdf.ward}</p>
                  )}
                </div>
                <p className="text-xs text-black mt-3 pt-2 border-t border-teal-100">
                  {new Date(pdf.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>

{/* PDF Modal */}
      {currentPdf && selectedIndex !== null && (
        <div 
          className={`fixed inset-0 z-50 flex items-end md:items-center justify-center transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={closePdf}
        >
          <div className={`fixed inset-0 bg-teal-950/75 backdrop-blur-sm transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`} aria-hidden="true" />
          <div 
            className={`relative bg-gradient-to-b from-white to-teal-50/50 w-full h-[90vh] md:h-[85vh] md:max-w-4xl md:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl transform transition-all duration-200 ${
              isClosing
                ? 'translate-y-full md:translate-y-12 opacity-0 scale-95'
                : 'translate-y-0 opacity-100 scale-100'
            }`}
            onClick={(e) => e.stopPropagation()}
            {...swipeHandlers}>

            {/* Header */}
            <div className="flex items-center justify-between p-1 md:p-1 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={closePdf}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
                <h2 className="text-sm md:text-base font-medium text-gray-700 truncate pr-4">
                  {getFileNameFromUrl(currentPdf.pdfUrl)}
                </h2>
              </div>
            </div>

            {/* PDF Display Area */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-3 md:p-6 bg-gradient-to-br from-teal-50/30 to-transparent">
              <iframe
                src={`${currentPdf.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full rounded-lg shadow-md"
                title={getFileNameFromUrl(currentPdf.pdfUrl)}
              />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <button
                onClick={goToPrevious}
                disabled={selectedIndex === 0}
                className="p-2 md:p-3 bg-teal-50 hover:bg-teal-100 disabled:bg-teal-50/50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-teal-600" />
              </button>

              <span className="text-sm md:text-base text-teal-600 font-medium">
                {selectedIndex + 1} / {pdfs.length}
              </span>

              <button
                onClick={goToNext}
                disabled={selectedIndex === pdfs.length - 1}
                className="p-2 md:p-3 bg-teal-50 hover:bg-teal-100 disabled:bg-teal-50/50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-teal-600" />
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-teal-100 bg-gradient-to-r from-teal-50 to-white px-4 md:px-6 py-4 md:py-5">
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
                <div>
                  <p className="text-black text-xs md:text-sm">Uploader</p>
                  <p className="font-semibold text-teal-700 text-sm md:text-base line-clamp-1">
                    {currentPdf.name}
                  </p>
                </div>
                <div>
                  <p className="text-black text-xs md:text-sm">
                    {currentPdf.areaType === 'block' ? 'Block' : 'ULB'}
                  </p>
                  <p className="font-semibold text-black text-sm md:text-base line-clamp-1">
                    {currentPdf.areaType === 'block' ? currentPdf.block : currentPdf.ulb}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewerPage;