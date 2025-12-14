// 방 화면
import './style.css'
import { getRoom, saveRoom } from './storage.js'
import { convertToEmoji, suggestRoomName, generateMission } from './emojiConverter.js'

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
  const objectCount = currentRoom.objects.length
  const showTitleSuggestion = objectCount >= 3
  const showMissionBtn = objectCount >= 5
  
  app.innerHTML = `
    <div class="room-container">
      <header class="room-header">
        <div class="room-title-wrapper">
          <input 
            type="text" 
            class="room-title-input" 
            value="${escapeHtml(currentRoom.name)}" 
            placeholder="Untitled Room"
          />
          ${showTitleSuggestion ? `
            <button class="room-action-btn room-title-suggest-btn" id="title-suggest-btn">
              ${currentRoom.name === 'Untitled Room' ? '제목 제안' : '제목 다시 제안'}
            </button>
          ` : ''}
        </div>
      </header>
      
      ${currentRoom.mission ? `
        <div class="room-mission">
          <span class="mission-text">${escapeHtml(currentRoom.mission)}</span>
        </div>
      ` : ''}
      
      <div class="room-objects-grid" id="objects-grid">
        ${currentRoom.objects.map((obj, index) => `
          <div class="room-object" data-index="${index}">
            <span class="object-emoji">${obj.emoji}</span>
            <button class="object-delete" data-index="${index}" aria-label="Delete object">×</button>
          </div>
        `).join('')}
      </div>
      
      <div class="room-input-container">
        ${objectCount === 0 ? `
          <div class="room-input-guide">
            <p class="guide-text">당신이 이 공간에 보관하고 싶은 것이 무엇인지 자유롭게 설명해주세요.</p>
            <p class="guide-examples">예: 꼬리를 흔들고 있는 강아지, 갓 나온 빵냄새, 조용한 오후의 햇살, 따뜻한 차 한 잔의 향기 등</p>
          </div>
        ` : ''}
        ${showMissionBtn ? `
          <button class="room-action-btn room-mission-btn" id="mission-btn">
            ${currentRoom.mission ? '미션 다시 생성' : '미션 생성'}
          </button>
        ` : ''}
        <input 
          type="text" 
          class="room-input" 
          id="room-input"
          placeholder="이 공간에 보관하고 싶은 것, 느낌, 순간을 자유롭게 적어주세요"
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
  
  // 제목 제안 버튼
  const titleSuggestBtn = document.getElementById('title-suggest-btn')
  if (titleSuggestBtn) {
    titleSuggestBtn.addEventListener('click', async () => {
      titleSuggestBtn.disabled = true
      titleSuggestBtn.textContent = '생성 중...'
      
      try {
        const suggestedName = await suggestRoomName(currentRoom.objects)
        currentRoom.name = suggestedName
        saveRoom(currentRoom)
        renderRoom()
      } catch (error) {
        console.error('Error suggesting room name:', error)
        titleSuggestBtn.disabled = false
        titleSuggestBtn.textContent = currentRoom.name === 'Untitled Room' ? '제목 제안' : '제목 다시 제안'
      }
    })
  }
  
  // 미션 생성 버튼
  const missionBtn = document.getElementById('mission-btn')
  if (missionBtn) {
    missionBtn.addEventListener('click', async () => {
      missionBtn.disabled = true
      missionBtn.textContent = '생성 중...'
      
      try {
        const mission = await generateMission(currentRoom.objects)
        currentRoom.mission = mission
        saveRoom(currentRoom)
        renderRoom()
      } catch (error) {
        console.error('Error generating mission:', error)
        missionBtn.disabled = false
        missionBtn.textContent = currentRoom.mission ? '미션 다시 생성' : '미션 생성'
      }
    })
  }
  
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
