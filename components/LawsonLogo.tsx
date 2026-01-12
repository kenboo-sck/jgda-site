'use client';

export function LawsonLogo() {
  return (
    <img 
      src="/images/head_logo_pc_scl.png" 
      alt="LAWSON DO! SPORTS" 
      className="h-5 w-auto object-contain"
      style={{ filter: 'brightness(0) invert(1)' }}
      onError={(e) => { 
        (e.currentTarget as HTMLImageElement).style.display = 'none'; 
      }}
    />
  );
}