import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { PrepaidCard } from '../types';

interface CardDetailProps {
  card: PrepaidCard;
  loggedInName?: string;
  allCards?: PrepaidCard[];
  onSelectCard?: (card: PrepaidCard) => void;
  onBackToStore: () => void;
  onProceedToCheckout: (customizedCard: PrepaidCard) => void;
}

export const CardDetail: React.FC<CardDetailProps> = ({
  card,
  loggedInName,
  allCards = [],
  onSelectCard,
  onBackToStore,
  onProceedToCheckout
}) => {
  const [customLimit, setCustomLimit] = useState(card.limit);
  const [calculatedPrice, setCalculatedPrice] = useState(card.price);

  // Sync state if card changes
  useEffect(() => {
    setCustomLimit(card.limit);
    setCalculatedPrice(card.price);
  }, [card]);

  // Dynamically calculate price based on customized credit limits
  // (Base price plus $0.50 per $100 increased over base limit)
  useEffect(() => {
    const limitDiff = customLimit - card.limit;
    if (limitDiff > 0) {
      const extraCost = (limitDiff / 100) * 0.40;
      setCalculatedPrice(parseFloat((card.price + extraCost).toFixed(2)));
    } else if (limitDiff < 0) {
      const discount = (Math.abs(limitDiff) / 100) * 0.20;
      setCalculatedPrice(parseFloat(Math.max(15.00, card.price - discount).toFixed(2)));
    } else {
      setCalculatedPrice(card.price);
    }
  }, [customLimit, card]);

  // Compute up to 8 related cards (same brand, excluding current)
  const relatedCards = React.useMemo(() => {
    if (!allCards || allCards.length === 0) return [];
    let related = allCards.filter(c => c.id !== card.id && c.brand === card.brand);
    // If not enough related by brand, pad with other cards
    if (related.length < 8) {
      const others = allCards.filter(c => c.id !== card.id && c.brand !== card.brand);
      related = [...related, ...others];
    }
    return related.slice(0, 8);
  }, [allCards, card]);

  const handleBuy = () => {
    const customizedCard: PrepaidCard = {
      ...card,
      accountHolder: card.accountHolder,
      limit: customLimit,
      price: calculatedPrice
    };
    onProceedToCheckout(customizedCard);
  };

  return (
    <div className="w-full bg-[#040904]/40 py-12 px-4 shadow-inner" id="card-details-section">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <button
          onClick={onBackToStore}
          id="detail-back-btn"
          className="flex items-center space-x-2 text-zinc-400 hover:text-[#adff2f] transition-colors font-mono text-xs uppercase mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Prepaid Catalog</span>
        </button>

        {/* Outer Split Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Mockup Showcase (Left Pillar) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real scale card */}
            <div
              className={`w-full aspect-[1.58/1] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden ${
                card.imageURL 
                  ? 'border-none shadow-none bg-transparent' 
                  : 'border border-[#adff2f]/20 shadow-[0_0_30px_rgba(173,255,47,0.08)] bg-gradient-to-br ' + card.color.split(' ').filter(c => !c.startsWith('hover:')).join(' ')
              }`}
              style={card.imageURL ? { backgroundImage: `url(${card.imageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {card.isUploadedImage && card.imageURL ? (
                // Display custom device uploaded PNG completely "in place of the card"
                <div className="absolute inset-0 bg-transparent z-10" />
              ) : (
                <>
                  {card.imageURL && <div className="absolute inset-0 bg-black/55 -z-0" />}
                  
                  <div className="flex items-start justify-between z-10 relative">
                    <div>
                      <span className="text-[8px] font-mono tracking-widest text-[#adff2f] font-bold block z-10">NEOBYTE BANK</span>
                      <span className="text-[10px] text-zinc-400 font-sans tracking-tight mt-0.5 uppercase block z-10">PREPAID VIRTUAL</span>
                    </div>
                    <span className="text-sm text-white font-mono font-extrabold z-10">{card.brand}</span>
                  </div>

                  {/* Chips structure */}
                  <div className="w-10 h-8 rounded bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 border border-yellow-400/40 p-0.5 z-10 relative">
                    <div className="w-full h-full border border-yellow-800/20" />
                  </div>

                  <div className="space-y-1 text-left z-10 relative">
                    <p className="text-sm md:text-base text-white font-mono tracking-widest font-bold z-10">
                      {card.cardNumber.split(' ')[0]} **** **** {card.cardNumber.split(' ')[3] || '7378'}
                    </p>
                    <div className="flex justify-between items-center text-[9px] text-[#adff2f] font-mono z-10">
                      <span className="truncate max-w-[140px] uppercase tracking-wide font-bold z-10">{card.accountHolder || 'CARD MEMBER'}</span>
                      <span className="tracking-widest z-10">{card.expiry}</span>
                    </div>
                  </div>
                </>
              )}

            </div>

          </div>

          {/* Complete Specification Viewer (Right Pillar) */}
          <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 space-y-6">
            
            <div className="text-left space-y-2">
              <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-lime-950 border border-[#adff2f]/20 text-[#adff2f] font-bold uppercase tracking-wider">
                Specifications Configured
              </span>
              <h2 className="text-white text-xl font-sans font-bold uppercase tracking-tight">
                {card.name}
              </h2>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Structured Table Attributes */}
            <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs font-sans">
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4 bg-zinc-950/40">
                <span className="text-zinc-500 font-semibold text-left">1. Card Type</span>
                <span className="text-white font-mono text-right font-medium">{card.brand}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4">
                <span className="text-zinc-500 font-semibold text-left">2. Card Number</span>
                <span className="text-white font-mono text-right font-medium">
                  {card.cardNumber.split(' ')[0]} **** 0*** {card.cardNumber.split(' ')[3] || '7378'}
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4 bg-zinc-950/40">
                <span className="text-zinc-500 font-semibold text-left">3. Expiry Range</span>
                <span className="text-[#adff2f] font-mono text-right font-bold">{card.expiry}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4">
                <span className="text-zinc-500 font-semibold text-left">4. Verified Holder</span>
                <span className="text-white text-right truncate font-bold uppercase">{card.accountHolder}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4 bg-zinc-950/40">
                <span className="text-zinc-500 font-semibold text-left">5. Security CVV</span>
                <span className="text-zinc-500 font-mono text-right font-medium">*** (Hidden)</span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4">
                <span className="text-zinc-500 font-semibold text-left">6. Monthly Limit</span>
                <span className="text-white font-mono text-right font-bold">${card.limit.toLocaleString()}/Month</span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4 bg-zinc-950/40">
                <span className="text-zinc-500 font-semibold text-left">7. Assigned Address</span>
                <span className="text-zinc-400 text-right font-mono truncate">{card.address}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-zinc-900 py-2.5 px-4">
                <span className="text-zinc-500 font-semibold text-left">8. Country Access</span>
                <span className="text-white text-right font-medium">{card.country}</span>
              </div>
              <div className="grid grid-cols-2 py-3 px-4 bg-[#122412]/20 border-t-2 border-[#adff2f]/20">
                <span className="text-white font-bold font-sans text-left">9. Purchase Value ($)</span>
                <span className="text-[#adff2f] font-mono text-right font-black text-base">${calculatedPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Check advantages badges */}
            <div className="p-3.5 bg-[#122812]/20 border border-[#adff2f]/10 rounded-xl text-left text-[11px] text-zinc-400 space-y-1 font-sans">
              <span className="font-mono text-xs font-bold text-white block uppercase tracking-wide">Included Features:</span>
              <p>&bull; Immediate automatic activation on compliance networks</p>
              <p>&bull; High speed digital authorization protocol validation</p>
              <p>&bull; 3D Secure Verification (Verified by Visa & MasterCard Identity Check)</p>
            </div>

            {/* Action Checkout Trigger */}
            <div className="pt-2">
              <button
                onClick={handleBuy}
                id="detail-buy-now-submit"
                className="w-full py-4 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md shadow-[#adff2f]/10 flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <span>BUY CARD NOW</span>
                <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust badge footer */}
            <div className="pt-4 border-t border-zinc-900/60 text-center space-y-2">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Guaranteed Safe Checkout</p>
              <div className="flex items-center justify-center gap-4 text-zinc-400 opacity-60 hover:opacity-80 transition-opacity">
                <span className="text-[10px] font-mono font-bold tracking-widest border border-zinc-800 p-1 rounded">VISA</span>
                <span className="text-[10px] font-mono font-bold tracking-widest border border-zinc-800 p-1 rounded">MASTERCARD</span>
                <span className="text-[10px] font-mono font-bold tracking-widest border border-zinc-800 p-1 rounded">AMERICAN EXPRESS</span>
                <span className="text-[10px] font-mono font-bold tracking-widest border border-zinc-800 p-1 rounded">DISCOVER</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Cards Section */}
        {relatedCards.length > 0 && (
          <div className="mt-16 pt-12 border-t border-zinc-900">
            <h3 className="text-sm font-mono font-bold tracking-widest text-[#adff2f] uppercase mb-8">Related Cards</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedCards.map((rCard) => (
                <div
                  key={rCard.id}
                  onClick={() => onSelectCard && onSelectCard(rCard)}
                  className="group flex flex-col items-center bg-transparent border-none cursor-pointer relative"
                >
                  <div className="w-full aspect-[1.58/1] rounded-xl overflow-hidden relative shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <div
                      className={`w-full h-full p-3 flex flex-col justify-between relative ${
                        rCard.imageURL 
                          ? 'bg-transparent' 
                          : 'bg-gradient-to-br ' + rCard.color.split(' ').filter(c => !c.startsWith('hover:')).join(' ')
                      }`}
                      style={rCard.imageURL ? { backgroundImage: `url(${rCard.imageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    >
                      {rCard.isUploadedImage && rCard.imageURL ? (
                        <div className="absolute inset-0 bg-transparent z-10" />
                      ) : (
                        <>
                          {rCard.imageURL && <div className="absolute inset-0 bg-black/55 -z-0" />}
                          <div className="flex items-start justify-between z-10 relative">
                            <span className="text-[6px] sm:text-[7px] font-mono tracking-widest text-[#adff2f] font-bold">NEOBYTE</span>
                            <span className="text-[8px] sm:text-[9px] text-white font-mono font-extrabold">{rCard.brand}</span>
                          </div>
                          <div className="w-6 h-5 rounded bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 border border-yellow-400/40 p-0.5 z-10 relative">
                            <div className="w-full h-full border border-yellow-800/20" />
                          </div>
                          <div className="mt-auto z-10 relative space-y-1">
                            <div className="font-mono text-[9px] sm:text-[10px] text-white/90 tracking-[0.1em]">{rCard.cardNumber || '5574 **** **** 7378'}</div>
                            <div className="flex justify-between items-end">
                              <span className="font-mono text-[6px] sm:text-[7px] text-white/70 uppercase tracking-wider block">{rCard.accountHolder}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-center w-full">
                    <h4 className="text-white font-sans text-[10px] sm:text-xs font-bold leading-tight group-hover:text-[#adff2f] transition-colors line-clamp-1">{rCard.name}</h4>
                    <span className="text-zinc-500 font-mono text-[9px] sm:text-[10px] block mt-0.5">${rCard.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
