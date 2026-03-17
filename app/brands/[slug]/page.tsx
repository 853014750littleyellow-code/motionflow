'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Motion, Brand } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import MasonryGrid from '@/components/MasonryGrid';
import MotionCard from '@/components/MotionCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandAndMotions();
  }, [slug]);

  const fetchBrandAndMotions = async () => {
    setLoading(true);

    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!brandError && brandData) {
      setBrand(brandData);

      const { data: motionsData, error: motionsError } = await supabase
        .from('motions')
        .select(`
          *,
          brand:brands(*)
        `)
        .eq('brand_id', brandData.id)
        .order('created_at', { ascending: false });

      if (!motionsError && motionsData) {
        setMotions(motionsData as Motion[]);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回品牌列表
          </Link>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : !brand ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">品牌不存在</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {motions.length} 个动效
                    </p>
                    {brand.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {motions.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 dark:text-gray-400">该品牌暂无动效</p>
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
