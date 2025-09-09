import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ShopFilterSidebarProps {
  initialMinPrice: string;
  initialMaxPrice: string;
  availablePlatforms: string[];
  initialSelectedPlatforms: string[];
  availableCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onApplyFilters: (filters: { minPrice: string; maxPrice: string; platforms: string[] }) => void;
  onClearFilters: () => void;
}

const ShopFilterSidebar: React.FC<ShopFilterSidebarProps> = ({
  initialMinPrice,
  initialMaxPrice,
  availablePlatforms,
  initialSelectedPlatforms,
  availableCategories,
  selectedCategory,
  setSelectedCategory,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localMinPrice, setLocalMinPrice] = useState(initialMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(initialMaxPrice);
  const [localSelectedPlatforms, setLocalSelectedPlatforms] = useState<string[]>(initialSelectedPlatforms);

  useEffect(() => {
    setLocalMinPrice(initialMinPrice);
  }, [initialMinPrice]);

  useEffect(() => {
    setLocalMaxPrice(initialMaxPrice);
  }, [initialMaxPrice]);

  useEffect(() => {
    setLocalSelectedPlatforms(initialSelectedPlatforms);
  }, [initialSelectedPlatforms]);

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setLocalSelectedPlatforms(prev =>
      checked ? [...prev, platform] : prev.filter(p => p !== platform)
    );
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      platforms: localSelectedPlatforms,
    });
  };

  const handleClear = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSelectedPlatforms([]);
    setSelectedCategory("all"); 
    onClearFilters();
  };

  return (
    <Card className="w-full md:w-64 lg:w-72 xl:w-80 p-0 border shadow-sm rounded-xl bg-card text-card-foreground h-fit sticky top-6">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs">
            <X className="w-3 h-3 mr-1" /> Clear All
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 space-y-6">
        {/* Price Filter */}
        <div className="space-y-2">
          <Label htmlFor="min-price" className="font-medium">Price Range (EGP)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="min-price"
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-1/2"
              min="0"
            />
            <span className="text-gray-500">-</span>
            <Input
              id="max-price"
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-1/2"
              min="0"
            />
          </div>
        </div>

        <Separator />

        {/* Platform Filter */}
        <div className="space-y-2">
          <Label className="font-medium">Platform</Label>
          {availablePlatforms.length > 0 ? (
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-2">
                {availablePlatforms.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={localSelectedPlatforms.includes(platform)}
                      onCheckedChange={(checked) => handlePlatformChange(platform, !!checked)}
                    />
                    <Label htmlFor={`platform-${platform}`} className="font-normal cursor-pointer flex-1 capitalize">
                      {platform}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No platforms available.</p>
          )}
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="font-medium">Category</Label>
          {availableCategories.length > 0 ? (
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category-filter-all" 
                    checked={selectedCategory === "all"}
                    onCheckedChange={(checked) => { if (checked) setSelectedCategory("all"); }}
                  />
                  <Label htmlFor="category-filter-all" className="font-normal cursor-pointer flex-1">
                    All Categories
                  </Label>
                </div>
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-filter-${category}`} 
                      checked={selectedCategory === category}
                      onCheckedChange={(checked) => { if (checked) setSelectedCategory(category); }}
                    />
                    <Label htmlFor={`category-filter-${category}`} className="font-normal cursor-pointer flex-1 capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No categories available.</p>
          )}
        </div>

        <Button onClick={handleApply} className="w-full bg-[#39536f] hover:bg-[#2a405a]">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default ShopFilterSidebar;
