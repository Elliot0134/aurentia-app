export default function FoundationsSection() {
  const colors = [
    { name: 'Primary (Orange Aurentia)', value: '#ff592b', var: '--color-primary' },
    { name: 'Pink Aurentia', value: '#EF4A6D', var: '--color-aurentia-pink' },
    { name: 'Text Primary', value: '#2e333d', var: '--text-primary' },
    { name: 'Text Secondary', value: '#f8f8f6', var: '--text-secondary' },
    { name: 'Text Muted', value: '#6b7280', var: '--text-muted' },
    { name: 'Background Page', value: '#ffffff', var: '--bg-page' },
    { name: 'Card Clickable', value: '#f4f4f5', var: '--bg-card-clickable' },
    { name: 'Card Static', value: '#ffffff', var: '--bg-card-static' },
    { name: 'Border Default', value: '#e6e6e9', var: '--border-default' },
    { name: 'Border Hover', value: '#d3d3d8', var: '--border-hover' },
  ];

  const typography = [
    { tag: 'h1', label: 'Heading 1 (Page Title)', size: '2.5rem', weight: '400', font: 'BIZUD Mincho' },
    { tag: 'h2', label: 'Heading 2', size: '2rem', weight: '600', font: 'Inter' },
    { tag: 'h3', label: 'Heading 3', size: '1.5rem', weight: '600', font: 'Inter' },
    { tag: 'h4', label: 'Heading 4', size: '1.25rem', weight: '600', font: 'Inter' },
    { tag: 'p', label: 'Body Text', size: '1rem', weight: '400', font: 'Inter' },
    { tag: 'small', label: 'Small Text', size: '0.875rem', weight: '400', font: 'Inter' },
    { tag: 'code', label: 'Code', size: '0.875rem', weight: '400', font: 'Monaco' },
  ];

  const spacing = [
    { name: 'spacing-1', value: '0.25rem', pixels: '4px' },
    { name: 'spacing-2', value: '0.5rem', pixels: '8px' },
    { name: 'spacing-3', value: '0.75rem', pixels: '12px' },
    { name: 'spacing-4', value: '1rem', pixels: '16px' },
    { name: 'spacing-6', value: '1.5rem', pixels: '24px' },
    { name: 'spacing-8', value: '2rem', pixels: '32px' },
    { name: 'spacing-12', value: '3rem', pixels: '48px' },
  ];

  const borderRadius = [
    { name: 'radius-sm', value: '6px', usage: 'Small elements' },
    { name: 'radius-md', value: '8px', usage: 'Buttons' },
    { name: 'radius-lg', value: '12px', usage: 'Cards' },
    { name: 'radius-xl', value: '16px', usage: 'Modals' },
    { name: 'radius-full', value: '9999px', usage: 'Pills, badges' },
  ];

  const animations = [
    { name: 'fadeInUp', duration: '0.5s', description: 'Fade in with upward motion and blur effect' },
    { name: 'fadeInBlur', duration: '0.5s', description: 'Fade in with blur effect' },
    { name: 'slide-up', duration: '0.3s', description: 'Slide up animation' },
    { name: 'spin', duration: '1s', description: 'Continuous rotation' },
    { name: 'pulse', duration: '1.5s', description: 'Pulsing effect' },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Foundations</h1>
        <p className="text-[#6b7280] text-lg">
          Core design tokens that define the Aurentia visual language
        </p>
      </div>

      {/* Colors */}
      <section id="colors">
        <h2 className="text-2xl font-semibold mb-6">Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((color) => (
            <div
              key={color.name}
              className="border border-[#e6e6e9] rounded-lg overflow-hidden"
            >
              <div
                className="h-24"
                style={{ backgroundColor: color.value }}
              />
              <div className="p-4 bg-white">
                <p className="font-semibold text-sm text-[#2e333d]">{color.name}</p>
                <p className="text-xs text-[#6b7280] mt-1 font-mono">{color.value}</p>
                <p className="text-xs text-[#6b7280] font-mono">{color.var}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section id="typography">
        <h2 className="text-2xl font-semibold mb-6">Typography</h2>
        <div className="space-y-6">
          {typography.map((type) => (
            <div key={type.tag} className="border border-[#e6e6e9] rounded-lg p-6 bg-white">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-[#2e333d]">{type.label}</p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    {type.size} · {type.weight} · {type.font}
                  </p>
                </div>
                <code className="text-xs bg-[#f2f2f1] px-2 py-1 rounded">
                  {`<${type.tag}>`}
                </code>
              </div>
              {type.tag === 'h1' && <h1>The quick brown fox jumps</h1>}
              {type.tag === 'h2' && <h2>The quick brown fox jumps</h2>}
              {type.tag === 'h3' && <h3>The quick brown fox jumps</h3>}
              {type.tag === 'h4' && <h4>The quick brown fox jumps</h4>}
              {type.tag === 'p' && <p>The quick brown fox jumps over the lazy dog</p>}
              {type.tag === 'small' && (
                <small className="text-[#6b7280]">The quick brown fox jumps over the lazy dog</small>
              )}
              {type.tag === 'code' && (
                <code className="bg-[#f2f2f1] px-2 py-1 rounded">
                  const example = "code";
                </code>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section id="spacing">
        <h2 className="text-2xl font-semibold mb-6">Spacing</h2>
        <div className="space-y-3">
          {spacing.map((space) => (
            <div key={space.name} className="border border-[#e6e6e9] rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <code className="text-sm font-mono text-[#2e333d] font-semibold">
                    {space.name}
                  </code>
                  <span className="text-sm text-[#6b7280]">
                    {space.value} ({space.pixels})
                  </span>
                </div>
                <div
                  className="bg-[#ff592b] h-8"
                  style={{ width: space.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section id="border-radius">
        <h2 className="text-2xl font-semibold mb-6">Border Radius</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {borderRadius.map((radius) => (
            <div key={radius.name} className="border border-[#e6e6e9] rounded-lg p-6 bg-white">
              <div
                className="w-full h-20 bg-[#ff592b] mb-4"
                style={{ borderRadius: radius.value }}
              />
              <p className="font-semibold text-sm text-[#2e333d]">{radius.name}</p>
              <p className="text-xs text-[#6b7280] mt-1">{radius.value}</p>
              <p className="text-xs text-[#6b7280] mt-1">{radius.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Animations */}
      <section id="animations">
        <h2 className="text-2xl font-semibold mb-6">Animations</h2>
        <div className="space-y-4">
          {animations.map((anim) => (
            <div key={anim.name} className="border border-[#e6e6e9] rounded-lg p-6 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <code className="text-sm font-mono font-semibold text-[#2e333d]">
                    {anim.name}
                  </code>
                  <p className="text-sm text-[#6b7280] mt-1">{anim.description}</p>
                  <p className="text-xs text-[#6b7280] mt-1">Duration: {anim.duration}</p>
                </div>
                <div className={`w-16 h-16 bg-[#ff592b] rounded-lg animate-${anim.name}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
