import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronRight, ShieldCheck, AlertCircle, ShoppingCart } from 'lucide-react';
import { PrepaidCard, CardBrand } from '../types';

interface CardListingProps {
  cards: PrepaidCard[];
  onSelectCard: (card: PrepaidCard) => void;
}

export const CardListing: React.FC<CardListingProps> = ({ cards, onSelectCard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<CardBrand | 'All'>('All');
  const [sortBy, setSortBy] = useState<'highest-price' | 'lowest-price' | 'highest-limit' | 'title'>('lowest-price');

  // Available brands for filters
  const brands: (CardBrand | 'All')[] = ['All', 'Mastercard', 'Visa', 'Amex', 'Discover', 'Atmos'];

  // Filtered and sorted listings
  const filteredCards = useMemo(() => {
    let result = cards.filter(card => {
      const matchSearch = 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.accountHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchBrand = selectedBrand === 'All' || card.brand === selectedBrand;
      
      return matchSearch && matchBrand;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'lowest-price') return a.price - b.price;
      if (sortBy === 'highest-price') return b.price - a.price;
      if (sortBy === 'highest-limit') return b.limit - a.limit;
      if (sortBy === 'title') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [cards, searchTerm, selectedBrand, sortBy]);

  return (
    <div className="w-full bg-black py-12 px-4 shadow-inner" id="card-catalog-section">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title Grid */}
        <div className="text-center md:text-left md:flex justify-between items-end border-b border-zinc-900 pb-6 gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight uppercase" id="catalog-title">
              OUR FEATURED <span className="text-[#adff2f]">VIRTUAL CARDS</span>
            </h2>
            <p className="text-xs text-zinc-500 max-w-xl font-sans leading-relaxed">
              Carefully designed and trusted by our growing community, these cards stand out for their advanced security, innovative features, and seamless global usability. Chosen for performance. Valued for reliability.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-1.5 p-2 bg-[#122c12]/40 border border-[#adff2f]/15 rounded-xl font-mono text-[10px] text-[#adff2f]/90 mt-4 md:mt-0 uppercase">
            <ShieldCheck className="w-4 h-4 text-[#adff2f] animate-pulse" />
            <span>Select card to see Luhn specifications</span>
          </div>
        </div>

        {/* Search, Filter, Sort controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Search bar input */}
          <div className="lg:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search card model, type or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-zinc-950/80 border border-zinc-800 focus:border-[#adff2f]/30 pl-10 pr-4 py-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 font-sans transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Brand Filter Pills */}
          <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5 overflow-x-auto py-1scrollbar-none">
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-2 text-[10px] sm:text-xs font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrand === brand
                    ? 'bg-[#122a12] text-[#adff2f] border-[#adff2f]/30'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Sorter selector */}
          <div className="lg:col-span-3 flex items-center space-x-2 bg-zinc-950/80 border border-zinc-800 p-2 rounded-xl">
            <ArrowUpDown className="w-4 h-4 text-zinc-600" />
            <select
              value={sortBy}
              aria-label="Sort cards list"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs bg-transparent text-zinc-300 border-none outline-none font-mono cursor-pointer font-bold uppercase focus:ring-0"
            >
              <option className="bg-zinc-950 text-white" value="lowest-price">Price: Low to High</option>
              <option className="bg-zinc-950 text-white" value="highest-price">Price: High to Low</option>
              <option className="bg-zinc-950 text-white" value="highest-limit">Limit Capacity</option>
              <option className="bg-zinc-950 text-white" value="title">Card Model (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Results grid */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10" id="catalog-grid">
            {filteredCards.map((card) => {
              // Simplified display brand name mapping
              const formatBrandName = (brand: string) => {
                const b = brand.toLowerCase();
                if (b === 'mastercard') return 'Master Card';
                if (b === 'amex') return 'American Express';
                if (b === 'discover') return 'Discover';
                if (b === 'visa') return 'Visa Card';
                return brand;
              };

              return (
                <div
                  key={card.id}
                  onClick={() => onSelectCard(card)}
                  className="group flex flex-col items-center bg-transparent border-none cursor-pointer relative"
                  id={`card-item-${card.id}`}
                >
                  {/* Card visual mockup panel */}
                  <div className="w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative shadow-lg group-hover:scale-103 transition-transform duration-300">
                    <div
                      className={`w-full h-full p-4 flex flex-col justify-between relative ${
                        card.imageURL 
                          ? 'bg-transparent border-none' 
                          : 'bg-gradient-to-br ' + card.color.split(' ').filter(c => !c.startsWith('hover:')).join(' ')
                      }`}
                      style={card.imageURL ? { backgroundImage: `url(${card.imageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    >
                      {card.isUploadedImage && card.imageURL ? (
                        // Display local file PNG without overlay text
                        <div className="absolute inset-0 bg-transparent z-10" />
                      ) : (
                        <>
                          {card.imageURL && <div className="absolute inset-0 bg-black/45 -z-0" />}
                          
                          <div className="flex items-start justify-between z-10 relative">
                            <span className="text-[8px] text-[#adff2f] font-mono tracking-widest uppercase font-bold opacity-90">NEOBYTE BANK</span>
                            <span className="text-[11px] text-white font-mono font-bold leading-none">{card.brand}</span>
                          </div>

                          <div className="w-8 h-5.5 rounded-sm bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 border border-yellow-400/50 z-10 relative" />

                          <div className="space-y-1.5 z-10 relative">
                            <p className="text-[12px] text-white font-mono tracking-wider font-semibold">
                              {card.cardNumber.split(' ')[0]} **** **** {card.cardNumber.split(' ')[3] || '7378'}
                            </p>
                            
                            <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                              <span className="truncate max-w-[100px] uppercase font-bold">{card.accountHolder}</span>
                              <span>{card.expiry}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Text and details panel */}
                  <div className="mt-3.5 text-center space-y-1">
                    <h3 className="text-zinc-100 group-hover:text-white text-sm font-sans font-medium tracking-wide transition-colors">
                      {formatBrandName(card.brand)}
                    </h3>
                    <div className="text-xs font-mono font-semibold text-lime-400">
                      <span className="line-through opacity-60 mr-2">${card.originalPrice.toFixed(2)}</span>
                      <span>${card.price.toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-2.5 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-zinc-600" />
            <h4 className="text-white text-sm font-bold uppercase font-mono">No Cards Match Criteria</h4>
            <p className="text-xs text-zinc-500 font-sans">
              Adjust your cryptographic filter terms, category tabs, or clean the keyword search box to retrieve our stock virtual credits.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('All');
              }}
              className="text-xs text-lime-400 font-mono underline hover:text-white"
            >
              Reset active search rules
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
