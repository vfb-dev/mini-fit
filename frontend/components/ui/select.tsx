"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SelectItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value"
> & {
  value: string
}

type SelectContextValue = {
  contentElement: HTMLDivElement | null
  contentId: string
  disabled: boolean
  open: boolean
  selectedLabel: React.ReactNode
  setContentElement: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
  setOpen: (open: boolean) => void
  setTriggerElement: React.Dispatch<
    React.SetStateAction<HTMLButtonElement | null>
  >
  triggerElement: HTMLButtonElement | null
  value: string
  chooseItem: (value: string) => void
}

type SelectProps = {
  children?: React.ReactNode
  defaultOpen?: boolean
  defaultValue?: string
  disabled?: boolean
  name?: string
  onOpenChange?: (open: boolean) => void
  onValueChange?: (value: string) => void
  open?: boolean
  required?: boolean
  value?: string
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error(`${component} must be used inside Select`)
  }

  return context
}

function collectSelectItems(children: React.ReactNode) {
  const items: Record<string, React.ReactNode> = {}

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return

    if (child.type === SelectItem) {
      const itemProps = child.props as SelectItemProps
      items[itemProps.value] = itemProps.children
      return
    }

    const childProps = child.props as { children?: React.ReactNode }

    if (childProps.children) {
      Object.assign(items, collectSelectItems(childProps.children))
    }
  })

  return items
}

function Select({
  children,
  defaultOpen = false,
  defaultValue = "",
  disabled = false,
  name,
  onOpenChange,
  onValueChange,
  open: openProp,
  required,
  value: valueProp,
}: SelectProps) {
  const contentId = React.useId()
  const isOpenControlled = openProp !== undefined
  const isValueControlled = valueProp !== undefined

  const [contentElement, setContentElement] =
    React.useState<HTMLDivElement | null>(null)
  const [triggerElement, setTriggerElement] =
    React.useState<HTMLButtonElement | null>(null)
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const open = openProp ?? internalOpen
  const value = valueProp ?? internalValue
  const items = React.useMemo(() => collectSelectItems(children), [children])
  const hasSelectedItem =
    value !== "" && Object.prototype.hasOwnProperty.call(items, value)
  const selectedLabel = hasSelectedItem ? items[value] : null

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (disabled) return

      if (!isOpenControlled) {
        setInternalOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [disabled, isOpenControlled, onOpenChange],
  )

  const chooseItem = React.useCallback(
    (nextValue: string) => {
      if (!isValueControlled) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)
      setOpen(false)
    },
    [isValueControlled, onValueChange, setOpen],
  )

  React.useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target

      if (!(target instanceof Node)) return

      if (
        triggerElement?.contains(target) ||
        contentElement?.contains(target)
      ) {
        return
      }

      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        triggerElement?.focus()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [contentElement, open, setOpen, triggerElement])

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      contentElement,
      contentId,
      disabled,
      open,
      selectedLabel,
      setContentElement,
      setOpen,
      setTriggerElement,
      triggerElement,
      value,
      chooseItem,
    }),
    [
      contentElement,
      contentId,
      disabled,
      open,
      selectedLabel,
      setOpen,
      triggerElement,
      value,
      chooseItem,
    ],
  )

  return (
    <SelectContext.Provider value={contextValue}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
          disabled={disabled}
        />
      ) : null}
      {children}
    </SelectContext.Provider>
  )
}

function SelectGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  children,
  placeholder,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  placeholder?: React.ReactNode
}) {
  const { selectedLabel, value } = useSelectContext("SelectValue")
  const displayValue = selectedLabel ?? children
  const isPlaceholder = !value || displayValue == null

  return (
    <span
      data-slot="select-value"
      data-placeholder={isPlaceholder ? "" : undefined}
      className={cn(
        "line-clamp-1 flex min-w-0 items-center gap-1.5 text-left",
        isPlaceholder && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {isPlaceholder ? placeholder : displayValue}
    </span>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  disabled,
  onClick,
  onKeyDown,
  type,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "default"
}) {
  const {
    contentId,
    disabled: rootDisabled,
    open,
    selectedLabel,
    setOpen,
    setTriggerElement,
  } = useSelectContext("SelectTrigger")
  const isDisabled = disabled || rootDisabled

  return (
    <button
      type={type ?? "button"}
      role="combobox"
      aria-controls={contentId}
      aria-expanded={open}
      data-slot="select-trigger"
      data-size={size}
      data-state={open ? "open" : "closed"}
      data-placeholder={!selectedLabel ? "" : undefined}
      disabled={isDisabled}
      className={cn(
        "flex h-8 w-full min-w-0 items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-base whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      ref={setTriggerElement}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          setOpen(!open)
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)

        if (event.defaultPrevented) return

        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault()
          setOpen(true)
        }
      }}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          "pointer-events-none size-4 text-muted-foreground transition-transform",
          open && "rotate-180",
        )}
      />
    </button>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  style,
  onKeyDown,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "center" | "end" | "start"
  position?: "item-aligned" | "popper"
}) {
  const {
    contentElement,
    contentId,
    open,
    setContentElement,
    setOpen,
    triggerElement,
  } = useSelectContext("SelectContent")

  const updatePosition = React.useCallback(() => {
    if (!triggerElement || !contentElement) return

    const rect = triggerElement.getBoundingClientRect()
    const gap = 6
    const viewportPadding = 12
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding
    const availableAbove = rect.top - viewportPadding
    const openAbove = availableBelow < 180 && availableAbove > availableBelow
    const availableHeight = openAbove ? availableAbove : availableBelow

    let left = rect.left

    if (align === "end") {
      left = rect.right - rect.width
    }

    if (align === "center") {
      left = rect.left + rect.width / 2 - rect.width / 2
    }

    Object.assign(contentElement.style, {
      left: `${left}px`,
      maxHeight: `${Math.min(280, Math.max(120, availableHeight - gap))}px`,
      top: `${openAbove ? rect.top - gap : rect.bottom + gap}px`,
      transform: openAbove ? "translateY(-100%)" : "",
      width: `${rect.width}px`,
    })
  }, [align, contentElement, triggerElement])

  React.useLayoutEffect(() => {
    if (!open) return

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open, updatePosition])

  if (typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div
      id={contentId}
      role="listbox"
      data-slot="select-content"
      data-state={open ? "open" : "closed"}
      data-position={position}
      data-align={align}
      ref={setContentElement}
      className={cn(
        "fixed z-[60] min-w-36 overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        !open && "hidden",
        className,
      )}
      style={style}
      onKeyDown={(event) => {
        onKeyDown?.(event)

        if (event.defaultPrevented) return

        if (event.key === "Escape") {
          setOpen(false)
          triggerElement?.focus()
        }
      }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}

function SelectLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  disabled,
  onClick,
  onKeyDown,
  value,
  ...props
}: SelectItemProps) {
  const { chooseItem, contentElement, setOpen, triggerElement, value: selectedValue } =
    useSelectContext("SelectItem")
  const selected = selectedValue === value

  function focusSiblingItem(direction: 1 | -1) {
    const items = Array.from(
      contentElement?.querySelectorAll<HTMLButtonElement>(
        "[data-slot='select-item']:not(:disabled)",
      ) ?? [],
    )

    const currentIndex = items.findIndex((item) => item.value === value)
    const nextIndex = currentIndex + direction
    const nextItem = items[nextIndex] ?? items[direction === 1 ? 0 : items.length - 1]
    nextItem?.focus()
  }

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-slot="select-item"
      data-state={selected ? "checked" : "unchecked"}
      disabled={disabled}
      value={value}
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-left text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented && !disabled) {
          chooseItem(value)
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)

        if (event.defaultPrevented) return

        if (event.key === "ArrowDown") {
          event.preventDefault()
          focusSiblingItem(1)
        }

        if (event.key === "ArrowUp") {
          event.preventDefault()
          focusSiblingItem(-1)
        }

        if (event.key === "Escape") {
          setOpen(false)
          triggerElement?.focus()
        }
      }}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        {selected ? <CheckIcon className="pointer-events-none" /> : null}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </button>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </div>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
