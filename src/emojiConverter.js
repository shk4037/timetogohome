// 텍스트 → 이모지 변환
// GPT API를 사용하여 텍스트를 이모지로 변환

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

// 폴백용 간단한 매핑 테이블 (API 실패 시 사용)
const EMOJI_MAP = {
  '복숭아': '🍑',
  '케이크': '🍰',
  '램프': '💡',
  '책': '📖',
  '차': '🍵',
  '녹차': '🍵',
  '커피': '☕',
  '빵': '🍞',
}

// 폴백 변환 함수
function fallbackConvert(text) {
  const lowerText = text.toLowerCase()
  
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lowerText.includes(key.toLowerCase())) {
      return emoji
    }
  }
  
  if (lowerText.includes('냄새') || lowerText.includes('향')) {
    return '🫧'
  }
  if (lowerText.includes('공기') || lowerText.includes('바람')) {
    return '☁️'
  }
  if (lowerText.includes('오후') || lowerText.includes('저녁')) {
    return '🌤️'
  }
  if (lowerText.includes('새벽') || lowerText.includes('아침')) {
    return '🌅'
  }
  if (lowerText.includes('밤') || lowerText.includes('밤하늘')) {
    return '🌙'
  }
  if (lowerText.includes('빨래')) {
    return '🫧☁️'
  }
  
  const abstractEmojis = ['✨', '☁️', '🌤️', '💫', '🫧', '🌸']
  return abstractEmojis[Math.floor(Math.random() * abstractEmojis.length)]
}

// GPT API를 사용한 이모지 변환
export async function convertToEmoji(text) {
  // API 키가 없으면 폴백 사용
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('OpenAI API key not found. Using fallback conversion.')
    return fallbackConvert(text)
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an emoji translator. Convert user's text input into 1-3 emojis.

Rules:
1. If the input is a concrete object (e.g., "peach", "cake", "lamp"), return direct emoji(s).
2. If the input is a sensory/abstract experience (e.g., "smell of fresh laundry", "quiet afternoon"), return metaphorical emoji(s) that capture the feeling, color, texture, or atmosphere.
3. Allow slightly off-metaphors - resonance is more important than accuracy.
4. Return ONLY a JSON object in this exact format: {"emojis": ["emoji1", "emoji2"]}
5. Do not include any text, explanation, or markdown formatting. Only return the JSON object.

Examples:
- "peach" → {"emojis": ["🍑"]}
- "green tea cake" → {"emojis": ["🍰", "🍵"]}
- "smell of fresh laundry" → {"emojis": ["🫧", "☁️"]}
- "quiet afternoon" → {"emojis": ["🌤️", "📖"]}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 50
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    // JSON 파싱
    const parsed = JSON.parse(content)
    
    if (parsed.emojis && Array.isArray(parsed.emojis) && parsed.emojis.length > 0) {
      // 이모지 배열을 하나의 문자열로 결합
      return parsed.emojis.join('')
    } else {
      throw new Error('Invalid response format')
    }
    
  } catch (error) {
    console.error('GPT API error:', error)
    // 오류 발생 시 폴백 사용
    return fallbackConvert(text)
  }
}

// 방 이름 제안
export async function suggestRoomName(objects) {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    // 폴백: 간단한 제안
    const suggestions = ['온실', '서재', '작은 방', '나만의 공간']
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }
  
  try {
    const objectTexts = objects.map(obj => obj.text).join(', ')
    const objectEmojis = objects.map(obj => obj.emoji).join(' ')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You suggest room names based on objects placed in the room. 
Return ONLY a JSON object in this format: {"name": "room name"}

Important rules:
1. The name must include words that convey "room" or "space" feeling, such as: "방", "공간", "서재", "온실", "정원", "작은 방", "나만의 방" etc.
2. Examples of good names: "동물과 함께하는 방", "향기로운 공간", "별빛 서재", "따뜻한 온실", "책이 있는 방"
3. Avoid names that just describe objects without room feeling (e.g., "동물친구들" ❌, "동물과 함께하는 방" ✅)
4. The name should be 2-5 words, poetic and evocative
5. Do not include any explanation or markdown. Only return the JSON object.`
          },
          {
            role: 'user',
            content: `Objects in this room: ${objectTexts} (${objectEmojis})`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 30
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    const parsed = JSON.parse(content)
    
    return parsed.name || 'Untitled Room'
    
  } catch (error) {
    console.error('GPT API error:', error)
    const suggestions = ['온실', '서재', '작은 방', '나만의 공간']
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }
}

// 미션 생성
export async function generateMission(objects) {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    // 폴백: 간단한 미션
    return '강아지 사진 다섯 개 찾아서 저장해보기'
  }
  
  try {
    const objectTexts = objects.map(obj => obj.text).join(', ')
    const objectEmojis = objects.map(obj => obj.emoji).join(' ')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `사용자가 가상 공간에 배치한 오브젝트들을 분석하여 실생활에서 할 수 있는 활동 미션을 생성하세요.

중요한 원칙:
1. 미션은 반드시 한국어로 작성하세요.
2. 가상 공간의 이모지들은 실제로 가질 수 없는 것들이므로, 실생활에서 할 수 있는 구체적인 활동을 제안하세요.
3. 예시: "강아지 사진 다섯 개 찾아서 저장해보기", "기니피그에 대한 흥미로운 사실 두 가지 찾아보기", "따뜻한 차 한 잔 마시며 책 읽기"
4. 부드럽고 따뜻한 톤으로, 강요하지 않는 제안 형태
5. 한 문장, 20단어 이내

반환 형식: {"mission": "미션 텍스트"}
설명이나 마크다운 없이 JSON 객체만 반환하세요.`
          },
          {
            role: 'user',
            content: `이 방의 오브젝트들: ${objectTexts} (${objectEmojis})`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 80
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    const parsed = JSON.parse(content)
    
    return parsed.mission || '강아지 사진 다섯 개 찾아서 저장해보기'
    
  } catch (error) {
    console.error('GPT API error:', error)
    return '강아지 사진 다섯 개 찾아서 저장해보기'
  }
}

