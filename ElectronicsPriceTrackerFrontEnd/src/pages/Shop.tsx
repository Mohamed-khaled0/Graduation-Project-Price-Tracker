import React, { useEffect, useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useSearch } from "@/contexts/search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShopFilters, { ShopFiltersState } from "@/components/shop/ShopFilters";


// --- Types ---
export interface ProductData {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  price: number;
  productUrl?: string;
  platformName?: string;
  platformLogoUrl?: string;
}

interface PagedProductsResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: ProductData[];
}

// --- API Helper ---
const fetchShopProductsAPI = async (
  searchTerm: string,
  page: number,
  pageSize: number,
  filters: ShopFiltersState
): Promise<PagedProductsResponse> => {
  let url = `/api/Product/`;
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("pageSize", pageSize.toString());

  if (searchTerm.trim()) {
    url += `search`;
    queryParams.append("searchTerm", searchTerm);
  } else {
    url += `paged`;
  }

  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
  if (filters.selectedPlatforms.length > 0) queryParams.append("platforms", filters.selectedPlatforms.join(','));
  if (filters.selectedCategories.length > 0) queryParams.append("categories", filters.selectedCategories.join(','));

  url += `?${queryParams.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Failed to fetch products: ${res.status} ${errorData || res.statusText}`);
  }
  const data = await res.json();

  const mappedItems: ProductData[] = data.items.map((item: any) => ({
    id: item.productId,
    title: item.name,
    category: item.category,
    thumbnail: item.imageUrl || 'https://via.placeholder.com/300?text=No+Image',
    price: item.currentPrice || 0,
    productUrl: item.productUrl,
    platformName: item.platformName,
    platformLogoUrl: item.platformLogoUrl,
  }));
  return { ...data, items: mappedItems };
};


// --- Component ---
const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentSearch, setCurrentSearch: setGlobalSearch, searchHistory, addToHistory, clearHistory } = useSearch();

  const getInitialPage = () => {
    const pageFromUrl = searchParams.get("page");
    const parsedPage = parseInt(pageFromUrl || "1", 10);
    return !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  };

  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get("search") || "");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const productsPerPage = 12;

  const initialFilters: ShopFiltersState = {
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    selectedPlatforms: searchParams.get("platforms")?.split(',').filter(Boolean) || [],
    selectedCategories: searchParams.get("categories")?.split(',').filter(Boolean) || [],
  };
  const [activeFilters, setActiveFilters] = useState<ShopFiltersState>(initialFilters);
  const [tempFilters, setTempFilters] = useState<ShopFiltersState>(initialFilters);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    const searchTermFromUrl = searchParams.get("search") || "";
    const pageFromUrl = getInitialPage();
    const newFiltersFromUrl: ShopFiltersState = {
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      selectedPlatforms: searchParams.get("platforms")?.split(',').filter(Boolean) || [],
      selectedCategories: searchParams.get("categories")?.split(',').filter(Boolean) || [],
    };

    setLocalSearchTerm(searchTermFromUrl);
    setSubmittedSearchTerm(searchTermFromUrl);
    if (isInitialLoad.current || currentSearch !== searchTermFromUrl) {
      setGlobalSearch(searchTermFromUrl);
    }
    setCurrentPage(pageFromUrl);
    setActiveFilters(newFiltersFromUrl);
    setTempFilters(newFiltersFromUrl);

    isInitialLoad.current = false;
  }, [searchParams, setGlobalSearch, currentSearch]);


  const {
    data: pagedData,
    isLoading,
    error,
  } = useQuery<PagedProductsResponse, Error>({
    queryKey: ["shopProducts", submittedSearchTerm, currentPage, productsPerPage, activeFilters],
    queryFn: () => fetchShopProductsAPI(submittedSearchTerm, currentPage, productsPerPage, activeFilters),
    placeholderData: (previousData) => previousData,
  });

  const { data: allProductsForFilters } = useQuery<PagedProductsResponse, Error>({
    queryKey: ["allProductsForFilterOptions"],
    queryFn: () => fetchShopProductsAPI("", 1, 1000, { minPrice: "", maxPrice: "", selectedCategories: [], selectedPlatforms: [] }), 
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const allAvailableCategories = useMemo(() => {
    if (!allProductsForFilters?.items) return [];
    return Array.from(new Set(allProductsForFilters.items.map(p => p.category).filter(Boolean))).sort();
  }, [allProductsForFilters]);

  const allAvailablePlatforms = useMemo(() => {
    if (!allProductsForFilters?.items) return [];
    return Array.from(new Set(allProductsForFilters.items.map(p => p.platformName).filter(Boolean))).sort();
  }, [allProductsForFilters]);


  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setLocalSearchTerm(newSearchTerm);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = localSearchTerm.trim();
    setGlobalSearch(term); 
    addToHistory(term);
    setSubmittedSearchTerm(term);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const validNewPage = Math.max(1, newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", validNewPage.toString());
    setSearchParams(params);
  };

  const handleRecentSearchClick = (search: string) => {
    setLocalSearchTerm(search);
    setGlobalSearch(search); 
    const term = search.trim();
    addToHistory(term);
    setSubmittedSearchTerm(term);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    setSearchParams(params);
  };


  const handleFilterChangeInPanel = (changedFilters: Partial<ShopFiltersState>) => {
    setTempFilters(prev => ({ ...prev, ...changedFilters }));
  };

  const handleApplyFilters = () => {

    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); 
    if (tempFilters.minPrice) params.set("minPrice", tempFilters.minPrice); else params.delete("minPrice");
    if (tempFilters.maxPrice) params.set("maxPrice", tempFilters.maxPrice); else params.delete("maxPrice");
    if (tempFilters.selectedPlatforms.length > 0) params.set("platforms", tempFilters.selectedPlatforms.join(',')); else params.delete("platforms");
    if (tempFilters.selectedCategories.length > 0) params.set("categories", tempFilters.selectedCategories.join(',')); else params.delete("categories");
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const freshFilters: ShopFiltersState = {
      minPrice: "",
      maxPrice: "",
      selectedPlatforms: [],
      selectedCategories: [],
    };

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("platforms");
    params.delete("categories");
    if (!submittedSearchTerm) params.delete("search");
    else params.set("search", submittedSearchTerm); 

    setSearchParams(params);
  };

  const displayedProducts = pagedData?.items || [];
  const hasActiveFilters = activeFilters.minPrice || activeFilters.maxPrice || (activeFilters.selectedCategories && activeFilters.selectedCategories.length > 0) || (activeFilters.selectedPlatforms && activeFilters.selectedPlatforms.length > 0);


  if (error && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-600 text-center mt-10">Error fetching products: {error.message}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products by title..."
                className="pl-10 border-2 border-[#6f7d95] py-3 rounded-xl"
                value={localSearchTerm}
                onChange={handleSearchInputChange}
              />
              {searchHistory.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <History className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-sm font-medium">Recent Searches</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearHistory();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    {searchHistory.map((search, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                      >
                        {search}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </form>
          </div>
          <Separator className="my-4" />

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
              <ShopFilters
                filters={tempFilters}
                onFilterChange={handleFilterChangeInPanel}
                allCategories={allAvailableCategories}
                allPlatforms={allAvailablePlatforms}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
              />
            </aside>

            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent content overflow issues with flex items */}
              <div className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39536f]"></div>
                  </div>
                ) : displayedProducts.length === 0 ? (
                  <div className="text-gray-600 text-center col-span-full py-10">
                    No products found {submittedSearchTerm.trim() ? `for "${submittedSearchTerm}"` : ""}
                    {hasActiveFilters ? ' matching your current filters.' : '.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        category={product.category}
                        thumbnail={product.thumbnail}
                        productUrl={product.productUrl}
                        platformName={product.platformName}
                        platformLogoUrl={product.platformLogoUrl}
                      />
                    ))}
                  </div>
                )}
              </div>
              {!isLoading && pagedData && pagedData.totalCount > 0 && (
                <div className="mt-8 sm:mt-12 flex justify-center">
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {Math.ceil(pagedData.totalCount / productsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(pagedData.totalCount / productsPerPage)}
                      className="w-10 h-10 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Shop;
