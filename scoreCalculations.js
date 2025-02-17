// Utility file to calculate drink impact on health

/**
 * Calculates the estimated number of neurons killed based on user's health and drink properties.
 * @param {Object} user - User's health data.
 * @param {number} user.weight - User's weight in kg.
 * @param {number} user.age - User's age in years.
 * @param {number} user.neuronsKilled - Previously accumulated neurons killed (optional).
 * @param {Object} drink - Drink object.
 * @param {number} drink.alcoholContent - Alcohol content in grams.
 * @param {number} [drink.sugarContent] - Sugar content in grams (optional).
 * @returns {number} - Updated total neurons killed.
 */
export function calculateNeuronsKilled(user, drink) {
  const alcoholContent = Number(drink.alcoholContent) || 0;
  const sugarContent = Number(drink.sugarContent) || 0; // Defaults to 0 if not provided

  const baseNeuronLoss = alcoholContent * 1000; // Approximate neuron damage from alcohol
  const sugarImpact = sugarContent * 5; // Sugar adds additional neuron loss

  // Adjust for user's weight and age
  const weightFactor = user.weight < 70 ? 1.2 : 1; // More impact on lighter individuals
  const ageFactor = user.age > 50 ? 1.3 : 1; // Higher impact on older individuals

  // Total neurons lost
  const neuronsLost = (baseNeuronLoss + sugarImpact) * weightFactor * ageFactor;

  return (Number(user.neuronsKilled) || 0) + neuronsLost;
}

/**
 * Calculates the estimated time (in days) taken off the user's life due to the drink.
 * @param {Object} user - User's health data.
 * @param {number} user.smoker - 1 if the user is a smoker, 0 if not.
 * @param {number} user.exercisePerWeek - How many times the user exercises per week.
 * @param {Object} drink - Drink object.
 * @param {number} drink.alcoholContent - Alcohol content in grams.
 * @param {number} [drink.sugarContent] - Sugar content in grams (optional).
 * @returns {number} - Estimated days of life lost.
 */
export function calculateLifeLost(user, drink) {
  const alcoholContent = Number(drink.alcoholContent) || 0;
  const sugarContent = Number(drink.sugarContent) || 0; // Defaults to 0 if not provided

  const baseLifeLoss = alcoholContent * 0.5; // Base impact from alcohol
  const sugarImpact = sugarContent * 0.1; // Additional impact from sugar

  // Lifestyle adjustments
  const smokerPenalty = user.smoker ? 1.5 : 1; // Smoking increases damage
  const exerciseBonus = user.exercisePerWeek > 3 ? 0.8 : 1; // Exercise reduces damage

  // Total days lost
  const daysLost = (baseLifeLoss + sugarImpact) * smokerPenalty * exerciseBonus;

  return daysLost;
}
