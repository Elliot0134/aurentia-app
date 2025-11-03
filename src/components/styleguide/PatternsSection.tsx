import ComponentShowcase from './ComponentShowcase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PatternsSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Patterns</h1>
        <p className="text-[#6b7280] text-lg">
          Common layout patterns and interaction behaviors
        </p>
      </div>

      {/* Grid Layouts */}
      <ComponentShowcase
        title="Grid Layouts"
        description="Responsive grid systems for organizing content"
        preview={
          <div className="space-y-6">
            {/* 2-column grid */}
            <div>
              <p className="text-sm font-semibold mb-3">2-Column Grid</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <p className="text-sm text-[#6b7280]">Column {i}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 3-column grid */}
            <div>
              <p className="text-sm font-semibold mb-3">3-Column Grid</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <p className="text-sm text-[#6b7280]">Column {i}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 4-column grid */}
            <div>
              <p className="text-sm font-semibold mb-3">4-Column Grid</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-[#6b7280]">{i}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        }
        code={`// 2-Column Grid (mobile: 1, tablet+: 2)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card>...</Card>
  <Card>...</Card>
</div>

// 3-Column Grid (mobile: 1, tablet: 2, desktop: 3)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// 4-Column Grid (mobile: 2, tablet: 3, desktop: 4)
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>`}
        notes="Use responsive grids with Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)"
      />

      {/* Container Layouts */}
      <ComponentShowcase
        title="Container Patterns"
        description="Maximum width containers for content"
        preview={
          <div className="space-y-6">
            <div className="max-w-7xl mx-auto px-4 bg-[#f2f2f1] py-8 rounded-lg">
              <p className="text-sm font-semibold mb-2">Max-width Container (7xl)</p>
              <p className="text-sm text-[#6b7280]">
                Most page content uses max-w-7xl (1280px) with horizontal padding
              </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 bg-[#f2f2f1] py-8 rounded-lg">
              <p className="text-sm font-semibold mb-2">Medium Container (4xl)</p>
              <p className="text-sm text-[#6b7280]">
                For forms and focused content areas (896px)
              </p>
            </div>

            <div className="max-w-2xl mx-auto px-4 bg-[#f2f2f1] py-8 rounded-lg">
              <p className="text-sm font-semibold mb-2">Narrow Container (2xl)</p>
              <p className="text-sm text-[#6b7280]">
                For reading content and long-form text (672px)
              </p>
            </div>
          </div>
        }
        code={`// Large Container (most pages)
<div className="max-w-7xl mx-auto px-4">
  {/* Content */}
</div>

// Medium Container (forms, focused content)
<div className="max-w-4xl mx-auto px-4">
  {/* Content */}
</div>

// Narrow Container (reading content)
<div className="max-w-2xl mx-auto px-4">
  {/* Content */}
</div>

// Responsive Padding
<div className="px-4 md:px-8 lg:px-12">
  {/* Content */}
</div>`}
        notes="Always include horizontal padding (px-4) with centered containers. Use responsive padding for larger screens."
      />

      {/* Card Hover Effects */}
      <ComponentShowcase
        title="Interactive Card Patterns"
        description="Hover effects and clickable card behaviors"
        preview={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Card with Lift Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Hover to see the card lift up
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f4f4f5] cursor-pointer hover:bg-[#e8e8e9] transition-all">
              <CardHeader>
                <CardTitle>Card with Background Change</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Hover to see background color change
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:border-[#ff592b] hover:shadow-md">
              <CardHeader>
                <CardTitle>Card with Border Highlight</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Hover to see orange border
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer group">
              <CardHeader>
                <CardTitle className="group-hover:text-[#ff592b] transition-colors">
                  Card with Text Color Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Hover to see title change color
                </p>
              </CardContent>
            </Card>
          </div>
        }
        code={`// Lift Effect
<Card className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
  <CardContent>...</CardContent>
</Card>

// Background Change
<Card className="bg-[#f4f4f5] cursor-pointer hover:bg-[#e8e8e9] transition-all">
  <CardContent>...</CardContent>
</Card>

// Border Highlight
<Card className="cursor-pointer transition-all hover:border-[#ff592b] hover:shadow-md">
  <CardContent>...</CardContent>
</Card>

// Group Hover (affects child elements)
<Card className="cursor-pointer group">
  <CardTitle className="group-hover:text-[#ff592b] transition-colors">
    Title
  </CardTitle>
</Card>`}
        notes="Use subtle hover effects for clickable cards. Combine multiple effects for richer interactions."
      />

      {/* Animation Patterns */}
      <ComponentShowcase
        title="Animation Patterns"
        description="Common animation use cases"
        preview={
          <div className="space-y-6">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle>Fade In Up Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Used for page loads and content reveals
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-blur">
              <CardHeader>
                <CardTitle>Fade In Blur Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Smoother fade in with blur effect
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Slide Up Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  Quick slide animation for interactive elements
                </p>
              </CardContent>
            </Card>
          </div>
        }
        code={`// Fade In Up (page loads)
<Card className="animate-fade-in-up">
  <CardContent>...</CardContent>
</Card>

// Fade In Blur (smooth reveals)
<Card className="animate-fade-in-blur">
  <CardContent>...</CardContent>
</Card>

// Slide Up (interactive elements)
<Card className="animate-slide-up">
  <CardContent>...</CardContent>
</Card>

// Staggered animations with delay
<div className="space-y-4">
  <Card className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>...</Card>
  <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>...</Card>
  <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>...</Card>
</div>`}
        notes="Use animations sparingly. Stagger animations for lists using animationDelay. All animations are defined in index.css."
      />

      {/* Responsive Patterns */}
      <ComponentShowcase
        title="Responsive Patterns"
        description="Mobile-first responsive design patterns"
        preview={
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stack on Mobile, Row on Desktop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-[#f2f2f1] p-4 rounded">
                    <p className="text-sm text-[#6b7280]">Column 1</p>
                  </div>
                  <div className="flex-1 bg-[#f2f2f1] p-4 rounded">
                    <p className="text-sm text-[#6b7280]">Column 2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hide on Mobile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-[#6b7280]">Always visible</p>
                  <p className="text-sm text-[#6b7280] hidden md:block">
                    Hidden on mobile, visible on tablet+
                  </p>
                  <p className="text-sm text-[#6b7280] md:hidden">
                    Visible on mobile only
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        }
        code={`// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Column 1</div>
  <div className="flex-1">Column 2</div>
</div>

// Hide on mobile
<div className="hidden md:block">
  Tablet and desktop only
</div>

// Show on mobile only
<div className="md:hidden">
  Mobile only
</div>

// Responsive spacing
<div className="p-4 md:p-8 lg:p-12">
  Content with responsive padding
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>`}
        notes="Always design mobile-first, then add tablet (md) and desktop (lg) breakpoints. Test on actual devices when possible."
      />

      {/* CSS Classes Reference */}
      <div className="bg-[#f2f2f1] border border-[#e6e6e9] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Utility Class Reference</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">From <code className="bg-white px-1 py-0.5 rounded">styles/components.css</code>:</p>
            <ul className="text-sm text-[#6b7280] space-y-1 ml-4 list-disc">
              <li><code className="bg-white px-1 py-0.5 rounded">card-clickable</code> - Clickable card with hover effect</li>
              <li><code className="bg-white px-1 py-0.5 rounded">card-static</code> - Static card (white background)</li>
              <li><code className="bg-white px-1 py-0.5 rounded">btn-primary</code> - Primary button styling</li>
              <li><code className="bg-white px-1 py-0.5 rounded">btn-secondary</code> - Secondary button styling</li>
              <li><code className="bg-white px-1 py-0.5 rounded">btn-tertiary</code> - Tertiary button styling</li>
              <li><code className="bg-white px-1 py-0.5 rounded">modal</code> - Modal container styling</li>
              <li><code className="bg-white px-1 py-0.5 rounded">spinner</code> - Loading spinner</li>
              <li><code className="bg-white px-1 py-0.5 rounded">skeleton</code> - Loading skeleton</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Common Tailwind Patterns:</p>
            <ul className="text-sm text-[#6b7280] space-y-1 ml-4 list-disc">
              <li><code className="bg-white px-1 py-0.5 rounded">transition-all duration-200</code> - Smooth transitions</li>
              <li><code className="bg-white px-1 py-0.5 rounded">hover:scale-[1.02]</code> - Subtle hover scale</li>
              <li><code className="bg-white px-1 py-0.5 rounded">focus:outline-none focus:ring-2 focus:ring-[#ff592b]</code> - Focus states</li>
              <li><code className="bg-white px-1 py-0.5 rounded">disabled:opacity-40 disabled:cursor-not-allowed</code> - Disabled states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
