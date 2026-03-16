import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { PortfolioData, Page, Module, ModuleType, SiteInfo } from '../types/portfolio';
import { createDefaultModule } from '../types/portfolio';

const DRAFT_KEY = 'portfolio-draft';

interface PortfolioContextValue {
  data: PortfolioData | null;
  setData: (data: PortfolioData) => void;
  activePage: Page | null;
  setActivePageId: (id: string) => void;
  addModule: (type: ModuleType) => void;
  removeModule: (moduleId: string) => void;
  duplicateModule: (moduleId: string) => void;
  updateModule: (moduleId: string, data: Record<string, unknown>) => void;
  reorderModules: (modules: Module[]) => void;
  addPage: () => void;
  duplicatePage: (pageId: string) => void;
  removePage: (pageId: string) => void;
  reorderPages: (pages: Page[]) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  setPageStatus: (pageId: string, status: 'published' | 'draft') => void;
  updateSite: (updates: Partial<SiteInfo>) => void;
  updateNavOrder: (nav: PortfolioData['navigation']) => void;
  syncNavAndStatus: (nav: PortfolioData['navigation']) => void;
  isDirty: boolean;
  setDirty: (v: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  hasSavedDraft: boolean;
  loadDraft: () => void;
  clearDraft: () => void;
  token: string;
  setToken: (t: string) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataRaw] = useState<PortfolioData | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isDirty, setDirty] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(() => !!localStorage.getItem(DRAFT_KEY));
  const [token, setTokenRaw] = useState(() => localStorage.getItem('gh-token') || '');

  // History stored in refs to avoid triggering renders on every keystroke
  const historyRef = useRef<PortfolioData[]>([]);
  const futureRef = useRef<PortfolioData[]>([]);

  const setToken = useCallback((t: string) => {
    localStorage.setItem('gh-token', t);
    setTokenRaw(t);
  }, []);

  // Auto-save to localStorage on every data change
  useEffect(() => {
    if (data) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      setHasSavedDraft(true);
    }
  }, [data]);

  const setData = useCallback((d: PortfolioData) => {
    historyRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
    setDataRaw(d);
    setDirty(false);
    setActivePageId(prev => (d.pages.find(p => p.id === prev) ? prev : d.pages[0]?.id ?? null));
  }, []);

  const loadDraft = useCallback(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try { setData(JSON.parse(raw)); } catch { /* ignore */ }
  }, [setData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasSavedDraft(false);
  }, []);

  const activePage = data?.pages.find(p => p.id === activePageId) ?? data?.pages[0] ?? null;

  const updateData = useCallback((updater: (d: PortfolioData) => PortfolioData) => {
    setDataRaw(prev => {
      if (!prev) return prev;
      // Push current state onto undo stack
      historyRef.current = [...historyRef.current.slice(-49), prev];
      futureRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
      return updater(prev);
    });
    setDirty(true);
  }, []);

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setDataRaw(current => {
      if (current) futureRef.current = [current, ...futureRef.current.slice(0, 49)];
      return prev;
    });
    historyRef.current = history.slice(0, -1);
    setCanUndo(history.length - 1 > 0);
    setCanRedo(true);
    setDirty(true);
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;
    const next = future[0];
    setDataRaw(current => {
      if (current) historyRef.current = [...historyRef.current.slice(-49), current];
      return next;
    });
    futureRef.current = future.slice(1);
    setCanUndo(true);
    setCanRedo(future.length - 1 > 0);
    setDirty(true);
  }, []);

  const addModule = useCallback((type: ModuleType) => {
    updateData(d => ({
      ...d,
      pages: d.pages.map(p =>
        p.id === (activePage?.id ?? d.pages[0]?.id)
          ? { ...p, modules: [...(p.modules || []), createDefaultModule(type)] }
          : p
      ),
    }));
  }, [activePage, updateData]);

  const removeModule = useCallback((moduleId: string) => {
    updateData(d => ({
      ...d,
      pages: d.pages.map(p =>
        p.id === activePage?.id
          ? { ...p, modules: p.modules.filter(m => m.id !== moduleId) }
          : p
      ),
    }));
  }, [activePage, updateData]);

  const duplicateModule = useCallback((moduleId: string) => {
    updateData(d => ({
      ...d,
      pages: d.pages.map(p => {
        if (p.id !== activePage?.id) return p;
        const idx = p.modules.findIndex(m => m.id === moduleId);
        if (idx === -1) return p;
        const copy = { ...p.modules[idx], id: crypto.randomUUID() };
        const modules = [...p.modules];
        modules.splice(idx + 1, 0, copy);
        return { ...p, modules };
      }),
    }));
  }, [activePage, updateData]);

  const updateModule = useCallback((moduleId: string, moduleData: Record<string, unknown>) => {
    updateData(d => ({
      ...d,
      pages: d.pages.map(p =>
        p.id === activePage?.id
          ? { ...p, modules: p.modules.map(m => m.id === moduleId ? { ...m, data: { ...m.data, ...moduleData } } : m) }
          : p
      ),
    }));
  }, [activePage, updateData]);

  const reorderModules = useCallback((modules: Module[]) => {
    updateData(d => ({
      ...d,
      pages: d.pages.map(p => p.id === activePage?.id ? { ...p, modules } : p),
    }));
  }, [activePage, updateData]);

  const addPage = useCallback(() => {
    const id = crypto.randomUUID();
    const newPage: Page = {
      id,
      title: 'New Page',
      slug: `/page-${id.slice(0, 6)}`,
      status: 'draft',
      modules: [],
    };
    updateData(d => ({ ...d, pages: [...d.pages, newPage] }));
    setActivePageId(id);
  }, [updateData]);

  const duplicatePage = useCallback((pageId: string) => {
    const newId = crypto.randomUUID();
    updateData(d => {
      const page = d.pages.find(p => p.id === pageId);
      if (!page) return d;
      const copy: Page = {
        ...page,
        id: newId,
        title: page.title + ' (Copy)',
        slug: page.slug.replace(/-copy(-\d+)?$/, '') + '-copy',
        status: 'draft',
        modules: (page.modules || []).map(m => ({ ...m, id: crypto.randomUUID() })),
      };
      const idx = d.pages.findIndex(p => p.id === pageId);
      const pages = [...d.pages];
      pages.splice(idx + 1, 0, copy);
      return { ...d, pages };
    });
    setActivePageId(newId);
  }, [updateData]);

  const reorderPages = useCallback((pages: Page[]) => {
    updateData(d => ({ ...d, pages }));
  }, [updateData]);

  const removePage = useCallback((pageId: string) => {
    updateData(d => ({
      ...d,
      pages: d.pages.filter(p => p.id !== pageId),
      navigation: d.navigation.filter(n => n.id !== pageId),
    }));
    setActivePageId(prev => (prev === pageId ? null : prev));
  }, [updateData]);

  const updatePage = useCallback((pageId: string, updates: Partial<Page>) => {
    updateData(d => {
      const updatedPages = d.pages.map(p => p.id === pageId ? { ...p, ...updates } : p);
      // Keep nav label in sync when title changes
      const updatedNav = 'title' in updates
        ? d.navigation.map(n => n.id === pageId ? { ...n, label: updates.title as string } : n)
        : d.navigation;
      return { ...d, pages: updatedPages, navigation: updatedNav };
    });
  }, [updateData]);

  const setPageStatus = useCallback((pageId: string, status: 'published' | 'draft') => {
    updateData(d => {
      const page = d.pages.find(p => p.id === pageId);
      if (!page) return d;
      const updatedPages = d.pages.map(p => p.id === pageId ? { ...p, status } : p);
      const inNav = d.navigation.some(n => n.id === pageId);
      let updatedNav = d.navigation;
      if (status === 'published' && !inNav) {
        updatedNav = [...d.navigation, { id: pageId, label: page.title, slug: `#${page.slug}`, published: true }];
      } else if (status === 'draft' && inNav) {
        updatedNav = d.navigation.filter(n => n.id !== pageId);
      }
      return { ...d, pages: updatedPages, navigation: updatedNav };
    });
  }, [updateData]);

  const updateSite = useCallback((updates: Partial<SiteInfo>) => {
    updateData(d => ({ ...d, site: { ...d.site, ...updates } }));
  }, [updateData]);

  const updateNavOrder = useCallback((nav: PortfolioData['navigation']) => {
    updateData(d => ({ ...d, navigation: nav }));
  }, [updateData]);

  // Atomic: updates nav order AND syncs page live/draft to match nav membership
  const syncNavAndStatus = useCallback((nav: PortfolioData['navigation']) => {
    updateData(d => {
      const prevNavIds = new Set(d.navigation.map(n => n.id));
      const newNavIds = new Set(nav.map(n => n.id));
      const pages = d.pages.map(p => {
        if (!prevNavIds.has(p.id) && newNavIds.has(p.id)) return { ...p, status: 'published' as const };
        if (prevNavIds.has(p.id) && !newNavIds.has(p.id)) return { ...p, status: 'draft' as const };
        return p;
      });
      return { ...d, pages, navigation: nav };
    });
  }, [updateData]);

  return (
    <PortfolioContext.Provider value={{
      data, setData, activePage, setActivePageId,
      addModule, removeModule, duplicateModule, updateModule, reorderModules,
      addPage, duplicatePage, removePage, reorderPages, updatePage, setPageStatus, updateSite, updateNavOrder, syncNavAndStatus,
      isDirty, setDirty,
      canUndo, canRedo, undo, redo,
      hasSavedDraft, loadDraft, clearDraft,
      token, setToken,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return ctx;
}
