import React from 'react';

interface HeatmapPoint {
    text: string;
    score: number;
    type: string;
}

interface HeatmapOverlayProps {
    points: HeatmapPoint[];
    onClose: () => void;
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ points, onClose }) => {
    return (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            {/* Background Dim */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

            {/* Heatmap Points */}
            <div className="relative w-full h-full">
                {points.map((point, idx) => {
                    // Randomly distribute points for simulation if we don't have exact coordinates
                    // In a real app, we'd match 'text' to DOM elements. 
                    // For this simulation, we'll place them strategically.
                    const top = 10 + (idx * 15) % 80;
                    const left = 20 + (idx * 25) % 60;
                    const size = 100 + (point.score * 2);
                    const opacity = point.score / 100;

                    return (
                        <div
                            key={idx}
                            className="absolute transition-all duration-1000 animate-pulse"
                            style={{
                                top: `${top}%`,
                                left: `${left}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                transform: 'translate(-50%, -50%)',
                                background: `radial-gradient(circle, rgba(255,0,0,${opacity}) 0%, rgba(255,255,0,${opacity * 0.5}) 50%, transparent 70%)`,
                                borderRadius: '50%',
                                filter: 'blur(20px)',
                            }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel/90 px-2 py-1 rounded text-[8px] font-bold text-ink whitespace-nowrap shadow-sm border border-red-200 pointer-events-auto">
                                {point.text.substring(0, 20)}... ({point.score}%)
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 pointer-events-auto">
                <button
                    onClick={onClose}
                    className="bg-panel/90 hover:bg-panel text-ink px-4 py-2 rounded-full shadow-xl text-[10px] font-black uppercase tracking-widest border border-border"
                >
                    Fechar Simulação
                </button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-panel/90 px-6 py-3 rounded-2xl shadow-2xl border border-border pointer-events-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[9px] font-bold text-slate uppercase">Alta Atenção</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-[9px] font-bold text-slate uppercase">Média</span>
                </div>
                <div className="h-4 w-px bg-border mx-2"></div>
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Predição de Eye-Tracking via IA</span>
            </div>
        </div>
    );
};

export default HeatmapOverlay;
