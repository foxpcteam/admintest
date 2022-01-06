import React, {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  useImperativeHandle,
  useRef,
} from "react"
import MinusIcon from "../../fundamentals/icons/minus-icon"
import PlusIcon from "../../fundamentals/icons/plus-icon"
import InputContainer from "../../fundamentals/input-container"
import InputHeader from "../../fundamentals/input-header"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  deletable?: boolean
  key?: string
  onDelete?: MouseEventHandler<HTMLSpanElement>
  onChange?: ChangeEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
  withTooltip?: boolean
  tooltipText?: string
  tooltipProps?: any
  props?: React.HTMLAttributes<HTMLDivElement>
}

const InputField = React.forwardRef(
  (
    {
      placeholder,
      label,
      name,
      key,
      required,
      deletable,
      onDelete,
      onChange,
      onFocus,
      withTooltip = false,
      tooltipText,
      tooltipProps = {},
      props,
      ...fieldProps
    }: InputProps,
    ref
  ) => {
    const inputRef = useRef(null)

    useImperativeHandle(ref, () => inputRef.current)

    const onClickChevronUp = () => {
      inputRef.current?.stepUp()
      if (onChange) {
        inputRef.current?.dispatchEvent(
          new InputEvent("change", {
            view: window,
            bubbles: true,
            cancelable: false,
          })
        )
      }
    }

    const onClickChevronDown = () => {
      inputRef.current?.stepDown()
      if (onChange) {
        inputRef.current?.dispatchEvent(
          new InputEvent("change", {
            view: window,
            bubbles: true,
            cancelable: false,
          })
        )
      }
    }

    return (
      <InputContainer
        props={props}
        key={name}
        onClick={() => inputRef?.current?.focus()}
      >
        {label && (
          <InputHeader
            {...{ label, required, withTooltip, tooltipText, tooltipProps }}
          />
        )}
        <div className="w-full flex mt-1">
          <input
            className="bg-inherit outline-none outline-0 w-full remove-number-spinner leading-base text-grey-90 font-normal caret-violet-60 placeholder-grey-40"
            ref={inputRef}
            autoComplete="off"
            name={name}
            key={key || name}
            placeholder={placeholder ? placeholder : "Placeholder"}
            onChange={onChange}
            onFocus={onFocus}
            {...fieldProps}
          />

          {deletable && (
            <span onClick={onDelete} className="cursor-pointer ml-2">
              &times;
            </span>
          )}

          {fieldProps.type === "number" && (
            <div className="flex self-end">
              <span
                onClick={onClickChevronDown}
                onMouseDown={e => e.preventDefault()}
                className="mr-2 text-grey-50 w-4 h-4 hover:bg-grey-10 rounded-soft cursor-pointer"
              >
                <MinusIcon size={16} />
              </span>
              <span
                onMouseDown={e => e.preventDefault()}
                onClick={onClickChevronUp}
                className="text-grey-50 w-4 h-4 hover:bg-grey-10 rounded-soft cursor-pointer"
              >
                <PlusIcon size={16} />
              </span>
            </div>
          )}
        </div>
      </InputContainer>
    )
  }
)

export default InputField
