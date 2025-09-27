import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsAndConditions: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-conditions-title"
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 sm:p-8 relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close terms and conditions"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 id="terms-conditions-title" className="text-2xl font-bold text-teal-600 mb-4 font-serif">Terms & Conditions</h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>By using this website, you agree to the following:</p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>The content is meant for educational and community purposes only.</li>
                        <li>Users should maintain respectful behavior and not misuse the site.</li>
                        <li>Content published here belongs to the respective government/organizing body and should not be copied without permission.</li>
                        <li>We may update or modify these terms at any time; continued use of the site means acceptance of the updated terms.</li>
                        <li>The organizers are not responsible for any external links or third-party content.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;