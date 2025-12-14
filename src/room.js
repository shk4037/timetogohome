// 방 화면
import './style.css'
import { getRoom, saveRoom } from './storage.js'
import { convertToEmoji } from './emojiConverter.js'

let currentRoom = null

export function initRoom() {
  const urlParams = new URLSearchParams(window.location.search)
  const roomId = urlParams.get('id')
  
  if (!roomId) {
    document.querySelector('#app').innerHTML = '<p>방을 찾을 수 없습니다.</p>'
    return
  }
  
  currentRoom = getRoom(roomId)
  if (!currentRoom) {
    document.querySelector('#app').innerHTML = '<p>방을 찾을 수 없습니다.</p>'
    return
  }
  
  renderRoom()
}

function renderRoom() {
  const app = document.querySelector('#app')
  
  app.innerHTML = `
    <div class="room-container">
      <header class="room-header">
        <input 
          type="text" 
          class="room-title-input" 
          value="${escapeHtml(currentRoom.name)}" 
          placeholder="Untitled Room"
        />
      </header>
      
      <div class="room-objects-grid" id="objects-grid">
        ${currentRoom.objects.map((obj, index) => `
          <div class="room-object" data-index="${index}">
            <span class="object-emoji">${obj.emoji}</span>
            <button class="object-delete" data-index="${index}" aria-label="Delete object">×</button>
          </div>
        `).join('')}
      </div>
      
      <div class="room-input-container">
        <input 
          type="text" 
          class="room-input" 
          id="room-input"
          placeholder="이 공간에 무엇을 두고 싶나요?"
          autocomplete="off"
        />
      </div>
    </div>
  `
  
  // 방 이름 수정
  const titleInput = document.querySelector('.room-title-input')
  titleInput.addEventListener('blur', () => {
    currentRoom.name = titleInput.value.trim() || 'Untitled Room'
    saveRoom(currentRoom)
  })
  
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      titleInput.blur()
    }
  })
  
  // 텍스트 입력 → 이모지 변환
  const input = document.getElementById('room-input')
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      const text = input.value.trim()
      input.value = ''
      input.disabled = true
      input.placeholder = '생성 중...'
      
      try {
        // 이모지 변환
        const emoji = await convertToEmoji(text)
        
        // 오브젝트 추가
        currentRoom.objects.push({
          emoji,
          text,
          createdAt: new Date().toISOString()
        })
        
        saveRoom(currentRoom)
        renderRoom()
      } catch (error) {
        console.error('Error converting to emoji:', error)
        input.placeholder = '이 공간에 무엇을 두고 싶나요?'
        input.disabled = false
        input.focus()
      }
    }
  })
  
  // 오브젝트 삭제
  document.querySelectorAll('.object-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const index = parseInt(btn.dataset.index)
      currentRoom.objects.splice(index, 1)
      saveRoom(currentRoom)
      renderRoom()
    })
  })
  
  // 포커스
  input.focus()
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 초기화
initRoom()
