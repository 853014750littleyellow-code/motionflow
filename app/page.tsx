'use client';

import { useState, useEffect } from 'react';
import { Motion, Brand } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import MasonryGrid from '@/components/MasonryGrid';
import MotionCard from '@/components/MotionCard';

export default function Home() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMotionTypes, setSelectedMotionTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
    fetchMotions();
  }, []);

  useEffect(() => {
    fetchMotions();
  }, [searchQuery, selectedBrands, selectedMotionTypes, selectedStyles]);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setBrands(data);
        setApiError(null);
      } else {
        setApiError(data?.error || data?.detail || '获取品牌失败');
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : '网络错误');
    }
  };

  const fetchMotions = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedBrands.length) params.set('brands', selectedBrands.join(','));
      if (selectedMotionTypes.length) params.set('motionTypes', selectedMotionTypes.join(','));
      if (selectedStyles.length) params.set('styles', selectedStyles.join(','));

      const res = await fetch(`/api/motions?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMotions(data as Motion[]);
        setApiError(null);
      } else {
        setApiError(data?.error || data?.detail || '获取动效失败');
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : '网络错误');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">API 错误: {apiError}</p>
            </div>
          )}
          <div className="mb-8 space-y-6">
            <div className="flex justify-center">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            <FilterPanel
              brands={brands}
              selectedBrands={selectedBrands}
              selectedMotionTypes={selectedMotionTypes}
              selectedStyles={selectedStyles}
              onBrandChange={setSelectedBrands}
              onMotionTypeChange={setSelectedMotionTypes}
              onStyleChange={setSelectedStyles}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : motions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">暂无动效数据</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                请先在上传页面添加动效素材
              </p>
            </div>
          ) : (
            <MasonryGrid>
              {motions.map((motion) => (
                <div key={motion.id} className="mb-6">
                  <MotionCard motion={motion} />
                </div>
              ))}
            </MasonryGrid>
          )}
        </div>
      </main>
    </>
  );
}
