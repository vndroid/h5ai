import { useEffect, useState } from 'react';
import type { FileItem } from '@h5ai/types';
import { apiGet } from '../api/client';
import { useStore } from '../store';
import styles from './Sidebar.module.css';

interface Props {
  currentHref: string;
  onNavigate: (href: string) => void;
}

interface TreeNode {
  href: string;
  name: string;
  children: TreeNode[];
  loaded: boolean;
}

function buildNode(href: string): TreeNode {
  const name = decodeURIComponent(href.split('/').filter(Boolean).pop() ?? '/');
  return { href, name, children: [], loaded: false };
}

export default function Sidebar({ currentHref, onNavigate }: Props) {
  const [root, setRoot] = useState<TreeNode>(() => buildNode('/'));
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/']));

  const loadChildren = async (node: TreeNode) => {
    if (node.loaded) return node;
    const resp = await apiGet({ items: { href: node.href, what: 1 } });
    const folders = (resp.items ?? []).filter(
      (i) => i.managed !== undefined && i.href !== node.href,
    );
    const children = folders.map((f) => buildNode(f.href));
    const updated = { ...node, children, loaded: true };
    return updated;
  };

  const toggle = async (node: TreeNode) => {
    const next = new Set(expanded);
    if (next.has(node.href)) {
      next.delete(node.href);
    } else {
      next.add(node.href);
      // lazy-load children
      const updated = await loadChildren(node);
      setRoot((r) => updateNode(r, updated));
    }
    setExpanded(next);
  };

  const updateNode = (tree: TreeNode, updated: TreeNode): TreeNode => {
    if (tree.href === updated.href) return updated;
    return { ...tree, children: tree.children.map((c) => updateNode(c, updated)) };
  };

  useEffect(() => {
    void loadChildren(root).then((updated) => setRoot(updated));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expanded.has(node.href);
    const isCurrent = currentHref.startsWith(node.href) || node.href === currentHref;

    return (
      <div key={node.href} className={styles.nodeWrap}>
        <div
          className={`${styles.node} ${isCurrent ? styles.current : ''}`}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          <button
            className={styles.toggle}
            onClick={() => void toggle(node)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <img
              src="/images/ui/tree-toggle.svg"
              alt=""
              width={16}
              height={16}
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}
            />
          </button>
          <button className={styles.label} onClick={() => onNavigate(node.href)}>
            <img src="/images/themes/default/folder.svg" alt="" width={16} height={16} className={styles.folderIcon} />
            {node.name}
          </button>
        </div>
        {isExpanded && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  return <nav className={styles.sidebar}>{renderNode(root)}</nav>;
}
