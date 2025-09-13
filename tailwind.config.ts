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
				'lg': '1050px', // Custom breakpoint for 1050px
				'2xl': '1400px'
			}
		},
		extend: {
			padding: {
				'safe': 'env(safe-area-inset-bottom)',
			},
			width: {
				'9/10': '90%',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#F4F4F1', // Nouvelle couleur de fond
				foreground: '#151515', // Nouvelle couleur de texte
				primary: {
					DEFAULT: '#FF592C', // Nouvelle couleur primaire (boutons)
					foreground: '#FFFFFF' // Texte blanc pour les boutons
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
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
					DEFAULT: '#FFFFFF', // Nouvelle couleur de fond des cartes
					foreground: '#151515' // Nouvelle couleur de titre de cartes
				},
				aurentia: {
					'orange-aurentia': '#FF592C',
					'orange-light-1': '#FFF4F0', // HSL(15, 100%, 95%)
					'orange-light-2': '#FFE8E0', // HSL(15, 100%, 90%)
					'orange-light-3': '#FFDCD0', // HSL(15, 100%, 85%)
					'orange-light-4': '#FFC4B0', // HSL(15, 100%, 75%)
					pink: '#EF4A6D',
					orange: '#F67B47',
					yellow: '#E9C46A',
					blue: '#4361EE',
					green: '#4CAF50',
					violet: '#9C27B0',
					rose: '#E91E63',
					mint: '#26A69A',
					'blue-violet': '#3F51B5',
					'deliverable-resource': '#57acc2'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				inter: ['Inter Display', 'sans-serif'],
				'biz-ud-mincho': ['BIZ UDPMincho', 'sans-serif'],
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
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
                'fade-out': { // New fade-out keyframe
                    from: { opacity: '1' },
                    to: { opacity: '0' }
                },
				'slide-up': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				spin: {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
                'fade-out': 'fade-out 0.3s ease-out forwards', // New fade-out animation
				'slide-up': 'slide-up 0.3s ease-out',
				spin: 'spin 1s linear infinite' // Added spin animation
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(90deg, #FF592C, #FF592C)',
				'gradient-concept': 'linear-gradient(90deg, #FF592C, #FF592C)',
				'gradient-recommendations': 'linear-gradient(90deg, #FF592C, #FF592C)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
