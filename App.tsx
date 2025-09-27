import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Initiative from './components/Initiative';
import OurAims from './components/OurAims';
import Posters from './components/Posters';
import Spotlight from './components/Spotlight';
import Objectives from './components/Objectives';
import Footer from './components/Footer';
import DistrictPage from './components/DistrictPage';
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
            </Routes>
        </Router>
    );
}

export default App;