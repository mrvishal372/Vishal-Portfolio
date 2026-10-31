import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import {
  Terminal, Save, FileCode, Folder, FolderPlus, FilePlus, ChevronRight, ChevronDown,
  File, ShieldAlert, RefreshCw, Search, Bot, Play, CheckCircle2, AlertCircle,
  GitBranch, GitCommit, GitPullRequest, RotateCcw, History, Trash2, Edit3, X,
  ExternalLink, Lock, Unlock, ShieldCheck, Sparkles, Check, Eye, Settings,
  Code2, ArrowRight, CornerDownLeft, Maximize2, Minimize2, SplitSquareVertical
} from 'lucide-react';
import { getAdminToken, hasAdminSession, adminLogin } from '../../../lib/adminAuth';
import {
  FileNode, SyncState, SyncInfo, SearchResult, CodeProposal, BackupItem,
  fetchFileTree, fetchFileContent, saveFileContent, createFileOrDir, deleteFileOrDir,
  renameFileOrDir, searchProjectFiles, fetchBackups, restoreBackup, fetchSyncStatus,
  triggerSyncNow, saveSyncConfig, askVyronAiCodeAssistant
} from '../../../lib/codeSync';

interface OpenTab {
  path: string;
  name: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
}

export const AppCodeViewer: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(hasAdminSession());
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // File tree & tabs
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/components', 'src/lib']));
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Sync state
  const [syncInfo, setSyncInfo] = useState<SyncInfo>({
    status: 'synced',
    branch: 'main',
    lastSyncTime: Date.now(),
    modifiedFiles: [],
    uncommittedCount: 0,
    remoteConfigured: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showSyncConfigModal, setShowSyncConfigModal] = useState(false);
  const [remoteUrlInput, setRemoteUrlInput] = useState('');
  const [remoteTokenInput, setRemoteTokenInput] = useState('');

  // Search state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Backups / Rollback state
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupList, setBackupList] = useState<BackupItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);

  // Create / Rename / Delete Modals
  const [createModal, setCreateModal] = useState<{ open: boolean; type: 'file' | 'directory'; parentPath: string } | null>(null);
  const [createName, setCreateName] = useState('');
  const [renameModal, setRenameModal] = useState<{ open: boolean; path: string; oldName: string } | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<string | null>(null);

  // AI Code Assistant state
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiWorkingMode, setAiWorkingMode] = useState<'learn' | 'analyze' | 'developer'>('analyze');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; proposal?: CodeProposal; refs?: any[] }>>([
    {
      sender: 'assistant',
      text: 'Namaste Vishal! Main Vyron AI Code Assistant hu. Main 3 Working Modes me kaam karta hu:\n\n1. 🎓 **LEARN MODE**: HTML, CSS, JavaScript, React, TypeScript, Java, Firebase step-by-step seekhein.\n2. 🔍 **ANALYZE MODE**: VYRON ka koi bhi component, HTML element, CSS style, DIV, button ya function line-by-line samjhein.\n3. 🛠️ **DEVELOPER MODE**: Naye features banayein, bug fix karein aur code diff review karke approve karein.\n\nMode select karke shuru karein!',
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [languagePref, setLanguagePref] = useState<'hinglish' | 'hindi' | 'english'>('hinglish');

  // Diff Review & Approval Modal
  const [activeProposal, setActiveProposal] = useState<CodeProposal | null>(null);

  // Layout & Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'web' | 'terminal'>('web');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunningSnippet, setIsRunningSnippet] = useState(false);

  const editorRef = useRef<any>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabPath, openTabs]);

  // Load Tree and Sync Status if Admin
  const loadWorkspace = async () => {
    if (!isAdmin) return;
    setIsLoadingTree(true);
    try {
      const tree = await fetchFileTree();
      setFileTree(tree);
      const sync = await fetchSyncStatus();
      setSyncInfo(sync);
    } catch (err: any) {
      console.error("Workspace load error:", err);
    } finally {
      setIsLoadingTree(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadWorkspace();
    }
  }, [isAdmin]);

  // Active tab reference
  const currentTab = openTabs.find(t => t.path === activeTabPath);

  // Open file in tab
  const handleOpenFile = async (filePath: string) => {
    const existing = openTabs.find(t => t.path === filePath);
    if (existing) {
      setActiveTabPath(filePath);
      if (isMobile) setSidebarOpen(false);
      return;
    }

    try {
      const { content } = await fetchFileContent(filePath);
      const name = filePath.split('/').pop() || filePath;
      const newTab: OpenTab = {
        path: filePath,
        name,
        content,
        savedContent: content,
        isDirty: false,
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabPath(filePath);
      if (isMobile) setSidebarOpen(false);
    } catch (err: any) {
      setSaveStatus(`Error loading ${filePath}`);
    }
  };

  const handleCloseTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = openTabs.filter(t => t.path !== path);
    setOpenTabs(filtered);
    if (activeTabPath === path) {
      setActiveTabPath(filtered.length > 0 ? filtered[filtered.length - 1].path : null);
    }
  };

  const handleContentChange = (val: string) => {
    if (!activeTabPath) return;
    setOpenTabs(prev => prev.map(t => {
      if (t.path === activeTabPath) {
        return {
          ...t,
          content: val,
          isDirty: val !== t.savedContent,
        };
      }
      return t;
    }));
  };

  // Save current active tab
  const handleSave = async () => {
    if (!currentTab) return;
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      await saveFileContent(currentTab.path, currentTab.content);
      setOpenTabs(prev => prev.map(t => {
        if (t.path === currentTab.path) {
          return {
            ...t,
            savedContent: t.content,
            isDirty: false,
          };
        }
        return t;
      }));
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 3000);
      
      // Refresh sync status
      const sync = await fetchSyncStatus();
      setSyncInfo(sync);
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Perform verified sync
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage('Synchronizing changes...');
    try {
      const updated = await triggerSyncNow();
      setSyncInfo(updated);
      setSyncMessage(updated.message || 'Synced successfully!');
      setTimeout(() => setSyncMessage(''), 4000);
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create file/dir
  const handleCreateConfirm = async () => {
    if (!createModal || !createName.trim()) return;
    const cleanName = createName.trim();
    const fullPath = createModal.parentPath ? `${createModal.parentPath}/${cleanName}` : cleanName;
    try {
      await createFileOrDir(fullPath, createModal.type);
      setCreateModal(null);
      setCreateName('');
      await loadWorkspace();
      if (createModal.type === 'file') {
        handleOpenFile(fullPath);
      }
    } catch (err: any) {
      alert(`Create failed: ${err.message}`);
    }
  };

  // Rename
  const handleRenameConfirm = async () => {
    if (!renameModal || !renameName.trim()) return;
    const parent = renameModal.path.split('/').slice(0, -1).join('/');
    const newPath = parent ? `${parent}/${renameName.trim()}` : renameName.trim();
    try {
      await renameFileOrDir(renameModal.path, newPath);
      setRenameModal(null);
      setRenameName('');
      await loadWorkspace();
      // Update open tabs if renamed
      setOpenTabs(prev => prev.map(t => {
        if (t.path === renameModal.path) {
          return { ...t, path: newPath, name: renameName.trim() };
        }
        return t;
      }));
      if (activeTabPath === renameModal.path) setActiveTabPath(newPath);
    } catch (err: any) {
      alert(`Rename failed: ${err.message}`);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPath) return;
    try {
      await deleteFileOrDir(deleteConfirmPath);
      // Close tab if open
      setOpenTabs(prev => prev.filter(t => t.path !== deleteConfirmPath));
      if (activeTabPath === deleteConfirmPath) setActiveTabPath(null);
      setDeleteConfirmPath(null);
      await loadWorkspace();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchProjectFiles(searchQuery);
      setSearchResults(res);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Backups
  const handleOpenBackups = async () => {
    setShowBackupModal(true);
    setIsLoadingBackups(true);
    try {
      const list = await fetchBackups(currentTab?.path);
      setBackupList(list);
    } catch {
      setBackupList([]);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleRestoreBackup = async (id: string) => {
    if (!confirm('Restore this backup version? Current state will be safely snapshotted first.')) return;
    try {
      await restoreBackup(id);
      setShowBackupModal(false);
      if (currentTab) {
        const { content } = await fetchFileContent(currentTab.path);
        setOpenTabs(prev => prev.map(t => t.path === currentTab.path ? { ...t, content, savedContent: content, isDirty: false } : t));
      }
      alert('Version restored successfully!');
    } catch (err: any) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  // AI Assistant Ask
  const handleAskAi = async (promptText?: string) => {
    const q = promptText || aiInput;
    if (!q.trim() || isAiLoading) return;
    
    const userMsg = { sender: 'user' as const, text: q };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await askVyronAiCodeAssistant({
        question: q,
        activeFile: currentTab?.path,
        workingMode: aiWorkingMode,
        selectedCode: editorRef.current?.getModel()?.getValueInRange(editorRef.current.getSelection()),
        languagePreference: languagePref,
      });

      setAiMessages(prev => [...prev, {
        sender: 'assistant',
        text: res.reply,
        proposal: res.proposal,
        refs: res.references,
      }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, {
        sender: 'assistant',
        text: `Error connecting to Vyron AI: ${err.message}`,
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply proposed diff
  const handleApplyProposal = async (prop: CodeProposal) => {
    try {
      // Load current content
      const { content } = await fetchFileContent(prop.targetFile);
      let updated = content;

      if (prop.originalContent && updated.includes(prop.originalContent)) {
        updated = updated.replace(prop.originalContent, prop.proposedContent);
      } else {
        // Fallback: replace target lines or whole file
        updated = prop.proposedContent;
      }

      await saveFileContent(prop.targetFile, updated);
      setActiveProposal(null);
      alert(`Applied patch to ${prop.targetFile}!`);
      
      // Update open tab if open
      setOpenTabs(prev => prev.map(t => {
        if (t.path === prop.targetFile) {
          return { ...t, content: updated, savedContent: updated, isDirty: false };
        }
        return t;
      }));
      await loadWorkspace();
    } catch (err: any) {
      alert(`Failed to apply proposal: ${err.message}`);
    }
  };

  // Terminal run
  const handleRunSnippet = async () => {
    if (!currentTab) return;
    setIsRunningSnippet(true);
    setTerminalOutput('Compiling and running...');
    setPreviewOpen(true);
    setPreviewTab('terminal');

    try {
      const ext = currentTab.path.split('.').pop() || 'ts';
      const langMap: Record<string, string> = {
        ts: 'typescript',
        tsx: 'typescript',
        js: 'javascript',
        jsx: 'javascript',
        py: 'python',
        c: 'c',
        cpp: 'cpp',
        sql: 'sql',
      };
      const language = langMap[ext] || 'typescript';

      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          language,
          code: currentTab.content,
        }),
      });
      const data = await res.json();
      setTerminalOutput(data.output || data.error || 'Execution completed with no output.');
    } catch (err: any) {
      setTerminalOutput(`Execution error: ${err.message}`);
    } finally {
      setIsRunningSnippet(false);
    }
  };

  // Unlock PIN
  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim()) return;
    setIsVerifyingPin(true);
    setPinError('');
    try {
      const res = await adminLogin('admin', adminPin);
      if (res.success) {
        setIsAdmin(true);
        setAdminPin('');
      } else {
        setPinError(res.error || 'Invalid Admin PIN/Password');
      }
    } catch (err: any) {
      setPinError(err.message || 'Verification failed');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const getLanguage = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.md')) return 'markdown';
    if (path.endsWith('.sql')) return 'sql';
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.c') || path.endsWith('.cpp')) return 'cpp';
    return 'plaintext';
  };

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  // Render tree recursive
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      if (node.type === 'directory') {
        const isExpanded = expandedFolders.has(node.path);
        return (
          <div key={node.path}>
            <div 
              className="group flex items-center justify-between py-1 px-2 hover:bg-slate-800/60 cursor-pointer text-slate-300 text-xs rounded transition-colors"
              style={{ paddingLeft: `${depth * 10 + 6}px` }}
              onClick={() => toggleFolder(node.path)}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-60 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60 text-slate-400 shrink-0" />}
                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate font-medium">{node.name}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-slate-400" onClick={e => e.stopPropagation()}>
                <button
                  title="New File in folder"
                  onClick={() => { setCreateModal({ open: true, type: 'file', parentPath: node.path }); setCreateName(''); }}
                  className="p-0.5 hover:text-white hover:bg-slate-700 rounded"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
                <button
                  title="Delete Folder"
                  onClick={() => setDeleteConfirmPath(node.path)}
                  className="p-0.5 hover:text-rose-400 hover:bg-slate-700 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {isExpanded && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isActive = activeTabPath === node.path;
      return (
        <div 
          key={node.path}
          className={`group flex items-center justify-between py-1 px-2 cursor-pointer text-xs rounded transition-colors ${isActive ? 'bg-blue-600/25 text-blue-300 font-semibold border-l-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          style={{ paddingLeft: `${depth * 10 + 20}px` }}
          onClick={() => handleOpenFile(node.path)}
        >
          <div className="flex items-center gap-1.5 truncate">
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${node.name.endsWith('.tsx') || node.name.endsWith('.ts') ? 'text-sky-400' : node.name.endsWith('.json') ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="truncate">{node.name}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-slate-400" onClick={e => e.stopPropagation()}>
            <button
              title="Rename File"
              onClick={() => { setRenameModal({ open: true, path: node.path, oldName: node.name }); setRenameName(node.name); }}
              className="p-0.5 hover:text-white hover:bg-slate-700 rounded"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              title="Delete File"
              onClick={() => setDeleteConfirmPath(node.path)}
              className="p-0.5 hover:text-rose-400 hover:bg-slate-700 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    });
  };

  // Auth lock screen
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-slate-900/95 border-2 border-slate-800 text-slate-300 shadow-2xl backdrop-blur-xl max-w-lg mx-auto my-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mb-5 shadow-inner">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Vyron App Code Workspace</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
          Access to the source code editor, two-way sync, and Vyron AI codebase intelligence is secured for the founder.
        </p>

        <form onSubmit={handleUnlockPin} className="w-full space-y-3">
          <div className="relative">
            <input
              type="password"
              placeholder="Enter Admin PIN / Password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-center text-sm font-mono tracking-wider"
              autoFocus
            />
          </div>
          {pinError && (
            <p className="text-xs text-rose-400 font-medium">{pinError}</p>
          )}
          <button
            type="submit"
            disabled={isVerifyingPin || !adminPin}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            {isVerifyingPin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
            <span>Unlock Developer Workspace</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl sm:rounded-3xl bg-[#12141a] border border-slate-800 shadow-2xl overflow-hidden h-[86vh] max-h-[920px] relative">
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-[#161822] shrink-0 gap-2">
        {/* Left: Explorer toggle & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle File Explorer"
          >
            <Folder className="w-4 h-4 text-blue-400" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-300 font-semibold text-xs shrink-0">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">App Code</span>
          </div>

          {/* Sync Status Badge */}
          <div 
            onClick={() => setShowSyncConfigModal(true)}
            className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors shrink-0 bg-slate-900 border-slate-700 hover:border-slate-500"
            title="Click to configure GitHub sync"
          >
            {syncInfo.status === 'synced' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-400 font-mono">Synced</span>
              </>
            ) : syncInfo.status === 'syncing' ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                <span className="text-amber-300 font-mono">Syncing...</span>
              </>
            ) : syncInfo.status === 'conflict' ? (
              <>
                <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                <span className="text-rose-400 font-mono">Conflict</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-300 font-mono">{syncInfo.uncommittedCount} dirty</span>
              </>
            )}
            <GitBranch className="w-3 h-3 text-slate-500 ml-1" />
            <span className="text-slate-400 text-[10px] hidden md:inline">{syncInfo.branch}</span>
          </div>

          {/* Breadcrumbs */}
          {currentTab && (
            <span className="text-slate-400 text-xs font-mono truncate hidden lg:inline max-w-xs">
              {currentTab.path}
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {saveStatus && (
            <span className="text-xs text-blue-400 font-medium animate-pulse hidden md:inline">
              {saveStatus}
            </span>
          )}

          {/* Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Search in Project (Ctrl+Shift+F)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Backups / History */}
          <button
            onClick={handleOpenBackups}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Version History & Backups"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Sync Now Button */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            title="Synchronize with Local Filesystem & Remote GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Sync Now</span>
          </button>

          {/* Run Snippet Button */}
          <button
            onClick={handleRunSnippet}
            disabled={isRunningSnippet || !currentTab}
            className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
            title="Execute Code or Run Live Preview"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* Vyron AI Drawer Toggle */}
          <button
            onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiDrawerOpen ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-purple-950/40 text-purple-300 border border-purple-500/40 hover:bg-purple-900/50'}`}
            title="Vyron AI Code Intelligence"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vyron AI</span>
          </button>

          {/* Save Button */}
          <button 
            onClick={handleSave} 
            disabled={!currentTab || isSaving}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3.5 py-1.5 rounded-lg font-bold transition-colors text-xs shadow-sm"
            title="Save File (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Sync Message Bar if active */}
      {syncMessage && (
        <div className="bg-blue-900/40 border-b border-blue-500/30 px-3 py-1 text-xs text-blue-300 flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage('')} className="text-slate-400 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR: FILE EXPLORER */}
        <div 
          className={`absolute md:relative z-20 h-full bg-[#151722] border-r border-slate-800 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64 sm:w-72 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64 w-0'}`}
        >
          {/* Explorer Header */}
          <div className="flex items-center justify-between p-2 px-3 border-b border-slate-800 bg-[#12141d] shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Project Files
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <button 
                title="New File in Root" 
                onClick={() => { setCreateModal({ open: true, type: 'file', parentPath: '' }); setCreateName(''); }}
                className="p-1 hover:text-white hover:bg-slate-800 rounded"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button 
                title="New Folder in Root" 
                onClick={() => { setCreateModal({ open: true, type: 'directory', parentPath: '' }); setCreateName(''); }}
                className="p-1 hover:text-white hover:bg-slate-800 rounded"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button 
                title="Refresh File Tree" 
                onClick={loadWorkspace}
                className="p-1 hover:text-white hover:bg-slate-800 rounded"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTree ? 'animate-spin' : ''}`} />
              </button>
              <button 
                title="Close Explorer on mobile" 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:text-white hover:bg-slate-800 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Explorer Tree Body */}
          <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700">
            {fileTree.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                {isLoadingTree ? 'Scanning project...' : 'No files found.'}
              </div>
            ) : (
              renderTree(fileTree)
            )}
          </div>

          {/* Explorer Footer Status */}
          <div className="p-2 border-t border-slate-800 bg-[#12141d] text-[10px] text-slate-500 flex items-center justify-between">
            <span>Branch: <code className="text-blue-400">{syncInfo.branch}</code></span>
            <span>{openTabs.length} tabs open</span>
          </div>
        </div>

        {/* CENTER: EDITOR + TABS */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0e1017]">
          {/* Tabs Strip */}
          <div className="flex items-center bg-[#151722] border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0">
            {openTabs.map(tab => {
              const isActive = tab.path === activeTabPath;
              return (
                <div
                  key={tab.path}
                  onClick={() => setActiveTabPath(tab.path)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-slate-800 cursor-pointer select-none transition-colors whitespace-nowrap shrink-0 ${isActive ? 'bg-[#0e1017] text-white font-medium border-t-2 border-t-blue-500' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{tab.name}</span>
                  {tab.isDirty && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Unsaved changes" />
                  )}
                  <button
                    onClick={(e) => handleCloseTab(tab.path, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 hover:text-white transition-opacity ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {currentTab ? (
              <Editor
                height="100%"
                language={getLanguage(currentTab.path)}
                theme="vs-dark"
                value={currentTab.content}
                onChange={(val) => handleContentChange(val || '')}
                onMount={(editor) => { editorRef.current = editor; }}
                options={{
                  minimap: { enabled: !isMobile },
                  fontSize: isMobile ? 12 : 13.5,
                  wordWrap: 'on',
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  tabSize: 2,
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <FileCode className="w-16 h-16 mb-4 text-slate-700 opacity-50" />
                <h4 className="text-base font-semibold text-slate-300 mb-1">No File Open</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Select any file from the explorer on the left, or use Project Search to find components and routes.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFile('src/App.tsx')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
                  >
                    Open App.tsx
                  </button>
                  <button
                    onClick={() => handleOpenFile('server.ts')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
                  >
                    Open server.ts
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Keyboard Coding Strip (for quick punctuation symbols) */}
            {isMobile && currentTab && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#151722] border-t border-slate-800 overflow-x-auto scrollbar-none shrink-0">
                {['{', '}', '(', ')', ';', '=', '>', '<', '"', "'", '/', '[', ']', '$', ':', '!', '&', '|'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.trigger('keyboard', 'type', { text: sym });
                        editorRef.current.focus();
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono shrink-0 shadow-sm"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DRAWER: VYRON AI CODE INTELLIGENCE */}
        {aiDrawerOpen && (
          <div className="w-80 sm:w-96 bg-[#161824] border-l border-slate-800 flex flex-col h-full shrink-0 shadow-2xl z-30 transition-all">
            {/* AI Drawer Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-[#12141c]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-white">Vyron AI Code Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Language toggle */}
                <select
                  value={languagePref}
                  onChange={(e) => setLanguagePref(e.target.value as any)}
                  className="bg-slate-800 text-slate-300 text-[10px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
                >
                  <option value="hinglish">Hinglish</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                </select>
                <button
                  onClick={() => setAiDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3 Working Modes Switcher */}
            <div className="p-2 border-b border-slate-800 bg-[#12141d] shrink-0">
              <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setAiWorkingMode('learn')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    aiWorkingMode === 'learn'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="1. LEARN MODE: Teach HTML, CSS, Java, JS, React, TS, Firebase step by step"
                >
                  🎓 Learn
                </button>
                <button
                  type="button"
                  onClick={() => setAiWorkingMode('analyze')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    aiWorkingMode === 'analyze'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="2. ANALYZE MODE: Deeply analyze complete VYRON source code, elements & line numbers"
                >
                  🔍 Analyze
                </button>
                <button
                  type="button"
                  onClick={() => setAiWorkingMode('developer')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    aiWorkingMode === 'developer'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="3. DEVELOPER MODE: Create features, write code, fix bugs & show code diffs for approval"
                >
                  🛠️ Developer
                </button>
              </div>

              {/* Mode Description Banner */}
              <div className="mt-1.5 px-2 py-1 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>
                  {aiWorkingMode === 'learn' && '📘 Teaching: HTML, CSS, JS, TS, React, Java & Firebase step by step'}
                  {aiWorkingMode === 'analyze' && '🔎 Code Analyzer: Component, DIV, button, CSS classes & exact lines'}
                  {aiWorkingMode === 'developer' && '⚡ Feature Builder & Bug Fixer: Proposes diffs requiring your approval'}
                </span>
                <span className="text-purple-400 font-mono text-[9px] uppercase tracking-wider shrink-0 ml-1">
                  Active
                </span>
              </div>
            </div>

            {/* Mode-Specific Quick Prompts */}
            <div className="p-2 border-b border-slate-800 bg-[#141620] flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {aiWorkingMode === 'learn' && (
                <>
                  <button
                    onClick={() => handleAskAi("Mujhe React Hooks (useState, useEffect, useRef) step-by-step Hindi me samjhao")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    ⚛️ React Hooks
                  </button>
                  <button
                    onClick={() => handleAskAi("TypeScript Interfaces vs Types with practical examples")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🔷 TypeScript Guide
                  </button>
                  <button
                    onClick={() => handleAskAi("Firebase Firestore real-time sync aur security rules kaise kaam karte hain?")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🔥 Firebase Firestore
                  </button>
                  <button
                    onClick={() => handleAskAi("CSS Flexbox aur Grid layout system saral bhasha me samjhao")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🎨 CSS Flex & Grid
                  </button>
                  <button
                    onClick={() => handleAskAi("Java OOP concepts (Inheritance, Polymorphism, Encapsulation) with practical code")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    ☕ Java OOP
                  </button>
                </>
              )}
              {aiWorkingMode === 'analyze' && (
                <>
                  <button
                    onClick={() => handleAskAi("Header component ke voice button aur navigation elements ka exact code aur line numbers analyze karo")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🔍 Header & Voice Button
                  </button>
                  <button
                    onClick={() => handleAskAi("TypingEngine me WPM aur accuracy kaise calculate hoti hai? File aur line numbers batao")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    ⌨️ Typing Engine Code
                  </button>
                  <button
                    onClick={() => handleAskAi("server.ts ke saare API routes aur unke request handlers analyze karo")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🚀 server.ts Routes
                  </button>
                  <button
                    onClick={() => handleAskAi("BottomNav component me active tab switching aur CSS animations kaise implement hain?")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    📱 BottomNav Styles
                  </button>
                  <button
                    onClick={() => handleAskAi("GamesHub aur GameShell ka component structure aur soundEngine analysis")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🎮 Games Architecture
                  </button>
                </>
              )}
              {aiWorkingMode === 'developer' && (
                <>
                  <button
                    onClick={() => handleAskAi("Active file me performance optimize karo aur code diff propose karo")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    ⚡ Optimize Active File
                  </button>
                  <button
                    onClick={() => handleAskAi("AppCode me tabs close karne ka Clear All Tabs button add karne ka code proposal do")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    ✨ Add Feature
                  </button>
                  <button
                    onClick={() => handleAskAi("Is active file me potential bugs check karke corrected diff propose karo")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    🛠️ Bug Fix & Diff
                  </button>
                  <button
                    onClick={() => handleAskAi("Profile photo upload pipeline me image compression add karne ka proposed diff banao")}
                    className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] whitespace-nowrap shrink-0 border border-slate-700"
                  >
                    📸 Photo Compression
                  </button>
                </>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col text-xs leading-relaxed ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2.5 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* File References */}
                    {msg.refs && msg.refs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1">
                        {msg.refs.map((r, ri) => (
                          <button
                            key={ri}
                            onClick={() => handleOpenFile(r.file)}
                            className="text-[10px] bg-slate-900/80 hover:bg-slate-900 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 font-mono"
                          >
                            <span>{r.file.split('/').pop()}</span>
                            {r.lineStart && <span className="text-amber-400">:{r.lineStart}</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Code Proposal Card */}
                    {msg.proposal && (
                      <div className="mt-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[11px] flex items-center gap-1 text-purple-300">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            Proposed Code Fix
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{msg.proposal.targetFile}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-2">{msg.proposal.explanation}</p>
                        <button
                          onClick={() => setActiveProposal(msg.proposal!)}
                          className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review & Approve Diff</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-400 p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Vyron AI codebase inspect kar raha hai...</span>
                </div>
              )}
            </div>

            {/* AI Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleAskAi(); }}
              className="p-2.5 border-t border-slate-800 bg-[#12141c] flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Vyron AI about any file or bug..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={isAiLoading}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white placeholder-slate-500 text-xs border border-slate-700 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiInput.trim()}
                className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* BOTTOM / DOCKED PREVIEW & TERMINAL PANEL */}
        {previewOpen && (
          <div className="absolute inset-x-0 bottom-0 h-72 bg-[#12141c] border-t-2 border-slate-700 z-30 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-[#161822] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab('web')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${previewTab === 'web' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Live Web Preview
                </button>
                <button
                  onClick={() => setPreviewTab('terminal')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${previewTab === 'terminal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Code Terminal Output
                </button>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-black overflow-hidden relative">
              {previewTab === 'web' ? (
                <iframe
                  src="/"
                  title="Vyron Live App Preview"
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <pre className="p-3 text-xs font-mono text-emerald-400 overflow-auto h-full whitespace-pre-wrap">
                  {terminalOutput}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. DIFF REVIEW & APPROVAL MODAL */}
      {activeProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#181a26] border border-purple-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-[#12141c] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Vyron AI Code Proposal Review
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Target: <span className="text-purple-300">{activeProposal.targetFile}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveProposal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-purple-950/20 border-b border-purple-500/20 text-xs text-purple-200">
              <span className="font-bold text-purple-300">Explanation: </span>
              {activeProposal.explanation}
            </div>

            {/* Side-by-Side or Stacked Diff */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {activeProposal.originalContent && (
                <div>
                  <div className="text-[11px] font-bold text-rose-400 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Original Code (To be removed / replaced):
                  </div>
                  <pre className="p-3 bg-rose-950/30 border border-rose-500/30 text-rose-200 rounded-xl overflow-x-auto whitespace-pre-wrap">
                    {activeProposal.originalContent}
                  </pre>
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Proposed Code (To be inserted):
                </div>
                <pre className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 rounded-xl overflow-x-auto whitespace-pre-wrap">
                  {activeProposal.proposedContent}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#12141c] flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                A safety backup will be created automatically before saving.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setActiveProposal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Reject & Discard
                </button>
                <button
                  onClick={() => handleApplyProposal(activeProposal)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Apply Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. GLOBAL SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#181a26] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-[#12141c] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                Project-Wide Search
              </h3>
              <button onClick={() => setShowSearchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-slate-800 bg-[#151722]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search code or keywords (e.g. handleSave, typingData)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {searchResults.length === 0 ? (
                <p className="text-center text-slate-500 py-6">
                  {isSearching ? 'Searching project...' : 'No search results yet.'}
                </p>
              ) : (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      handleOpenFile(res.file);
                      setShowSearchModal(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-blue-300 font-semibold">{res.file}</span>
                      <span className="text-amber-400 font-mono text-[11px]">Line {res.line}</span>
                    </div>
                    <pre className="text-slate-400 font-mono text-[11px] truncate bg-black/40 p-1 rounded">
                      {res.content}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. BACKUPS & ROLLBACK MODAL */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#181a26] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-[#12141c] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Version History & Safety Backups
              </h3>
              <button onClick={() => setShowBackupModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {isLoadingBackups ? (
                <div className="text-center py-6 text-slate-400">Loading backups...</div>
              ) : backupList.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No automated backup snapshots recorded yet. Backups are created automatically each time a file is saved or patched.
                </div>
              ) : (
                backupList.map(b => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-slate-200 font-semibold">{b.originalPath}</div>
                      <div className="text-[11px] text-slate-400">{b.dateStr} · {(b.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      onClick={() => handleRestoreBackup(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. SYNC CONFIGURATION MODAL (GITHUB REMOTE) */}
      {showSyncConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#181a26] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-400" />
                Two-Way Sync & Remote Repository
              </h3>
              <button onClick={() => setShowSyncConfigModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Local filesystem synchronization with Google AI Studio is active on disk. To mirror commits to a remote GitHub repository, provide your repository URL and Personal Access Token (PAT). Credentials are securely stored server-side.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">GitHub Repo HTTPS URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/username/vyron-ai.git"
                  value={remoteUrlInput}
                  onChange={(e) => setRemoteUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={remoteTokenInput}
                  onChange={(e) => setRemoteTokenInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSyncConfigModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await saveSyncConfig({ remoteUrl: remoteUrlInput, token: remoteTokenInput });
                    setShowSyncConfigModal(false);
                    await handleSyncNow();
                  } catch (err: any) {
                    alert(`Failed to save config: ${err.message}`);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CREATE FILE / DIRECTORY MODAL */}
      {createModal && createModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#181a26] border border-slate-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white mb-2">
              Create New {createModal.type === 'directory' ? 'Folder' : 'File'}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Location: <code className="text-blue-300">{createModal.parentPath || 'root'}</code>
            </p>
            <input
              type="text"
              placeholder={createModal.type === 'directory' ? 'e.g. components' : 'e.g. MyComponent.tsx'}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateConfirm()}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 mb-4 font-mono focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setCreateModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConfirm}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RENAME MODAL */}
      {renameModal && renameModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#181a26] border border-slate-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white mb-2">Rename File or Folder</h4>
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 mb-4 font-mono focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRenameModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameConfirm}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DELETE CONFIRMATION MODAL */}
      {deleteConfirmPath && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#181a26] border border-rose-500/40 rounded-2xl w-full max-w-sm p-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5 text-rose-400">
              <Trash2 className="w-4 h-4" />
              Confirm Deletion
            </h4>
            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to delete <code className="text-rose-300">{deleteConfirmPath}</code>? An automated backup snapshot will be preserved in .vyron_backups.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmPath(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
