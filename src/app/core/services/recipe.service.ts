import { Injectable, inject } from '@angular/core';
import { Observable, map, BehaviorSubject, catchError, of } from 'rxjs';
import { Firebase } from './firebase';
import { Recipe, ScaledRecipe, ScaledIngredient, RecipeCartItem } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly firebase = inject(Firebase);
  private readonly collectionName = 'recetas';
  
  // Subject para manejar errores de forma no intrusiva
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  public readonly error$ = this.errorSubject.asObservable();

  /**
   * Get all recipes from Firestore
   */
  getRecipes(): Observable<Recipe[]> {
    return this.firebase.getAll<Recipe>(this.collectionName).pipe(
      catchError(error => {
        console.error('Error fetching recipes:', error);
        this.errorSubject.next('Error al cargar las recetas. Por favor, intenta de nuevo más tarde.');
        return of([]);
      })
    );
  }

  /**
   * Get a specific recipe by ID
   */
  getRecipeById(id: string): Observable<Recipe | null> {
    return this.firebase.getById<Recipe>(this.collectionName, id).pipe(
      catchError(error => {
        console.error('Error fetching recipe by ID:', error);
        this.errorSubject.next('Error al cargar la receta. Por favor, intenta de nuevo.');
        return of(null);
      })
    );
  }

  /**
   * Get recipes filtered by category
   */
  getRecipesByCategory(category: string): Observable<Recipe[]> {
    return this.firebase.getWhere<Recipe>(this.collectionName, 'categoria', '==', category).pipe(
      catchError(error => {
        console.error('Error fetching recipes by category:', error);
        this.errorSubject.next('Error al filtrar recetas por categoría.');
        return of([]);
      })
    );
  }

  /**
   * Scale recipe ingredients based on desired portions
   * Fórmula: cantidad_final = (cantidad_base * porciones_usuario) / porciones_base
   */
  scaleRecipe(recipe: Recipe, desiredPortions: number): ScaledRecipe {
    if (!recipe || !recipe.ingredientes || recipe.porciones_base <= 0 || desiredPortions <= 0) {
      throw new Error('Datos de receta o porciones inválidos');
    }

    const scaledIngredients: ScaledIngredient[] = recipe.ingredientes.map(ingredient => ({
      ...ingredient,
      cantidad_final: (ingredient.cantidad * desiredPortions) / recipe.porciones_base
    }));

    return {
      receta: recipe.nombre,
      porciones: desiredPortions,
      ingredientes: scaledIngredients
    };
  }

  /**
   * Create a recipe cart item for integration with the existing cart system
   */
  createRecipeCartItem(recipe: Recipe, portions: number): RecipeCartItem {
    const scaledRecipe = this.scaleRecipe(recipe, portions);
    
    return {
      receta: scaledRecipe.receta,
      porciones: scaledRecipe.porciones,
      ingredientes: scaledRecipe.ingredientes,
      recipeId: recipe.id || '',
      timestamp: new Date()
    };
  }

  /**
   * Get unique categories from recipes
   */
  getRecipeCategories(): Observable<string[]> {
    return this.getRecipes().pipe(
      map(recipes => {
        const categories = recipes
          .map(recipe => recipe.categoria)
          .filter((category): category is string => !!category);
        return [...new Set(categories)].sort();
      })
    );
  }

  /**
   * Search recipes by name or ingredients
   */
  searchRecipes(searchTerm: string): Observable<Recipe[]> {
    return this.getRecipes().pipe(
      map(recipes => {
        if (!searchTerm.trim()) {
          return recipes;
        }

        const term = searchTerm.toLowerCase().trim();
        return recipes.filter(recipe => 
          recipe.nombre.toLowerCase().includes(term) ||
          recipe.descripcion?.toLowerCase().includes(term) ||
          recipe.ingredientes.some(ingredient => 
            ingredient.nombre.toLowerCase().includes(term)
          )
        );
      })
    );
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Validate recipe data structure
   */
  private validateRecipe(recipe: Recipe): boolean {
    return !!(
      recipe.nombre &&
      recipe.porciones_base > 0 &&
      recipe.ingredientes &&
      recipe.ingredientes.length > 0 &&
      recipe.ingredientes.every(ingredient => 
        ingredient.nombre &&
        ingredient.cantidad > 0 &&
        ingredient.unidad &&
        ingredient.categoria
      )
    );
  }

  /**
   * Calculate total estimated cost of a scaled recipe
   * This could be extended to integrate with product pricing
   */
  calculateEstimatedCost(scaledRecipe: ScaledRecipe): number {
    // Placeholder implementation - could integrate with product prices
    // For now, returns 0 as this would require product price integration
    return 0;
  }

  /**
   * Get ingredients grouped by category
   */
  getIngredientsGroupedByCategory(scaledRecipe: ScaledRecipe): Record<string, ScaledIngredient[]> {
    return scaledRecipe.ingredientes.reduce((groups, ingredient) => {
      const category = ingredient.categoria || 'Sin categoría';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(ingredient);
      return groups;
    }, {} as Record<string, ScaledIngredient[]>);
  }
}