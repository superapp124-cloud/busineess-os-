export interface OptimizationStrategy {
  name: string;
  optimize(results: any[], goal: any): any;
}

export class LowestCostStrategy implements OptimizationStrategy {
  name = 'Lowest Cost';

  public optimize(results: any[], goal: any): any {
    let bestSingleProvider = null;
    let singleTotal = Infinity;
    
    // Find best single provider
    for (const r of results) {
      if (r.totalCost > 0 && r.totalCost < singleTotal) {
        singleTotal = r.totalCost;
        bestSingleProvider = r;
      }
    }

    // Attempt Split Basket Optimization
    let splitBasketProviders = new Set<string>();
    let splitBasketAllocations: Record<string, {items: any[], cost: number, name: string}> = {};
    let splitItemTotal = 0;

    goal.items.forEach((itemName: string) => {
      let bestPriceForItem = Infinity;
      let providerForThisItem = null;
      let foundName = itemName;
      
      for (const r of results) {
        const itemHit = r.itemsAvailable?.find((i: any) => i.name === itemName);
        if (itemHit && itemHit.price < bestPriceForItem) {
          bestPriceForItem = itemHit.price;
          providerForThisItem = r;
          foundName = itemHit.foundName;
        }
      }

      if (providerForThisItem && bestPriceForItem !== Infinity) {
        splitBasketProviders.add(providerForThisItem.providerId);
        if (!splitBasketAllocations[providerForThisItem.providerId]) {
          splitBasketAllocations[providerForThisItem.providerId] = {
            items: [], cost: 0, name: providerForThisItem.providerId
          };
        }
        splitBasketAllocations[providerForThisItem.providerId].items.push({ name: foundName, price: bestPriceForItem });
        splitBasketAllocations[providerForThisItem.providerId].cost += bestPriceForItem;
        splitItemTotal += bestPriceForItem;
      }
    });

    let splitTotalCost = splitItemTotal;
    splitBasketProviders.forEach(pid => {
      const p = results.find(r => r.providerId === pid);
      if (p) splitTotalCost += p.rawData?.deliveryFee || 0;
    });

    if (splitBasketProviders.size > 1 && splitTotalCost < singleTotal) {
      // Split is cheaper!
      return {
        winner: 'Split Basket',
        savings: singleTotal - splitTotalCost,
        rationale: `Splitting the order across ${splitBasketProviders.size} providers saves ₹${singleTotal - splitTotalCost} even after paying multiple delivery fees.`,
        allocations: Object.values(splitBasketAllocations).map(alloc => ({
          providerId: alloc.name,
          totalEstimatedCost: alloc.cost,
          items: alloc.items
        }))
      };
    }

    return {
      winner: 'Single Provider',
      rationale: bestSingleProvider 
        ? `Ordering all items from ${bestSingleProvider.providerId} is the most cost-effective strategy.`
        : 'Could not fulfill the order.',
      allocations: bestSingleProvider ? [{
        providerId: bestSingleProvider.providerId,
        totalEstimatedCost: bestSingleProvider.totalCost,
        items: bestSingleProvider.itemsAvailable
      }] : []
    };
  }
}

export class OutcomeOptimizer {
  private strategies = new Map<string, OptimizationStrategy>();

  constructor() {
    const defaultStrategy = new LowestCostStrategy();
    this.strategies.set(defaultStrategy.name, defaultStrategy);
  }

  public optimize(results: any[], goal: any): any {
    const strategy = this.strategies.get('Lowest Cost')!;
    return strategy.optimize(results, goal);
  }
}

export const globalOutcomeOptimizer = new OutcomeOptimizer();
