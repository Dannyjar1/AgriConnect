import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeedService {
  private firestore = inject(Firestore);

  // Datos de ejemplo para productores
  private readonly sampleProducers = [
    {
      name: "Finca La Esperanza",
      displayName: "La Esperanza - Frutas Orgánicas",
      email: "contacto@laesperanza.com",
      phone: "+593-99-123-4567",
      address: "Km 15 Vía a Daule",
      province: "Guayas",
      logoUrl: "https://via.placeholder.com/150x150/22c55e/ffffff?text=LE",
      companyName: "Finca La Esperanza S.A.",
      productName: "Bananos Orgánicos",
      type: "company",
      contactInfo: {
        phone: "+593-99-123-4567",
        email: "contacto@laesperanza.com",
        address: "Km 15 Vía a Daule, Guayas"
      },
      certifications: ["Frutas", "Orgánico", "Fair Trade"],
      registeredBy: "system-seed",
      registeredAt: new Date(),
      isActive: true,
      products: []
    },
    {
      name: "Cooperativa San Miguel",
      displayName: "Cooperativa San Miguel",
      email: "info@coopsanmiguel.com",
      phone: "+593-98-765-4321",
      address: "Sector El Calvario, Parroquia San Miguel",
      province: "Cotopaxi",
      logoUrl: "https://via.placeholder.com/150x150/3b82f6/ffffff?text=CSM",
      companyName: "Cooperativa San Miguel de Productores",
      productName: "Quinua Premium",
      type: "cooperative",
      contactInfo: {
        phone: "+593-98-765-4321",
        email: "info@coopsanmiguel.com",
        address: "Sector El Calvario, Parroquia San Miguel, Cotopaxi"
      },
      certifications: ["Granos, Legumbres y Cereales", "Orgánico"],
      registeredBy: "system-seed",
      registeredAt: new Date(),
      isActive: true,
      products: []
    },
    {
      name: "Don Carlos Pérez",
      displayName: "Huerta Don Carlos",
      email: "doncarlos@gmail.com",
      phone: "+593-97-888-9999",
      address: "Sector La Tola, Vía a Ambato",
      province: "Tungurahua",
      logoUrl: "https://via.placeholder.com/150x150/f59e0b/ffffff?text=DC",
      companyName: "",
      productName: "Hortalizas Frescas",
      type: "individual",
      contactInfo: {
        phone: "+593-97-888-9999",
        email: "doncarlos@gmail.com",
        address: "Sector La Tola, Vía a Ambato, Tungurahua"
      },
      certifications: ["Verduras y Hortalizas"],
      registeredBy: "system-seed",
      registeredAt: new Date(),
      isActive: true,
      products: []
    },
    {
      name: "Lácteos Andinos",
      displayName: "Lácteos Andinos Premium",
      email: "ventas@lacteosandinos.com",
      phone: "+593-96-555-1234",
      address: "Panamericana Norte Km 25",
      province: "Pichincha",
      logoUrl: "https://via.placeholder.com/150x150/8b5cf6/ffffff?text=LA",
      companyName: "Lácteos Andinos Cía. Ltda.",
      productName: "Quesos Artesanales",
      type: "company",
      contactInfo: {
        phone: "+593-96-555-1234",
        email: "ventas@lacteosandinos.com",
        address: "Panamericana Norte Km 25, Pichincha"
      },
      certifications: ["Lácteos", "Artesanal"],
      registeredBy: "system-seed",
      registeredAt: new Date(),
      isActive: true,
      products: []
    },
    {
      name: "Granja Avícola El Roble",
      displayName: "Granja El Roble",
      email: "contacto@granjaelroble.com",
      phone: "+593-95-444-5678",
      address: "Vía Machachi - Aloasí Km 8",
      province: "Pichincha",
      logoUrl: "https://via.placeholder.com/150x150/ef4444/ffffff?text=GR",
      companyName: "Granja Avícola El Roble",
      productName: "Pollos de Campo",
      type: "company",
      contactInfo: {
        phone: "+593-95-444-5678",
        email: "contacto@granjaelroble.com",
        address: "Vía Machachi - Aloasí Km 8, Pichincha"
      },
      certifications: ["Carne y Aves", "Campo Libre"],
      registeredBy: "system-seed",
      registeredAt: new Date(),
      isActive: true,
      products: []
    },
    {
      name: "Hierbas del Ecuador",
      displayName: "Hierbas Medicinales del Ecuador",
      email: "info@hierbasecuador.com",
      phone: "+593-94-333-2222",
      address: "Comunidad Salasaca",
      province: "Tungurahua",
      logoUrl: "https://via.placeholder.com/150x150/22c55e/ffffff?text=HE",
      companyName: "Hierbas del Ecuador S.A.",
      productName: "Plantas Medicinales",
      type: "association",
      contactInfo: {
        phone: "+593-94-333-2222",
        email: "info@hierbasecuador.com",
        address: "Comunidad Salasaca, Tungurahua"
      },
      certifications: ["Hierbas, Especias y Condimentos", "Medicinal", "Orgánico"],
      registeredBy: "system-seed",
      registeredAt: new Date(),
      isActive: true,
      products: []
    }
  ];

  /**
   * Verificar si existen datos en la base de datos
   */
  checkExistingData(): Observable<{hasProducers: boolean, hasProducts: boolean, producersCount: number, productsCount: number}> {
    const producersCheck = from(getDocs(collection(this.firestore, 'producers')));
    const productsCheck = from(getDocs(collection(this.firestore, 'products')));

    return producersCheck.pipe(
      switchMap(producersSnapshot => 
        productsCheck.pipe(
          map(productsSnapshot => ({
            hasProducers: producersSnapshot.size > 0,
            hasProducts: productsSnapshot.size > 0,
            producersCount: producersSnapshot.size,
            productsCount: productsSnapshot.size
          }))
        )
      ),
      catchError(error => {
        console.error('Error checking existing data:', error);
        return of({hasProducers: false, hasProducts: false, producersCount: 0, productsCount: 0});
      })
    );
  }

  /**
   * Insertar productores de ejemplo
   */
  insertProducers(): Observable<string[]> {
    const producerPromises = this.sampleProducers.map(producer =>
      addDoc(collection(this.firestore, 'producers'), producer)
    );

    return from(Promise.all(producerPromises)).pipe(
      map(docRefs => docRefs.map(docRef => docRef.id)),
      catchError(error => {
        console.error('Error inserting producers:', error);
        throw error;
      })
    );
  }

  /**
   * Insertar productos de ejemplo
   */
  insertProducts(producerIds: string[]): Observable<string[]> {
    const sampleProducts = [
      {
        producerId: producerIds[0], // Finca La Esperanza
        producerName: "Finca La Esperanza",
        name: "Banano Orgánico Premium",
        category: "Frutas",
        description: "Bananos orgánicos cultivados sin pesticidas, con certificación internacional. Ideal para exportación y consumo local.",
        images: ["https://via.placeholder.com/400x300/22c55e/ffffff?text=Banano+Org%C3%A1nico"],
        price: { perUnit: 1.25, unit: "kg", minOrder: 50, maxOrder: 1000 },
        availability: 500,
        province: "Guayas",
        certifications: ["Orgánico", "Fair Trade", "Global GAP"],
        traceability: {
          batch: "BAN-2024-001",
          coordinates: { latitude: -2.1894, longitude: -79.8890 },
          harvestMethod: "Manual selectivo"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[0], // Finca La Esperanza
        producerName: "Finca La Esperanza",
        name: "Maracuyá Premium",
        category: "Frutas",
        description: "Maracuyá de primera calidad, con alto contenido de pulpa. Perfecto para jugos y postres.",
        images: ["https://via.placeholder.com/400x300/f59e0b/ffffff?text=Maracuy%C3%A1"],
        price: { perUnit: 2.10, unit: "kg", minOrder: 30, maxOrder: 800 },
        availability: 250,
        province: "Guayas",
        certifications: ["Premium", "Alto Rendimiento", "Cultivo Sustentable"],
        traceability: {
          batch: "MAR-2024-002",
          coordinates: { latitude: -2.1894, longitude: -79.8890 },
          harvestMethod: "Cosecha por madurez"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[1], // Cooperativa San Miguel
        producerName: "Cooperativa San Miguel",
        name: "Quinua Real Premium",
        category: "Granos, Legumbres y Cereales",
        description: "Quinua real de los páramos ecuatorianos, rica en proteínas y aminoácidos esenciales. Producto de comercio justo.",
        images: ["https://via.placeholder.com/400x300/f59e0b/ffffff?text=Quinua+Real"],
        price: { perUnit: 4.50, unit: "kg", minOrder: 25, maxOrder: 500 },
        availability: 200,
        province: "Cotopaxi",
        certifications: ["Orgánico", "Fair Trade", "Libre de Gluten"],
        traceability: {
          batch: "QUI-2024-003",
          coordinates: { latitude: -0.6847, longitude: -78.6735 },
          harvestMethod: "Cosecha tradicional"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[2], // Don Carlos Pérez
        producerName: "Don Carlos Pérez",
        name: "Lechuga Hidropónica",
        category: "Verduras y Hortalizas",
        description: "Lechuga cultivada en sistema hidropónico, libre de tierra y pesticidas. Frescura garantizada.",
        images: ["https://via.placeholder.com/400x300/22c55e/ffffff?text=Lechuga+Hidrop%C3%B3nica"],
        price: { perUnit: 0.75, unit: "unidad", minOrder: 100, maxOrder: 2000 },
        availability: 800,
        province: "Tungurahua",
        certifications: ["Hidropónico", "Libre de Pesticidas"],
        traceability: {
          batch: "LEC-2024-004",
          coordinates: { latitude: -1.2486, longitude: -78.6267 },
          harvestMethod: "Corte manual"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[2], // Don Carlos Pérez
        producerName: "Don Carlos Pérez",
        name: "Tomate Riñón",
        category: "Verduras y Hortalizas",
        description: "Tomates riñón de invernadero, perfectos para ensaladas y preparaciones culinarias.",
        images: ["https://via.placeholder.com/400x300/ef4444/ffffff?text=Tomate+Ri%C3%B1%C3%B3n"],
        price: { perUnit: 1.10, unit: "kg", minOrder: 50, maxOrder: 1000 },
        availability: 300,
        province: "Tungurahua",
        certifications: ["Invernadero", "Buenas Prácticas Agrícolas"],
        traceability: {
          batch: "TOM-2024-005",
          coordinates: { latitude: -1.2486, longitude: -78.6267 },
          harvestMethod: "Recolección selectiva"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[3], // Lácteos Andinos
        producerName: "Lácteos Andinos",
        name: "Queso Fresco Artesanal",
        category: "Lácteos",
        description: "Queso fresco elaborado artesanalmente con leche de vacas de pastoreo libre. Sabor tradicional ecuatoriano.",
        images: ["https://via.placeholder.com/400x300/f3f4f6/000000?text=Queso+Fresco"],
        price: { perUnit: 3.25, unit: "kg", minOrder: 10, maxOrder: 200 },
        availability: 150,
        province: "Pichincha",
        certifications: ["Artesanal", "Pastoreo Libre", "Sin Conservantes"],
        traceability: {
          batch: "QUE-2024-006",
          coordinates: { latitude: -0.1807, longitude: -78.4678 },
          harvestMethod: "Ordeño diario"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[3], // Lácteos Andinos
        producerName: "Lácteos Andinos",
        name: "Yogurt Natural",
        category: "Lácteos",
        description: "Yogurt natural sin azúcar añadida, rico en probióticos. Elaborado con leche fresca de la sierra.",
        images: ["https://via.placeholder.com/400x300/ddd6fe/000000?text=Yogurt+Natural"],
        price: { perUnit: 2.80, unit: "litro", minOrder: 20, maxOrder: 500 },
        availability: 100,
        province: "Pichincha",
        certifications: ["Sin Azúcar", "Probióticos", "Leche Fresca"],
        traceability: {
          batch: "YOG-2024-007",
          coordinates: { latitude: -0.1807, longitude: -78.4678 },
          harvestMethod: "Fermentación natural"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[4], // Granja Avícola El Roble
        producerName: "Granja Avícola El Roble",
        name: "Pollo de Campo",
        category: "Carne y Aves",
        description: "Pollos criados al aire libre con alimentación natural. Carne tierna y sabrosa.",
        images: ["https://via.placeholder.com/400x300/fde68a/000000?text=Pollo+de+Campo"],
        price: { perUnit: 4.20, unit: "kg", minOrder: 20, maxOrder: 500 },
        availability: 80,
        province: "Pichincha",
        certifications: ["Campo Libre", "Alimentación Natural", "Sin Hormonas"],
        traceability: {
          batch: "POL-2024-008",
          coordinates: { latitude: -0.3516, longitude: -78.5654 },
          harvestMethod: "Sacrificio humanitario"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[5], // Hierbas del Ecuador
        producerName: "Hierbas del Ecuador",
        name: "Manzanilla Deshidratada",
        category: "Hierbas, Especias y Condimentos",
        description: "Flores de manzanilla deshidratadas naturalmente. Perfecta para infusiones relajantes.",
        images: ["https://via.placeholder.com/400x300/fef3c7/000000?text=Manzanilla"],
        price: { perUnit: 8.50, unit: "kg", minOrder: 5, maxOrder: 100 },
        availability: 50,
        province: "Tungurahua",
        certifications: ["Orgánico", "Deshidratado Natural", "Medicinal"],
        traceability: {
          batch: "MAN-2024-009",
          coordinates: { latitude: -1.2570, longitude: -78.6151 },
          harvestMethod: "Recolección manual"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        producerId: producerIds[5], // Hierbas del Ecuador
        producerName: "Hierbas del Ecuador",
        name: "Orégano Seco",
        category: "Hierbas, Especias y Condimentos",
        description: "Orégano ecuatoriano secado al sol, con aroma y sabor intensos. Ideal para condimentar.",
        images: ["https://via.placeholder.com/400x300/22c55e/ffffff?text=Or%C3%A9gano+Seco"],
        price: { perUnit: 12.00, unit: "kg", minOrder: 2, maxOrder: 50 },
        availability: 30,
        province: "Tungurahua",
        certifications: ["Orgánico", "Secado Solar", "Sin Aditivos"],
        traceability: {
          batch: "ORE-2024-010",
          coordinates: { latitude: -1.2570, longitude: -78.6151 },
          harvestMethod: "Cosecha selectiva"
        },
        registeredBy: "system-seed",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ];

    const productPromises = sampleProducts.map(product =>
      addDoc(collection(this.firestore, 'products'), product)
    );

    return from(Promise.all(productPromises)).pipe(
      map(docRefs => docRefs.map(docRef => docRef.id)),
      catchError(error => {
        console.error('Error inserting products:', error);
        throw error;
      })
    );
  }

  /**
   * Ejecutar el seed completo
   */
  runSeed(): Observable<{success: boolean, message: string, producersCount: number, productsCount: number}> {
    return this.insertProducers().pipe(
      switchMap(producerIds => 
        this.insertProducts(producerIds).pipe(
          map(productIds => ({
            success: true,
            message: 'Base de datos llenada exitosamente',
            producersCount: producerIds.length,
            productsCount: productIds.length
          }))
        )
      ),
      catchError(error => {
        console.error('Error running seed:', error);
        return of({
          success: false,
          message: `Error llenando la base de datos: ${error.message}`,
          producersCount: 0,
          productsCount: 0
        });
      })
    );
  }
}