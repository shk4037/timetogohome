// 메인 화면 - 방 목록
import './style.css'
import { getRooms, createRoom, deleteRoom, getMoodboard, addMoodboardItem, deleteMoodboardItem } from './storage.js'

export function renderRooms() {
  const app = document.querySelector('#app')
  const rooms = getRooms()
  const moodboardItems = getMoodboard()
  
  app.innerHTML = `
    <div class="rooms-container">
      <header class="rooms-header">
        <h1 class="app-title">Sanctuary</h1>
        <p class="app-subtitle">Time to go home</p>
      </header>
      
      <div class="moodboard-section">
        <h2 class="moodboard-title">무드보드</h2>
        <p class="moodboard-description">아직 방에 넣지 않은 취향 보관소</p>
        <div class="moodboard-input-container">
          <input 
            type="text" 
            class="moodboard-input" 
            id="moodboard-input"
            placeholder="기록해두고 싶은 것을 자유롭게 적어주세요"
            autocomplete="off"
          />
        </div>
        <div class="moodboard-items" id="moodboard-items">
          ${moodboardItems.map(item => `
            <div class="moodboard-item" data-item-id="${item.id}">
              <span class="moodboard-item-text">${escapeHtml(item.text)}</span>
              <button class="moodboard-item-delete" data-item-id="${item.id}" aria-label="Delete item">×</button>
            </div>
          `).join('')}
          ${moodboardItems.length === 0 ? '<p class="moodboard-empty">아직 기록이 없습니다</p>' : ''}
        </div>
      </div>
      
      <div class="rooms-section">
        <h2 class="rooms-section-title">방</h2>
        <div class="rooms-grid">
          ${rooms.map(room => `
            <div class="room-card" data-room-id="${room.id}">
              <div class="room-card-preview">
                ${room.objects.slice(0, 6).map(obj => `<span class="preview-emoji">${obj.emoji}</span>`).join('')}
                ${room.objects.length === 0 ? '<span class="preview-empty">Empty room</span>' : ''}
              </div>
              <div class="room-card-info">
                <h3 class="room-card-name">${escapeHtml(room.name)}</h3>
                <span class="room-card-count">${room.objects.length} objects</span>
              </div>
              <button class="room-card-delete" data-room-id="${room.id}" aria-label="Delete room">×</button>
            </div>
          `).join('')}
          
          <div class="room-card room-card-new" id="new-room-card">
            <div class="room-card-preview">
              <span class="preview-icon">+</span>
            </div>
            <div class="room-card-info">
              <h3 class="room-card-name">새 방 만들기</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  
  // 이벤트 리스너
  document.querySelectorAll('.room-card[data-room-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('room-card-delete')) return
      const roomId = card.dataset.roomId
      openRoom(roomId)
    })
  })
  
  document.getElementById('new-room-card').addEventListener('click', () => {
    const newRoom = createRoom()
    openRoom(newRoom.id)
  })
  
  document.querySelectorAll('.room-card-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (confirm('이 방을 삭제하시겠어요?')) {
        deleteRoom(btn.dataset.roomId)
        renderRooms()
      }
    })
  })
  
  // 무드보드 입력
  const moodboardInput = document.getElementById('moodboard-input')
  moodboardInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && moodboardInput.value.trim()) {
      const text = moodboardInput.value.trim()
      addMoodboardItem(text)
      moodboardInput.value = ''
      renderRooms()
    }
  })
  
  // 무드보드 아이템 삭제
  document.querySelectorAll('.moodboard-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      deleteMoodboardItem(btn.dataset.itemId)
      renderRooms()
    })
  })
}

function openRoom(roomId) {
  window.open(`/room.html?id=${roomId}`, '_blank')
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

