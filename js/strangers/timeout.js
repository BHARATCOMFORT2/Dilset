let timeoutTimer = null;

export function startTimeout(onTimeout) {
  clearTimeout(timeoutTimer);

  timeoutTimer = setTimeout(() => {
    onTimeout();
  }, 60000); // 60 sec
}

export function resetTimeout(onTimeout) {
  startTimeout(onTimeout);
}

export function stopTimeout() {
  clearTimeout(timeoutTimer);
}
