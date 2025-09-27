import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Privacy: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-title"
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 sm:p-8 relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close privacy policy"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 id="privacy-policy-title" className="text-2xl font-bold text-teal-600 mb-4 font-serif">Privacy Policy</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>We respect your privacy. This website's data handling practices are as follows:</p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>We do not collect personal information from children or users, except for basic details shared voluntarily during registration or participation in Balasabha activities.</li>
                        <li>Any information collected will only be used for educational and community purposes.</li>
                        <li>We do not share your information with third parties.</li>
                        <li>This site may contain links to other government or educational websites,we are not responsible for their content or privacy practices.</li>
                        <li>If you have concerns about your data, you may contact the site administrators.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Privacy;