/**
 * MOMENTUM - Görevler Modülü (TodoManager)
 * Görevlerin oluşturulması, tamamlanması, filtrelenmesi ve sayaçla entegrasyonu.
 */

class TodoManager {
  constructor(initialTodos = []) {
    this.todos = initialTodos;
    this.filter = 'all'; // 'all', 'active', 'completed'
  }

  setTodos(todos) {
    this.todos = Array.isArray(todos) ? todos : [];
  }

  add(text, category = 'spor', itemId = null) {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;

    const newTodo = {
      id: `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: trimmed,
      category: category,
      itemId: itemId,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.todos.unshift(newTodo);
    return newTodo;
  }

  toggle(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = Date.now();
      return todo;
    }
    return null;
  }

  delete(id) {
    const idx = this.todos.findIndex(t => t.id === id);
    if (idx !== -1) {
      const removed = this.todos.splice(idx, 1)[0];
      return removed;
    }
    return null;
  }

  clearCompleted() {
    const beforeCount = this.todos.length;
    this.todos = this.todos.filter(t => !t.completed);
    return beforeCount - this.todos.length;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  getFiltered() {
    if (this.filter === 'active') {
      return this.todos.filter(t => !t.completed);
    }
    if (this.filter === 'completed') {
      return this.todos.filter(t => t.completed);
    }
    return this.todos;
  }

  getCounts() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }

  renderList(container, { onFocus, onToggle, onDelete, itemsMap = {} }) {
    if (!container) return;
    const list = this.getFiltered();

    if (list.length === 0) {
      let emptyMsg = 'Henüz eklenmiş bir görev yok.';
      if (this.filter === 'active') emptyMsg = 'Tamamlanmamış aktif görev bulunmuyor.';
      if (this.filter === 'completed') emptyMsg = 'Henüz tamamlanmış bir görev yok.';

      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🎯</span>
          <p class="empty-text">${emptyMsg}</p>
        </div>
      `;
      return;
    }

    const catLabels = { spor: '🏃‍♂️ Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };

    container.innerHTML = list.map(t => {
      const itemInfo = t.itemId ? itemsMap[t.itemId] : null;
      const pillLabel = itemInfo ? `${itemInfo.emoji || ''} ${itemInfo.title}` : (catLabels[t.category] || t.category);

      return `
        <div class="todo-card ${t.completed ? 'completed' : ''}" data-id="${t.id}">
          <button class="todo-check-btn" data-action="toggle" title="${t.completed ? 'Tamamlanmadı yap' : 'Tamamlandı yap'}">
            <span class="todo-check-circle"></span>
          </button>
          <div class="todo-content">
            <div class="todo-title">${this.escapeHtml(t.text)}</div>
            <div class="todo-meta">
              <span class="todo-category-pill pill-${t.category}">${pillLabel}</span>
            </div>
          </div>
          <div class="todo-actions">
            ${!t.completed ? `
              <button class="todo-focus-btn" data-action="focus" title="Bu görevle seans başlat">
                ⏱️ Odaklan
              </button>
            ` : ''}
            <button class="todo-delete-btn" data-action="delete" title="Görevi sil">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Dinleyicileri bağla
    container.querySelectorAll('.todo-card').forEach(card => {
      const id = card.dataset.id;
      const todo = this.todos.find(t => t.id === id);

      card.querySelector('[data-action="toggle"]')?.addEventListener('click', () => {
        if (onToggle) onToggle(id);
      });

      card.querySelector('[data-action="focus"]')?.addEventListener('click', () => {
        if (onFocus && todo) onFocus(todo);
      });

      card.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
        if (onDelete) onDelete(id);
      });
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.TodoManager = TodoManager;
