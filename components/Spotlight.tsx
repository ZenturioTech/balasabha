import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

type RawMetadata = {
    name?: string;
    district?: string;
    block?: string;
    panchayath?: string;
    ward?: string | number;
    mediaType?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    createdAt?: string;
};

type MetadataRow = {
    id: number;
    created_at: string;
    metadata: RawMetadata | null;
    district: string | null;
    username: string | null;
    block_ulb: string | null;
    panchayath: string | null;
};

type SpotlightVideo = {
    id: string;
    name: string;
    district: string;
    panchayath: string;
    wardLabel: string;
    thumbnailUrl: string;
    videoUrl: string;
};

const MOBILE_TILE_COUNT = 8;
const DESKTOP_TILE_COUNT = 8;

const districts = [
    'Trivandrum', 'Kollam', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Kannur', 'Wayanad', 'Kasaragod', 'Pathanamthitta', 'Urban Localbodies'
];

const districtImages = [
    '/images/sree-padmanabhaswamy.jpg',      // Trivandrum
    '/images/kollam.jpg',          // Kollam
    '/images/ambalapuzha-sree-krishna.jpg',       // Alappuzha
    '/images/scenic-paradise.jpg',        // Kottayam
    '/images/ajin.jpg',          // Idukki
    '/images/ekm.jpg',       // Ernakulam
    '/images/Kudamatom_at_thrissur_pooram.webp',        // Thrissur
    '/images/malampuzha-garden-and.jpg',        // Palakkad
    '/images/thirumandhamkunnu-bhagavathy.jpg',      // Malappuram
    '/images/caption.jpg',       // Kozhikode
    '/images/Kandanar_Kelan_Theyyam_kannur.jpg',          // Kannur
    '/images/edakkal-caves.jpg',         // Wayanad
    '/images/bekal-fort.jpg',       // Kasaragod
    '/images/photo8jpg.jpg',  // Pathanamthitta
    '/images/INS_Vikrant_under_construction_at_Cochin_Shipyard.png'            // Urban Localbodies
];

// A comprehensive list of Kerala's Local Self Government Institutions
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
    'Pala Municipality',
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
    'Guruvayur Municipality',
    'Irinjalakuda Municipality',
    'Kodungallur Municipality',
    'Chittur-Thathamangalam Municipality',
    'Ottappalam Municipality',
    'Palakkad Municipality',
    'Shornur Municipality',
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
    'Mattanur Municipality',
    'Anthoor Municipality',
    'Panoor Municipality',
    'Sreekandapuram Municipality',
    'Kuthuparamba Municipality',
    'Kalpetta Municipality',
    'Mananthavady Municipality',
    'Sulthan Bathery Municipality',
    'Kanhangad Municipality',
    'Kasaragod Municipality',
    'Nileshwaram Municipality',
    // Block Panchayats
    'Adimaly Block Panchayat',
    'Alangad Block Panchayat',
    'Alathur Block Panchayat',
    'Ambalappuzha Block Panchayat',
    'Anchal Block Panchayat',
    'Angamaly Block Panchayat',
    'Anthikad Block Panchayat',
    'Areacode Block Panchayat',
    'Aryad Block Panchayat',
    'Athiyannoor Block Panchayat',
    'Attappady Block Panchayat',
    'Azhutha Block Panchayat',
    'Balussery Block Panchayat',
    'Bharanickavu Block Panchayat',
    'Block Name Block Panchayat',
    'Chadayamangalam Block Panchayat',
    'Chalakudy Block Panchayat',
    'Champakulam Block Panchayat',
    'Chavakkad Block Panchayat',
    'Chavara Block Panchayat',
    'Chelannur Block Panchayat',
    'Chengannur Block Panchayat',
    'Cherpu Block Panchayat',
    'Chirayinkeezhu Block Panchayat',
    'Chittumala Block Panchayat',
    'Chittur Block Panchayat',
    'Chowannur Block Panchayat',
    'Devikulam Block Panchayat',
    'Edakkad Block Panchayat',
    'Edappally Block Panchayat',
    'Elanthoor Block Panchayat',
    'Elemdesam Block Panchayat',
    'Erattupetta Block Panchayat',
    'Ettumanoor Block Panchayat',
    'Haripad Block Panchayat',
    'Idukki Block Panchayat',
    'Irikkur Block Panchayat',
    'Irinjalakuda Block Panchayat',
    'Iritty Block Panchayat',
    'Ithikkara Block Panchayat',
    'Kaduthuruthy Block Panchayat',
    'Kalikavu Block Panchayat',
    'Kalliasseri Block Panchayat',
    'Kalpetta Block Panchayat',
    'Kanhangad Block Panchayat',
    'Kanjikuzhy Block Panchayat',
    'Kanjirappally Block Panchayat',
    'Kannur Block Panchayat',
    'Karadka Block Panchayat',
    'Kasaragod Block Panchayat',
    'Kattappana Block Panchayat',
    'Kilimanoor Block Panchayat',
    'Kodakara Block Panchayat',
    'Koduvally Block Panchayat',
    'Koipuram Block Panchayat',
    'Kollengode Block Panchayat',
    'Kondotty Block Panchayat',
    'Konni Block Panchayat',
    'Koovappady Block Panchayat',
    'Kothamangalam Block Panchayat',
    'Kottarakara Block Panchayat',
    'Kozhikkode Block Panchayat',
    'Kunnamangalam Block Panchayat',
    'Kunnummal Block Panchayat',
    'Kuthuparamba Block Panchayat',
    'Kuttippuram Block Panchayat',
    'Kuzhalmannam Block Panchayat',
    'Lalam Block Panchayat',
    'Madappally Block Panchayat',
    'Mala Block Panchayat',
    'Malampuzha Block Panchayat',
    'Malappuram Block Panchayat',
    'Mallappally Block Panchayat',
    'Mananthavady Block Panchayat',
    'Manjesaram Block Panchayat',
    'Mankada Block Panchayat',
    'Mannarkad Block Panchayat',
    'Mathilakam Block Panchayat',
    'Mavelikara Block Panchayat',
    'Melady Block Panchayat',
    'Mukhathala Block Panchayat',
    'Mulanthuruthy Block Panchayat',
    'Mullassery Block Panchayat',
    'Muthukulam Block Panchayat',
    'Muvattupuzha Block Panchayat',
    'Nedumangad Block Panchayat',
    'Nedumkandam Block Panchayat',
    'Nemmara Block Panchayat',
    'Nemom Block Panchayat',
    'Nilambur Block Panchayat',
    'Nileswaram Block Panchayat',
    'Oachira Block Panchayat',
    'Ollukkara Block Panchayat',
    'Ottapalam Block Panchayat',
    'Palakkad Block Panchayat',
    'Pallom Block Panchayat',
    'Palluruthy Block Panchayat',
    'Pampady Block Panchayat',
    'Pampakuda Block Panchayat',
    'Panamaram Block Panchayat',
    'Pandalam Block Panchayat',
    'Panoor Block Panchayat',
    'Panthalayani Block Panchayat',
    'Parakkadavu Block Panchayat',
    'Parakkode Block Panchayat',
    'Parappa Block Panchayat',
    'Parassala Block Panchayat',
    'Paravur Block Panchayat',
    'Pathanapuram Block Panchayat',
    'Pattambi Block Panchayat',
    'Pattanakkad Block Panchayat',
    'Payyannur Block Panchayat',
    'Pazhayannur Block Panchayat',
    'Perambra Block Panchayat',
    'Peravoor Block Panchayat',
    'Perinthalmanna Block Panchayat',
    'Perumkadavila Block Panchayat',
    'Perumpadappa Block Panchayat',
    'Ponnani Block Panchayat',
    'Pothencode Block Panchayat',
    'Pulikeezhu Block Panchayat',
    'Puzhakkal Block Panchayat',
    'Ranni Block Panchayat',
    'Sasthamcotta Block Panchayat',
    'Sreekrishnapuram Block Panchayat',
    'Sulthan Bathery Block Panchayat',
    'Tanur Block Panchayat',
    'Thalassery Block Panchayat',
    'Thalikulam Block Panchayat',
    'Thalipparamba Block Panchayat',
    'Thodannur Block Panchayat',
    'Thodupuzha Block Panchayat',
    'Thycattussery Block Panchayat',
    'Tirur Block Panchayat',
    'Tirurangadi Block Panchayat',
    'Trithala Block Panchayat',
    'Tuneri Block Panchayat',
    'Uzhavoor Block Panchayat',
    'Vadavucode Block Panchayat',
    'Vaikom Block Panchayat',
    'Vamanapuram Block Panchayat',
    'Varkala Block Panchayat',
    'Vatakara Block Panchayat',
    'Vazhakulam Block Panchayat',
    'Vazhoor Block Panchayat',
    'Veliyanad Block Panchayat',
    'Vellanad Block Panchayat',
    'Vellangallur Block Panchayat',
    'Vengara Block Panchayat',
    'Vettikavala Block Panchayat',
    'Vypin Block Panchayat',
    'Wadakanchery Block Panchayat',
    'Wandoor Block Panchayat',
    // Panchayaths
    'Abdurahiman Nagar',
    'Adat',
    'Adichanalloor',
    'Adimaly',
    'Agali',
    'Aikaranad',
    'Ajanur',
    'Akalakunnam',
    'Akathethara',
    'Ala',
    'Alagappanagar',
    'Alakode',
    'Alamkode',
    'Alanallur',
    'Alangad',
    'Alappad',
    'Alathur',
    'Alayamon',
    'Aliparamba',
    'Aloor',
    'Amarambalam',
    'Ambalappara',
    'Ambalappuzha North',
    'Ambalappuzha South',
    'Ambalavayal',
    'Amballoor',
    'Amboori',
    'Anad',
    'Anakkara',
    'Anakkayam',
    'Ananganadi',
    'Anchal',
    'Anchuthengu',
    'Andoorkonam',
    'Angadippuram',
    'Anicadu',
    'Anjarakandy',
    'Annamanada',
    'Anthikad',
    'Arakulam',
    'Arakuzha',
    'Aralam',
    'Aranmula',
    'Arattupuzha',
    'Areacode',
    'Arikkulam',
    'Arimpur',
    'Arookutty',
    'Aroor',
    'Arpookara',
    'Aruvappulam',
    'Aruvikkara',
    'Aryad',
    'Aryanad',
    'Aryancode',
    'Aryankavu',
    'Asamannoor',
    'Athavanad',
    'Athirampuzha',
    'Athirappilly',
    'Athiyannoor',
    'Atholi',
    'Avanur',
    'Avinissery',
    'Avoly',
    'Ayalur',
    'Ayancheri',
    'Ayarkunnam',
    'Ayavana',
    'Aymanam',
    'Ayroor',
    'Ayyampuzha',
    'Ayyankunnu',
    'Ayyappan Coil',
    'Azhikode',
    'Azhiyur',
    'Azhoor',
    'Badiadka',
    'Balal',
    'Balaramapuram',
    'Balussery',
    'Bedadka',
    'Bellur',
    'Bharananganam',
    'Bharanickavu',
    'Bisonvalley',
    'Budhanoor',
    'Chadayamangalam',
    'Chakkittapara',
    'Chakkupallam',
    'Chalavara',
    'Chalissery',
    'Chaliyar',
    'Champakulam',
    'Changaroth',
    'Chapparapadava',
    'Chathamangalam',
    'Chathannoor',
    'Chavara',
    'Chazhur',
    'Cheacode',
    'Chekkiad',
    'Chelakkara',
    'Chelannur',
    'Chelembra',
    'Chellanam',
    'Chemanchery',
    'Chembilode',
    'Chemmaruthy',
    'Chemnad',
    'Chempu',
    'Chendamangalam',
    'Chengala',
    'Chengalayi',
    'Chengamanad',
    'Chengottukavu',
    'Chenkal',
    'Chennam Pallippuram',
    'Chenneerkara',
    'Chennithala-Thripperumthura',
    'Cheppad',
    'Cheranalloor',
    'Cheriyamundam',
    'Cheriyanad',
    'Cherpu',
    'Cherthala South',
    'Cherukavu',
    'Cherukole',
    'Cherukunnu',
    'Cherunniyoor',
    'Cherupuzha',
    'Cheruthana',
    'Cheruthazham',
    'Cheruvannur',
    'Cheruvathur',
    'Chettikulangara',
    'Chingoli',
    'Chinnakanal',
    'Chirakkadavu',
    'Chirakkal',
    'Chirakkara',
    'Chirayinkeezhu',
    'Chithara',
    'Chittar',
    'Chittariparamba',
    'Chittattukara',
    'Chokkad',
    'Chokli',
    'Choondal',
    'Choornikkara',
    'Chorode',
    'Chottanikkara',
    'Chowannur',
    'Chunakara',
    'Chungathara',
    'Clappana',
    'Delampady',
    'Desamangalam',
    'Devikulam',
    'Devikulangara',
    'Dharmadam',
    'East Eleri',
    'East Kallada',
    'Edacheri',
    'Edakkara',
    'Edakkattuvayal',
    'Edamalakudi',
    'Edamulackal',
    'Edapal',
    'Edappatta',
    'Edarikode',
    'Edathala',
    'Edathiruthy',
    'Edathua',
    'Edava',
    'Edavaka',
    'Edavanakkad',
    'Edavanna',
    'Edavetty',
    'Edavilangu',
    'Edayur',
    'Elakamon',
    'Elamadu',
    'Elamkulam',
    'Elampalloor',
    'Elanji',
    'Elankunnapuzha',
    'Elanthoor',
    'Elappara',
    'Elappully',
    'Elavally',
    'Elavancherry',
    'Elikulam',
    'Enadimangalam',
    'Engandiyur',
    'Enmakaje',
    'Eramala',
    'Eramam Kuttur',
    'Eranholi',
    'Erathu',
    'Erattayar',
    'Eraviperoor',
    'Erimayur',
    'Eriyad',
    'Erumapetty',
    'Erumeli',
    'Eruthenpathy',
    'Eruvessy',
    'Ezhamkulam',
    'Ezhikkara',
    'Ezhome',
    'Ezhukone',
    'Ezhumattoor',
    'Ezhupunna',
    'Idukki Kanjikuzhy',
    'Irikkur',
    'Irimbiliyam',
    'Ittiva',
    'Kadakkal',
    'Kadakkarappally',
    'Kadakkavoor',
    'Kadalundi',
    'Kadamakudy',
    'Kadambur',
    'Kadampanad',
    'Kadampazhipuram',
    'Kadanad',
    'Kadangode',
    'Kadannappally Panapuzha',
    'Kadaplamattom',
    'Kadappuram',
    'Kadapra',
    'Kadavallur',
    'Kadinamkulam',
    'Kadirur',
    'Kadukutty',
    'Kadungalloor',
    'Kaduthuruthy',
    'Kainakary',
    'Kaipamangalam',
    'Kaiparambu',
    'Kakkodi',
    'Kakkur',
    'Kaladi',
    'Kalady',
    'Kalanjoor',
    'Kalikavu',
    'Kallar',
    'Kallara',
    'Kalliasseri',
    'Kallikkadu',
    'Kalliyoor',
    'Kallooppara',
    'Kalloorkad',
    'Kalluvathukkal',
    'Kalpakanchery',
    'Kamakshy',
    'Kanakkary',
    'Kanchiyar',
    'Kandalloor',
    'Kandanassery',
    'Kangazha',
    'Kanhirapuzha',
    'Kanichar',
    'Kaniyambetta',
    'Kanjikuzhy',
    'Kanjiramkulam',
    'Kanjirappally',
    'Kanjoor',
    'Kankol - Alappadamba',
    'Kannadi',
    'Kannamangalam',
    'Kannambra',
    'Kannapuram',
    'Kanthalloor',
    'Kappur',
    'Karadka',
    'Karakulam',
    'Karakurussi',
    'Karalam',
    'Karassery',
    'Karavaloor',
    'Karavaram',
    'Kareepra',
    'Karimannoor',
    'Karimba',
    'Karimkunnam',
    'Karimpuzha',
    'Karivellur Peralam',
    'Karode',
    'Karoor',
    'Karthikappally',
    'Karukachal',
    'Karukutty',
    'Karulai',
    'Karumallur',
    'Karumkulam',
    'Karunapuram',
    'Karuvarakundu',
    'Karuvatta',
    'Kattakada',
    'Kattakampal',
    'Kattippara',
    'Kattoor',
    'Kavalam',
    'Kavalangad',
    'Kavanur',
    'Kavassery',
    'Kavilumpara',
    'Kaviyoor',
    'Kayakkody',
    'Kayanna',
    'Kayyur Cheemeni',
    'Keerampara',
    'Keezhallur',
    'Keezhariyur',
    'Keezhattur',
    'Keezhmad',
    'Keezhuparamba',
    'Kelakam',
    'Keralassery',
    'Kidangoor',
    'Kilimanoor',
    'Kinanoor - Karinthalam',
    'Kizhakkambalam',
    'Kizhakkencherry',
    'Kizhakkoth',
    'Kizhuvilam',
    'Kodakara',
    'Kodamthuruth',
    'Kodanchery',
    'Kodassery',
    'Kodikulam',
    'Kodiyathur',
    'Kodom Belur',
    'Kodumbu',
    'Kodumon',
    'Kodur',
    'Koduvayur',
    'Koipuram',
    'Kokkayar',
    'Kolachery',
    'Kolayad',
    'Kolazhy',
    'Kollayil',
    'Kollengode',
    'Kondazhy',
    'Kongad',
    'Konnathady',
    'Konni',
    'Koodali',
    'Koodaranhi',
    'Koorachundu',
    'Kooroppada',
    'Koothali',
    'Koottickal',
    'Koottilangadi',
    'Koovappady',
    'Koppam',
    'Koratty',
    'Koruthodu',
    'Kottamkara',
    'Kottanad',
    'Kottangal',
    'Kottappady',
    'Kottathara',
    'Kottayam',
    'Kottayi',
    'Kottiyoor',
    'Kottopadam',
    'Kottukal',
    'Kottur',
    'Kottuvally',
    'Kozhencherry',
    'Kozhinjampara',
    'Kozhuvanal',
    'Krishnapuram',
    'Kudayathoor',
    'Kulakkada',
    'Kulanada',
    'Kulasekharapuram',
    'Kulathoor',
    'Kulathupuzha',
    'Kulukkallur',
    'Kumarakam',
    'Kumaramangalam',
    'Kumaramputhur',
    'Kumarapuram',
    'Kumbadaje',
    'Kumbalam',
    'Kumbalanghi',
    'Kumbla',
    'Kumily',
    'Kummil',
    'Kundara',
    'Kunhimangalam',
    'Kunnamangalam',
    'Kunnamthanam',
    'Kunnathoor',
    'Kunnathukal',
    'Kunnathunad',
    'Kunnothuparamba',
    'Kunnukara',
    'Kunnummal',
    'Kuravilangad',
    'Kurichy',
    'Kurumathur',
    'Kuruva',
    'Kuruvattoor',
    'Kuthanur',
    'Kuthiathod',
    'Kuttampuzha',
    'Kuttiadi',
    'Kuttiattoor',
    'Kuttichal',
    'Kuttikol',
    'Kuttipuram',
    'Kuttoor',
    'Kuzhalmannam',
    'Kuzhimanna',
    'Kuzhuppilly',
    'Kuzhur',
    'LB',
    'Lakkidi - Perur',
    'Madakkathara',
    'Madappally',
    'Madavoor',
    'Madayi',
    'Madhur',
    'Madikai',
    'Makkaraparamba',
    'Mala',
    'Malampuzha',
    'Malappattam',
    'Malayalapuzha',
    'Malayattoor Neeleeswaram',
    'Malayinkeezh',
    'Mallappally',
    'Mallappuzhassery',
    'Malur',
    'Mampad',
    'Manakkad',
    'Manalur',
    'Manamboor',
    'Manarcad',
    'Maneed',
    'Mangalam',
    'Mangalapuram',
    'Mangalpady',
    'Mangattidam',
    'Manickal',
    'Manimala',
    'Maniyur',
    'Manjalloor',
    'Manjapra',
    'Manjeshwar',
    'Manjoor',
    'Mankada',
    'Mankara',
    'Mankulam',
    'Mannancherry',
    'Mannar',
    'Mannur',
    'Marady',
    'Marakkara',
    'Maranalloor',
    'Maranchery',
    'Marangattupilly',
    'Mararikulam North',
    'Mararikulam South',
    'Maravanthuruthu',
    'Marayoor',
    'Mariyapuram',
    'Marutharode',
    'Maruthonkara',
    'Mathilakam',
    'Mathur',
    'Mattathur',
    'Mattool',
    'Mavelikara Thamarakulam',
    'Mavelikara Thekkekara',
    'Mavoor',
    'Mayyanad',
    'Mayyil',
    'Mazhuvannoor',
    'Meenachil',
    'Meenadom',
    'Meenangadi',
    'Meenja',
    'Melarcode',
    'Melattur',
    'Melila',
    'Meloor',
    'Melukavu',
    'Meppadi',
    'Meppayur',
    'Mezhuveli',
    'Mogral Puthur',
    'Mokeri',
    'Moodadi',
    'Mookkannur',
    'Moonnilavu',
    'Moonniyur',
    'Moorkkanad',
    'Moothedam',
    'Morayur',
    'Mudakkal',
    'Mudakuzha',
    'Muhamma',
    'Mulakulam',
    'Mulakunnathukavu',
    'Mulakuzha',
    'Mulanthuruthy',
    'Mulavukad',
    'Muliyar',
    'Mullankolly',
    'Mullassery',
    'Mullurkara',
    'Mundakayam',
    'Munderi',
    'Mundur',
    'Munnar',
    'Munroethuruth',
    'Muppainad',
    'Muriyad',
    'Muthalamada',
    'Mutholy',
    'Muthukulam',
    'Muthuthala',
    'Muthuvalloor',
    'Muttar',
    'Muttil',
    'Muttom',
    'Muzhakkunnu',
    'Muzhappilangad',
    'Mylapra',
    'Mylom',
    'Mynagappally',
    'Nadapuram',
    'Nadathara',
    'Naduvannur',
    'Naduvil',
    'Nagalassery',
    'Nagaroor',
    'Nallepilly',
    'Nanminda',
    'Nannambra',
    'Nannammukku',
    'Nanniyode',
    'Narakal',
    'Naranammoozhy',
    'Naranganam',
    'Narath',
    'Narikunni',
    'Narippatta',
    'Nattika',
    'Navaikulam',
    'Nayarambalam',
    'Nedumbassery',
    'Nedumkandam',
    'Nedumkunnam',
    'Nedumpana',
    'Nedumpuram',
    'Nedumudi',
    'Neduvathoor',
    'Neelamperoor',
    'Neendakara',
    'Neendoor',
    'Neezhoor',
    'Nellanad',
    'Nellaya',
    'Nellikuzhi',
    'Nelliyampathy',
    'Nemmara',
    'Nenmanikkara',
    'Nenmeni',
    'New Mahe',
    'Nilamel',
    'Niramaruthur',
    'Niranam',
    'Nochad',
    'Noolpuzha',
    'Nooranad',
    'Oachira',
    'Okkal',
    'Olavanna',
    'Omalloor',
    'Omassery',
    'Onchiyam',
    'Ongallur',
    'Oorakam',
    'Orumanayur',
    'Othukkungal',
    'Ottasekharamangalam',
    'Ottoor',
    'Ozhur',
    'Padinharathara',
    'Padiyoor',
    'Padiyur',
    'Padne',
    'Paingottoor',
    'Paippad',
    'Paipra',
    'Paivalike',
    'Palakuzha',
    'Palamel',
    'Pallarimangalam',
    'Pallassana',
    'Pallichal',
    'Pallickal',
    'Pallikere',
    'Pallikkal',
    'Pallikkathode',
    'Pallippad',
    'Pallippuram',
    'Pallivasal',
    'Pampadumpara',
    'Pampady',
    'Pampakuda',
    'Panachikkad',
    'Panamaram',
    'Pananchery',
    'Panangad',
    'Panathady',
    'Panavally',
    'Panavoor',
    'Panayam',
    'Pandalam Thekkekara',
    'Pandanad',
    'Pandikkad',
    'Pangode',
    'Panjal',
    'Panmana',
    'Panniyannur',
    'Pappinisseri',
    'Parakkadavu',
    'Paralam',
    'Parali',
    'Parappukkara',
    'Parappur',
    'Parassala',
    'Parathodu',
    'Pariyaram',
    'Paruthur',
    'Pathanapuram',
    'Pathiyoor',
    'Pattanakkad',
    'Pattanchery',
    'Pattazhi',
    'Pattazhi Vadakkekara',
    'Pattiam',
    'Pattithara',
    'Pattuvam',
    'Pavaratty',
    'Pavithreswaram',
    'Payam',
    'Payyavoor',
    'Pazhayakunnumel',
    'Pazhayannur',
    'Peermade',
    'Peralassery',
    'Perambra',
    'Peravoor',
    'Perayam',
    'Perinad',
    'Peringammala',
    'Peringara',
    'Peringome Vayakkara',
    'Peringottukurissi',
    'Perinjanam',
    'Perumanna',
    'Perumanna Klari',
    'Perumatty',
    'Perumkadavila',
    'Perumpadappa',
    'Perumpalam',
    'Peruvalloor',
    'Peruvanthanam',
    'Peruvayal',
    'Peruvemba',
    'Pilicode',
    'Pinarayi',
    'Pindimana',
    'Piravanthoor',
    'Pirayiri',
    'Polpully',
    'Ponmala',
    'Ponmundam',
    'Pookkottukavu',
    'Pookkottur',
    'Poomangalam',
    'Poonjar',
    'Poonjar Thekkekara',
    'Poothadi',
    'Poothakulam',
    'Poothrikka',
    'Poovachal',
    'Poovar',
    'Pooyappally',
    'Porkulam',
    'Porur',
    'Poruvazhy',
    'Pothanicad',
    'Pothencode',
    'Pothukallu',
    'Poyya',
    'Pozhuthana',
    'Pramadom',
    'Puducode',
    'Pudukad',
    'Pudunagaram',
    'Puduppady',
    'Puduppariyaram',
    'Pudur',
    'Pudusseri',
    'Pulamanthole',
    'Pulikkal',
    'Pulimath',
    'Pulincunnoo',
    'Puliyoor',
    'Pullampara',
    'Pullur Periya',
    'Pulpally',
    'Pulpatta',
    'Punnapra North',
    'Punnapra South',
    'Punnayur',
    'Punnayurkulam',
    'Purakkad',
    'Puramattom',
    'Purameri',
    'Purapuzha',
    'Purathur',
    'Puthenchira',
    'Puthenvelikkara',
    'Puthige',
    'Puthuppally',
    'Puthur',
    'Puzhakkattiri',
    'Rajakkad',
    'Rajakumary',
    'Ramamangalam',
    'Ramankary',
    'Ramanthali',
    'Ramapuram',
    'Ranni',
    'Ranni Angadi',
    'Ranni Pazhavangadi',
    'Ranni Perunadu',
    'Rayamangalam',
    'Santhanpara',
    'Sasthamcotta',
    'Seethathodu',
    'Senapathy',
    'Sholayoor',
    'Sooranad North',
    'Sooranad South',
    'Sreekrishnapuram',
    'Sreemoolanagaram',
    'Sreenarayanapuram',
    'TV Puram',
    'Tachampara',
    'Tanalur',
    'Tarur',
    'Tavanur',
    'Teekoy',
    'Thachanattukara',
    'Thakazhy',
    'Thalakkad',
    'Thalakulathur',
    'Thalanad',
    'Thalappalam',
    'Thalavady',
    'Thalavoor',
    'Thalayazham',
    'Thalayolaparambu',
    'Thalikulam',
    'Thamarassery',
    'Thanneermukkom',
    'Thannithodu',
    'Thanniyam',
    'Thariode',
    'Thavinhal',
    'Thazhakara',
    'Thazhava',
    'Thazhekkode',
    'Thekkumbhagom',
    'Thekkumkara',
    'Thenhipalam',
    'Thenkara',
    'Thenkurissi',
    'Thenmala',
    'Thennala',
    'Thevalakkara',
    'Thidanad',
    'Thikkodi',
    'Thillankery',
    'Thirumarady',
    'Thirumittacode',
    'Thirunavaya',
    'Thirunelly',
    'Thirupuram',
    'Thiruvali',
    'Thiruvallur',
    'Thiruvambadi',
    'Thiruvaniyoor',
    'Thiruvanvandoor',
    'Thiruvarppu',
    'Thiruvegappura',
    'Thiruvilwamala',
    'Thodiyoor',
    'Tholicode',
    'Tholur',
    'Thondernad',
    'Thottappuzhassery',
    'Thrickodithanam',
    'Thrikkalangodu',
    'Thrikkaruva',
    'Thrikkovilvattom',
    'Thrikkunnappuzha',
    'Thrikkur',
    'Thumpamon',
    'Thuravoor',
    'Thurayur',
    'Thycattussery',
    'Trikarpur',
    'Trikkaderi',
    'Triprangode',
    'Triprangottoor',
    'Trithala',
    'Tuneri',
    'Tuvvur',
    'Udayagiri',
    'Udayamperoor',
    'Udayanapuram',
    'Udma',
    'Udumbanchola',
    'Udumbanoor',
    'Ulikkal',
    'Ulliyeri',
    'Ummannoor',
    'Unnikulum',
    'Upputhara',
    'Urangattiri',
    'Uzhamalakkal',
    'Uzhavoor',
    'Vadakarapathy',
    'Vadakkekkad',
    'Vadakkekkara',
    'Vadakkenchery',
    'Vadaserikara',
    'Vadavannur',
    'Vadavucode Puthencruz',
    'Vakathanam',
    'Vakkom',
    'Valakom',
    'Valapad',
    'Valapattanam',
    'Valavannur',
    'Valayam',
    'Valiyaparamba',
    'Vallachira',
    'Vallapuzha',
    'Vallathol Nagar',
    'Vallicode',
    'Vallikkunnu',
    'Vallikunnam',
    'Vamanapuram',
    'Vandanmedu',
    'Vandazhy',
    'Vandiperiyar',
    'Vaniamkulam',
    'Vanimal',
    'Vannappuram',
    'Varandarappilly',
    'Varappetty',
    'Varapuzha',
    'Varavoor',
    'Vatanappally',
    'Vathikudy',
    'Vattamkulam',
    'Vattavada',
    'Vayalar',
    'Vazhakkad',
    'Vazhakulam',
    'Vazhappally',
    'Vazhathope',
    'Vazhayur',
    'Vazhikkadavu',
    'Vazhoor',
    'Vechoochira',
    'Vechoor',
    'Veeyapuram',
    'Veliancode',
    'Velinalloor',
    'Veliyam',
    'Veliyanad',
    'Veliyannoor',
    'Vellamunda',
    'Vellanad',
    'Vellangallur',
    'Vellarada',
    'Vellathooval',
    'Vellavoor',
    'Vellinezhi',
    'Velliyamattom',
    'Velloor',
    'Velom',
    'Velukara',
    'Velur',
    'Vembayam',
    'Vengad',
    'Venganoor',
    'Vengappally',
    'Vengara',
    'Vengola',
    'Vengoor',
    'Venkitangu',
    'Venmoney',
    'Vettathur',
    'Vettikavala',
    'Vettom',
    'Vettoor',
    'Vijayapuram',
    'Vilakkudy',
    'Vilappil',
    'Vilavoorkal',
    'Vilayur',
    'Villiappally',
    'Vithura',
    'Vorkady',
    'Vythiri',
    'Wandoor',
    'West Eleri',
    'West Kallada',
    'Yeroor',
];

interface SpotlightProps {
    onSelectDistrict: (districtName: string, imageUrl: string) => void;
    startInDistricts?: boolean;
}

const Spotlight: React.FC<SpotlightProps> = ({ onSelectDistrict, startInDistricts }) => {
    const [showDistricts, setShowDistricts] = useState(!!startInDistricts);
    const interactiveSectionRef = useRef<HTMLElement>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const [allVideos, setAllVideos] = useState<SpotlightVideo[]>([]);
    const [displayVideos, setDisplayVideos] = useState<SpotlightVideo[]>([]);
    const [searchResults, setSearchResults] = useState<SpotlightVideo[]>([]);
    const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [selectedVideo, setSelectedVideo] = useState<SpotlightVideo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isModalClosing, setIsModalClosing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const toggleViews = () => {
        setShowDistricts(prevState => !prevState);
        if (interactiveSectionRef.current) {
            interactiveSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const classifyLocation = (label: string): { baseName: string; kind: 'panchayath' | 'block' | 'municipality' | 'corporation' } => {
        const v = label.trim();
        if (v.includes('Municipal Corporation')) {
            return { baseName: v.replace(' Municipal Corporation', ''), kind: 'corporation' };
        }
        if (v.includes(' Corporation')) {
            return { baseName: v.replace(' Corporation', ''), kind: 'corporation' };
        }
        if (v.includes('Municipality')) {
            return { baseName: v.replace(' Municipality', ''), kind: 'municipality' };
        }
        if (v.includes(' Block Panchayat')) {
            return { baseName: v.replace(' Block Panchayat', ''), kind: 'block' };
        }
        return { baseName: v, kind: 'panchayath' };
    };

    const ulbBaseSet = React.useMemo(() => {
        const set = new Set<string>();
        keralaLocations.forEach(l => {
            if (l.includes('Municipal Corporation')) set.add(l.replace(' Municipal Corporation', '').toLowerCase());
            else if (l.includes(' Corporation')) set.add(l.replace(' Corporation', '').toLowerCase());
            else if (l.includes('Municipality')) set.add(l.replace(' Municipality', '').toLowerCase());
        });
        return set;
    }, []);

    const blockBaseSet = React.useMemo(() => {
        const set = new Set<string>();
        keralaLocations.forEach(l => {
            if (l.includes(' Block Panchayat')) set.add(l.replace(' Block Panchayat', '').toLowerCase());
        });
        return set;
    }, []);

    const panchayathSet = React.useMemo(() => {
        const set = new Set<string>();
        keralaLocations.forEach(l => {
            if (l.includes('Municipal Corporation')) return;
            if (l.includes('Municipality')) return;
            if (l.includes(' Block Panchayat')) return;
            set.add(l.toLowerCase());
        });
        return set;
    }, []);

    const formatSuggestion = (raw: string): string => {
        const c = classifyLocation(raw);
        if (c.kind === 'corporation') return `${c.baseName} - Corporation`;
        if (c.kind === 'municipality') return `${c.baseName} - Municipality`;
        if (c.kind === 'block') return `${c.baseName} - Block`;
        return `${c.baseName} - Panchayath`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const filteredSuggestions = keralaLocations
                .filter(location => location.toLowerCase().includes(query.toLowerCase()))
                .map(formatSuggestion);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = async (suggestion: string) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
        const parsed = suggestion.split(' - ');
        const name = parsed[0] || suggestion;
        const typeLabel = (parsed[1] || '').toLowerCase();
        let kind: 'panchayath' | 'block' | 'municipality' | 'corporation' = 'panchayath';
        if (typeLabel.includes('corporation')) kind = 'corporation';
        else if (typeLabel.includes('municipality')) kind = 'municipality';
        else if (typeLabel.includes('block')) kind = 'block';
        await performSearch(name, kind);
    };

    const inferKind = (name: string): 'panchayath' | 'block' | 'municipality' | 'corporation' => {
        const lc = name.toLowerCase();
        if (ulbBaseSet.has(lc)) {
            // Could be municipality or corporation; default to municipality unless explicitly known
            // We cannot easily distinguish, but both use name+ulb pattern
            return 'municipality';
        }
        if (blockBaseSet.has(lc)) return 'block';
        return 'panchayath';
    };

    const performSearch = async (name: string, kind?: 'panchayath' | 'block' | 'municipality' | 'corporation') => {
        try {
            setIsSearching(true);
            setShowSearchResults(false);
            setLoading(true);
            setError(null);
            const resolvedKind = kind ?? inferKind(name);
            // eslint-disable-next-line no-console
            console.log('[Spotlight] Search', { name, resolvedKind });
            let query = supabase
                .from('metadata')
                .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                .order('created_at', { ascending: false })
                .limit(100);

            if (resolvedKind === 'panchayath') {
                query = query.or(`metadata->>panchayath.ilike.%${name}%,panchayath.ilike.%${name}%`);
            } else if (resolvedKind === 'block') {
                query = query.or(`metadata->>block.ilike.%${name}%,block_ulb.ilike.%${name}%`);
            } else {
                // municipality or corporation: use name+ulb pattern
                const pattern = `${name.toLowerCase()}ulb`;
                query = query.ilike('block_ulb', `%${pattern}%`);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            const toTitleCase = (input: string): string => {
                return input
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
            };

            const mapped: SpotlightVideo[] = (data as any[])
                .map((row) => {
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
                .filter(v => v.videoUrl);

            // Store full results and display results page
            setSearchResults(uniqueById(mapped));
            setShowSearchResults(true);
            if (interactiveSectionRef.current) {
                interactiveSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e: any) {
            setError(e?.message || 'Search failed');
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
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

    // If asked to start in districts grid, scroll into view on mount
    useEffect(() => {
        if (startInDistricts && interactiveSectionRef.current) {
            interactiveSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [startInDistricts]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError(null);
                // Debug: starting fetch
                // eslint-disable-next-line no-console
                console.log('[Spotlight] Starting fetch from Supabase metadata...');
                let { data, error: fetchError } = await supabase
                    .from('metadata')
                    .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                    .limit(100);

                // Debug: raw response
                // eslint-disable-next-line no-console
                console.log('[Spotlight] Supabase response', { error: fetchError, rows: data?.length, sample: data?.[0] });

                if (fetchError) {
                    throw fetchError;
                }

                if (!data || data.length === 0) {
                    // Debug: fallback fetch without filter to inspect rows
                    // eslint-disable-next-line no-console
                    console.log('[Spotlight] No rows matched filter. Fetching unfiltered sample to inspect...');
                    const { data: fallbackData, error: fbErr } = await supabase
                        .from('metadata')
                        .select('id, created_at, metadata, district, username, block_ulb, panchayath')
                        .order('created_at', { ascending: false })
                        .limit(10);
                    // eslint-disable-next-line no-console
                    console.log('[Spotlight] Fallback sample', { error: fbErr, rows: fallbackData?.length, firstMeta: fallbackData?.[0]?.metadata });
                    data = fallbackData ?? [];
                }

                const toTitleCase = (input: string): string => {
                    return input
                        .split(/\s+/)
                        .filter(Boolean)
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                };

                const mapped: SpotlightVideo[] = (data as MetadataRow[])
                    .filter((row) => {
                        const mt = (row.metadata as any)?.mediaType;
                        return mt && String(mt).toLowerCase() === 'video';
                    })
                    .map((row) => {
                    const m = row.metadata ?? {};
                    const district = (m.district || row.district || '').toString();
                    const basePanch = (m.panchayath || row.panchayath || '').toString();
                    const blockUlbRaw = ((row as any).block_ulb || (m as any).block || '').toString();
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
                }).filter(v => v.videoUrl);

                // Debug: mapped videos
                // eslint-disable-next-line no-console
                console.log('[Spotlight] Mapped videos count', mapped.length, mapped.slice(0, 3));

                setAllVideos(uniqueById(mapped));
            } catch (e: any) {
                setError(e?.message || 'Failed to load videos');
                // Debug: error during fetch
                // eslint-disable-next-line no-console
                console.error('[Spotlight] Fetch error', e);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const uniqueById = (items: SpotlightVideo[]): SpotlightVideo[] => {
        const seen = new Set<string>();
        const out: SpotlightVideo[] = [];
        for (const it of items) {
            if (!seen.has(it.id)) {
                seen.add(it.id);
                out.push(it);
            }
        }
        return out;
    };

    const buildRandomizedList = (source: SpotlightVideo[], desiredCount: number): SpotlightVideo[] => {
        if (source.length === 0) return [];
        // ensure we only duplicate if we have fewer than desiredCount in the source
        const unique = uniqueById(source);
        const shuffled = [...unique].sort(() => Math.random() - 0.5);
        if (shuffled.length >= desiredCount) {
            return shuffled.slice(0, desiredCount);
        }
        const result: SpotlightVideo[] = [...shuffled];
        let i = 0;
        while (result.length < desiredCount && shuffled.length > 0) {
            result.push(shuffled[i % shuffled.length]);
            i += 1;
        }
        return result;
    };

    useEffect(() => {
        if (allVideos.length === 0) {
            setDisplayVideos([]);
            return;
        }
        const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
        const count = isDesktop ? DESKTOP_TILE_COUNT : MOBILE_TILE_COUNT;
        // eslint-disable-next-line no-console
        console.log('[Spotlight] Initial display list', { total: allVideos.length, isDesktop, count });
        setDisplayVideos(buildRandomizedList(allVideos, count));
        // No interval/resize refresh; only set once per data load
    }, [allVideos]);

    const RENDER_TILE_COUNT = 8;
    const limitedVideos: SpotlightVideo[] = displayVideos.slice(0, RENDER_TILE_COUNT);
    const desktopCols: SpotlightVideo[][] = [[], [], [], []];
    limitedVideos.forEach((video, index) => {
        desktopCols[index % 4].push(video);
    });
    
    const openModal = (video: SpotlightVideo) => {
        setSelectedVideo(video);
        setIsModalClosing(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalClosing(true);
        // Allow transition to play before unmounting
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
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen]);
    
    return (
        <section id="interactive-section" ref={interactiveSectionRef} className="pt-8 md:pt-16 pb-8 px-6 text-center">
            {/* Spotlight View */}
            <div id="spotlight-container" className={showDistricts || showSearchResults ? 'hidden' : ''}>
                <h2 className="text-3xl md:text-6xl font-bold text-teal-600  mb-12 font-serif">Dream Vibes Spotlight</h2>
                
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="text-red-600 mb-6">{error}</div>
                    )}
                    {loading && (
                        <div className="text-gray-600 mb-6">Loading videos...</div>
                    )}
                    {!loading && !error && displayVideos.length === 0 && (
                        <div className="text-gray-600 mb-6">No videos available. Check console for details.</div>
                    )}
                    {/* Mobile & Tablet view - default grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:hidden ">
                        {limitedVideos.map((video) => (
                            <div key={video.id} className="group relative" onClick={() => openModal(video)}>
                                <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                    <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Spotlight video thumbnail" />
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
                                        <p className="text-xs">{video.wardLabel}{video.wardLabel ? ', ' : ''}{video.panchayath}</p>
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
                                    <div key={video.id} className="group relative" onClick={() => {
                                        // Debug: opening modal
                                        // eslint-disable-next-line no-console
                    console.log('[Spotlight] Open modal for video', video);
                                        openModal(video);
                                    }}>
                                        <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                            <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Spotlight video thumbnail" />
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
                                                <p className="text-xs">{video.wardLabel}{video.wardLabel ? ', ' : ''}{video.panchayath}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <button id="view-all-btn" onClick={toggleViews} className="mt-16 md:text-3xl text-teal-600 font-bold hover:text-teal-800 transition-colors text-lg">View all </button>
            </div>

            {/* District Search View */}
            <div id="district-search-container" className={!showDistricts || showSearchResults ? 'hidden' : ''}>
                <div className="relative max-w-xl mx-auto mb-12" ref={searchContainerRef}>
                     <div className="relative flex items-center w-full">
                        <input 
                            type="text" 
                            placeholder="Search Panchayath/Block/Municipality/Corporation" 
                            className="w-full text-sm sm:text-base pl-4 sm:pl-6 pr-24 sm:pr-32 py-3 sm:py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500 placeholder:text-xs sm:placeholder:text-sm"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onFocus={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const parsed = searchQuery.split(' - ');
                                    const name = (parsed[0] || searchQuery).trim();
                                    const typeLabel = (parsed[1] || '').toLowerCase();
                                    let kind: 'panchayath' | 'block' | 'municipality' | 'corporation' | undefined;
                                    if (typeLabel.includes('corporation')) kind = 'corporation';
                                    else if (typeLabel.includes('municipality')) kind = 'municipality';
                                    else if (typeLabel.includes('block')) kind = 'block';
                                    performSearch(name, kind);
                                }
                            }}
                         />
                        <button 
                            className="absolute right-2 bg-teal-500 text-white font-semibold text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-8 rounded-full hover:bg-teal-600 transition-colors shadow-md"
                            onClick={() => {
                                const parsed = searchQuery.split(' - ');
                                const name = (parsed[0] || searchQuery).trim();
                                const typeLabel = (parsed[1] || '').toLowerCase();
                                let kind: 'panchayath' | 'block' | 'municipality' | 'corporation' | undefined;
                                if (typeLabel.includes('corporation')) kind = 'corporation';
                                else if (typeLabel.includes('municipality')) kind = 'municipality';
                                else if (typeLabel.includes('block')) kind = 'block';
                                performSearch(name, kind);
                            }}
                        >Search</button>
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
                    {districts.map((district, index) => {
                        const districtName = district.replace('<br>', ' ');
                        return (
                            <div 
                                key={district} 
                                className="group relative aspect-[3/4] rounded-3xl shadow-lg overflow-hidden cursor-pointer text-white font-bold text-sm md:text-lg flex items-end justify-center text-center"
                                onClick={() => onSelectDistrict(districtName, districtImages[index])}
                            >
                                <img src={districtImages[index]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt={districtName} />
                                <div className="absolute inset-0 bg-gradient-to-t from-teal-700/80 via-transparent to-transparent"></div>
                                <span className="relative z-10 pb-2 sm:pb-4 px-2" dangerouslySetInnerHTML={{ __html: district }}></span>
                            </div>
                        )
                    })}
                </div>
                <button id="back-to-spotlight-btn" onClick={toggleViews} className="mt-12 text-teal-600 font-bold hover:text-teal-800 transition-colors">{'<< Back to Spotlight'}</button>
            </div>

            {/* Search Results View */}
            {showSearchResults && (
                <div id="search-results" className="bg-white py-8">
                    <div className="max-w-6xl mx-auto px-2 sm:px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl sm:text-3xl font-semibold text-teal-700">Search Results</h3>
                            <button
                                className="text-teal-600 hover:text-teal-800 font-semibold"
                                onClick={() => { setShowSearchResults(false); setSearchResults([]); }}
                            >Close</button>
                        </div>
                        {isSearching && (
                            <div className="text-gray-600 mb-6">Searching...</div>
                        )}
                        {!isSearching && searchResults.length === 0 && (
                            <div className="text-gray-600 mb-6">No matching videos found.</div>
                        )}
                        {!isSearching && searchResults.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {searchResults.map(video => (
                                    <div key={video.id} className="group relative" onClick={() => openModal(video)}>
                                        <div className="relative overflow-hidden border-[6px] border-white cursor-pointer shadow-lg">
                                            <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="Video thumbnail" />
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
                                                <p className="text-xs">{video.wardLabel}{video.wardLabel ? ', ' : ''}{video.panchayath}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Video Modal */}
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
                        <div className="w-full bg-black flex-1 flex items-center justify-center">
                            <video controls preload="metadata" poster={selectedVideo.thumbnailUrl} className="max-w-full max-h-full w-auto h-auto object-contain">
                                <source src={selectedVideo.videoUrl} />
                            </video>
                        </div>
                        <div className="p-4 sm:p-5 bg-white/15 backdrop-blur-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <div className="font-semibold text-xl sm:text-xl">{selectedVideo.name}</div>
                            <div className="text-sm sm:text-base opacity-90">{selectedVideo.district}</div>
                            <div className="text-sm sm:text-base opacity-95">{selectedVideo.wardLabel}{selectedVideo.wardLabel ? ', ' : ''}{selectedVideo.panchayath}</div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Spotlight;