import { watch, onUnmounted } from "vue"

const modalStack: VoidFunction[] = []
let listening = false

function getBackButton() {
  const tg = window.Telegram?.WebApp
  if (!tg?.isVersionAtLeast("6.1")) return null
  return tg.BackButton
}

function handleBackButtonClick() {
  const topClose = modalStack[modalStack.length - 1]
  topClose?.()
}

function handleEscapeKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.isComposing || e.defaultPrevented) return
  handleBackButtonClick()
}

function syncEscapeKey() {
  if (modalStack.length > 0) {
    document.addEventListener("keydown", handleEscapeKey)
  } else {
    document.removeEventListener("keydown", handleEscapeKey)
  }
}

function syncVisibility() {
  const backButton = getBackButton()
  if (!backButton) return

  if (modalStack.length > 0) {
    if (!listening) {
      backButton.onClick(handleBackButtonClick)
      listening = true
    }
    backButton.show()
  } else {
    backButton.hide()
  }
}

function removeFromStack(close: VoidFunction) {
  const index = modalStack.lastIndexOf(close)
  if (index !== -1) modalStack.splice(index, 1)
}

export function useModalBackButton(isOpen: () => boolean, close: VoidFunction) {
  watch(
    isOpen,
    (open) => {
      if (open) {
        modalStack.push(close)
      } else {
        removeFromStack(close)
      }
      syncVisibility()
      syncEscapeKey()
    },
    { immediate: true }
  )

  onUnmounted(() => {
    removeFromStack(close)
    syncVisibility()
    syncEscapeKey()
  })
}
