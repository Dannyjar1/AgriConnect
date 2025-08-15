# AuthHeader Component - AgriConnect

A modern, responsive header component designed specifically for authentication screens (login, register, forgot password) in the AgriConnect agricultural marketplace platform.

## Features

- **Modern Design**: Beautiful gradient background with curved elements and animated decorations
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
- **AgriConnect Branding**: Integrated logo and brand colors
- **Accessibility Compliant**: WCAG 2.1 AA compliant with proper ARIA labels
- **Angular 20 Compatible**: Built using standalone components and modern Angular practices
- **Tailwind CSS v4**: Utilizes the latest Tailwind CSS features and custom utilities
- **Professional Animations**: Smooth hover effects and micro-interactions
- **Customizable Content**: Configurable headlines, descriptions, and call-to-action buttons

## Component Structure

```
src/app/shared/components/auth-header/
└── auth-header.ts          # Main component file
```

## Usage

### 1. Import the Component

```typescript
import { AuthHeaderComponent } from '../../../shared/components/auth-header/auth-header';

@Component({
  // ...
  imports: [
    // other imports...
    AuthHeaderComponent
  ],
  // ...
})
export class YourAuthComponent {
  // ...
}
```

### 2. Use in Template

#### Basic Usage
```html
<app-auth-header></app-auth-header>
```

#### Customized Usage
```html
<app-auth-header 
  headline="Bienvenido a AgriConnect"
  description="Inicia sesión para conectarte con el mejor marketplace agrícola del Ecuador"
  ctaText="Conoce nuestros beneficios"
  [showFeatures]="true">
</app-auth-header>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `headline` | `string` | `'Conéctate con el campo'` | Main headline text |
| `description` | `string` | `'Únete a la red más grande de productores y compradores agrícolas del Ecuador'` | Descriptive text below headline |
| `ctaText` | `string` | `'Conócenos'` | Call-to-action button text |
| `showFeatures` | `boolean` | `true` | Whether to show feature badges |

## Examples for Different Auth Screens

### Register Page
```html
<app-auth-header 
  headline="Únete a AgriConnect"
  description="Conecta con una red de más de 10,000 productores y compradores en todo el Ecuador"
  ctaText="Conoce más">
</app-auth-header>
```

### Login Page
```html
<app-auth-header 
  headline="Bienvenido de vuelta"
  description="Accede a tu cuenta y continúa conectándote con el campo ecuatoriano"
  ctaText="Ver beneficios">
</app-auth-header>
```

### Forgot Password Page
```html
<app-auth-header 
  headline="Recupera tu acceso"
  description="Te ayudamos a recuperar tu cuenta para que sigas siendo parte de nuestra comunidad"
  ctaText="¿Necesitas ayuda?"
  [showFeatures]="false">
</app-auth-header>
```

## Design System Integration

The component uses the existing AgriConnect design system:

### Colors
- Primary gradient: Blue-600 → Blue-700 → AgriConnect Green-600
- Brand colors: AgriConnect green palette (agri-green-50 to agri-green-900)
- White text with appropriate opacity variations

### Typography
- Headlines: Epilogue font family
- Body text: Noto Sans font family
- Responsive text sizing with `clamp()` functions

### Animations
- Smooth hover transitions (300ms ease)
- Gentle floating animations for decorative elements
- Scale and translate effects on interactive elements

## Accessibility Features

- **Semantic HTML**: Proper use of `<header>`, headings, and landmarks
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Focus Management**: Proper focus rings and keyboard navigation
- **Reduced Motion**: Respects `prefers-reduced-motion` settings
- **Color Contrast**: Meets WCAG 2.1 AA standards

## Responsive Breakpoints

- **Mobile**: < 640px - Stacked layout, smaller logo, centered content
- **Tablet**: 640px - 1024px - Balanced two-column layout
- **Desktop**: > 1024px - Full two-column layout with larger content

## Customization

### Extending the Component
The component uses signals for reactivity and can be easily extended:

```typescript
// In your auth component
@ViewChild(AuthHeaderComponent) authHeader!: AuthHeaderComponent;

// Customize features dynamically
ngOnInit() {
  this.authHeader.features.set(['Precio justo', 'Entrega rápida', 'Calidad garantizada']);
}
```

### Custom Styling
Use Tailwind CSS utilities to customize appearance:

```html
<app-auth-header class="my-custom-header">
</app-auth-header>
```

```css
.my-custom-header {
  @apply shadow-2xl border border-white/10;
}
```

## Performance Considerations

- **Lazy Loading**: Component uses standalone architecture for optimal loading
- **Image Optimization**: SVG logo is optimized and cached
- **CSS Optimizations**: Uses Tailwind's purging for minimal bundle size
- **Animation Performance**: Uses transform properties for hardware acceleration

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Best Practices

1. **Content Consistency**: Keep headlines and descriptions consistent with your brand voice
2. **CTA Relevance**: Make call-to-action buttons relevant to the current auth flow
3. **Performance**: Test on mobile devices for smooth animations
4. **Accessibility**: Always test with screen readers and keyboard navigation

## Troubleshooting

### Common Issues

1. **Logo not showing**: Ensure the SVG path `/assets/images/agriconnect-logo.svg` is correct
2. **Styles not applied**: Check that global styles include the enhanced utilities
3. **Animation not smooth**: Verify hardware acceleration is enabled in the browser

### Debug Mode

Add this to component for debugging:
```typescript
ngOnInit() {
  console.log('AuthHeader initialized with:', {
    headline: this.headline,
    description: this.description,
    ctaText: this.ctaText
  });
}
```

---

**Built with ❤️ for AgriConnect - Connecting Ecuador's agricultural community**