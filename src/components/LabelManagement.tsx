import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Palette,
  Pipette,
  Tag,
  X,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  LabelGroup,
  SubLabel,
  COLOR_PALETTE,
  COLOR_NAMES,
  labelGroupStore,
  genId,
  nowStr,
  useStore,
} from './modelComputeData';

// ===================== 工具：同色系颜色生成 =====================
// 给定一个基础颜色，生成 n 个同色系的渐变色（用于"一键统一配置"）
const shadeColor = (hex: string, percent: number): string => {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  const nr = Math.round((t - R) * p) + R;
  const ng = Math.round((t - G) * p) + G;
  const nb = Math.round((t - B) * p) + B;
  return (
    '#' +
    (0x1000000 + nr * 0x10000 + ng * 0x100 + nb)
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
};

const generateHarmony = (baseHex: string, count: number): string[] => {
  if (count <= 1) return [baseHex];
  const result: string[] = [];
  // 从 -0.3 到 +0.1 之间均匀分布（浅到略深）
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const shade = -0.25 + t * 0.5; // -0.25 ~ +0.25
    result.push(shadeColor(baseHex, shade));
  }
  return result;
};

// ===================== 标签管理主组件 =====================
const LabelManagement: React.FC = () => {
  const groups = useStore(labelGroupStore);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(groups.map((g) => g.id)),
  );
  const [editingGroup, setEditingGroup] = useState<LabelGroup | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalGroups = groups.length;
  const totalChildren = groups.reduce((acc, g) => acc + g.children.length, 0);

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.children.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  // 一键统一配置：用分组主题色生成同色系颜色，应用到所有子标签
  const applyHarmonyToGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.children.length === 0) return;
    const harmony = generateHarmony(group.themeColor, group.children.length);
    labelGroupStore.set((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              children: g.children.map((c, idx) => ({
                ...c,
                color: harmony[idx] || c.color,
              })),
              updatedAt: nowStr(),
            }
          : g,
      ),
    );
  };

  return (
    <div className="h-full bg-gray-50 p-4 flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Tag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="输入标签分组/子标签名称搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            共 {totalGroups} 个分组 · {totalChildren} 个子标签
          </div>
        </div>
        <button
          onClick={() => setCreatingGroup(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
        >
          <Plus size={16} />
          <span>新建标签分组</span>
        </button>
      </div>

      {/* 提示条 */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 flex items-start gap-2">
        <Palette size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">颜色管理：</span>
          点击"新建标签分组"可为每个分组设置主题色，点击"一键统一配色"可让所有子标签自动套用
          <span className="font-medium">同色系</span>颜色；子标签也支持手动单独指定颜色。所有颜色均以 HEX 编号
          醒目显示，可通过预置颜色或标准调色盘选取。
        </div>
      </div>

      {/* 分组列表 */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg py-16 flex flex-col items-center text-gray-400 text-sm">
            <Tag size={40} className="mb-3 text-gray-300" />
            <div>暂无标签分组，点击右上角「新建标签分组」创建</div>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* 分组头部 */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggle(group.id)}
              >
                {expandedIds.has(group.id) ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
                {/* 主题色大色块 */}
                <div
                  className="w-10 h-10 rounded shadow-sm border border-gray-200 flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: group.themeColor }}
                >
                  <span className="text-[9px] font-mono text-white drop-shadow">
                    {group.themeColor}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {group.name}
                    </span>
                    <span className="text-[11px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                      {group.children.length} 子标签
                    </span>
                  </div>
                  {group.description && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {group.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyHarmonyToGroup(group.id);
                    }}
                    disabled={group.children.length === 0}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 text-xs rounded border border-purple-200 hover:from-purple-100 hover:to-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="基于分组主题色生成同色系颜色应用到所有子标签"
                  >
                    <RefreshCw size={12} />
                    一键统一配色
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100"
                  >
                    <Edit2 size={12} />
                    编辑分组
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(`确定删除标签分组「${group.name}」及其所有子标签？`)
                      ) {
                        labelGroupStore.set((prev) =>
                          prev.filter((g) => g.id !== group.id),
                        );
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              </div>

              {/* 子标签列表（展开时显示） */}
              {expandedIds.has(group.id) && (
                <div className="border-t border-gray-100 bg-gray-50/40 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.children.map((child) => (
                      <SubLabelCard
                        key={child.id}
                        child={child}
                        group={group}
                      />
                    ))}
                    {/* 添加子标签按钮卡片 */}
                    <button
                      onClick={() => setAddingChildTo(group.id)}
                      className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded p-3 text-xs text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-white transition-colors"
                    >
                      <Plus size={14} />
                      <span>添加子标签</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 新建/编辑 分组弹窗 */}
      {creatingGroup && (
        <GroupFormModal
          onClose={() => setCreatingGroup(false)}
          onSubmit={(data) => {
            const newGroup: LabelGroup = {
              id: genId(),
              name: data.name,
              themeColor: data.themeColor,
              description: data.description || undefined,
              updatedAt: nowStr(),
              children: [],
            };
            labelGroupStore.set((prev) => [newGroup, ...prev]);
            setCreatingGroup(false);
          }}
        />
      )}

      {editingGroup && (
        <GroupFormModal
          initial={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSubmit={(data) => {
            labelGroupStore.set((prev) =>
              prev.map((g) =>
                g.id === editingGroup.id
                  ? {
                      ...g,
                      name: data.name,
                      themeColor: data.themeColor,
                      description: data.description || undefined,
                      updatedAt: nowStr(),
                    }
                  : g,
              ),
            );
            setEditingGroup(null);
          }}
        />
      )}

      {/* 添加子标签弹窗 */}
      {addingChildTo && (
        <SubLabelFormModal
          group={groups.find((g) => g.id === addingChildTo)!}
          onClose={() => setAddingChildTo(null)}
          onSubmit={(data) => {
            const newChild: SubLabel = {
              id: genId(),
              name: data.name,
              color: data.color,
            };
            labelGroupStore.set((prev) =>
              prev.map((g) =>
                g.id === addingChildTo
                  ? {
                      ...g,
                      children: [...g.children, newChild],
                      updatedAt: nowStr(),
                    }
                  : g,
              ),
            );
            setAddingChildTo(null);
          }}
        />
      )}
    </div>
  );
};

export default LabelManagement;

// ===================== 子标签卡片组件 =====================
interface SubLabelCardProps {
  child: SubLabel;
  group: LabelGroup;
}

const SubLabelCard: React.FC<SubLabelCardProps> = ({ child, group }) => {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded p-2.5 flex items-center gap-2.5 group hover:shadow-sm transition-shadow">
      {/* 大色块 + 颜色编号 */}
      <div
        className="w-12 h-12 rounded border border-gray-200 flex-shrink-0 flex flex-col items-center justify-center shadow-inner"
        style={{ backgroundColor: child.color }}
      >
        <span className="text-[9px] font-mono text-white drop-shadow font-semibold">
          {child.color}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {child.name}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          隶属于「{group.name}」
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="编辑子标签"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => {
            if (confirm(`确定删除子标签「${child.name}」？`)) {
              labelGroupStore.set((prev) =>
                prev.map((g) =>
                  g.id === group.id
                    ? {
                        ...g,
                        children: g.children.filter((c) => c.id !== child.id),
                        updatedAt: nowStr(),
                      }
                    : g,
                ),
              );
            }
          }}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
          title="删除子标签"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {editing && (
        <SubLabelFormModal
          group={group}
          initial={child}
          onClose={() => setEditing(false)}
          onSubmit={(data) => {
            labelGroupStore.set((prev) =>
              prev.map((g) =>
                g.id === group.id
                  ? {
                      ...g,
                      children: g.children.map((c) =>
                        c.id === child.id
                          ? { ...c, name: data.name, color: data.color }
                          : c,
                      ),
                      updatedAt: nowStr(),
                    }
                  : g,
              ),
            );
            setEditing(false);
          }}
        />
      )}
    </div>
  );
};

// ===================== 分组表单弹窗 =====================
interface GroupFormModalProps {
  initial?: LabelGroup;
  onClose: () => void;
  onSubmit: (data: { name: string; themeColor: string; description: string }) => void;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({
  initial,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initial?.name || '');
  const [themeColor, setThemeColor] = useState(
    initial?.themeColor || COLOR_PALETTE[0],
  );
  const [description, setDescription] = useState(initial?.description || '');
  const [pickerOpen, setPickerOpen] = useState(false);

  const confirm = () => {
    if (!name.trim()) {
      alert('请输入标签分组名称');
      return;
    }
    onSubmit({ name: name.trim(), themeColor, description: description.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[520px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">
            {initial ? '编辑标签分组' : '新建标签分组'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              分组名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：建筑物 / 交通工具 / 植被"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              主题色 <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">
                （该分组所有子标签将以此颜色为基础生成同色系推荐）
              </span>
            </label>
            <div className="flex items-center gap-3">
              {/* 大色块 + 颜色编号 */}
              <div
                className="w-14 h-14 rounded border border-gray-300 shadow-sm flex flex-col items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                <span className="text-[10px] font-mono text-white drop-shadow font-semibold">
                  {themeColor}
                </span>
              </div>
              <div className="flex-1">
                {/* 预置颜色 */}
                <div className="text-[11px] text-gray-500 mb-1.5">
                  预置颜色
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setThemeColor(c)}
                      title={`${c}${COLOR_NAMES[c] ? ' · ' + COLOR_NAMES[c] : ''}`}
                      className={`w-7 h-7 rounded-md border-2 transition-all flex-shrink-0 ${
                        themeColor === c
                          ? 'border-gray-800 scale-110 shadow-md'
                          : 'border-white ring-1 ring-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {/* 打开标准调色盘 */}
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 border border-blue-200"
                >
                  <Pipette size={12} />
                  打开标准调色盘
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="简短描述该分组的用途"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirm}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <Check size={14} className="inline mr-1" />
            {initial ? '保存' : '创建'}
          </button>
        </div>

        {pickerOpen && (
          <ColorPickerModal
            initialColor={themeColor}
            onClose={() => setPickerOpen(false)}
            onSelect={(c) => {
              setThemeColor(c);
              setPickerOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// ===================== 子标签表单弹窗 =====================
interface SubLabelFormModalProps {
  group: LabelGroup;
  initial?: SubLabel;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string }) => void;
}

const SubLabelFormModal: React.FC<SubLabelFormModalProps> = ({
  group,
  initial,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(
    initial?.color || group.themeColor,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  // 生成同色系推荐
  const recommended = generateHarmony(group.themeColor, 6);

  const confirm = () => {
    if (!name.trim()) {
      alert('请输入子标签名称');
      return;
    }
    onSubmit({ name: name.trim(), color });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-[480px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-800">
            {initial ? '编辑子标签' : `在「${group.name}」中添加子标签`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              子标签名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：居民楼 / 写字楼 / 商场"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              标签颜色
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded border border-gray-300 shadow-sm flex flex-col items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <span className="text-[10px] font-mono text-white drop-shadow font-semibold">
                  {color}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-gray-500 mb-1.5">
                  同色系推荐（基于分组主题色 {group.themeColor}）
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {recommended.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      title={c}
                      className={`w-7 h-7 rounded-md border-2 transition-all flex-shrink-0 ${
                        color === c
                          ? 'border-gray-800 scale-110 shadow-md'
                          : 'border-white ring-1 ring-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setColor(group.themeColor)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 border border-purple-200"
                  >
                    <Check size={12} />
                    使用分组主题色
                  </button>
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 border border-blue-200"
                  >
                    <Pipette size={12} />
                    标准调色盘
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-[11px] text-gray-600">
            <div className="flex items-start gap-2">
              <Tag size={12} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <div>
                <span className="font-medium">小贴士：</span>
                同色系推荐色可帮助同类标签视觉统一；若需高对比色，请打开标准调色盘手动选择。
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirm}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {initial ? '保存' : '创建'}
          </button>
        </div>

        {pickerOpen && (
          <ColorPickerModal
            initialColor={color}
            onClose={() => setPickerOpen(false)}
            onSelect={(c) => {
              setColor(c);
              setPickerOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// ===================== 标准调色盘弹窗（通用） =====================
interface ColorPickerModalProps {
  isOpen?: boolean;
  initialColor: string;
  onClose: () => void;
  onSelect: (color: string) => void;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  initialColor,
  onClose,
  onSelect,
}) => {
  const [selected, setSelected] = useState(initialColor);
  const [customHex, setCustomHex] = useState(initialColor);

  // 扩展的标准调色盘（7 列 × 6 行 共 42 色）
  const STANDARD_PALETTE = [
    // 红色系
    '#FEE2E2', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C',
    // 橙色系
    '#FFEDD5', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C',
    // 黄色系
    '#FEF9C3', '#FDE68A', '#FACC15', '#EAB308', '#CA8A04', '#A16207',
    // 绿色系
    '#DCFCE7', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D',
    // 青色系
    '#CFFAFE', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490',
    // 蓝色系
    '#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8',
    // 紫色系
    '#EDE9FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9',
    // 粉色系
    '#FCE7F3', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D',
    // 灰色系
    '#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#1F2937',
  ];

  const applyCustom = () => {
    // 校验是否为合法 HEX 颜色
    const reg = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    if (!reg.test(customHex)) {
      alert('请输入正确的 HEX 颜色编号（如 #3B82F6 或 #3BF）');
      return;
    }
    setSelected(customHex.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[80]">
      <div className="bg-white rounded-lg shadow-xl w-[460px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
            <Palette size={15} />
            标准调色盘
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 当前选择预览 */}
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded border border-gray-300 shadow-sm flex flex-col items-center justify-center"
              style={{ backgroundColor: selected }}
            >
              <span className="text-[10px] font-mono text-white drop-shadow font-bold">
                {selected}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-gray-500 mb-1">已选颜色</div>
              <div className="text-lg font-mono font-bold text-gray-800">
                {selected}
              </div>
              <div className="text-[11px] text-gray-500">
                RGB: {parseInt(selected.slice(1, 3), 16)}, {parseInt(selected.slice(3, 5), 16)}, {parseInt(selected.slice(5, 7), 16)}
              </div>
            </div>
          </div>

          {/* 调色盘网格 */}
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">点击色块选择</div>
            <div className="grid grid-cols-7 gap-1.5">
              {STANDARD_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelected(c)}
                  title={c}
                  className={`aspect-square rounded border-2 transition-all ${
                    selected === c
                      ? 'border-gray-800 scale-110 shadow-md'
                      : 'border-white ring-1 ring-gray-200 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 自定义 HEX */}
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">自定义 HEX</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={applyCustom}
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                应用
              </button>
              <input
                type="color"
                value={selected}
                onChange={(e) => setSelected(e.target.value.toUpperCase())}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            确认使用
          </button>
        </div>
      </div>
    </div>
  );
};
