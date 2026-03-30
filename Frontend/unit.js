// Unit.js — load unit cards from API, CRUD (add / edit / delete with confirmation)
document.addEventListener('DOMContentLoaded', function() {
    initializeUnitCards();
});

let unitPageId = null;
let unitCardsGrid = null;
let modalMode = 'add';
let editingCardId = null;

function initializeUnitCards() {
    const main = document.querySelector('main');
    unitCardsGrid = document.querySelector('.cards-grid');
    if (!main || !unitCardsGrid) return;

    unitPageId = parseInt(main.getAttribute('data-page-id'), 10);
    if (isNaN(unitPageId)) return;

    ensureCrudToolbar();
    ensureCardModal();
    loadAndRenderCards();
}

function ensureCrudToolbar() {
    if (document.querySelector('.unit-crud-toolbar')) return;
    const toolbar = document.createElement('div');
    toolbar.className = 'unit-crud-toolbar';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-add-card';
    btn.textContent = '+ Add card';
    btn.addEventListener('click', function() {
        openCardModal('add', null);
    });
    toolbar.appendChild(btn);
    unitCardsGrid.parentNode.insertBefore(toolbar, unitCardsGrid);
}

function ensureCardModal() {
    if (document.getElementById('unit-card-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'unit-card-modal';
    modal.className = 'unit-card-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
        '<div class="unit-card-modal-backdrop"></div>' +
        '<div class="unit-card-modal-panel">' +
        '<h2 class="unit-card-modal-title">Card</h2>' +
        '<form id="unit-card-form" class="unit-card-form">' +
        '<label>Title<input type="text" id="ucf-title" required maxlength="500" autocomplete="off"></label>' +
        '<label>Description <span class="field-hint">(paragraphs separated by blank lines; lines starting with - are bullets)</span>' +
        '<textarea id="ucf-description" rows="12"></textarea></label>' +
        '<label>Image URL (optional)<input type="text" id="ucf-image" placeholder="/Pictures/example.png"></label>' +
        '<label>Order index<input type="number" id="ucf-order" min="0" step="1" value="0"></label>' +
        '<div class="unit-card-modal-actions">' +
        '<button type="button" class="btn-modal-cancel">Cancel</button>' +
        '<button type="submit" class="btn-modal-save">Save</button>' +
        '</div></form></div>';
    document.body.appendChild(modal);

    modal.querySelector('.unit-card-modal-backdrop').addEventListener('click', closeCardModal);
    modal.querySelector('.btn-modal-cancel').addEventListener('click', closeCardModal);
    document.getElementById('unit-card-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitCardForm();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeCardModal();
        }
    });
}

function openCardModal(mode, card) {
    modalMode = mode;
    editingCardId = card ? card.id : null;
    const modal = document.getElementById('unit-card-modal');
    const titleEl = modal.querySelector('.unit-card-modal-title');
    const orderInput = document.getElementById('ucf-order');

    if (mode === 'add') {
        titleEl.textContent = 'Add card';
        document.getElementById('ucf-title').value = '';
        document.getElementById('ucf-description').value = '';
        document.getElementById('ucf-image').value = '';
        orderInput.value = '0';
        orderInput.disabled = true;
        orderInput.title = 'Order is set automatically for new cards';
    } else {
        titleEl.textContent = 'Edit card';
        document.getElementById('ucf-title').value = card.title || '';
        document.getElementById('ucf-description').value = card.description || '';
        document.getElementById('ucf-image').value = card.imageUrl || '';
        orderInput.value = String(card.orderIndex != null ? card.orderIndex : 0);
        orderInput.disabled = false;
        orderInput.title = '';
    }

    modal.classList.add('is-open');
    document.getElementById('ucf-title').focus();
}

function closeCardModal() {
    const modal = document.getElementById('unit-card-modal');
    if (modal) modal.classList.remove('is-open');
}

function submitCardForm() {
    const title = document.getElementById('ucf-title').value.trim();
    const description = document.getElementById('ucf-description').value;
    const imageUrl = document.getElementById('ucf-image').value.trim();
    const orderIndex = parseInt(document.getElementById('ucf-order').value, 10) || 0;

    if (!title) {
        alert('Please enter a title.');
        return;
    }

    if (modalMode === 'add') {
        fetch('/api/titlecards?pageId=' + unitPageId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                imageUrl: imageUrl,
                orderIndex: 0
            })
        })
            .then(function(res) {
                if (res.status === 201) {
                    closeCardModal();
                    loadAndRenderCards();
                } else {
                    alert('Could not add card (server error).');
                }
            })
            .catch(function() {
                alert('Could not add card.');
            });
    } else {
        fetch('/api/titlecards/' + editingCardId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                imageUrl: imageUrl,
                orderIndex: orderIndex
            })
        })
            .then(function(res) {
                if (res.ok) {
                    closeCardModal();
                    loadAndRenderCards();
                } else if (res.status === 403) {
                    alert('This card cannot be edited from here.');
                } else {
                    alert('Could not update card.');
                }
            })
            .catch(function() {
                alert('Could not update card.');
            });
    }
}

function loadAndRenderCards() {
    fetch('/api/titlecards?pageId=' + unitPageId)
        .then(function(res) {
            return res.ok ? res.json() : Promise.reject();
        })
        .then(function(cards) {
            if (!Array.isArray(cards)) return;
            const unitCards = cards.filter(function(c) {
                return !c.showOnHomepage;
            });
            renderCards(unitCardsGrid, unitCards);
        })
        .catch(function() {
            unitCardsGrid.innerHTML = '';
            const err = document.createElement('p');
            err.className = 'cards-grid-error';
            err.textContent = 'Could not load cards. Is the server running?';
            unitCardsGrid.appendChild(err);
        });
}

function renderCards(cardsGrid, cards) {
    cardsGrid.innerHTML = '';
    cards.sort(function(a, b) {
        return (a.orderIndex || 0) - (b.orderIndex || 0);
    });

    if (cards.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'cards-grid-empty';
        empty.textContent = 'No study cards yet. Use “Add card” to create one.';
        cardsGrid.appendChild(empty);
        return;
    }

    cards.forEach(function(card) {
        const wrap = document.createElement('div');
        const isSummary = (card.title || '').toLowerCase().includes('summary');
        wrap.className = 'card-with-actions' + (isSummary ? ' summary-card-wrap' : '');
        wrap.dataset.cardId = String(card.id);

        const inner = createInfoCard(card);

        const actions = document.createElement('div');
        actions.className = 'card-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-card-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function() {
            openCardModal('edit', card);
        });

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-card-delete';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', function() {
            confirmDeleteCard(card);
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        wrap.appendChild(inner);
        wrap.appendChild(actions);
        cardsGrid.appendChild(wrap);
    });
}

function confirmDeleteCard(card) {
    var label = card.title || 'this card';
    var msg = 'Delete this card?\n\n' + label + '\n\nThis cannot be undone.';
    if (!window.confirm(msg)) return;

    fetch('/api/titlecards/' + card.id, { method: 'DELETE' })
        .then(function(res) {
            if (res.status === 204) {
                loadAndRenderCards();
            } else if (res.status === 403) {
                alert('This card cannot be deleted.');
            } else {
                alert('Delete failed.');
            }
        })
        .catch(function() {
            alert('Delete failed.');
        });
}

function createInfoCard(card) {
    const div = document.createElement('div');
    const isSummary = (card.title || '').toLowerCase().includes('summary');
    div.className = 'info-card' + (isSummary ? ' summary-card' : '');

    let html = '<h3>' + escapeHtml(card.title || '') + '</h3>';
    if (card.description) {
        const blocks = (card.description || '').split(/\n\n+/).filter(Boolean);
        blocks.forEach(function(block) {
            const trimmed = block.trim();
            const lines = trimmed.split('\n').map(function(l) {
                return l.trim();
            }).filter(Boolean);

            function isBulletLine(line) {
                const t = line.trim();
                return t.startsWith('-') || t.startsWith('•') || t.startsWith('*');
            }
            function stripBullet(line) {
                return line.trim().replace(/^[-•*]\s*/, '');
            }
            const bulletItems = lines.filter(isBulletLine).map(stripBullet);
            const hasBullets = bulletItems.length > 0;
            const labelLine = lines[0] && !isBulletLine(lines[0]) && lines[0].endsWith(':') ? lines[0] : '';
            if (hasBullets) {
                html += '<div class="card-details">';
                if (labelLine) html += '<strong>' + escapeHtml(labelLine) + '</strong>';
                html += '<ul>';
                bulletItems.forEach(function(item) {
                    html += '<li>' + escapeHtml(item) + '</li>';
                });
                html += '</ul></div>';
            } else if (labelLine && lines.length === 1) {
                html += '<p>' + escapeHtml(trimmed) + '</p>';
            } else {
                html += '<p>' + escapeHtml(trimmed) + '</p>';
            }
        });
    }
    if (card.imageUrl) {
        const src = card.imageUrl.startsWith('/') ? card.imageUrl : '/' + card.imageUrl;
        html += '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(card.title || '') + '" class="card-image">';
    }
    div.innerHTML = html;
    return div;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
