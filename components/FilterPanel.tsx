'use client';

import { useState } from 'react';
import { MOTION_TYPES, STYLE_TAGS } from '@/lib/constants';
import { Brand } from '@/lib/supabase';
import { ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  brands: Brand[];
  selectedBrands: string[];
  selectedMotionTypes: string[];
  selectedStyles: string[];
  onBrandChange: (brands: string[]) => void;
  onMotionTypeChange: (types: string[]) => void;
  onStyleChange: (styles: string[]) => void;
}

export default function FilterPanel({
  brands,
  selectedBrands,
  selectedMotionTypes,
  selectedStyles,
  onBrandChange,
  onMotionTypeChange,
  onStyleChange,
}: FilterPanelProps) {
  const [showBrands, setShowBrands] = useState(false);
  const [showMotionTypes, setShowMotionTypes] = useState(false);
  const [showStyles, setShowStyles] = useState(false);

  const toggleBrand = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter(id => id !== brandId));
    } else {
      onBrandChange([...selectedBrands, brandId]);
    }
  };

  const toggleMotionType = (type: string) => {
    if (selectedMotionTypes.includes(type)) {
      onMotionTypeChange(selectedMotionTypes.filter(t => t !== type));
    } else {
      onMotionTypeChange([...selectedMotionTypes, type]);
    }
  };

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      onStyleChange(selectedStyles.filter(s => s !== style));
    } else {
      onStyleChange([...selectedStyles, style]);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div className="relative">
        <button
          onClick={() => setShowBrands(!showBrands)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          品牌 {selectedBrands.length > 0 && `(${selectedBrands.length})`}
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {showBrands && (
          <div className="absolute top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            {brands.map(brand => (
              <label
                key={brand.id}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="rounded"
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMotionTypes(!showMotionTypes)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          动效类型 {selectedMotionTypes.length > 0 && `(${selectedMotionTypes.length})`}
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {showMotionTypes && (
          <div className="absolute top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            {MOTION_TYPES.map(type => (
              <label
                key={type}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedMotionTypes.includes(type)}
                  onChange={() => toggleMotionType(type)}
                  className="rounded"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowStyles(!showStyles)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          风格 {selectedStyles.length > 0 && `(${selectedStyles.length})`}
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {showStyles && (
          <div className="absolute top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            {STYLE_TAGS.map(style => (
              <label
                key={style}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStyles.includes(style)}
                  onChange={() => toggleStyle(style)}
                  className="rounded"
                />
                <span className="text-sm">{style}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {(selectedBrands.length > 0 || selectedMotionTypes.length > 0 || selectedStyles.length > 0) && (
        <button
          onClick={() => {
            onBrandChange([]);
            onMotionTypeChange([]);
            onStyleChange([]);
          }}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
