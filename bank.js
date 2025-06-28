document.addEventListener('DOMContentLoaded', () => {
  const bankList = document.getElementById('bankList');
  const importBtn = document.getElementById('importBankBtn');
  const exportBtn = document.getElementById('exportBankBtn');
  const addBtn = document.getElementById('addBankBtn');

  // 渲染题库列表
  function renderBankList() {
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    bankList.innerHTML = '';
    if (banks.length === 0) {
      bankList.innerHTML = '<div class="text-gray-400 text-center py-4"><i class="fa fa-folder-open-o text-3xl mb-2 block"></i>暂无题库</div>';
      return;
    }
    banks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    banks.forEach(item => {
      const div = document.createElement('div');
      div.className = 'border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between';
      // 左侧信息
      const info = document.createElement('div');
      info.className = 'flex flex-col sm:flex-row sm:items-center gap-2';
      const title = document.createElement('span');
      title.className = 'font-bold text-gray-800';
      title.textContent = item.name ? item.name : `题库 #${item.id.substring(8)}`;
      const stats = document.createElement('span');
      stats.className = 'text-xs text-gray-500';
      stats.textContent = `共${item.totalQuestions || 0}题`;
      info.appendChild(title);
      info.appendChild(stats);
      // 右侧操作
      const ops = document.createElement('div');
      ops.className = 'flex gap-2 mt-2 sm:mt-0';
      // 详情
      const detailBtn = document.createElement('button');
      detailBtn.className = 'text-primary hover:text-primary/80 text-sm flex items-center';
      detailBtn.innerHTML = '<i class="fa fa-list mr-1"></i> 详情';
      detailBtn.onclick = () => {
        window.location.href = `bank_detail.html?id=${item.id}`;
      };
      // 重命名
      const renameBtn = document.createElement('button');
      renameBtn.className = 'text-blue-500 hover:text-blue-700 text-sm flex items-center';
      renameBtn.innerHTML = '<i class="fa fa-edit mr-1"></i> 重命名';
      renameBtn.onclick = () => {
        const newName = prompt('请输入新的题库名称：', item.name || '');
        if (newName && newName.trim() !== '') {
          item.name = newName.trim();
          const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
          const idx = all.findIndex(b => b.id === item.id);
          if (idx !== -1) {
            all[idx].name = item.name;
            localStorage.setItem('questionBank', JSON.stringify(all));
          }
          renderBankList();
        }
      };
      // 删除
      const delBtn = document.createElement('button');
      delBtn.className = 'text-red-500 hover:text-red-700 text-sm flex items-center';
      delBtn.innerHTML = '<i class="fa fa-trash mr-1"></i> 删除';
      delBtn.onclick = () => {
        if (confirm('确定要删除该题库吗？')) {
          const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
          const newAll = all.filter(b => b.id !== item.id);
          localStorage.setItem('questionBank', JSON.stringify(newAll));
          renderBankList();
        }
      };
      // 导出
      const exportOneBtn = document.createElement('button');
      exportOneBtn.className = 'text-info hover:text-info/80 text-sm flex items-center';
      exportOneBtn.innerHTML = '<i class="fa fa-download mr-1"></i> 导出';
      exportOneBtn.onclick = () => {
        const dataStr = JSON.stringify(item, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.name || '题库'}_${item.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
      ops.appendChild(detailBtn);
      ops.appendChild(renameBtn);
      ops.appendChild(exportOneBtn);
      ops.appendChild(delBtn);
      div.appendChild(info);
      div.appendChild(ops);
      bankList.appendChild(div);
    });
  }

  // 导出全部题库
  exportBtn.onclick = () => {
    const banks = JSON.parse(localStorage.getItem('questionBank') || '[]');
    if (banks.length === 0) {
      alert('题库为空');
      return;
    }
    const dataStr = JSON.stringify(banks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `全部题库_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入题库
  importBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const importData = JSON.parse(evt.target.result);
          let importBanks = Array.isArray(importData) ? importData : [importData];
          const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
          // 合并，避免重复
          importBanks.forEach(b => {
            if (!all.some(x => x.id === b.id)) {
              all.push(b);
            }
          });
          localStorage.setItem('questionBank', JSON.stringify(all));
          renderBankList();
          alert('导入成功');
        } catch (err) {
          alert('导入失败：' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 新建题库
  addBtn.onclick = () => {
    const name = prompt('请输入新题库名称：');
    if (!name || name.trim() === '') return;
    const all = JSON.parse(localStorage.getItem('questionBank') || '[]');
    const id = Date.now().toString();
    const newBank = {
      id,
      name: name.trim(),
      timestamp: new Date().toISOString(),
      questions: [],
      totalQuestions: 0
    };
    all.push(newBank);
    localStorage.setItem('questionBank', JSON.stringify(all));
    renderBankList();
  };

  renderBankList();
}); 