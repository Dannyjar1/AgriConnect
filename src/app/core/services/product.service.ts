import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // Signal para productos reactivos
  readonly products = signal<Product[]>([]);
  
  // BehaviorSubject para compatibilidad con observables
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  
  // Productos ecuatorianos completos organizados por categorías
  private readonly ecuadorianProducts: Product[] = [
    // FRUTAS
    {
      id: 'f1',
      producerId: 'prod-f001',
      name: 'Banano Premium',
      category: 'Frutas',
      description: 'Banano ecuatoriano de exportación, cultivado en las tierras fértiles de la costa ecuatoriana.',
      images: ['assets/images/banano.jpg'],
      price: { perUnit: 0.35, unit: 'unidad', minOrder: 10, maxOrder: 100 },
      availability: 500,
      province: 'El Oro, Guayas',
      certifications: ['ORGÁNICO', 'Rainforest Alliance'],
      traceability: {
        batch: 'BAN-2024-001',
        coordinates: { latitude: -3.2581, longitude: -79.9553 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'f2',
      producerId: 'prod-f002',
      name: 'Mango Tommy',
      category: 'Frutas',
      description: 'Mango ecuatoriano dulce y aromático, ideal para consumo fresco y preparaciones culinarias.',
      images: ['assets/images/mango.jpg'],
      price: { perUnit: 1.25, unit: 'unidad', minOrder: 5, maxOrder: 50 },
      availability: 200,
      province: 'Manabí, Los Ríos',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'MAN-2024-002',
        coordinates: { latitude: -1.0549, longitude: -80.7069 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'f3',
      producerId: 'prod-f003',
      name: 'Piña Golden',
      category: 'Frutas',
      description: 'Piña dorada ecuatoriana, jugosa y dulce, perfecta para jugos naturales y postres.',
      images: ['assets/images/pina.jpg'],
      price: { perUnit: 2.50, unit: 'unidad', minOrder: 3, maxOrder: 30 },
      availability: 150,
      province: 'Santo Domingo, Esmeraldas',
      certifications: ['ORGÁNICO', 'Fair Trade'],
      traceability: {
        batch: 'PIN-2024-003',
        coordinates: { latitude: -0.2500, longitude: -79.1667 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'f4',
      producerId: 'prod-f004',
      name: 'Granadilla Andina',
      category: 'Frutas',
      description: 'Granadilla de los Andes ecuatorianos, fruta tropical exótica rica en vitaminas.',
      images: ['assets/images/granadilla.jpg'],
      price: { perUnit: 3.50, unit: 'kg', minOrder: 1, maxOrder: 20 },
      availability: 80,
      province: 'Loja, Zamora Chinchipe',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'GRA-2024-004',
        coordinates: { latitude: -4.0079, longitude: -79.2113 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'f5',
      producerId: 'prod-f005',
      name: 'Mora de Castilla',
      category: 'Frutas',
      description: 'Mora andina ecuatoriana, rica en antioxidantes y perfecta para mermeladas.',
      images: ['assets/images/mora.jpg'],
      price: { perUnit: 4.00, unit: 'kg', minOrder: 1, maxOrder: 15 },
      availability: 60,
      province: 'Azuay, Tungurahua',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'MOR-2024-005',
        coordinates: { latitude: -2.9001, longitude: -79.0059 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'f6',
      producerId: 'prod-f006',
      name: 'Naranjilla',
      category: 'Frutas',
      description: 'Naranjilla ecuatoriana, fruta única con sabor agridulce, ideal para jugos refrescantes.',
      images: ['assets/images/naranjilla.jpg'],
      price: { perUnit: 2.80, unit: 'kg', minOrder: 2, maxOrder: 25 },
      availability: 100,
      province: 'Tungurahua, Napo',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'NAR-2024-006',
        coordinates: { latitude: -1.2544, longitude: -78.6267 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // LÁCTEOS
    {
      id: 'l1',
      producerId: 'prod-l001',
      name: 'Queso de Hoja Tradicional',
      category: 'Lácteos',
      description: 'Queso de hoja artesanal del norte del Ecuador, elaborado con técnicas tradicionales.',
      images: ['assets/images/queso-hoja.jpg'],
      price: { perUnit: 8.50, unit: 'kg', minOrder: 1, maxOrder: 10 },
      availability: 45,
      province: 'Imbabura, Carchi',
      certifications: ['Artesanal', 'Pastoreo Libre'],
      traceability: {
        batch: 'QUE-2024-001',
        coordinates: { latitude: 0.3547, longitude: -78.1223 },
        harvestMethod: 'Ordeño Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'l2',
      producerId: 'prod-l002',
      name: 'Yogurt Griego Natural',
      category: 'Lácteos',
      description: 'Yogurt griego cremoso y natural, elaborado con leche fresca de vacas alimentadas con pasto.',
      images: ['assets/images/yogurt-griego.jpg'],
      price: { perUnit: 3.25, unit: 'litro', minOrder: 2, maxOrder: 20 },
      availability: 120,
      province: 'Pichincha, Azuay',
      certifications: ['ORGÁNICO', 'Sin Conservantes'],
      traceability: {
        batch: 'YOG-2024-002',
        coordinates: { latitude: -0.2295, longitude: -78.5249 },
        harvestMethod: 'Proceso Artesanal'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'l3',
      producerId: 'prod-l003',
      name: 'Mantequilla Artesanal',
      category: 'Lácteos',
      description: 'Mantequilla artesanal cremosa, elaborada con métodos tradicionales de la sierra ecuatoriana.',
      images: ['assets/images/mantequilla.jpg'],
      price: { perUnit: 6.75, unit: 'kg', minOrder: 1, maxOrder: 8 },
      availability: 35,
      province: 'Bolívar, Tungurahua',
      certifications: ['Artesanal', 'Sin Aditivos'],
      traceability: {
        batch: 'MAN-2024-003',
        coordinates: { latitude: -1.5961, longitude: -79.0062 },
        harvestMethod: 'Batido Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // VERDURAS Y HORTALIZAS
    {
      id: 'v1',
      producerId: 'prod-v001',
      name: 'Papa Chaucha',
      category: 'Verduras y Hortalizas',
      description: 'Papa chaucha andina de excelente calidad, cultivada en los páramos del norte ecuatoriano.',
      images: ['assets/images/papa-chaucha.jpg'],
      price: { perUnit: 1.85, unit: 'kg', minOrder: 5, maxOrder: 100 },
      availability: 300,
      province: 'Carchi, Imbabura',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'PAP-2024-001',
        coordinates: { latitude: 0.8124, longitude: -77.7141 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'v2',
      producerId: 'prod-v002',
      name: 'Zanahoria Amarilla',
      category: 'Verduras y Hortalizas',
      description: 'Zanahoria amarilla ecuatoriana, rica en betacaroteno y cultivada en los valles interandinos.',
      images: ['assets/images/zanahoria-amarilla.jpg'],
      price: { perUnit: 2.20, unit: 'kg', minOrder: 3, maxOrder: 50 },
      availability: 180,
      province: 'Tungurahua, Chimborazo',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'ZAN-2024-002',
        coordinates: { latitude: -1.4677, longitude: -78.6543 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'v3',
      producerId: 'prod-v003',
      name: 'Brócoli Premium',
      category: 'Verduras y Hortalizas',
      description: 'Brócoli fresco de la sierra ecuatoriana, rico en nutrientes y cultivado orgánicamente.',
      images: ['assets/images/brocoli.jpg'],
      price: { perUnit: 3.80, unit: 'kg', minOrder: 2, maxOrder: 30 },
      availability: 90,
      province: 'Pichincha, Cotopaxi',
      certifications: ['ORGÁNICO', 'GlobalGAP'],
      traceability: {
        batch: 'BRO-2024-003',
        coordinates: { latitude: -0.6700, longitude: -78.6467 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // FRUTOS SECOS Y SEMILLAS
    {
      id: 's1',
      producerId: 'prod-s001',
      name: 'Maní Tostado Premium',
      category: 'Frutos Secos y Semillas',
      description: 'Maní ecuatoriano tostado artesanalmente, cultivado en la costa y procesado sin aditivos.',
      images: ['assets/images/mani-tostado.jpg'],
      price: { perUnit: 5.50, unit: 'kg', minOrder: 1, maxOrder: 20 },
      availability: 75,
      province: 'El Oro, Guayas',
      certifications: ['ORGÁNICO', 'Sin Sal Añadida'],
      traceability: {
        batch: 'MAN-2024-001',
        coordinates: { latitude: -3.5952, longitude: -79.9671 },
        harvestMethod: 'Tostado Artesanal'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 's2',
      producerId: 'prod-s002',
      name: 'Semillas de Chía',
      category: 'Frutos Secos y Semillas',
      description: 'Chía ecuatoriana de alta calidad, rica en omega-3 y fibra, ideal para dietas saludables.',
      images: ['assets/images/chia.jpg'],
      price: { perUnit: 12.50, unit: 'kg', minOrder: 1, maxOrder: 10 },
      availability: 40,
      province: 'Loja, Zamora Chinchipe',
      certifications: ['ORGÁNICO', 'Superfood'],
      traceability: {
        batch: 'CHI-2024-002',
        coordinates: { latitude: -4.0079, longitude: -79.2113 },
        harvestMethod: 'Secado Natural'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // CARNE Y AVES
    {
      id: 'c1',
      producerId: 'prod-c001',
      name: 'Carne de Cerdo Criolla',
      category: 'Carne y Aves',
      description: 'Carne de cerdo criollo ecuatoriano, criado en pastoreo libre en las montañas andinas.',
      images: ['assets/images/cerdo-criollo.jpg'],
      price: { perUnit: 8.90, unit: 'kg', minOrder: 2, maxOrder: 25 },
      availability: 65,
      province: 'Tungurahua, Los Ríos',
      certifications: ['Pastoreo Libre', 'Sin Hormonas'],
      traceability: {
        batch: 'CER-2024-001',
        coordinates: { latitude: -1.2544, longitude: -78.6267 },
        harvestMethod: 'Crianza Natural'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'c2',
      producerId: 'prod-c002',
      name: 'Pollo Criollo',
      category: 'Carne y Aves',
      description: 'Pollo criollo ecuatoriano criado al aire libre, alimentado con granos naturales.',
      images: ['assets/images/pollo-criollo.jpg'],
      price: { perUnit: 7.25, unit: 'kg', minOrder: 1, maxOrder: 20 },
      availability: 85,
      province: 'Azuay, Loja',
      certifications: ['Pastoreo Libre', 'ORGÁNICO'],
      traceability: {
        batch: 'POL-2024-002',
        coordinates: { latitude: -2.9001, longitude: -79.0059 },
        harvestMethod: 'Crianza Tradicional'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // PESCADO Y MARISCOS
    {
      id: 'p1',
      producerId: 'prod-p001',
      name: 'Corvina Fresca',
      category: 'Pescado y Mariscos',
      description: 'Corvina fresca del Pacífico ecuatoriano, pescada de manera sustentable por pescadores artesanales.',
      images: ['assets/images/corvina.jpg'],
      price: { perUnit: 9.50, unit: 'kg', minOrder: 1, maxOrder: 15 },
      availability: 55,
      province: 'Manabí, Santa Elena',
      certifications: ['Pesca Sustentable', 'Fresco del Día'],
      traceability: {
        batch: 'COR-2024-001',
        coordinates: { latitude: -1.0409, longitude: -81.0001 },
        harvestMethod: 'Pesca Artesanal'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'p2',
      producerId: 'prod-p002',
      name: 'Langostinos Jumbo',
      category: 'Pescado y Mariscos',
      description: 'Langostinos jumbo ecuatorianos de acuacultura responsable, frescos y de gran tamaño.',
      images: ['assets/images/langostinos.jpg'],
      price: { perUnit: 15.75, unit: 'kg', minOrder: 1, maxOrder: 10 },
      availability: 30,
      province: 'Guayas, El Oro',
      certifications: ['Acuacultura Responsable', 'ASC'],
      traceability: {
        batch: 'LAN-2024-002',
        coordinates: { latitude: -2.2105, longitude: -79.8877 },
        harvestMethod: 'Acuacultura'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // GRANOS, LEGUMBRES Y CEREALES
    {
      id: 'g1',
      producerId: 'prod-g001',
      name: 'Quinua Real Andina',
      category: 'Granos, Legumbres y Cereales',
      description: 'Quinua real ecuatoriana de los Andes, grano ancestral rico en proteínas y aminoácidos.',
      images: ['assets/images/quinua.jpg'],
      price: { perUnit: 8.90, unit: 'kg', minOrder: 1, maxOrder: 25 },
      availability: 120,
      province: 'Chimborazo, Imbabura',
      certifications: ['ORGÁNICO', 'Comercio Justo'],
      traceability: {
        batch: 'QUI-2024-001',
        coordinates: { latitude: -1.6635, longitude: -78.6543 },
        harvestMethod: 'Cosecha Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'g2',
      producerId: 'prod-g002',
      name: 'Amaranto Andino',
      category: 'Granos, Legumbres y Cereales',
      description: 'Amaranto ecuatoriano, pseudocereal andino rico en proteínas y libre de gluten.',
      images: ['assets/images/amaranto.jpg'],
      price: { perUnit: 6.75, unit: 'kg', minOrder: 1, maxOrder: 20 },
      availability: 80,
      province: 'Cotopaxi, Tungurahua',
      certifications: ['ORGÁNICO', 'Libre de Gluten'],
      traceability: {
        batch: 'AMA-2024-002',
        coordinates: { latitude: -0.9320, longitude: -78.6155 },
        harvestMethod: 'Cosecha Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // PANADERÍA Y REPOSTERÍA
    {
      id: 'pr1',
      producerId: 'prod-pr001',
      name: 'Pan de Yuca Tradicional',
      category: 'Panadería y Repostería',
      description: 'Pan de yuca ecuatoriano tradicional, horneado con almidón de yuca y queso fresco.',
      images: ['assets/images/pan-yuca.jpg'],
      price: { perUnit: 2.50, unit: 'unidad', minOrder: 6, maxOrder: 50 },
      availability: 100,
      province: 'Costa y Sierra',
      certifications: ['Artesanal', 'Tradicional'],
      traceability: {
        batch: 'PAN-2024-001',
        coordinates: { latitude: -0.2295, longitude: -78.5249 },
        harvestMethod: 'Horneado Artesanal'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'pr2',
      producerId: 'prod-pr002',
      name: 'Bizcochos de Cayambe',
      category: 'Panadería y Repostería',
      description: 'Bizcochos tradicionales de Cayambe, dulces típicos elaborados con receta ancestral.',
      images: ['assets/images/bizcochos-cayambe.jpg'],
      price: { perUnit: 4.25, unit: 'docena', minOrder: 1, maxOrder: 20 },
      availability: 60,
      province: 'Pichincha',
      certifications: ['Denominación de Origen', 'Artesanal'],
      traceability: {
        batch: 'BIZ-2024-002',
        coordinates: { latitude: 0.0417, longitude: -78.1500 },
        harvestMethod: 'Horneado Tradicional'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // BEBIDAS E INFUSIONES
    {
      id: 'b1',
      producerId: 'prod-b001',
      name: 'Café Especial Lojano',
      category: 'Bebidas e Infusiones',
      description: 'Café arábiga especial de Loja, cultivado en altura con métodos orgánicos y tostado artesanalmente.',
      images: ['assets/images/cafe-loja.jpg'],
      price: { perUnit: 18.50, unit: 'kg', minOrder: 1, maxOrder: 15 },
      availability: 45,
      province: 'Loja, Manabí',
      certifications: ['ORGÁNICO', 'Comercio Justo', 'Café Especial'],
      traceability: {
        batch: 'CAF-2024-001',
        coordinates: { latitude: -4.0079, longitude: -79.2113 },
        harvestMethod: 'Recolección Selectiva'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'b2',
      producerId: 'prod-b002',
      name: 'Chocolate Puro Nacional',
      category: 'Bebidas e Infusiones',
      description: 'Chocolate puro ecuatoriano elaborado con cacao nacional fino de aroma, sin aditivos artificiales.',
      images: ['assets/images/chocolate-puro.jpg'],
      price: { perUnit: 15.90, unit: 'kg', minOrder: 1, maxOrder: 12 },
      availability: 35,
      province: 'Manabí, Esmeraldas',
      certifications: ['ORGÁNICO', 'Cacao Fino de Aroma'],
      traceability: {
        batch: 'CHO-2024-002',
        coordinates: { latitude: 0.9824, longitude: -79.6519 },
        harvestMethod: 'Proceso Artesanal'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'b3',
      producerId: 'prod-b003',
      name: 'Guayusa Amazónica',
      category: 'Bebidas e Infusiones',
      description: 'Guayusa ecuatoriana de la Amazonía, hoja sagrada con propiedades energizantes naturales.',
      images: ['assets/images/guayusa.jpg'],
      price: { perUnit: 12.00, unit: 'kg', minOrder: 1, maxOrder: 10 },
      availability: 25,
      province: 'Napo, Pastaza',
      certifications: ['ORGÁNICO', 'Comercio Justo', 'Ancestral'],
      traceability: {
        batch: 'GUA-2024-003',
        coordinates: { latitude: -1.0833, longitude: -77.8167 },
        harvestMethod: 'Recolección Tradicional'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // APÍCOLAS Y ENDÉMICOS
    {
      id: 'a1',
      producerId: 'prod-a001',
      name: 'Miel de Abeja Pura',
      category: 'Apícolas y Endémicos',
      description: 'Miel de abeja ecuatoriana 100% pura, recolectada de colmenas en bosques andinos.',
      images: ['assets/images/miel-abeja.jpg'],
      price: { perUnit: 14.50, unit: 'kg', minOrder: 1, maxOrder: 15 },
      availability: 70,
      province: 'Loja, Imbabura',
      certifications: ['ORGÁNICO', '100% Pura'],
      traceability: {
        batch: 'MIE-2024-001',
        coordinates: { latitude: 0.3547, longitude: -78.1223 },
        harvestMethod: 'Extracción Natural'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'a2',
      producerId: 'prod-a002',
      name: 'Polen Natural',
      category: 'Apícolas y Endémicos',
      description: 'Polen natural ecuatoriano, suplemento rico en proteínas y vitaminas recolectado por abejas.',
      images: ['assets/images/polen.jpg'],
      price: { perUnit: 22.00, unit: 'kg', minOrder: 1, maxOrder: 8 },
      availability: 20,
      province: 'Azuay, Pichincha',
      certifications: ['ORGÁNICO', 'Superalimento'],
      traceability: {
        batch: 'POL-2024-002',
        coordinates: { latitude: -2.9001, longitude: -79.0059 },
        harvestMethod: 'Recolección Selectiva'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // HIERBAS, ESPECIAS Y CONDIMENTOS
    {
      id: 'h1',
      producerId: 'prod-h001',
      name: 'Orégano Seco Premium',
      category: 'Hierbas, Especias y Condimentos',
      description: 'Orégano ecuatoriano seco de alta calidad, aromático y cultivado orgánicamente.',
      images: ['assets/images/oregano.jpg'],
      price: { perUnit: 8.75, unit: 'kg', minOrder: 1, maxOrder: 12 },
      availability: 40,
      province: 'Loja, Manabí',
      certifications: ['ORGÁNICO'],
      traceability: {
        batch: 'ORE-2024-001',
        coordinates: { latitude: -4.0079, longitude: -79.2113 },
        harvestMethod: 'Secado Natural'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'h2',
      producerId: 'prod-h002',
      name: 'Achiote Amazónico',
      category: 'Hierbas, Especias y Condimentos',
      description: 'Achiote ecuatoriano de la Amazonía, condimento natural y colorante usado ancestralmente.',
      images: ['assets/images/achiote.jpg'],
      price: { perUnit: 6.50, unit: 'kg', minOrder: 1, maxOrder: 15 },
      availability: 50,
      province: 'Amazonía',
      certifications: ['ORGÁNICO', 'Ancestral'],
      traceability: {
        batch: 'ACH-2024-002',
        coordinates: { latitude: -1.8312, longitude: -78.1834 },
        harvestMethod: 'Recolección Silvestre'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    // Inicializar con productos ecuatorianos completos
    this.products.set(this.ecuadorianProducts);
    this.productsSubject.next(this.ecuadorianProducts);
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductsSignal() {
    return this.products;
  }

  getProductById(id: string): Observable<Product | undefined> {
    // TODO: Reemplazar con llamada a API/Base de Datos
    const currentProducts = this.products();
    const product = currentProducts.find(p => p.id === id);
    return of(product);
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    // TODO: Reemplazar con llamada a API/Base de Datos
    const currentProducts = this.products();
    const filtered = currentProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.province && product.province.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return of(filtered);
  }

  filterByCategory(category: string): Observable<Product[]> {
    // TODO: Reemplazar con llamada a API/Base de Datos
    const currentProducts = this.products();
    const filtered = currentProducts.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
    return of(filtered);
  }

  getProductsByCategory(): Observable<{category: string, products: Product[]}[]> {
    const currentProducts = this.products();
    const categoriesMap = new Map<string, Product[]>();
    
    currentProducts.forEach(product => {
      const category = product.category;
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, []);
      }
      categoriesMap.get(category)!.push(product);
    });

    const categorizedProducts = Array.from(categoriesMap.entries()).map(([category, products]) => ({
      category,
      products: products.sort((a, b) => a.name.localeCompare(b.name))
    }));

    // Ordenar las categorías
    categorizedProducts.sort((a, b) => a.category.localeCompare(b.category));

    return of(categorizedProducts);
  }

  // Método para cargar productos desde API (listo para implementar)
  loadProductsFromAPI(): Observable<Product[]> {
    // TODO: Implementar llamada HTTP a la API
    // return this.http.get<Product[]>('/api/products');
    return of([]);
  }

  // Método para actualizar productos dinámicamente
  updateProducts(products: Product[]): void {
    this.products.set(products);
    this.productsSubject.next(products);
  }

  // Obtener categorías únicas
  getCategories(): Observable<string[]> {
    const currentProducts = this.products();
    const uniqueCategories = [...new Set(currentProducts.map(p => p.category))];
    return of(uniqueCategories.sort());
  }
}