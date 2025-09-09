import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface ShopFiltersState {
  minPrice: string;
  maxPrice: string;
  selectedPlatforms: string[];
  selectedCategories: string[];
}

interface ShopFiltersProps {
  filters: ShopFiltersState;
  onFilterChange: (newFilters: Partial<ShopFiltersState>) => void;
  allCategories: string[];
  allPlatforms: string[];
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onFilterChange,
  allCategories,
  allPlatforms,
  onApplyFilters,
  onResetFilters,
}) => {
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ minPrice: e.target.value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ maxPrice: e.target.value });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.selectedCategories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    onFilterChange({ selectedCategories: newCategories });
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    const currentPlatforms = filters.selectedPlatforms || [];
    const newPlatforms = checked
      ? [...currentPlatforms, platform]
      : currentPlatforms.filter(p => p !== platform);
    onFilterChange({ selectedPlatforms: newPlatforms });
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border border-border h-fit sticky top-24 md:top-6">
      <h3 className="text-xl font-semibold mb-4 text-[#39536f]">Filters</h3>

      <Accordion type="multiple" defaultValue={['price', 'category', 'platform']} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium text-[#39536f] hover:no-underline">Price Range</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div>
              <Label htmlFor="min-price" className="text-sm font-medium text-gray-700">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="EGP 0"
                value={filters.minPrice}
                onChange={handleMinPriceChange}
                className="mt-1 w-full bg-gray-100 border-gray-300 focus:border-[#39536f] focus:ring-[#39536f]"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="text-sm font-medium text-gray-700">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="EGP 100000"
                value={filters.maxPrice}
                onChange={handleMaxPriceChange}
                className="mt-1 w-full bg-gray-100 border-gray-300 focus:border-[#39536f] focus:ring-[#39536f]"
                min="0"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {allCategories.length > 0 && (
          <AccordionItem value="category">
            <AccordionTrigger className="text-base font-medium text-[#39536f] hover:no-underline">Category</AccordionTrigger>
            <AccordionContent className="pt-2">
              <ScrollArea className="h-40">
                <div className="space-y-2 pr-2">
                  {allCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category.replace(/\s+/g, '-')}`} 
                        checked={(filters.selectedCategories || []).includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      />
                      <Label htmlFor={`cat-${category.replace(/\s+/g, '-')}`} className="text-sm font-normal text-gray-700 capitalize cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {allPlatforms.length > 0 && (
          <AccordionItem value="platform">
            <AccordionTrigger className="text-base font-medium text-[#39536f] hover:no-underline">Platform</AccordionTrigger>
            <AccordionContent className="pt-2">
              <ScrollArea className="h-40">
                <div className="space-y-2 pr-2">
                  {allPlatforms.map(platform => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={`plat-${platform.replace(/\s+/g, '-')}`} 
                        checked={(filters.selectedPlatforms || []).includes(platform)}
                        onCheckedChange={(checked) => handlePlatformChange(platform, !!checked)}
                      />
                      <Label htmlFor={`plat-${platform.replace(/\s+/g, '-')}`} className="text-sm font-normal text-gray-700 capitalize cursor-pointer">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <Separator className="my-6" />
      <div className="flex flex-col space-y-2">
        <Button onClick={onApplyFilters} className="w-full bg-[#39536f] hover:bg-[#2a405a]">
          Apply Filters
        </Button>
        <Button onClick={onResetFilters} variant="outline" className="w-full border-[#6f7d95] text-[#39536f] hover:bg-gray-100">
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default ShopFilters;
