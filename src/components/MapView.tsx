// MapView.tsx - 纯SVG地图占位符，无需任何地图库
export default function MapView() {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: '#0a1929',
        overflow: 'hidden'
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from({ length: 19 }).map((_, i) => (
          <line 
            key={`h-${i}`}
            x1="0" 
            y1={i * 60} 
            x2="1920" 
            y2={i * 60}
            stroke="#1e3a5f"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}
        
        {Array.from({ length: 33 }).map((_, i) => (
          <line 
            key={`v-${i}`}
            x1={i * 60} 
            y1="0" 
            x2={i * 60} 
            y2="1080"
            stroke="#1e3a5f"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}
        
        <path 
          d="M200,150 L350,120 L420,180 L480,160 L520,220 L450,280 L380,260 L320,300 L250,270 L180,220 Z
             M600,200 L750,180 L820,240 L900,220 L950,280 L880,340 L780,320 L700,360 L620,330 L580,260 Z
             M1000,180 L1150,160 L1220,220 L1300,200 L1350,260 L1280,320 L1180,300 L1100,340 L1020,310 L980,240 Z
             M300,450 L450,420 L520,480 L600,460 L650,520 L580,580 L480,560 L400,600 L320,570 L280,500 Z
             M700,500 L850,480 L920,540 L1000,520 L1050,580 L980,640 L880,620 L800,660 L720,630 L680,560 Z
             M1100,480 L1250,460 L1320,520 L1400,500 L1450,560 L1380,620 L1280,600 L1200,640 L1120,610 L1080,540 Z
             M1500,350 L1650,330 L1720,390 L1780,370 L1820,430 L1750,490 L1650,470 L1570,510 L1500,480 L1460,410 Z
             M400,750 L550,720 L620,780 L700,760 L750,820 L680,880 L580,860 L500,900 L420,870 L380,800 Z
             M800,800 L950,780 L1020,840 L1100,820 L1150,880 L1080,940 L980,920 L900,960 L820,930 L780,860 Z"
          fill="#ffffff"
          opacity="0.15"
        />
        
        <rect x="50" y="1000" width="200" height="20" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        <text x="150" y="1015" fill="#ffffff" fontSize="12" textAnchor="middle" opacity="0.7">0 50 100 km</text>
        <text x="1700" y="1050" fill="#ffffff" fontSize="12" opacity="0.7">经度: 116.40°E | 纬度: 39.90°N</text>
      </svg>
      
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none'
        }}
      />
      
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
