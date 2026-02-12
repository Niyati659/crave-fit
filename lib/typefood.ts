export interface Food {
  recipe_id: string;
  recipe_name: string;
  image: string; //this is questionable since we dunno if img will directly come here or on cards
  healthScore: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  dietType?: string;
  region: string;
  cravingMatch?: string[];
  healthierAlternative?: string;
  description?: string;
  instructions?: string[];
  healthierRecipe?: Food
}

