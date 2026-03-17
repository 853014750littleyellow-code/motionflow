'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, Brand } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { MOTION_TYPES, STYLE_TAGS } from '@/lib/constants';

interface UploadFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  id: string;
  title: string;
  brandId: string;
  appName: string;
  motionTypes: string[];
  styles: string[];
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('name');
    if (data) setBrands(data);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['mp4', 'webp', 'gif', 'json'].includes(ext || '');
    });

    const uploadFiles: UploadFile[] = validFiles.map(file => {
      const preview = file.type.startsWith('video/') || file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      return {
        file,
        preview,
        status: 'pending',
        progress: 0,
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ''),
        brandId: '',
        appName: '',
        motionTypes: [],
        styles: [],
      };
    });

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    updateFile(uploadFile.id, { status: 'uploading', progress: 0 });

    try {
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${Date.now()}_${uploadFile.id}.${fileExt}`;
      const filePath = `motions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('motions')
        .upload(filePath, uploadFile.file);

      if (uploadError) throw uploadError;

      updateFile(uploadFile.id, { progress: 50 });

      const { data: { publicUrl } } = supabase.storage
        .from('motions')
        .getPublicUrl(filePath);

      const fileType = fileExt === 'json' ? 'lottie' : fileExt as 'mp4' | 'webp' | 'gif';

      const { error: dbError } = await supabase.from('motions').insert({
        storage_path: publicUrl,
        title: uploadFile.title,
        brand_id: uploadFile.brandId || null,
        app_name: uploadFile.appName || null,
        motion_type: uploadFile.motionTypes.length > 0 ? uploadFile.motionTypes : null,
        style_tags: uploadFile.styles.length > 0 ? uploadFile.styles : null,
        file_type: fileType,
      });

      if (dbError) throw dbError;

      updateFile(uploadFile.id, { status: 'success', progress: 100 });
    } catch (error) {
      console.error('Upload error:', error);
      updateFile(uploadFile.id, { status: 'error', progress: 0 });
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">上传动效</h1>
            <p className="text-gray-600 dark:text-gray-400">
              支持 MP4、WebP、GIF、Lottie (JSON) 格式
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 mb-8 transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">拖拽文件到此处上传</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                或点击下方按钮选择文件
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                选择文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp4,.webp,.gif,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  待上传文件 ({files.filter(f => f.status === 'pending').length})
                </h2>
                <button
                  onClick={uploadAll}
                  disabled={files.filter(f => f.status === 'pending').length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  全部上传
                </button>
              </div>

              <div className="space-y-4">
                {files.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex gap-6">
                      {uploadFile.preview && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                          {uploadFile.file.type.startsWith('video/') ? (
                            <video src={uploadFile.preview} className="w-full h-full object-cover" />
                          ) : (
                            <img src={uploadFile.preview} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={uploadFile.title}
                              onChange={(e) => updateFile(uploadFile.id, { title: e.target.value })}
                              placeholder="标题"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <button
                            onClick={() => removeFile(uploadFile.id)}
                            className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">品牌</label>
                            <select
                              value={uploadFile.brandId}
                              onChange={(e) => updateFile(uploadFile.id, { brandId: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">选择品牌</option>
                              {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">应用名称</label>
                            <input
                              type="text"
                              value={uploadFile.appName}
                              onChange={(e) => updateFile(uploadFile.id, { appName: e.target.value })}
                              placeholder="如：Duolingo"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">动效类型</label>
                          <div className="flex flex-wrap gap-2">
                            {MOTION_TYPES.map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  const types = uploadFile.motionTypes.includes(type)
                                    ? uploadFile.motionTypes.filter(t => t !== type)
                                    : [...uploadFile.motionTypes, type];
                                  updateFile(uploadFile.id, { motionTypes: types });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                  uploadFile.motionTypes.includes(type)
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">风格</label>
                          <div className="flex flex-wrap gap-2">
                            {STYLE_TAGS.map(style => (
                              <button
                                key={style}
                                type="button"
                                onClick={() => {
                                  const styles = uploadFile.styles.includes(style)
                                    ? uploadFile.styles.filter(s => s !== style)
                                    : [...uploadFile.styles, style];
                                  updateFile(uploadFile.id, { styles });
                                }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                  uploadFile.styles.includes(style)
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                        {uploadFile.status === 'uploading' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">上传中...</span>
                              <span className="text-gray-600 dark:text-gray-400">{uploadFile.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {uploadFile.status === 'success' && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check className="w-5 h-5" />
                            <span className="text-sm">上传成功</span>
                          </div>
                        )}

                        {uploadFile.status === 'error' && (
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <X className="w-5 h-5" />
                            <span className="text-sm">上传失败</span>
                          </div>
                        )}

                        {uploadFile.status === 'pending' && (
                          <button
                            onClick={() => uploadFile(uploadFile)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            立即上传
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
