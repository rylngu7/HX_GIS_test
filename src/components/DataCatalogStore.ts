import { useState, useCallback } from 'react';

export interface DataFile {
  id: string;
  name: string;
  type: 'image' | 'vector' | '3d' | 'raw';
  typeLabel: string;
  fileType: string;
  dataType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  uploader: string;
  tags: string[];
  parentPath: string;
}

export interface DataFolder {
  id: string;
  name: string;
  parentPath: string;
  children: (DataFolder | DataFile)[];
}

export const initialFolders: DataFolder[] = [
  {
    id: 'f-hxha',
    name: '华兴海安',
    parentPath: '/',
    children: [
      {
        id: 'f-aijc',
        name: 'AI检测',
        parentPath: '/华兴海安',
        children: []
      },
      {
        id: 'f-bjs',
        name: '北京市',
        parentPath: '/华兴海安',
        children: []
      },
      {
        id: 'f-rsjccl',
        name: '遥感基础处理',
        parentPath: '/华兴海安',
        children: [
          {
            id: 'd-bdhc1',
            name: '波段合成1',
            type: 'image',
            typeLabel: '栅格',
            fileType: 'TIFF',
            dataType: '影像数据',
            size: 296.07 * 1024 * 1024,
            createdAt: '2026-07-03 16:35:07',
            updatedAt: '2026-07-03 16:48:11',
            uploader: 'liujinlai',
            tags: [],
            parentPath: '/华兴海安/遥感基础处理'
          },
          {
            id: 'd-bdhc',
            name: '波段合成',
            type: 'image',
            typeLabel: '栅格',
            fileType: 'TIFF',
            dataType: '影像数据',
            size: 312.5 * 1024 * 1024,
            createdAt: '2026-07-02 10:22:33',
            updatedAt: '2026-07-03 09:11:20',
            uploader: 'liujinlai',
            tags: [],
            parentPath: '/华兴海安/遥感基础处理'
          },
          {
            id: 'd-rz1',
            name: '镶嵌1_fix.tif',
            type: 'image',
            typeLabel: '栅格',
            fileType: 'TIFF',
            dataType: '影像数据',
            size: 528.3 * 1024 * 1024,
            createdAt: '2026-07-01 14:05:00',
            updatedAt: '2026-07-02 08:30:45',
            uploader: 'liujinlai',
            tags: [],
            parentPath: '/华兴海安/遥感基础处理'
          },
          {
            id: 'd-rz2',
            name: '镶嵌2_fix.tif',
            type: 'image',
            typeLabel: '栅格',
            fileType: 'TIFF',
            dataType: '影像数据',
            size: 498.7 * 1024 * 1024,
            createdAt: '2026-07-01 14:06:00',
            updatedAt: '2026-07-02 08:32:10',
            uploader: 'liujinlai',
            tags: [],
            parentPath: '/华兴海安/遥感基础处理'
          },
          {
            id: 'd-nj3857',
            name: 'nanjing3857.tif',
            type: 'image',
            typeLabel: '栅格',
            fileType: 'TIFF',
            dataType: '影像数据',
            size: 1.2 * 1024 * 1024 * 1024,
            createdAt: '2026-06-28 09:00:00',
            updatedAt: '2026-06-30 15:20:00',
            uploader: 'liujinlai',
            tags: [],
            parentPath: '/华兴海安/遥感基础处理'
          },
          {
            id: 'd-gf1',
            name: 'GF1_PMS2_E116.1_N38.8_202406...',
            type: 'raw',
            typeLabel: '原始影像',
            fileType: '未知',
            dataType: '影像数据',
            size: 2.1 * 1024 * 1024 * 1024,
            createdAt: '2026-06-25 11:30:00',
            updatedAt: '2026-06-25 11:30:00',
            uploader: 'liujinlai',
            tags: [],
            parentPath: '/华兴海安/遥感基础处理'
          }
        ]
      }
    ]
  },
  {
    id: 'f-swwx',
    name: '水文气象',
    parentPath: '/',
    children: [
      {
        id: 'd-img1',
        name: '地图遥感_ai-flow-datac...',
        type: 'image',
        typeLabel: '影像',
        fileType: 'TIFF',
        dataType: '影像数据',
        size: 10.61 * 1024 * 1024,
        createdAt: '2026-06-23 09:43:25',
        updatedAt: '2026-06-23 09:45:10',
        uploader: 'admin',
        tags: [],
        parentPath: '/水文气象'
      }
    ]
  },
  {
    id: 'f-wlzxsj',
    name: '网络在线数据',
    parentPath: '/',
    children: []
  },
  {
    id: 'f-test',
    name: '测试',
    parentPath: '/',
    children: []
  }
];

export function isFolder(item: DataFolder | DataFile): item is DataFolder {
  return 'children' in item;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export interface DataCatalogStore {
  folders: DataFolder[];
  setFolders: (f: DataFolder[]) => void;
  findFileById: (id: string) => DataFile | null;
  findFolderById: (id: string) => DataFolder | null;
  findFilePath: (id: string) => string;
  moveFile: (fileId: string, targetFolderId: string) => boolean;
  renameFile: (fileId: string, newName: string) => boolean;
  getAllFolders: () => { id: string; name: string; path: string; level: number }[];
}

export function useDataCatalog(initial: DataFolder[] = initialFolders): DataCatalogStore {
  const [folders, setFolders] = useState<DataFolder[]>(initial);

  const findFileById = useCallback((id: string): DataFile | null => {
    const search = (items: (DataFolder | DataFile)[]): DataFile | null => {
      for (const item of items) {
        if (!isFolder(item) && item.id === id) return item;
        if (isFolder(item)) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(folders);
  }, [folders]);

  const findFolderById = useCallback((id: string): DataFolder | null => {
    const search = (items: (DataFolder | DataFile)[]): DataFolder | null => {
      for (const item of items) {
        if (isFolder(item)) {
          if (item.id === id) return item;
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(folders);
  }, [folders]);

  const findFilePath = useCallback((id: string): string => {
    const f = findFileById(id);
    return f ? `${f.parentPath}/${f.name}` : '';
  }, [findFileById]);

  const moveFile = useCallback((fileId: string, targetFolderId: string): boolean => {
    let movedFile: DataFile | null = null;

    const deepClone = (arr: (DataFolder | DataFile)[]): (DataFolder | DataFile)[] =>
      arr.map(item => isFolder(item)
        ? { ...item, children: deepClone(item.children) }
        : { ...item }
      );

    const removeFrom = (items: (DataFolder | DataFile)[]): (DataFolder | DataFile)[] => {
      const result: (DataFolder | DataFile)[] = [];
      for (const item of items) {
        if (isFolder(item)) {
          const newChildren = removeFrom(item.children);
          result.push({ ...item, children: newChildren });
        } else if (item.id === fileId) {
          movedFile = { ...item };
        } else {
          result.push(item);
        }
      }
      return result;
    };

    const addTo = (items: (DataFolder | DataFile)[]): (DataFolder | DataFile)[] => {
      return items.map(item => {
        if (!isFolder(item)) return item;
        if (item.id === targetFolderId && movedFile) {
          const newFile: DataFile = {
            ...movedFile,
            parentPath: `${item.parentPath}/${item.name}`.replace(/^\/\//, '/')
          };
          return { ...item, children: [...item.children, newFile] };
        }
        return { ...item, children: addTo(item.children) };
      });
    };

    const currentFile = findFileById(fileId);
    if (!currentFile) return false;
    const targetFolder = findFolderById(targetFolderId);
    if (!targetFolder) return false;
    const targetPath = `${targetFolder.parentPath}/${targetFolder.name}`.replace(/^\/\//, '/');
    if (currentFile.parentPath === targetPath) return false;

    const newFolders = deepClone(folders);
    const afterRemove = removeFrom(newFolders);
    const afterAdd = addTo(afterRemove);

    const verify = searchIn(afterAdd, fileId);
    if (!verify) return false;

    setFolders(afterAdd as DataFolder[]);
    return true;
  }, [folders, findFileById, findFolderById]);

  const renameFile = useCallback((fileId: string, newName: string): boolean => {
    const update = (items: (DataFolder | DataFile)[]): (DataFolder | DataFile)[] =>
      items.map(item => {
        if (isFolder(item)) {
          return { ...item, children: update(item.children) };
        }
        if (item.id === fileId) {
          return { ...item, name: newName, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) };
        }
        return item;
      });
    setFolders(prev => update(prev) as DataFolder[]);
    return true;
  }, []);

  const getAllFolders = useCallback((): { id: string; name: string; path: string; level: number }[] => {
    const result: { id: string; name: string; path: string; level: number }[] = [];
    const walk = (items: (DataFolder | DataFile)[], level: number) => {
      for (const item of items) {
        if (isFolder(item)) {
          const path = `${item.parentPath}/${item.name}`.replace(/^\/\//, '/');
          result.push({ id: item.id, name: item.name, path, level });
          walk(item.children, level + 1);
        }
      }
    };
    walk(folders, 0);
    return result;
  }, [folders]);

  return {
    folders,
    setFolders,
    findFileById,
    findFolderById,
    findFilePath,
    moveFile,
    renameFile,
    getAllFolders
  };
}

function searchIn(items: (DataFolder | DataFile)[], id: string): boolean {
  for (const item of items) {
    if (item.id === id) return true;
    if (isFolder(item) && searchIn(item.children, id)) return true;
  }
  return false;
}
