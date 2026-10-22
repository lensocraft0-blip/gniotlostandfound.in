import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { ItemReport, ReportType } from '../types/database';
import { DataService } from '../services/dataService';
import { ItemCard } from '../components/items/ItemCard';
import { GNIOT_CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../config/campus';
import { Search, Filter, RotateCcw, PlusCircle, ArrowLeft } from 'lucide-react';

interface BrowseReportsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
  initialFilter?: {
    reportType?: 'lost' | 'found';
    category?: string;
  };
}

export const BrowseReportsPage: React.FC<BrowseReportsPageProps> = ({
  onNavigate,
  initialFilter,
}) => {
  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [reportType, setReportType] = useState<ReportType | 'all'>(initialFilter?.reportType || 'all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(initialFilter?.category || 'all');
  const [location, setLocation] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadItems();
  }, [reportType, category, location, search]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await DataService.getItems({
        report_type: reportType === 'all' ? undefined : reportType,
        category: category === 'all' ? undefined : category,
        campus_location: location === 'all' ? undefined : location,
        search: search.trim() || undefined,
      });
      setItems(data);
      setPage(1);
    } catch (err) {
      console.warn('Failed loading browse items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setReportType('all');
    setSearch('');
    setCategory('all');
    setLocation('all');
    setStatusFilter('all');
  };

  // Filter by status on client
  const filteredItems = items.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
            Campus Lost &amp; Found Registry
          </h1>
          <p className="text-xs text-[#BFC8D2] mt-1">
            Browse and search all indexed items across GNIOT Greater Noida campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('report_lost')}
            className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => onNavigate('report_found')}
            className="px-4 py-2 rounded-lg border border-[#E8EDF2]/15 bg-[#30152F]/70 text-[#E8EDF2] text-xs font-semibold hover:border-[#D9A441]/40 transition-colors"
          >
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar (Segmented + Dropdowns) */}
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/10 p-5 bg-[#1D1020]/90 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Segmented Type Controls (Allowed functional button elements) */}
          <div className="flex items-center p-1 rounded-xl bg-[#130b15] border border-[#E8EDF2]/10 text-xs">
            <button
              onClick={() => setReportType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                reportType === 'all'
                  ? 'bg-[#30152F] text-[#E8EDF2] border border-[#E8EDF2]/15 shadow-sm'
                  : 'text-[#BFC8D2] hover:text-[#E8EDF2]'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setReportType('lost')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                reportType === 'lost'
                  ? 'bg-[#30152F] text-[#D9A441] border border-[#D9A441]/30 shadow-sm'
                  : 'text-[#BFC8D2] hover:text-[#E8EDF2]'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setReportType('found')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                reportType === 'found'
                  ? 'bg-[#30152F] text-emerald-400 border border-emerald-400/30 shadow-sm'
                  : 'text-[#BFC8D2] hover:text-[#E8EDF2]'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#BFC8D2]" />
            <input
              type="text"
              placeholder="Search keyword, brand, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#130b15] border border-[#E8EDF2]/15 text-xs text-[#E8EDF2] placeholder-[#BFC8D2]/50 focus:border-[#D9A441] focus:outline-none"
            />
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <label className="block text-[#BFC8D2] text-[11px] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#BFC8D2] text-[11px] mb-1">Campus Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            >
              <option value="all">All GNIOT Locations</option>
              {GNIOT_CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#BFC8D2] text-[11px] mb-1">Report Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="potential_match">Potential Match</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 rounded-lg border border-[#E8EDF2]/15 text-[#BFC8D2] hover:text-[#E8EDF2] hover:bg-[#30152F] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Item List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-72 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/5 bg-[#30152F]/20"
            />
          ))}
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-3">
          <p className="text-sm font-semibold text-[#E8EDF2]">No matching items found</p>
          <p className="text-xs text-[#BFC8D2] max-w-sm mx-auto">
            Try broadening your search query, clearing filters, or filing a new report.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-[#30152F] text-xs text-[#D9A441] border border-[#D9A441]/30 hover:bg-[#30152F]/80"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={(selected) => onNavigate('item_details', selected.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-[#BFC8D2] px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
