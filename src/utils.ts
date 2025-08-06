const findPreviousAnnotateComment = (element: ChildNode, ignorePaths: string[] = []): string | undefined => {
  const prev = element.previousSibling
  if (!prev) return

  if (prev.nodeName !== '#comment') {
    return findPreviousAnnotateComment(prev, ignorePaths)
  }

  const comment = ((prev as any).data as string).trim()
  const match = comment.match(/^(BEGIN|END) (\S+)$/)
  if (!match) return

  const [, prefix, path] = match
  if (prefix === 'END') return findPreviousAnnotateComment(prev, [...ignorePaths, path])
  if (ignorePaths.includes(path)) return findPreviousAnnotateComment(prev, ignorePaths)

  return path
}

type FindTargetOptions = {
  ignorePaths?: string[]
}

export type FindTargetResult = {
  element: HTMLElement
  path: string
}

export const findTarget = (element: HTMLElement, options: FindTargetOptions = {}): FindTargetResult | undefined => {
  const path = findPreviousAnnotateComment(element, options.ignorePaths)

  if (path) {
    return {
      element,
      path,
    }
  }

  return element.parentElement ? findTarget(element.parentElement) : undefined
}

const MAX_PARENT_TARGETS = 20

export const findParentTargets = (element: HTMLElement, path: string): readonly FindTargetResult[] => {
  const parents: FindTargetResult[] = []
  let i = 0
  let el = element

  do {
    const result = findTarget(el, { ignorePaths: [...parents.map(({ path }) => path), path] })
    if (!result) break

    parents.push(result)
    el = result.element
    i++
  } while (i < MAX_PARENT_TARGETS);

  return parents.reverse()
}

const isKeyActive = (key: string, event: KeyboardEvent): boolean => {
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

export const isCombo = (comboKey: string, event: KeyboardEvent): boolean => {
  const keys = comboKey.replace('command', 'meta').toLowerCase().split('-')
  return keys.every(key => isKeyActive(key, event))
}
