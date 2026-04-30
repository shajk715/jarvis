// 외부 링크 트리거 헬퍼
// PWA standalone 모드에서 location.href는 차단될 수 있어 hidden anchor click 사용

let pendingUrl = null;

/**
 * 즉시 외부 URL 열기 (새 탭/시스템 브라우저)
 */
export function openExternal(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * 응답(TTS) 종료 후 열도록 URL을 큐에 등록
 */
export function queueExternal(url) {
  pendingUrl = url;
}

/**
 * 큐에 등록된 URL을 꺼내며 비움
 */
export function consumePendingExternal() {
  const url = pendingUrl;
  pendingUrl = null;
  return url;
}
