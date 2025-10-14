import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Initiative from './components/Initiative';

// Add custom swing animation
const swingStyle = `
    @keyframes swing {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(10deg); }
        100% { transform: rotate(0deg); }
    }
    .swing-animation {
        transform-origin: top center;
        animation: swing 2s ease-in-out infinite;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = swingStyle;
document.head.appendChild(styleSheet);
import OurAims from './components/OurAims';
import Posters from './components/Posters';
import Spotlight from './components/Spotlight';
import Objectives from './components/Objectives';
import Footer from './components/Footer';
import DistrictPage from './components/DistrictPage';
import PdfViewerPage from './components/PdfViewerPage';
import CMSApp from './src/cms/CMSApp';
import { I18nProvider } from './src/cms/lib/i18n';

const Divider: React.FC = () => (
    <div className="px-6 max-w-3xl mx-auto">
        <hr className="border-t border-teal-200"/>
    </div>
);

interface SelectedDistrict {
    name: string;
    imageUrl: string;
}

const MainApp: React.FC = () => {
    const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict | null>(null);
    const [showDistrictsOnHome, setShowDistrictsOnHome] = useState<boolean>(false);

    const handleSelectDistrict = (districtName: string, imageUrl: string) => {
        setSelectedDistrict({ name: districtName, imageUrl });
        // Push a history state so browser back returns here
        try {
            const url = new URL(window.location.href);
            url.hash = `#district=${encodeURIComponent(districtName)}`;
            window.history.pushState({ district: districtName }, '', url.toString());
        } catch (_) {
            // no-op
        }
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    const handleGoHome = () => {
        setSelectedDistrict(null);
        setShowDistrictsOnHome(true);
        try {
            const url = new URL(window.location.href);
            url.hash = '';
            window.history.pushState({ showDistricts: true }, '', url.toString());
        } catch (_) {
            // no-op
        }
        // Scroll to Spotlight grid after returning home
        setTimeout(() => {
            const spotlightEl = document.getElementById('spotlight');
            if (spotlightEl) {
                spotlightEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 0);
    };

    useEffect(() => {
        const onPopState = (ev: PopStateEvent) => {
            const state = ev.state as any;
            if (!state || !state.district) {
                // Return to home view
                setSelectedDistrict(null);
                return;
            }
            // Restore district if needed
            const district = String(state.district);
            if (!selectedDistrict || selectedDistrict.name !== district) {
                setSelectedDistrict({ name: district, imageUrl: '' });
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [selectedDistrict]);

    if (selectedDistrict) {
        return <DistrictPage districtName={selectedDistrict.name} imageUrl={selectedDistrict.imageUrl} onBack={handleGoHome} />;
    }

    return (
        <>
            <Hero />
            <main className="max-w-7xl mx-auto">
                <About />
                <Divider />
                <Initiative />
                <Divider />
                <OurAims />
                <div className="text-center my-8 px-4 sm:px-0">
                    <div className="inline-flex items-center justify-center gap-2 max-w-full flex-shrink-0">
                        <Link 
                            to="/pdfs" 
                            className="text-base sm:text-xl md:text-2xl font-bold text-teal-600 hover:text-teal-800 group relative inline-flex px-4 sm:px-6 py-2 border-2 border-teal-600 rounded-xl transition-all duration-300 hover:border-teal-800 hover:shadow-lg"
                        >
                            <span className="relative whitespace-normal sm:whitespace-nowrap">
                                View LSGD Plans and Reports
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                            </span>
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </Link>
                        <span className="relative flex-shrink-0 flex h-8 w-8 items-center justify-center" style={{perspective: '1000px'}}>
                            <span className="absolute inline-flex h-1 w-1 -top-1 bg-teal-600"></span>
                            <span className="relative inline-flex items-center justify-center h-8 w-8">
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0,0,256,256" className="swing-animation">
                                    <g fill="#4b856cff" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}>
                                        <g transform="scale(5.12,5.12)"><path d="M25,0c-2.20703,0 -4,1.79297 -4,4c0,2.20703 1.79297,4 4,4c2.20703,0 4,-1.79297 4,-4c0,-2.20703 -1.79297,-4 -4,-4zM19.375,6.09375c-4.57031,1.95703 -7.375,6.36328 -7.375,11.90625c0,11 -3.80078,13.76172 -6.0625,15.40625c-1.00391,0.72656 -1.9375,1.40234 -1.9375,2.59375c0,4.20703 6.28125,6 21,6c14.71875,0 21,-1.79297 21,-6c0,-1.19141 -0.93359,-1.86719 -1.9375,-2.59375c-2.26172,-1.64453 -6.0625,-4.40625 -6.0625,-15.40625c0,-5.55859 -2.80078,-9.95312 -7.375,-11.90625c-0.85547,2.27344 -3.05859,3.90625 -5.625,3.90625c-2.56641,0 -4.76953,-1.63672 -5.625,-3.90625zM19,43.875c0,0.03906 0,0.08594 0,0.125c0,3.30859 2.69141,6 6,6c3.30859,0 6,-2.69141 6,-6c0,-0.03906 0,-0.08594 0,-0.125c-1.88281,0.07813 -3.88281,0.125 -6,0.125c-2.11719,0 -4.11719,-0.04687 -6,-0.125z"></path></g>
                                    </g>
                                </svg>
                            </span>
                        </span>
                    </div>
                </div>
                <div id="spotlight">
                    <Spotlight onSelectDistrict={handleSelectDistrict} startInDistricts={showDistrictsOnHome} />
                </div>
                <Posters />
                <Objectives />
            </main>
            <Footer />
        </>
    );
}

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/login/*" element={<I18nProvider><CMSApp /></I18nProvider>} />
                <Route path="/pdfs" element={<I18nProvider><PdfViewerPage /></I18nProvider>} />
            </Routes>
        </Router>
    );
}

export default App;