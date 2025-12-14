// 메인 화면 - 방 목록
import './style.css'
import { getRooms, createRoom, deleteRoom } from './storage.js'

export function renderRooms() {
  const app = document.querySelector('#app')
  const rooms = getRooms()
  
  app.innerHTML = `
    <div class="rooms-container">
      <header class="rooms-header">
        <h1 class="app-title">Sanctuary</h1>
        <p class="app-subtitle">Time to go home</p>
      </header>
      
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
}

function openRoom(roomId) {
  window.open(`/room.html?id=${roomId}`, '_blank')
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

