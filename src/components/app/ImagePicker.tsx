import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package } from 'lucide-react'
import { presets as defaultPresets, categoryLabels as defaultCategoryLabels, type ImagePreset } from '@/lib/presets'
import { useCatalog } from '@/hooks/useApi'

interface ImagePickerProps {
  selected: string // image string or preset id
  onSelect: (image: string, preset?: ImagePreset) => void
}

export default function ImagePicker({ selected, onSelect }: ImagePickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [customImage, setCustomImage] = useState('')
  const { data: catalog } = useCatalog()

  // Derive categories and presets from catalog API, fall back to hardcoded
  const { categories, categoryLabelMap, presetsForCategory } = useMemo(() => {
    if (catalog?.categories?.length) {
      const cats = catalog.categories
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(c => c.id)
      const labelMap: Record<string, string> = {}
      for (const c of catalog.categories) {
        labelMap[c.id] = c.label
      }
      const presetsByCat: Record<string, ImagePreset[]> = {}
      for (const cat of cats) {
        presetsByCat[cat] = (catalog.presets || [])
          .filter(p => p.category_id === cat)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(p => ({
            id: p.id,
            name: p.name,
            image: p.image,
            description: p.description,
            category: p.category_id as ImagePreset['category'],
            defaultTier: p.default_tier as ImagePreset['defaultTier'],
            tags: p.tags || [],
          }))
      }
      return { categories: cats, categoryLabelMap: labelMap, presetsForCategory: presetsByCat }
    }

    // Fallback to hardcoded
    const cats = Object.keys(defaultCategoryLabels)
    const presetsByCat: Record<string, ImagePreset[]> = {}
    for (const cat of cats) {
      presetsByCat[cat] = defaultPresets.filter(p => p.category === cat)
    }
    return { categories: cats, categoryLabelMap: defaultCategoryLabels as Record<string, string>, presetsForCategory: presetsByCat }
  }, [catalog])

  // Default to first category when categories load or change
  useEffect(() => {
    if (categories.length && (!activeCategory || (activeCategory !== 'custom' && !categories.includes(activeCategory)))) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  const filtered = activeCategory !== 'custom'
    ? (presetsForCategory[activeCategory] || [])
    : []

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {activeCategory === cat && (
              <motion.div
                layoutId="imgCat"
                className="absolute inset-0 bg-zinc-800 rounded-lg"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{categoryLabelMap[cat] ?? cat}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveCategory('custom')}
          className={`relative flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeCategory === 'custom'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {activeCategory === 'custom' && (
            <motion.div
              layoutId="imgCat"
              className="absolute inset-0 bg-zinc-800 rounded-lg"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">Custom</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeCategory === 'custom' ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={customImage}
                onChange={e => {
                  setCustomImage(e.target.value)
                  onSelect(e.target.value)
                }}
                placeholder="docker.io/myimage:tag or bafybei... (IPFS CID)"
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 font-mono"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {filtered.map((preset, i) => {
              const isSelected = selected === preset.image || selected === preset.id
              return (
                <motion.button
                  key={preset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelect(preset.image, preset)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-red-500/5 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-red-500/20' : 'bg-zinc-800'
                    }`}>
                      <Package className={`w-4 h-4 ${isSelected ? 'text-red-400' : 'text-zinc-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {preset.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{preset.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-zinc-600 font-mono">{preset.image}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
