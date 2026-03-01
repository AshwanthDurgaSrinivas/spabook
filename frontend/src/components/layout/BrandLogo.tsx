import { cn } from '@/lib/utils';

interface BrandLogoProps {
    collapsed?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'light' | 'dark' | 'color';
}

export function BrandLogo({ collapsed = false, className = '', size = 'md', variant = 'color' }: BrandLogoProps) {
    const sizes = {
        sm: { icon: 'w-5 h-5', text: 'text-lg', subtext: 'text-[7px]' },
        md: { icon: 'w-6 h-6', text: 'text-xl', subtext: 'text-[9px]' },
        lg: { icon: 'w-8 h-8', text: 'text-2xl', subtext: 'text-[10px]' },
        xl: { icon: 'w-12 h-12', text: 'text-4xl', subtext: 'text-xs' },
    };

    const currentSize = sizes[size];

    return (
        <div className={cn("flex items-center", !collapsed && "gap-3", className)}>
            {/* Sparkles Icon Cluster */}
            <div className={cn("relative flex-shrink-0 animate-pulse-slow", currentSize.icon)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M12 3L14.5 9L21 11.5L14.5 14L12 21L9.5 14L3 11.5L9.5 9L12 3Z" fill="url(#sparkle-grad)" />
                    <path d="M19 16L20 19L23 20L20 21L19 24L18 21L15 20L18 19L19 16Z" fill="url(#sparkle-grad-2)" opacity="0.8" />
                    <path d="M5 4L5.5 5.5L7 6L5.5 6.5L5 8L4.5 6.5L3 6L4.5 5.5L5 4Z" fill="url(#sparkle-grad-3)" opacity="0.6" />
                    <defs>
                        <linearGradient id="sparkle-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4f46e5" />
                            <stop offset="0.5" stopColor="#8b5cf6" />
                            <stop offset="1" stopColor="#d946ef" />
                        </linearGradient>
                        <linearGradient id="sparkle-grad-2" x1="15" y1="16" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#8b5cf6" />
                            <stop offset="1" stopColor="#d946ef" />
                        </linearGradient>
                        <linearGradient id="sparkle-grad-3" x1="3" y1="4" x2="7" y2="8" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4f46e5" />
                            <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {!collapsed && (
                <div className="flex flex-col min-w-max">
                    <span
                        className={cn(
                            "font-display font-medium leading-normal tracking-tight transition-all duration-300 pr-2",
                            currentSize.text,
                            variant === 'color'
                                ? "bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] via-[#8b5cf6] to-[#d946ef] italic font-bold"
                                : "text-white"
                        )}
                        style={{
                            fontFamily: '"Great Vibes", cursive',
                            filter: variant === 'color' ? 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))' : 'none',
                            display: 'inline-block'
                        }}
                    >
                        SPARKLE
                    </span>
                    <span className={cn(
                        "font-bold uppercase tracking-[0.25em] transition-all duration-300 -mt-2",
                        currentSize.subtext,
                        variant === 'color' ? "text-[#8b5cf6]" : "text-white/90"
                    )}>
                        Beauty Lounge
                    </span>
                </div>
            )}
        </div>
    );
}
