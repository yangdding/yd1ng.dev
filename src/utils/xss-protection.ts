import DOMPurify from 'dompurify';

// XSS 보호 설정
const DOMPurifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class', 'id'
  ],
  ALLOWED_SCHEMES: ['http', 'https', 'mailto'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
};

// HTML 콘텐츠 sanitize
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  try {
    return DOMPurify.sanitize(html, DOMPurifyConfig);
  } catch (error) {
    console.error('HTML sanitization error:', error);
    return '';
  }
}

// 텍스트 콘텐츠 escape
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// URL 검증 및 sanitize
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // 허용된 프로토콜만 허용
    if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
      return '';
    }
    
    return urlObj.toString();
  } catch (error) {
    console.error('URL sanitization error:', error);
    return '';
  }
}

// 사용자 입력 검증
export function validateUserInput(input: string, type: 'text' | 'html' | 'url' = 'text'): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Invalid input' };
  }

  // 길이 제한
  if (input.length > 10000) {
    return { isValid: false, sanitized: '', error: 'Input too long' };
  }

  let sanitized: string;
  
  switch (type) {
    case 'html':
      sanitized = sanitizeHtml(input);
      break;
    case 'url':
      sanitized = sanitizeUrl(input);
      if (!sanitized) {
        return { isValid: false, sanitized: '', error: 'Invalid URL' };
      }
      break;
    case 'text':
    default:
      sanitized = escapeHtml(input);
      break;
  }

  return { isValid: true, sanitized };
}

// Markdown 렌더링을 위한 안전한 HTML 생성
export function createSafeMarkdownHtml(markdown: string): string {
  if (!markdown) return '';
  
  // 기본적인 Markdown 태그만 허용
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a'
  ];
  
  const config = {
    ...DOMPurifyConfig,
    ALLOWED_TAGS: allowedTags
  };
  
  try {
    return DOMPurify.sanitize(markdown, config);
  } catch (error) {
    console.error('Markdown sanitization error:', error);
    return escapeHtml(markdown);
  }
}

// 파일명 sanitize
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  // 위험한 문자 제거
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\./, '')
    .substring(0, 255); // 길이 제한
}

// SQL 인젝션 방지를 위한 입력 검증
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';
  
  // SQL 위험 문자 제거/이스케이프
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
}
