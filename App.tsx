import React, { useState } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Initiative from './components/Initiative';
import OurAims from './components/OurAims';
import Posters from './components/Posters';
import Spotlight from './components/Spotlight';
import Objectives from './components/Objectives';
import Footer from './components/Footer';
import DistrictPage from './components/DistrictPage';

const Divider: React.FC = () => (
    <div className="px-6 max-w-3xl mx-auto">
        <hr className="border-t border-teal-200"/>
    </div>
);

interface SelectedDistrict {
    name: string;
    imageUrl: string;
}

const App: React.FC = () => {
    const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict | null>(null);

    const handleSelectDistrict = (districtName: string, imageUrl: string) => {
        setSelectedDistrict({ name: districtName, imageUrl });
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    const handleGoHome = () => {
        setSelectedDistrict(null);
    };

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
                <Spotlight onSelectDistrict={handleSelectDistrict} />
                <Posters />
                <Objectives />
            </main>
            <Footer />
        </>
    );
}

export default App;