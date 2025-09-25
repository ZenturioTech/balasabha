import React, { useState, useRef, useEffect } from 'react';

const spotlightVideos = [
    { seed: 'vid1', name: 'Bhargav S', age: 18, location: 'Cherunniyoor', district: 'Trivandrum' },
    { seed: 'vid2', name: 'Neha N', age: 18, location: 'Cherunniyoor', district: 'Trivandrum' },
    { seed: 'vid3', name: 'Adithya V', age: 17, location: 'Varkala', district: 'Trivandrum' },
    { seed: 'vid4', name: 'Sreya P', age: 16, location: 'Kollam', district: 'Kollam' },
    { seed: 'vid5', name: 'Rahul K', age: 18, location: 'Kottarakkara', district: 'Kollam' },
    { seed: 'vid6', name: 'Anjali M', age: 15, location: 'Chirayinkeezhu', district: 'Trivandrum' },
    { seed: 'vid7', name: 'Vivek G', age: 17, location: 'Neyyattinkara', district: 'Trivandrum' },
    { seed: 'vid8', name: 'Hanna S', age: 16, location: 'Nedumangad', district: 'Trivandrum' },
];

const districts = [
    'Trivandrum', 'Kollam', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Kannur', 'Wayanad', 'Kasaragod', 'Pathanamthitta', 'Urban Localbodies'
];

// A comprehensive list of Kerala's Local Self Government Institutions
const keralaLocations = [
    // Corporations
    'Thiruvananthapuram Corporation', 'Kollam Corporation', 'Kochi Corporation', 'Thrissur Corporation', 'Kozhikode Corporation', 'Kannur Corporation',

    // Municipalities
    'Varkala Municipality', 'Attingal Municipality', 'Nedumangad Municipality', 'Neyyattinkara Municipality', 'Punalur Municipality', 'Paravur Municipality', 'Karunagappally Municipality', 'Kottarakkara Municipality', 'Adoor Municipality', 'Thiruvalla Municipality', 'Pathanamthitta Municipality', 'Alappuzha Municipality', 'Cherthala Municipality', 'Kayamkulam Municipality', 'Mavelikkara Municipality', 'Chengannur Municipality', 'Kottayam Municipality', 'Changanassery Municipality', 'Pala Municipality', 'Vaikom Municipality', 'Thodupuzha Municipality', 'Kattappana Municipality', 'Aluva Municipality', 'Angamaly Municipality', 'Eloor Municipality', 'Kalamassery Municipality', 'Kothamangalam Municipality', 'Maradu Municipality', 'Muvattupuzha Municipality', 'Paravur Municipality', 'Perumbavoor Municipality', 'Thrikkakara Municipality', 'Thrippunithura Municipality', 'Chalakudy Municipality', 'Guruvayur Municipality', 'Irinjalakuda Municipality', 'Kodungallur Municipality', 'Chittur-Thathamangalam Municipality', 'Ottappalam Municipality', 'Palakkad Municipality', 'Shornur Municipality', 'Kondotty Municipality', 'Kottakkal Municipality', 'Malappuram Municipality', 'Manjeri Municipality', 'Nilambur Municipality', 'Perinthalmanna Municipality', 'Ponnani Municipality', 'Tirur Municipality', 'Valanchery Municipality', 'Koyilandy Municipality', 'Vadakara Municipality', 'Payyannur Municipality', 'Taliparamba Municipality', 'Iritty Municipality', 'Mattanur Municipality', 'Anthoor Municipality', 'Panoor Municipality', 'Sreekandapuram Municipality', 'Kuthuparamba Municipality', 'Kalpetta Municipality', 'Mananthavady Municipality', 'Sulthan Bathery Municipality', 'Kanhangad Municipality', 'Kasaragod Municipality', 'Nileshwaram Municipality',

    // Block Panchayats
    'Athiyannur Block Panchayat', 'Chirayinkeezhu Block Panchayat', 'Elakamon Block Panchayat', 'Kilimanoor Block Panchayat', 'Nedumangad Block Panchayat', 'Parassala Block Panchayat', 'Varkala Block Panchayat', 'Anchal Block Panchayat', 'Chavara Block Panchayat', 'Kottarakkara Block Panchayat', 'Oachira Block Panchayat', 'Pathanapuram Block Panchayat', 'Elanthoor Block Panchayat', 'Konni Block Panchayat', 'Mallappally Block Panchayat', 'Pandalam Block Panchayat', 'Ranni Block Panchayat', 'Ambalapuzha Block Panchayat', 'Aryad Block Panchayat', 'Chengannur Block Panchayat', 'Haripad Block Panchayat', 'Mavelikkara Block Panchayat', 'Erattupetta Block Panchayat', 'Ettumanoor Block Panchayat', 'Kaduthurthy Block Panchayat', 'Kanjirappally Block Panchayat', 'Vaikom Block Panchayat', 'Adimaly Block Panchayat', 'Devikulam Block Panchayat', 'Kattappana Block Panchayat', 'Nedumkandam Block Panchayat', 'Thodupuzha Block Panchayat', 'Alangad Block Panchayat', 'Angamaly Block Panchayat', 'Kothamangalam Block Panchayat', 'Muvattupuzha Block Panchayat', 'Parur Block Panchayat', 'Chalakudy Block Panchayat', 'Chavakkad Block Panchayat', 'Kodakara Block Panchayat', 'Mala Block Panchayat', 'Wadakkanchery Block Panchayat', 'Alathur Block Panchayat', 'Chittur Block Panchayat', 'Mannarkkad Block Panchayat', 'Ottappalam Block Panchayat', 'Pattambi Block Panchayat', 'Areacode Block Panchayat', 'Kondotty Block Panchayat', 'Malappuram Block Panchayat', 'Perinthalmanna Block Panchayat', 'Tirur Block Panchayat', 'Balusseri Block Panchayat', 'Koduvally Block Panchayat', 'Kunnamangalam Block Panchayat', 'Perambra Block Panchayat', 'Vadakara Block Panchayat', 'Kalpetta Block Panchayat', 'Mananthavady Block Panchayat', 'Sulthan Bathery Block Panchayat', 'Irikkur Block Panchayat', 'Iritty Block Panchayat', 'Kannur Block Panchayat', 'Payyannur Block Panchayat', 'Taliparamba Block Panchayat', 'Kanhangad Block Panchayat', 'Kasaragod Block Panchayat', 'Manjeshwar Block Panchayat', 'Nileshwaram Block Panchayat',

    // Grama Panchayats
    'Elakamon', 'Edava', 'Chemmaruthy', 'Vettoor', 'Cherunniyoor', 'Manamboor', 'Ottoor', 'Azhoor', 'Kallara', 'Karavaram', 'Vamanapuram', 'Anad', 'Aruvikkara', 'Karakulam', 'Panavoor', 'Poovachal', 'Uzhamalackal', 'Veeranacavu', 'Aryanad', 'Vithura', 'Tholicode', 'Amboori', 'Kunnathukal', 'Parassala', 'Vellarada', 'Kollayil', 'Perumkadavila', 'Poovar',
    'Adichanalloor', 'Chathannoor', 'Kalluvathukkal', 'Poothakkulam', 'Meenad', 'Thrikkovilvattom', 'Alappad', 'Chavara', 'Neendakara', 'Thekkumbhagom', 'Thevalakkara', 'Kulasekharapuram', 'Oachira', 'Thazhava', 'Thodiyoor', 'Clappana', 'Sasthamcotta', 'Sooranad North', 'Sooranad South', 'West Kallada', 'Mynagappally',
    'Pandalam', 'Kodumon', 'Ezhamkulam', 'Kulanada', 'Pallickal', 'Adoor', 'Aranmula', 'Chenneerkara', 'Elanthoor', 'Kozhencherry', 'Mallapuzhassery', 'Mezhuveli', 'Naranganam', 'Omallur', 'Anicadu', 'Kaviyoor', 'Kottanad', 'Kuttoor', 'Thottapuzhassery', 'Eraviperoor',
    'Ambalappuzha', 'Aryad', 'Bharanikkavu', 'Chennithala', 'Cheriyanad', 'Punnapra North', 'Punnapra South', 'Purakkad', 'Thakazhy', 'Thalavady', 'Ramankary', 'Veliyanad', 'Kainakary', 'Nedumudi', 'Muttar', 'Pulinkunnoo', 'Kavalam', 'Neelamperoor',
    'Akalakunnam', 'Athirampuzha', 'Ayarkunnam', 'Ettumanoor', 'Karukachal', 'Aymanam', 'Kumarakom', 'Neendoor', 'Onamthuruthu', 'Thiruvarppu', 'Vijayapuram', 'Thalayazham', 'Thalayolaparambu', 'Vadayar', 'Vechoor', 'Velloor', 'Kallara',
    'Adimali', 'Arakulam', 'Elappara', 'Idukki-Kanjikuzhi', 'Kamakshy', 'Vandiperiyar', 'Bisonvalley', 'Chinnakanal', 'Devikulam', 'Gattuppara', 'Mankulam', 'Marayoor', 'Munnar', 'Vattavada', 'Kanthalloor', 'Pampadumpara', 'Rajakkad', 'Rajakumari', 'Santhanpara', 'Senapathy', 'Udumbanchola',
    'Aikaranad', 'Alangad', 'Amballur', 'Asamannoor', 'Chengamanad', 'Cheranallur', 'Choornikkara', 'Kadamakkudy', 'Kalady', 'Kanjoor', 'Karumalloor', 'Kottuvally', 'Malayattoor-Neeleeswaram', 'Manjapra', 'Nedumbassery', 'Parakkadavu', 'Puthenvelikkara', 'Sreemoolanagaram', 'Thuravoor', 'Vadakkekara', 'Varappuzha',
    'Adat', 'Alagappa Nagar', 'Avinissery', 'Aloor', 'Annamanada', 'Anthikad', 'Chazhoor', 'Manalur', 'Paralam', 'Thanniyam', 'Kadukutty', 'Kodakara', 'Koratty', 'Mattathur', 'Muringoor-Vadakkummuri', 'Pariyaram', 'Pudukkad', 'Varandarappilly',
    'Agali', 'Alanallur', 'Ambalapara', 'Anakkara', 'Ananganadi', 'Chalavara', 'Kappur', 'Koppam', 'Kulukkallur', 'Muthuthala', 'Nagalassey', 'Onallur', 'Parudur', 'Pattithara', 'Thirumittacode', 'Thiruvegappura', 'Thrithala', 'Vaniyamkulam',
    'Abdu Rahiman Nagar', 'Aliparamba', 'Amarambalam', 'Anakkayam', 'Angadippuram', 'Cherukavu', 'Chelembra', 'Edavanna', 'Kavanur', 'Kondotty', 'Kuzhimanna', 'Morayur', 'Muthuvallur', 'Nediyiruppu', 'Pulikkal', 'Vazhakkad', 'Vazhayur',
    'Atholi', 'Arikkulam', 'Avitanallur', 'Azhiyur', 'Balusseri', 'Changaroth', 'Chemancheri', 'Chengottukavu', 'Cheruvannur', 'Eramala', 'Kakkur', 'Karassery', 'Kattippara', 'Kodenchery', 'Kodiyathur', 'Koodaranji', 'Koothali', 'Kottur', 'Kunnamangalam', 'Kuruvattur', 'Mavoor', 'Naduvannur', 'Narikkuni', 'Olavanna', 'Panangad', 'Peruvayal', 'Thamarassery',
    'Ambalavayal', 'Edavaka', 'Kaniyambetta', 'Kottathara', 'Meenangadi', 'Mullenkolly', 'Muttil', 'Nenmeni', 'Noolpuzha', 'Padinharethara', 'Panamaram', 'Poothadi', 'Pozhuthana', 'Pulpally', 'Thariyode', 'Thavinhal', 'Thirunelly', 'Vellamunda', 'Vythiri',
    'Alakode', 'Andoor', 'Anjarakandy', 'Aralam', 'Azhikode', 'Chapparapadavu', 'Cheleri', 'Chengalayi', 'Cherukunnu', 'Cherupuzha', 'Cheruthazham', 'Chokli', 'Dharmadam', 'Eranholi', 'Ezhome', 'Irikkur', 'Kadirur', 'Kalliasseri', 'Kannadiparamba', 'Karivellur-Peralam', 'Kolacheri', 'Kottayam-Malabar', 'Kunhimangalam', 'Kuttiattoor', 'Madayi', 'Malur', 'Maniyoor', 'Mayyil', 'Mokeri', 'Munderi', 'Muzhappilangad', 'Narath', 'New Mahe', 'Padiyoor', 'Panniyannur', 'Panoor', 'Pappinisseri', 'Pariyaram', 'Pattuvam', 'Payam', 'Payyavoor', 'Peralasseri', 'Peringome-Vayakkara', 'Pinarayi', 'Ramanthali', 'Thillankeri', 'Udayagiri', 'Ulikkal', 'Valapattanam', 'Vengad',
    'Ajanur', 'Badiadka', 'Balal', 'Bedadka', 'Bellur', 'Chengala', 'Cheruvathur', 'Delampady', 'East Eleri', 'Enmakaje', 'Ichilangod', 'Karadka', 'Kayyur-Cheemeni', 'Kinanoor-Karindalam', 'Kodom-Belur', 'Kumbadaje', 'Kumbla', 'Kuttikole', 'Madhur', 'Madikai', 'Mangalpady', 'Manjeshwar', 'Meenja', 'Mogral Puthur', 'Muliyar', 'Padne', 'Paivalike', 'Pallikere', 'Panathady', 'Pilicode', 'Puthige', 'Trikarpur', 'Udma', 'Valiyaparamba', 'Vorkady', 'West Eleri'
];

interface SpotlightProps {
    onSelectDistrict: (districtName: string) => void;
}

const Spotlight: React.FC<SpotlightProps> = ({ onSelectDistrict }) => {
    const [showDistricts, setShowDistricts] = useState(false);
    const interactiveSectionRef = useRef<HTMLElement>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const toggleViews = () => {
        setShowDistricts(prevState => !prevState);
        if (interactiveSectionRef.current) {
            interactiveSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const filteredSuggestions = keralaLocations.filter(location =>
                location.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const desktopCols: (typeof spotlightVideos)[] = [[], [], [], []];
    spotlightVideos.forEach((video, index) => {
        desktopCols[index % 4].push(video);
    });
    
    return (
        <section id="interactive-section" ref={interactiveSectionRef} className="pt-8 md:pt-16 pb-8 px-6 text-center">
            {/* Spotlight View */}
            <div id="spotlight-container" className={showDistricts ? 'hidden' : ''}>
                <h2 className="text-3xl md:text-6xl font-bold text-teal-600  mb-12 font-serif">Dream Vibes Spotlight</h2>
                
                <div className="max-w-6xl mx-auto">
                    {/* Mobile & Tablet view - default grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:hidden ">
                        {spotlightVideos.map((video) => (
                            <div key={video.seed} className="group relative">
                                <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                    <img src={`https://picsum.photos/seed/${video.seed}/300/500`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Spotlight video thumbnail" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                    <div className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs bg-black/30 px-2 py-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        <span>{video.district}</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-4 text-white">
                                        <h3 className="font-bold">{video.name}</h3>
                                        <p className="text-xs">Age {video.age}, {video.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Desktop view - staggered columns */}
                    <div className="hidden lg:flex gap-x-6">
                        {desktopCols.map((col, colIndex) => (
                            <div key={colIndex} className={`w-1/4 flex flex-col gap-y-10 ${colIndex % 2 !== 0 ? 'mt-16' : ''}`}>
                                {col.map((video) => (
                                    <div key={video.seed} className="group relative">
                                        <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                            <img src={`https://picsum.photos/seed/${video.seed}/300/500`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Spotlight video thumbnail" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-teal-800/80 via-transparent to-black/20"></div>
                                            <div className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs bg-black/30 px-2 py-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                <span>{video.district}</span>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                                <h3 className="font-bold">{video.name}</h3>
                                                <p className="text-xs">Age {video.age}, {video.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <button id="view-all-btn" onClick={toggleViews} className="mt-16 md:text-3xl text-teal-600 font-bold hover:text-teal-800 transition-colors text-lg">View all</button>
            </div>

            {/* District Search View */}
            <div id="district-search-container" className={!showDistricts ? 'hidden' : ''}>
                <div className="relative max-w-xl mx-auto mb-12" ref={searchContainerRef}>
                     <div className="relative flex items-center w-full">
                        <input 
                            type="text" 
                            placeholder="Search Panchayath/Block/Municipality/Corporation" 
                            className="w-full text-sm sm:text-base pl-4 sm:pl-6 pr-24 sm:pr-32 py-3 sm:py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500 placeholder:text-xs sm:placeholder:text-sm"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onFocus={handleInputChange}
                         />
                        <button className="absolute right-2 bg-teal-500 text-white font-semibold text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-8 rounded-full hover:bg-teal-600 transition-colors shadow-md">Search</button>
                    </div>
                    {suggestions.length > 0 && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                           <ul className="divide-y divide-gray-100">
                                {suggestions.slice(0, 10).map((suggestion, index) => (
                                    <li 
                                        key={index}
                                        className="px-4 py-3 cursor-pointer hover:bg-teal-50 text-left text-gray-700"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
                    {districts.map(district => {
                        const districtName = district.replace('<br>', ' ');
                        const districtSeed = district.replace('<br>', '');
                        return (
                            <div 
                                key={district} 
                                className="group relative aspect-[3/4] rounded-3xl shadow-lg overflow-hidden cursor-pointer text-white font-bold text-sm md:text-lg flex items-end justify-center text-center"
                                onClick={() => onSelectDistrict(districtName)}
                            >
                                <img src={`https://picsum.photos/seed/${districtSeed}/300/400`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt={districtName} />
                                <div className="absolute inset-0 bg-gradient-to-t from-teal-700/80 via-transparent to-transparent"></div>
                                <span className="relative z-10 pb-2 sm:pb-4 px-2" dangerouslySetInnerHTML={{ __html: district }}></span>
                            </div>
                        )
                    })}
                </div>
                <button id="back-to-spotlight-btn" onClick={toggleViews} className="mt-12 text-teal-600 font-bold hover:text-teal-800 transition-colors">{'<< Back to Spotlight'}</button>
            </div>
        </section>
    );
}

export default Spotlight;