import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';

interface ProductsByCategory {
  category: string;
  products: Product[];
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedHeaderComponent],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class Productos implements OnInit {
  private readonly router = inject(Router);

  // Señales reactivas
  readonly isLoading = signal<boolean>(false);
  readonly selectedCategory = signal<string>('');
  
  // Nueva señal para la imagen de multifrutas
  readonly multifruitImage = signal<string>('assets/images/multifrutas.webp');
  
  // Productos organizados por categorías - Datos completos
  readonly productsByCategory = signal<ProductsByCategory[]>([]);

  // Productos totales para filtros
  readonly allProducts = computed(() => {
    return this.productsByCategory()
      .flatMap(category => category.products);
  });

  // Categorías disponibles
  readonly categories = computed(() => {
    return this.productsByCategory().map(cat => cat.category);
  });

  // Computed para determinar si una categoría es de frutas para mostrar la imagen decorativa
  readonly isFruitCategory = computed(() => (categoryName: string) => {
    return categoryName.toLowerCase().includes('fruta') || 
           categoryName.toLowerCase().includes('fruit');
  });

  ngOnInit(): void {
    this.loadAllProducts();
  }

  private loadAllProducts(): void {
    this.isLoading.set(true);
    
    const productsData: ProductsByCategory[] = [
      {
        category: 'Frutas',
        products: [
          {
            id: 'fruit-001',
            name: 'Banano',
            description: 'Banano ecuatoriano de exportación, dulce y nutritivo',
            category: 'Frutas',
            price: { perUnit: 0.75, unit: 'lb' },
            availability: 250,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/banano.jpg'],
            province: 'El Oro'
          },
          {
            id: 'fruit-002',
            name: 'Mango',
            description: 'Mango tropical jugoso y aromático de la costa ecuatoriana',
            category: 'Frutas',
            price: { perUnit: 1.25, unit: 'unidad' },
            availability: 180,
            certifications: ['ORGÁNICO', 'NATURAL'],
            images: ['assets/images/products/mango.jpg'],
            province: 'Manabí'
          },
          {
            id: 'fruit-003',
            name: 'Piña',
            description: 'Piña fresca y dulce, rica en vitaminas y enzimas digestivas',
            category: 'Frutas',
            price: { perUnit: 2.50, unit: 'unidad' },
            availability: 120,
            certifications: ['NATURAL'],
            images: ['assets/images/products/pina.jpg'],
            province: 'Santo Domingo'
          },
          {
            id: 'fruit-004',
            name: 'Granadilla',
            description: 'Granadilla andina, fruta exótica con sabor único y refrescante',
            category: 'Frutas',
            price: { perUnit: 3.00, unit: 'lb' },
            availability: 95,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/granadilla.jpg'],
            province: 'Loja'
          },
          {
            id: 'fruit-005',
            name: 'Mora',
            description: 'Mora andina rica en antioxidantes y sabor intenso',
            category: 'Frutas',
            price: { perUnit: 4.50, unit: 'lb' },
            availability: 85,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/mora.jpg'],
            province: 'Azuay'
          },
          {
            id: 'fruit-006',
            name: 'Naranjilla',
            description: 'Naranjilla ecuatoriana, perfecta para jugos y postres',
            category: 'Frutas',
            price: { perUnit: 2.75, unit: 'lb' },
            availability: 110,
            certifications: ['NATURAL'],
            images: ['assets/images/products/naranjilla.jpg'],
            province: 'Tungurahua'
          },
          {
            id: 'fruit-007',
            name: 'Chirimoya',
            description: 'Chirimoya cremosa y dulce, conocida como la reina de las frutas',
            category: 'Frutas',
            price: { perUnit: 3.75, unit: 'unidad' },
            availability: 70,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/chirimoya.jpg'],
            province: 'Loja'
          },
          {
            id: 'fruit-008',
            name: 'Guayaba',
            description: 'Guayaba tropical rica en vitamina C y fibra natural',
            category: 'Frutas',
            price: { perUnit: 1.50, unit: 'lb' },
            availability: 200,
            certifications: ['NATURAL'],
            images: ['assets/images/products/guayaba.jpg'],
            province: 'Guayas'
          },
          {
            id: 'fruit-009',
            name: 'Uvilla',
            description: 'Uvilla andina, pequeña fruta dorada llena de sabor',
            category: 'Frutas',
            price: { perUnit: 5.50, unit: 'lb' },
            availability: 60,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/uvilla.jpg'],
            province: 'Imbabura'
          },
          {
            id: 'fruit-010',
            name: 'Taxo',
            description: 'Taxo andino, fruta de la pasión de montaña con sabor único',
            category: 'Frutas',
            price: { perUnit: 4.25, unit: 'lb' },
            availability: 75,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/taxo.jpg'],
            province: 'Pichincha'
          }
        ]
      },
      {
        category: 'Lácteos',
        products: [
          {
            id: 'dairy-001',
            name: 'Queso de Hoja',
            description: 'Queso fresco tradicional de la sierra norte del Ecuador',
            category: 'Lácteos',
            price: { perUnit: 3.50, unit: 'lb' },
            availability: 150,
            certifications: ['ARTESANAL'],
            images: ['assets/images/products/queso-hoja.jpg'],
            province: 'Imbabura'
          },
          {
            id: 'dairy-002',
            name: 'Yogurt Griego',
            description: 'Yogurt griego cremoso y natural, rico en proteínas',
            category: 'Lácteos',
            price: { perUnit: 2.75, unit: 'envase' },
            availability: 200,
            certifications: ['NATURAL', 'PROBIÓTICOS'],
            images: ['assets/images/products/yogurt-griego.jpg'],
            province: 'Pichincha'
          },
          {
            id: 'dairy-003',
            name: 'Mantequilla Artesanal',
            description: 'Mantequilla artesanal elaborada con leche fresca de altura',
            category: 'Lácteos',
            price: { perUnit: 4.25, unit: 'barra' },
            availability: 80,
            certifications: ['ARTESANAL'],
            images: ['assets/images/products/mantequilla.jpg'],
            province: 'Bolívar'
          },
          {
            id: 'dairy-004',
            name: 'Queso Tipo Mozzarella',
            description: 'Queso fresco tipo mozzarella perfecto para pizza y ensaladas',
            category: 'Lácteos',
            price: { perUnit: 4.75, unit: 'lb' },
            availability: 120,
            certifications: ['FRESCO'],
            images: ['assets/images/products/mozzarella.jpg'],
            province: 'Azuay'
          },
          {
            id: 'dairy-005',
            name: 'Leche en Polvo',
            description: 'Leche en polvo fortificada con vitaminas y minerales',
            category: 'Lácteos',
            price: { perUnit: 8.50, unit: 'kg' },
            availability: 300,
            certifications: ['FORTIFICADA'],
            images: ['assets/images/products/leche-polvo.jpg'],
            province: 'Nacional'
          }
        ]
      },
      {
        category: 'Verduras y Hortalizas',
        products: [
          {
            id: 'veg-001',
            name: 'Papa Chaucha',
            description: 'Papa pequeña y cremosa de los valles andinos',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.25, unit: 'lb' },
            availability: 400,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/papa-chaucha.jpg'],
            province: 'Carchi'
          },
          {
            id: 'veg-002',
            name: 'Zanahoria Amarilla',
            description: 'Zanahoria andina dulce y nutritiva, rica en betacarotenos',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.50, unit: 'lb' },
            availability: 250,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/zanahoria-amarilla.jpg'],
            province: 'Tungurahua'
          },
          {
            id: 'veg-003',
            name: 'Brócoli',
            description: 'Brócoli fresco cultivado en los valles andinos, rico en nutrientes',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.75, unit: 'unidad' },
            availability: 180,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/brocoli.jpg'],
            province: 'Pichincha'
          },
          {
            id: 'veg-004',
            name: 'Espinaca',
            description: 'Espinaca fresca rica en hierro y vitaminas',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.25, unit: 'atado' },
            availability: 160,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/espinaca.jpg'],
            province: 'Azuay'
          },
          {
            id: 'veg-005',
            name: 'Coliflor',
            description: 'Coliflor blanca y compacta de cultivos andinos',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 2.25, unit: 'unidad' },
            availability: 120,
            certifications: ['NATURAL'],
            images: ['assets/images/products/coliflor.jpg'],
            province: 'Pichincha'
          },
          {
            id: 'veg-006',
            name: 'Pepino',
            description: 'Pepino fresco y crujiente de la costa ecuatoriana',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 0.75, unit: 'unidad' },
            availability: 300,
            certifications: ['NATURAL'],
            images: ['assets/images/products/pepino.jpg'],
            province: 'Manabí'
          },
          {
            id: 'veg-007',
            name: 'Ají Dulce',
            description: 'Ají dulce aromático perfecto para salsas y condimentos',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 2.50, unit: 'lb' },
            availability: 90,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/aji-dulce.jpg'],
            province: 'Manabí'
          },
          {
            id: 'veg-008',
            name: 'Alcachofa',
            description: 'Alcachofa tierna cultivada en los valles interandinos',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.75, unit: 'unidad' },
            availability: 110,
            certifications: ['NATURAL'],
            images: ['assets/images/products/alcachofa.jpg'],
            province: 'Imbabura'
          },
          {
            id: 'veg-009',
            name: 'Remolacha',
            description: 'Remolacha dulce y nutritiva rica en folatos',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.50, unit: 'lb' },
            availability: 140,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/remolacha.jpg'],
            province: 'Bolívar'
          }
        ]
      },
      {
        category: 'Frutos Secos y Semillas',
        products: [
          {
            id: 'nuts-001',
            name: 'Maní Tostado',
            description: 'Maní ecuatoriano tostado, crujiente y lleno de sabor',
            category: 'Frutos Secos y Semillas',
            price: { perUnit: 3.25, unit: 'lb' },
            availability: 200,
            certifications: ['NATURAL'],
            images: ['assets/images/products/mani-tostado.jpg'],
            province: 'El Oro'
          },
          {
            id: 'nuts-002',
            name: 'Almendras',
            description: 'Almendras frescas ricas en vitamina E y grasas saludables',
            category: 'Frutos Secos y Semillas',
            price: { perUnit: 8.50, unit: 'lb' },
            availability: 80,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/almendras.jpg'],
            province: 'Loja'
          },
          {
            id: 'nuts-003',
            name: 'Semillas de Chía',
            description: 'Semillas de chía orgánicas, superfood lleno de omega-3',
            category: 'Frutos Secos y Semillas',
            price: { perUnit: 12.50, unit: 'lb' },
            availability: 60,
            certifications: ['ORGÁNICO', 'SUPERFOOD'],
            images: ['assets/images/products/chia.jpg'],
            province: 'Loja'
          },
          {
            id: 'nuts-004',
            name: 'Pepas de Zapallo',
            description: 'Pepas de zapallo tostadas, ricas en minerales y proteínas',
            category: 'Frutos Secos y Semillas',
            price: { perUnit: 4.75, unit: 'lb' },
            availability: 120,
            certifications: ['NATURAL'],
            images: ['assets/images/products/pepas-zapallo.jpg'],
            province: 'Tungurahua'
          },
          {
            id: 'nuts-005',
            name: 'Nuez de Pecán',
            description: 'Nueces de pecán de cultivos especiales de valles ecuatorianos',
            category: 'Frutos Secos y Semillas',
            price: { perUnit: 15.50, unit: 'lb' },
            availability: 40,
            certifications: ['GOURMET'],
            images: ['assets/images/products/pecan.jpg'],
            province: 'Pichincha'
          }
        ]
      },
      {
        category: 'Carne y Aves',
        products: [
          {
            id: 'meat-001',
            name: 'Carne de Cerdo',
            description: 'Carne de cerdo fresca de granjas familiares de la sierra',
            category: 'Carne y Aves',
            price: { perUnit: 5.75, unit: 'lb' },
            availability: 150,
            certifications: ['FRESCO'],
            images: ['assets/images/products/carne-cerdo.jpg'],
            province: 'Tungurahua'
          },
          {
            id: 'meat-002',
            name: 'Pollo Criollo',
            description: 'Pollo criollo de campo, criado de manera tradicional',
            category: 'Carne y Aves',
            price: { perUnit: 4.25, unit: 'lb' },
            availability: 100,
            certifications: ['CRIOLLO', 'CAMPO'],
            images: ['assets/images/products/pollo-criollo.jpg'],
            province: 'Azuay'
          },
          {
            id: 'meat-003',
            name: 'Huevos de Codorniz',
            description: 'Huevos frescos de codorniz, delicadeza nutritiva y gourmet',
            category: 'Carne y Aves',
            price: { perUnit: 6.50, unit: 'docena' },
            availability: 80,
            certifications: ['GOURMET', 'FRESCO'],
            images: ['assets/images/products/huevos-codorniz.jpg'],
            province: 'Cotopaxi'
          },
          {
            id: 'meat-004',
            name: 'Conejo',
            description: 'Carne de conejo magra y saludable de crianza artesanal',
            category: 'Carne y Aves',
            price: { perUnit: 7.25, unit: 'lb' },
            availability: 60,
            certifications: ['ARTESANAL'],
            images: ['assets/images/products/conejo.jpg'],
            province: 'Pichincha'
          },
          {
            id: 'meat-005',
            name: 'Pavo',
            description: 'Pavo fresco ideal para ocasiones especiales',
            category: 'Carne y Aves',
            price: { perUnit: 6.75, unit: 'lb' },
            availability: 45,
            certifications: ['FRESCO'],
            images: ['assets/images/products/pavo.jpg'],
            province: 'Chimborazo'
          }
        ]
      },
      {
        category: 'Pescado y Mariscos',
        products: [
          {
            id: 'seafood-001',
            name: 'Corvina',
            description: 'Corvina fresca del océano Pacífico ecuatoriano',
            category: 'Pescado y Mariscos',
            price: { perUnit: 8.50, unit: 'lb' },
            availability: 120,
            certifications: ['FRESCO', 'OCÉANO'],
            images: ['assets/images/products/corvina.jpg'],
            province: 'Manabí'
          },
          {
            id: 'seafood-002',
            name: 'Langostinos',
            description: 'Langostinos ecuatorianos de cultivo sustentable',
            category: 'Pescado y Mariscos',
            price: { perUnit: 12.75, unit: 'lb' },
            availability: 80,
            certifications: ['SUSTENTABLE', 'FRESCO'],
            images: ['assets/images/products/langostinos.jpg'],
            province: 'Guayas'
          },
          {
            id: 'seafood-003',
            name: 'Pulpo',
            description: 'Pulpo fresco capturado artesanalmente en la costa',
            category: 'Pescado y Mariscos',
            price: { perUnit: 10.50, unit: 'lb' },
            availability: 60,
            certifications: ['ARTESANAL', 'FRESCO'],
            images: ['assets/images/products/pulpo.jpg'],
            province: 'Esmeraldas'
          },
          {
            id: 'seafood-004',
            name: 'Sardina',
            description: 'Sardina fresca rica en omega-3 y proteínas',
            category: 'Pescado y Mariscos',
            price: { perUnit: 3.25, unit: 'lb' },
            availability: 200,
            certifications: ['FRESCO'],
            images: ['assets/images/products/sardina.jpg'],
            province: 'Manabí'
          },
          {
            id: 'seafood-005',
            name: 'Concha Prieta',
            description: 'Concha prieta del manglar, delicia marina tradicional',
            category: 'Pescado y Mariscos',
            price: { perUnit: 4.75, unit: 'docena' },
            availability: 150,
            certifications: ['MANGLAR', 'TRADICIONAL'],
            images: ['assets/images/products/concha-prieta.jpg'],
            province: 'Esmeraldas'
          }
        ]
      },
      {
        category: 'Granos, Legumbres y Cereales',
        products: [
          {
            id: 'grains-001',
            name: 'Quinua Real',
            description: 'Quinua real de los Andes, superfood ancestral ecuatoriano',
            category: 'Granos, Legumbres y Cereales',
            price: { perUnit: 6.50, unit: 'lb' },
            availability: 180,
            certifications: ['ORGÁNICO', 'ANCESTRAL'],
            images: ['assets/images/products/quinua.jpg'],
            province: 'Chimborazo'
          },
          {
            id: 'grains-002',
            name: 'Amaranto',
            description: 'Amaranto andino rico en proteínas y minerales',
            category: 'Granos, Legumbres y Cereales',
            price: { perUnit: 5.25, unit: 'lb' },
            availability: 120,
            certifications: ['ORGÁNICO'],
            images: ['assets/images/products/amaranto.jpg'],
            province: 'Cotopaxi'
          },
          {
            id: 'grains-003',
            name: 'Lenteja Beluga',
            description: 'Lenteja beluga negra, variedad gourmet de los Andes',
            category: 'Granos, Legumbres y Cereales',
            price: { perUnit: 4.75, unit: 'lb' },
            availability: 100,
            certifications: ['GOURMET', 'ORGÁNICO'],
            images: ['assets/images/products/lenteja-beluga.jpg'],
            province: 'Loja'
          },
          {
            id: 'grains-004',
            name: 'Garbanzo',
            description: 'Garbanzo ecuatoriano ideal para sopas y ensaladas',
            category: 'Granos, Legumbres y Cereales',
            price: { perUnit: 3.50, unit: 'lb' },
            availability: 220,
            certifications: ['NATURAL'],
            images: ['assets/images/products/garbanzo.jpg'],
            province: 'Manabí'
          },
          {
            id: 'grains-005',
            name: 'Cebada Perlada',
            description: 'Cebada perlada de altura, perfecta para sopas nutritivas',
            category: 'Granos, Legumbres y Cereales',
            price: { perUnit: 2.75, unit: 'lb' },
            availability: 160,
            certifications: ['NATURAL'],
            images: ['assets/images/products/cebada.jpg'],
            province: 'Bolívar'
          }
        ]
      },
      {
        category: 'Panadería y Repostería',
        products: [
          {
            id: 'bakery-001',
            name: 'Pan de Yuca',
            description: 'Pan de yuca tradicional ecuatoriano, libre de gluten',
            category: 'Panadería y Repostería',
            price: { perUnit: 0.50, unit: 'unidad' },
            availability: 300,
            certifications: ['TRADICIONAL', 'SIN GLUTEN'],
            images: ['assets/images/products/pan-yuca.jpg'],
            province: 'Costa y Sierra'
          },
          {
            id: 'bakery-002',
            name: 'Bizcochos de Cayambe',
            description: 'Bizcochos tradicionales de Cayambe, patrimonio gastronómico',
            category: 'Panadería y Repostería',
            price: { perUnit: 1.25, unit: 'unidad' },
            availability: 150,
            certifications: ['PATRIMONIO', 'ARTESANAL'],
            images: ['assets/images/products/bizcochos-cayambe.jpg'],
            province: 'Pichincha'
          },
          {
            id: 'bakery-003',
            name: 'Tortillas de Maíz',
            description: 'Tortillas de maíz andino hechas a mano tradicionalmente',
            category: 'Panadería y Repostería',
            price: { perUnit: 0.75, unit: 'unidad' },
            availability: 200,
            certifications: ['ARTESANAL', 'MAÍZ CRIOLLO'],
            images: ['assets/images/products/tortillas-maiz.jpg'],
            province: 'Sierra'
          },
          {
            id: 'bakery-004',
            name: 'Alfajores',
            description: 'Alfajores artesanales rellenos de dulce de leche',
            category: 'Panadería y Repostería',
            price: { perUnit: 2.25, unit: 'unidad' },
            availability: 80,
            certifications: ['ARTESANAL'],
            images: ['assets/images/products/alfajores.jpg'],
            province: 'Azuay'
          },
          {
            id: 'bakery-005',
            name: 'Helados de Paila',
            description: 'Helados tradicionales de paila de Ibarra, únicos en el mundo',
            category: 'Panadería y Repostería',
            price: { perUnit: 1.50, unit: 'porción' },
            availability: 100,
            certifications: ['TRADICIONAL', 'ÚNICO'],
            images: ['assets/images/products/helados-paila.jpg'],
            province: 'Imbabura'
          }
        ]
      },
      {
        category: 'Bebidas e Infusiones',
        products: [
          {
            id: 'drinks-001',
            name: 'Café Especial',
            description: 'Café especial de altura con notas frutales y aromáticas',
            category: 'Bebidas e Infusiones',
            price: { perUnit: 8.50, unit: 'lb' },
            availability: 120,
            certifications: ['ORGÁNICO', 'COMERCIO JUSTO'],
            images: ['assets/images/products/cafe-especial.jpg'],
            province: 'Loja'
          },
          {
            id: 'drinks-002',
            name: 'Chocolate Puro',
            description: 'Chocolate puro 100% cacao nacional ecuatoriano',
            category: 'Bebidas e Infusiones',
            price: { perUnit: 12.75, unit: 'barra' },
            availability: 80,
            certifications: ['100% CACAO', 'FINO DE AROMA'],
            images: ['assets/images/products/chocolate-puro.jpg'],
            province: 'Manabí'
          },
          {
            id: 'drinks-003',
            name: 'Guayusa',
            description: 'Guayusa amazónica energizante natural de los pueblos ancestrales',
            category: 'Bebidas e Infusiones',
            price: { perUnit: 6.25, unit: 'paquete' },
            availability: 100,
            certifications: ['ANCESTRAL', 'ENERGIZANTE'],
            images: ['assets/images/products/guayusa.jpg'],
            province: 'Napo'
          },
          {
            id: 'drinks-004',
            name: 'Horchata Lojana',
            description: 'Horchata lojana tradicional con hierbas medicinales',
            category: 'Bebidas e Infusiones',
            price: { perUnit: 4.50, unit: 'paquete' },
            availability: 90,
            certifications: ['MEDICINAL', 'TRADICIONAL'],
            images: ['assets/images/products/horchata-lojana.jpg'],
            province: 'Loja'
          },
          {
            id: 'drinks-005',
            name: 'Chicha de Jora',
            description: 'Chicha de jora ancestral, bebida ceremonial de maíz',
            category: 'Bebidas e Infusiones',
            price: { perUnit: 3.75, unit: 'botella' },
            availability: 60,
            certifications: ['ANCESTRAL', 'CEREMONIAL'],
            images: ['assets/images/products/chicha-jora.jpg'],
            province: 'Imbabura'
          }
        ]
      },
      {
        category: 'Apícolas y Endémicos',
        products: [
          {
            id: 'honey-001',
            name: 'Miel de Abeja',
            description: 'Miel pura de abeja de los valles andinos ecuatorianos',
            category: 'Apícolas y Endémicos',
            price: { perUnit: 7.50, unit: 'frasco' },
            availability: 150,
            certifications: ['PURA', 'SIN ADITIVOS'],
            images: ['assets/images/products/miel-abeja.jpg'],
            province: 'Loja'
          },
          {
            id: 'honey-002',
            name: 'Polen',
            description: 'Polen de abeja natural, suplemento rico en proteínas',
            category: 'Apícolas y Endémicos',
            price: { perUnit: 12.50, unit: 'frasco' },
            availability: 80,
            certifications: ['NATURAL', 'SUPLEMENTO'],
            images: ['assets/images/products/polen.jpg'],
            province: 'Azuay'
          },
          {
            id: 'honey-003',
            name: 'Propóleo',
            description: 'Propóleo puro con propiedades antibacterianas naturales',
            category: 'Apícolas y Endémicos',
            price: { perUnit: 15.25, unit: 'gotero' },
            availability: 60,
            certifications: ['ANTIBACTERIANO', 'MEDICINAL'],
            images: ['assets/images/products/propoleo.jpg'],
            province: 'Cotopaxi'
          },
          {
            id: 'honey-004',
            name: 'Algarrobina',
            description: 'Algarrobina natural, edulcorante saludable de algarrobo',
            category: 'Apícolas y Endémicos',
            price: { perUnit: 8.75, unit: 'frasco' },
            availability: 100,
            certifications: ['NATURAL', 'EDULCORANTE'],
            images: ['assets/images/products/algarrobina.jpg'],
            province: 'Loja'
          },
          {
            id: 'honey-005',
            name: 'Miel de Eucalipto',
            description: 'Miel de eucalipto de Catamayo con propiedades expectorantes',
            category: 'Apícolas y Endémicos',
            price: { perUnit: 9.25, unit: 'frasco' },
            availability: 70,
            certifications: ['MEDICINAL', 'EXPECTORANTE'],
            images: ['assets/images/products/miel-eucalipto.jpg'],
            province: 'Loja'
          }
        ]
      },
      {
        category: 'Hierbas, Especias y Condimentos',
        products: [
          {
            id: 'herbs-001',
            name: 'Orégano Seco',
            description: 'Orégano seco aromático de los valles secos ecuatorianos',
            category: 'Hierbas, Especias y Condimentos',
            price: { perUnit: 3.25, unit: 'paquete' },
            availability: 200,
            certifications: ['AROMÁTICO', 'SECO'],
            images: ['assets/images/products/oregano-seco.jpg'],
            province: 'Loja'
          },
          {
            id: 'herbs-002',
            name: 'Achiote',
            description: 'Achiote amazónico natural para dar color y sabor',
            category: 'Hierbas, Especias y Condimentos',
            price: { perUnit: 4.75, unit: 'paquete' },
            availability: 120,
            certifications: ['AMAZÓNICO', 'COLORANTE NATURAL'],
            images: ['assets/images/products/achiote.jpg'],
            province: 'Amazonía'
          },
          {
            id: 'herbs-003',
            name: 'Hoja de Laurel',
            description: 'Hojas de laurel secas de la sierra ecuatoriana',
            category: 'Hierbas, Especias y Condimentos',
            price: { perUnit: 2.50, unit: 'paquete' },
            availability: 180,
            certifications: ['SECO', 'AROMÁTICO'],
            images: ['assets/images/products/laurel.jpg'],
            province: 'Sierra'
          },
          {
            id: 'herbs-004',
            name: 'Cúrcuma',
            description: 'Cúrcuma fresca de la costa con propiedades antiinflamatorias',
            category: 'Hierbas, Especias y Condimentos',
            price: { perUnit: 5.25, unit: 'lb' },
            availability: 90,
            certifications: ['ANTIINFLAMATORIA', 'MEDICINAL'],
            images: ['assets/images/products/curcuma.jpg'],
            province: 'Costa'
          },
          {
            id: 'herbs-005',
            name: 'Hierbaluisa',
            description: 'Hierbaluisa fresca de la sierra para infusiones relajantes',
            category: 'Hierbas, Especias y Condimentos',
            price: { perUnit: 1.75, unit: 'atado' },
            availability: 150,
            certifications: ['RELAJANTE', 'MEDICINAL'],
            images: ['assets/images/products/hierbaluisa.jpg'],
            province: 'Sierra'
          }
        ]
      }
    ];

    this.productsByCategory.set(productsData);
    this.isLoading.set(false);
  }

  /**
   * Navigate to product detail page
   */
  navigateToProduct(productId: string): void {
    this.router.navigate(['/producto', productId]);
  }

  /**
   * Navigate to producer profile
   */
  navigateToProducer(producerId: string): void {
    this.router.navigate(['/productor', producerId]);
  }

  /**
   * Filter products by category
   */
  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
  }

  /**
   * Add product to cart (placeholder)
   */
  addToCart(product: Product): void {
    console.log('Agregando al carrito:', product);
    // TODO: Implementar funcionalidad del carrito
  }

  /**
   * Handle image loading errors
   */
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-product.svg';
  }

  /**
   * Get background image style for multifruit decorative elements
   */
  getMultifruitBackgroundStyle(opacity: number = 0.1): string {
    return `background-image: url('${this.multifruitImage()}'); opacity: ${opacity}; background-size: cover; background-position: center; background-repeat: no-repeat;`;
  }
}