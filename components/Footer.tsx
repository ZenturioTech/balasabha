import React, { useState } from 'react';
import Privacy from './Privacy';
import TermsAndConditions from './TermsAndConditions';

const Footer: React.FC = () => {
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    return (
        <>
            <footer className="bg-[#b2e4e2] py-8 px-6 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {/* The logo in the user's image has a white background box */}
                        <div className="bg-white p-2">
                            <img 
                                src="/images/kudumbasree.png" 
                                alt="Kudumbashree Logo" 
                                className="h-20"
                            />
                        </div>
                    </div>

                    {/* Main Content: Centered */}
                    <div className="text-center space-y-2 flex-grow">
                        <p className="text-teal-800">Department of Local Self Government, Government of Kerala, Thiruvananthapuram, Kerala, India - 695011,</p>
                        <p className="text-gray-900">Phone: 91-471-2554714, 15, 16, 17 &nbsp;&nbsp; Fax: 91- 471-2554714 &nbsp;&nbsp; Email: info@kudumbashree.org</p>
                        <p className="pt-2 text-gray-900">© Copyright 2025 Kudumbashree I All Rights Reserved</p>
                        <div className="flex justify-center gap-6 pt-1">
                            <button onClick={() => setIsPrivacyPolicyOpen(true)} className="text-teal-600 hover:underline">Privacy Policy</button>
                            <button onClick={() => setIsTermsOpen(true)} className="text-teal-600 hover:underline">Terms & Conditions</button>
                        </div>
                    </div>

                    {/* Designed By */}
                    <div className="text-center md:text-right flex-shrink-0">
                        <p className="text-teal-700">Designed & Developed by</p>
                        <a href="#" className="text-teal-800 font-semibold hover:underline">Zenturiotech Private ltd.</a>
                    </div>
                </div>
            </footer>

            <Privacy isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
            <TermsAndConditions isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </>
    );
}

export default Footer;