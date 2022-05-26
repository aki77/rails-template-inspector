const findPreviousAnnotateComment = (element: ChildNode): string | undefined => {
  const prev = element.previousSibling
  if (!prev) return

  if (prev.nodeName !== '#comment') {
    return findPreviousAnnotateComment(prev)
  }

  const comment = (prev as any).data as string
  if (!comment.trim().startsWith('BEGIN')) return

  return comment.replace('BEGIN', '').trim()
}

type FindTargetResult = {
  element: HTMLElement
  path: string
}

export const findTarget = (element: HTMLElement): FindTargetResult | undefined => {
  const path = findPreviousAnnotateComment(element)

  if (path) {
    return {
      element,
      path,
    }
  }

  return element.parentElement ? findTarget(element.parentElement) : undefined
}

export const isKeyActive = (key: string, event: KeyboardEvent): boolean => {
  switch (key) {
    case "shift":
    case "control":
    case "alt":
    case "meta":
      return event.getModifierState(key.charAt(0).toUpperCase() + key.slice(1))
    default:
      return key === event.key.toLowerCase()
  }
}
