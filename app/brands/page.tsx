'use client';

import { useState, useEffect } from 'react';
import { supabase, Brand } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');

  useEffect(() => {
    fetchBrands();
  }, [sortBy]);

  const fetchBrands = async () => {
    setLoading(true);
    
    const { data: brandsData, error } = await supabase
      .from('brands')
      .select('*');

    if (!error && brandsData) {
      const brandsWithCount = await Promise.all(
        brandsData.map(async (brand) => {
          const { count } = await supabase
            .from('motions')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id);
          
          return { ...brand, motion_count: count || 0 };
        })
      );

      const sorted = [...brandsWithCount].sort((a, b) => {
        if (sortBy === 'count') {
          return (b.motion_count || 0) - (a.motion_count || 0);
        }
        return a.name.localeCompare(b.name, 'zh-CN');
      });

      setBrands(sorted);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">品牌专区</h1>
            <p className="text-gray-600 dark:text-gray-400">
              按品牌维度浏览和研究 UI 动效
            </p>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">排序：</span>
            <button
              onClick={() => setSortBy('name')}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                sortBy === 'name'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              名称
            </button>
            <button
              onClick={() => setSortBy('count')}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                sortBy === 'count'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              动效数量
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">暂无品牌数据</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {brand.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {brand.motion_count || 0} 个动效
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {brand.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
