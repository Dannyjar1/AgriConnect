/**
 * Recipe model for AgriConnect marketplace
 * Following Angular 20 naming conventions
 */

export interface Ingredient {
  nombre: string;
  cantidad: number;
  unidad: string;
  categoria: string;
}

export interface ScaledIngredient extends Ingredient {
  cantidad_final: number;
}

export interface Recipe {
  id?: string;
  nombre: string;
  porciones_base: number;
  ingredientes: Ingredient[];
  descripcion?: string;
  tiempoPreparacion?: number;
  dificultad?: 'Fácil' | 'Media' | 'Difícil';
  categoria?: string;
  imagen?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface ScaledRecipe {
  receta: string;
  porciones: number;
  ingredientes: ScaledIngredient[];
}

export interface RecipeCartItem {
  receta: string;
  porciones: number;
  ingredientes: ScaledIngredient[];
  recipeId: string;
  timestamp: Date;
}