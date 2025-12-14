// 로컬 스토리지 관리
const STORAGE_KEY = 'sanctuary_rooms'

export function getRooms() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    // 초기 예시 방들 (선택적)
    const defaultRooms = []
    saveRooms(defaultRooms)
    return defaultRooms
  }
  return JSON.parse(data)
}

export function saveRooms(rooms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
}

export function getRoom(roomId) {
  const rooms = getRooms()
  return rooms.find(r => r.id === roomId)
}

export function saveRoom(room) {
  const rooms = getRooms()
  const index = rooms.findIndex(r => r.id === room.id)
  if (index >= 0) {
    rooms[index] = room
  } else {
    rooms.push(room)
  }
  saveRooms(rooms)
}

export function deleteRoom(roomId) {
  const rooms = getRooms()
  const filtered = rooms.filter(r => r.id !== roomId)
  saveRooms(filtered)
}

export function createRoom(name = 'Untitled Room') {
  const room = {
    id: Date.now().toString(),
    name,
    objects: [],
    createdAt: new Date().toISOString()
  }
  saveRoom(room)
  return room
}

