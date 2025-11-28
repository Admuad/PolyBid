import React, { useState, useEffect } from 'react';
import { AuctionCardWrapper } from './AuctionCardWrapper';
import { Pagination } from './Pagination';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuctionGridProps {
    title: string;
    icon?: React.ReactNode;
    auctions: string[];
    onAuctionClick: (address: string) => void;
    backLink?: string;
    backText?: string;
    emptyMessage?: string;
}

export function AuctionGrid({
    title,
    icon,
    auctions,
    onAuctionClick,
    backLink,
    backText = 'Back',
    emptyMessage = 'No auctions found.'
}: AuctionGridProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(18);

    // Responsive items per page
    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 640 ? 10 : 18);
        };

        handleResize(); // Set initial
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate pagination
    const totalPages = Math.ceil(auctions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAuctions = auctions.slice(startIndex, startIndex + itemsPerPage);

    // Reset page if auctions change significantly
    useEffect(() => {
        setCurrentPage(1);
    }, [auctions.length]);

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen bg-black">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    {backLink && (
                        <Link to={backLink} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    )}
                    {icon}
                    <h1 className="text-3xl sm:text-4xl font-bold text-gradient-zama">{title}</h1>
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold">
                        {auctions.length}
                    </span>
                </div>
            </div>

            {/* Grid */}
            {auctions.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentAuctions.map((address) => (
                            <AuctionCardWrapper
                                key={address}
                                auctionAddress={address}
                                onClick={() => onAuctionClick(address)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
}
