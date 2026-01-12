'use client';

export function AboutHeroImage() {
  return (
    <img 
      src="/images/fujii_k.webp" 
      alt="JGDA Activity" 
      className="w-full h-full object-cover"
      onError={(e) => { 
        e.currentTarget.src = "/images/an8a6761.webp" ; 
      }}
    />
  );
}