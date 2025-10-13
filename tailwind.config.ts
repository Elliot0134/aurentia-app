import type { Config } from "tailwindcss";

export default {
  safelist: [
    'bg-[#e8f7df]',
    'bg-[#ffdfdf]',
    'bg-[#E91E62]',
  ],
	darkMode: ["class", 'class'],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			lg: '1050px',
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		padding: {
    			safe: 'env(safe-area-inset-bottom)'
    		},
    		width: {
    			'9/10': '90%'
    		},
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: '#F4F4F1',
    			foreground: '#151515',
    			primary: {
    				DEFAULT: 'var(--color-primary)',
    				foreground: '#FFFFFF'
    			},
    			secondary: {
    				DEFAULT: 'var(--color-secondary)',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: '#FFFFFF',
    				foreground: '#151515'
    			},
    			aurentia: {
    				'orange-aurentia': 'var(--color-aurentia-orange)',
    				'orange-light-1': '#FFF4F0',
    				'orange-light-2': '#FFE8E0',
    				'orange-light-3': '#FFDCD0',
    				'orange-light-4': '#FFC4B0',
    				pink: 'var(--color-aurentia-pink)',
    				orange: 'var(--color-primary)',
    				yellow: '#E9C46A',
    				blue: '#4361EE',
    				green: '#4CAF50',
    				violet: '#9C27B0',
    				rose: '#E91E63',
    				mint: '#26A69A',
    				'blue-violet': '#3F51B5',
    				'deliverable-resource': '#57acc2'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontFamily: {
    			inter: [
    				'Inter Display',
    				'sans-serif'
    			],
    			'biz-ud-mincho': [
    				'BIZ UDPMincho',
    				'sans-serif'
    			],
    			gordita: [
    				'Gordita',
    				'sans-serif'
    			]
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'fade-in': {
    				from: {
    					opacity: '0'
    				},
    				to: {
    					opacity: '1'
    				}
    			},
    			'fade-out': {
    				from: {
    					opacity: '1'
    				},
    				to: {
    					opacity: '0'
    				}
    			},
    			'slide-up': {
    				from: {
    					transform: 'translateY(10px)',
    					opacity: '0'
    				},
    				to: {
    					transform: 'translateY(0)',
    					opacity: '1'
    				}
    			},
    			spin: {
    				from: {
    					transform: 'rotate(0deg)'
    				},
    				to: {
    					transform: 'rotate(360deg)'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.3s ease-out',
    			'fade-out': 'fade-out 0.3s ease-out forwards',
    			'slide-up': 'slide-up 0.3s ease-out',
    			spin: 'spin 1s linear infinite'
    		},
    		backgroundImage: {
    			'gradient-primary': 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
    			'gradient-concept': 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
    			'gradient-recommendations': 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
