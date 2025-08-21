import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Recipe, ScaledRecipe, ScaledIngredient } from '../../core/models/recipe.model';
import { RecipeService } from '../../core/services/recipe.service';
import { CartService } from '../../core/services/cart';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface RecipeSearchForm {
  searchTerm: string;
  category: string;
  portions: number;
  difficulty: string;
}

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedHeaderComponent
  ],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss']
})
export class Recetas implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly cartService = inject(CartService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Señales reactivas
  readonly allRecipes = signal<Recipe[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedCategory = signal<string>('');
  readonly selectedRecipe = signal<Recipe | null>(null);
  readonly selectedPortions = signal<number>(4);
  readonly showModal = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  
  // Imagen de decoración
  readonly decorativeImage = signal<string>('assets/images/multifrutas.webp');

  // Formulario reactivo
  readonly searchForm: FormGroup<any> = this.fb.group({
    searchTerm: [''],
    category: [''],
    portions: [4],
    difficulty: ['']
  });

  // Observable para recetas filtradas
  readonly filteredRecipes$: Observable<Recipe[]>;

  // Categorías disponibles
  readonly categories = computed(() => {
    const recipes = this.allRecipes();
    const uniqueCategories = [...new Set(recipes.map(r => r.categoria).filter(Boolean))];
    return ['Todas', ...uniqueCategories];
  });

  // Dificultades disponibles
  readonly difficulties = ['Todas', 'Fácil', 'Media', 'Difícil'];

  // Receta escalada actual
  readonly scaledRecipe = computed<ScaledRecipe | null>(() => {
    const recipe = this.selectedRecipe();
    const portions = this.selectedPortions();
    
    if (!recipe) return null;
    
    try {
      return this.recipeService.scaleRecipe(recipe, portions);
    } catch (error) {
      console.error('Error scaling recipe:', error);
      return null;
    }
  });

  // Ingredientes agrupados por categoría
  readonly ingredientsByCategory = computed(() => {
    const scaled = this.scaledRecipe();
    if (!scaled) return {};
    
    return this.recipeService.getIngredientsGroupedByCategory(scaled);
  });

  constructor() {
    // Configurar filtros reactivos
    this.filteredRecipes$ = combineLatest([
      this.recipeService.getRecipes(),
      this.searchForm.valueChanges.pipe(
        startWith(this.searchForm.value),
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([recipes, filters]) => this.filterRecipes(recipes, filters))
    );

    // Suscribirse a errores del servicio
    this.recipeService.error$.subscribe(error => {
      this.error.set(error);
    });
  }

  ngOnInit(): void {
    this.loadRecipes();
  }

  private loadRecipes(): void {
    this.isLoading.set(true);
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        this.allRecipes.set(recipes);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando recetas:', error);
        this.error.set('Error al cargar las recetas. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  private filterRecipes(recipes: Recipe[], filters: Partial<RecipeSearchForm>): Recipe[] {
    if (!recipes || !filters) return recipes;

    return recipes.filter(recipe => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          recipe.nombre.toLowerCase().includes(searchTerm) ||
          recipe.descripcion?.toLowerCase().includes(searchTerm) ||
          recipe.ingredientes.some(ingredient => 
            ingredient.nombre.toLowerCase().includes(searchTerm)
          );
        if (!matchesSearch) return false;
      }

      // Filtro por categoría
      if (filters.category && filters.category !== 'Todas') {
        if (recipe.categoria !== filters.category) return false;
      }

      // Filtro por dificultad
      if (filters.difficulty && filters.difficulty !== 'Todas') {
        if (recipe.dificultad !== filters.difficulty) return false;
      }

      return true;
    });
  }

  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
    this.searchForm.patchValue({ category });
  }

  onDifficultySelect(difficulty: string): void {
    this.searchForm.patchValue({ difficulty });
  }

  onClearFilters(): void {
    this.searchForm.reset();
    this.searchForm.patchValue({ portions: 4 });
    this.selectedCategory.set('');
  }

  openRecipeDetail(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
    this.selectedPortions.set(4); // Porción por defecto
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedRecipe.set(null);
  }

  updatePortions(portions: number): void {
    if (portions > 0 && portions <= 50) { // Límite razonable
      this.selectedPortions.set(portions);
    }
  }

  addRecipeToCart(): void {
    const recipe = this.selectedRecipe();
    const portions = this.selectedPortions();
    
    if (!recipe) return;

    try {
      const recipeCartItem = this.recipeService.createRecipeCartItem(recipe, portions);
      
      // Convertir ingredientes a productos para el carrito
      recipeCartItem.ingredientes.forEach(ingredient => {
        // Crear un pseudo-producto para cada ingrediente
        const pseudoProduct = {
          id: `recipe-ingredient-${recipe.id}-${ingredient.nombre}`,
          name: `${ingredient.nombre} (${recipe.nombre})`,
          description: `Ingrediente para la receta: ${recipe.nombre}`,
          price: { perUnit: 0, unit: ingredient.unidad },
          category: ingredient.categoria,
          images: [this.decorativeImage()],
          availability: 999,
          certifications: [],
          producerName: 'Receta',
          producerId: 'recipe',
          province: 'Receta',
          registeredBy: 'recipe-system',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        this.cartService.add(pseudoProduct, ingredient.cantidad_final);
      });

      this.closeModal();
      this.error.set(null);
      
      console.log('Receta agregada al carrito:', recipe.nombre, 'para', portions, 'personas');
      
    } catch (error) {
      console.error('Error agregando receta al carrito:', error);
      this.error.set('Error al agregar la receta al carrito.');
    }
  }

  clearError(): void {
    this.error.set(null);
    this.recipeService.clearError();
  }

  formatQuantity(quantity: number): string {
    // Formatear cantidad para mostrar decimales solo cuando sea necesario
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
  }

  getRecipeImage(recipe: Recipe): string {
    return recipe.imagen || this.decorativeImage();
  }

  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      if (!img.src.includes('multifrutas.webp')) {
        img.src = this.decorativeImage();
      } else {
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent) {
          parent.innerHTML = '<div class="w-full h-40 flex items-center justify-center bg-gray-100 rounded-lg"><span class="material-icons text-gray-400 text-2xl">restaurant</span></div>';
        }
      }
    }
  }

  getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPreparationTimeText(time?: number): string {
    if (!time) return 'Tiempo no especificado';
    return time < 60 ? `${time} min` : `${Math.floor(time / 60)}h ${time % 60}min`;
  }
}