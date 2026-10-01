"use client";

import React, { useId, useSyncExternalStore } from "react";
import Select, {
  Props as SelectProps,
  GroupBase,
  StylesConfig,
  components,
  DropdownIndicatorProps,
  ClearIndicatorProps,
  OptionProps,
  MultiValueRemoveProps,
  LoadingIndicatorProps,
  SelectInstance,
} from "react-select";
import CreatableSelect, {
  CreatableProps,
} from "react-select/creatable";
import AsyncSelect, { AsyncProps } from "react-select/async";
import {
  CaretDownIcon,
  XIcon,
  CheckIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";

export interface SelectOption {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectExtraProps {
  error?: boolean;
  prefixIcon?: React.ReactNode;
  containerClassName?: string;
  selectClassName?: string;
  size?: "sm" | "md";
}

export type SelectInputProps<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Omit<SelectProps<Option, IsMulti, Group>, "className"> &
  CustomSelectExtraProps & {
    ref?: React.Ref<SelectInstance<Option, IsMulti, Group>>;
  };

export type CreatableSelectInputProps<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Omit<CreatableProps<Option, IsMulti, Group>, "className"> &
  CustomSelectExtraProps & {
    ref?: React.Ref<SelectInstance<Option, IsMulti, Group>>;
  };

export type AsyncSelectInputProps<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Omit<AsyncProps<Option, IsMulti, Group>, "className"> &
  CustomSelectExtraProps & {
    ref?: React.Ref<SelectInstance<Option, IsMulti, Group>>;
  };

const emptySubscribe = () => () => {};

/**
 * Idiomatic React 18/19 hook to detect client-side mounting without setState in useEffect.
 */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Custom Dropdown Indicator with animated Caret
function DropdownIndicator<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(props: DropdownIndicatorProps<Option, IsMulti, Group>) {
  return (
    <components.DropdownIndicator {...props}>
      <div
        className={`cursor-pointer! text-zinc-400 transition-transform duration-200 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 ${
          props.selectProps.menuIsOpen ? "rotate-180" : ""
        }`}
      >
        <CaretDownIcon size={14} weight="bold" />
      </div>
    </components.DropdownIndicator>
  );
}

// Custom Clear Button
function ClearIndicator<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(props: ClearIndicatorProps<Option, IsMulti, Group>) {
  return (
    <components.ClearIndicator {...props}>
      <div className="cursor-pointer! text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200">
        <XIcon size={13} weight="bold" />
      </div>
    </components.ClearIndicator>
  );
}

// Custom Option component with support for icons, descriptions, and checkmark
function Option<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(props: OptionProps<Option, IsMulti, Group>) {
  const data = props.data as SelectOption;
  const isSelected = props.isSelected;

  return (
    <components.Option {...props}>
      <div className="flex w-full items-center justify-between gap-2 cursor-pointer!">
        <div className="flex items-center gap-2 overflow-hidden cursor-pointer!">
          {data?.icon && (
            <span className="shrink-0 text-current">{data.icon}</span>
          )}
          <div className="flex flex-col text-left min-w-0 cursor-pointer!">
            <span className="truncate leading-normal cursor-pointer!">
              {props.children}
            </span>
            {data?.description && (
              <span
                className={`text-[10px] leading-tight truncate cursor-pointer! ${
                  isSelected
                    ? "text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {data.description}
              </span>
            )}
          </div>
        </div>

        {isSelected && (
          <span className="shrink-0 cursor-pointer!">
            <CheckIcon size={12} weight="bold" />
          </span>
        )}
      </div>
    </components.Option>
  );
}

// Custom Multi-value Remove Icon
function MultiValueRemove<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(props: MultiValueRemoveProps<Option, IsMulti, Group>) {
  return (
    <components.MultiValueRemove {...props}>
      <div className="text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer!">
        <XIcon size={11} weight="bold" />
      </div>
    </components.MultiValueRemove>
  );
}

// Custom Loading Spinner Indicator
function LoadingIndicator<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(props: LoadingIndicatorProps<Option, IsMulti, Group>) {
  return (
    <components.LoadingIndicator {...props}>
      <CircleNotchIcon
        size={14}
        className="animate-spin text-zinc-400 dark:text-zinc-500"
      />
    </components.LoadingIndicator>
  );
}

export function getSelectClassNames({
  error,
  prefixIcon,
  selectClassName = "",
  size = "md",
}: {
  error?: boolean;
  prefixIcon?: React.ReactNode;
  selectClassName?: string;
  size?: "sm" | "md";
}) {
  const isSm = size === "sm";
  const fontSize = isSm ? "text-xs" : "text-sm";

  return {
    container: () => "cursor-pointer!",
    control: ({
      isFocused,
      isDisabled,
    }: {
      isFocused: boolean;
      isDisabled: boolean;
    }) => {
      const minHeight = isSm ? "min-h-9" : "min-h-10.5";
      const px = isSm ? "px-2.5" : "px-3";
      const baseClasses = `relative flex items-center ${minHeight} w-full rounded-xl border bg-white ${px} ${fontSize} text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 cursor-pointer!`;
      const paddingClass = prefixIcon ? (isSm ? "pl-8" : "pl-9") : "";
      const stateClass = error
        ? "border-red-500/80 ring-2 ring-red-500/20 dark:border-red-500/80"
        : isFocused
        ? "border-zinc-900 ring-2 ring-zinc-900/10 dark:border-zinc-400 dark:ring-zinc-400/20"
        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700";
      const disabledClass = isDisabled
        ? "opacity-50 cursor-not-allowed! bg-zinc-50 dark:bg-zinc-900/50"
        : "cursor-pointer!";

      return `${baseClasses} ${paddingClass} ${stateClass} ${disabledClass} ${selectClassName}`;
    },
    valueContainer: () =>
      isSm
        ? "flex flex-wrap items-center gap-1 py-0.5 cursor-pointer!"
        : "flex flex-wrap items-center gap-1.5 py-1 cursor-pointer!",
    placeholder: () =>
      `${fontSize} leading-normal text-zinc-400 dark:text-zinc-500 font-normal cursor-pointer! select-none`,
    singleValue: () =>
      `${fontSize} leading-normal text-zinc-900 dark:text-zinc-100 font-normal cursor-pointer! select-none`,
    input: () =>
      `${fontSize} leading-normal text-zinc-900 dark:text-zinc-100 cursor-pointer! [&_input]:cursor-pointer!`,
    menu: () =>
      `${fontSize} mt-1.5 overflow-hidden rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-md p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-2xl z-50 cursor-pointer! [&_*]:cursor-pointer!`,
    menuList: () =>
      `${fontSize} flex flex-col gap-0.5 p-0 max-h-60 overflow-y-auto cursor-pointer! [&_*]:cursor-pointer!`,
    menuPortal: () => "cursor-pointer! [&_*]:cursor-pointer!",
    option: ({
      isFocused,
      isSelected,
      isDisabled,
    }: {
      isFocused: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }) => {
      const padding = isSm ? "px-2 py-1.5" : "px-2.5 py-2";
      const base = `rounded-lg ${padding} ${fontSize} leading-normal transition-colors cursor-pointer! select-none`;
      if (isDisabled) return `${base} opacity-40 cursor-not-allowed!`;
      if (isSelected) {
        return `${base} bg-zinc-900 text-white font-medium dark:bg-zinc-100 dark:text-zinc-950`;
      }
      if (isFocused) {
        return `${base} bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100`;
      }
      return `${base} text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50`;
    },
    multiValue: () =>
      "inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
    multiValueLabel: () => "truncate",
    multiValueRemove: () =>
      "rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer!",
    indicatorsContainer: () => "flex items-center gap-0.5 pl-1 cursor-pointer!",
    clearIndicator: () =>
      "p-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer!",
    dropdownIndicator: () =>
      "p-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer!",
    indicatorSeparator: () => "hidden",
    noOptionsMessage: () =>
      `py-4 text-center ${fontSize} text-zinc-400 dark:text-zinc-500`,
    loadingMessage: () =>
      `py-4 text-center ${fontSize} text-zinc-400 dark:text-zinc-500`,
    groupHeading: () =>
      "px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500",
  };
}

export function getSelectStyles<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(customStyles?: StylesConfig<Option, IsMulti, Group>): StylesConfig<Option, IsMulti, Group> {
  return {
    ...customStyles,
    container: (base, state) => ({
      ...base,
      cursor: "pointer",
      ...(customStyles?.container ? customStyles.container(base, state) : {}),
    }),
    control: (base, state) => ({
      ...base,
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      ...(customStyles?.control ? customStyles.control(base, state) : {}),
    }),
    valueContainer: (base, state) => ({
      ...base,
      cursor: "pointer",
      ...(customStyles?.valueContainer ? customStyles.valueContainer(base, state) : {}),
    }),
    placeholder: (base, state) => ({
      ...base,
      cursor: "pointer",
      ...(customStyles?.placeholder ? customStyles.placeholder(base, state) : {}),
    }),
    singleValue: (base, state) => ({
      ...base,
      cursor: "pointer",
      ...(customStyles?.singleValue ? customStyles.singleValue(base, state) : {}),
    }),
    menu: (base, state) => ({
      ...base,
      cursor: "pointer",
      ...(customStyles?.menu ? customStyles.menu(base, state) : {}),
    }),
    menuList: (base, state) => ({
      ...base,
      cursor: "pointer",
      ...(customStyles?.menuList ? customStyles.menuList(base, state) : {}),
    }),
    option: (base, state) => ({
      ...base,
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      ...(customStyles?.option ? customStyles.option(base, state) : {}),
    }),
  };
}

export const defaultSelectComponents = {
  DropdownIndicator,
  ClearIndicator,
  Option,
  MultiValueRemove,
  LoadingIndicator,
};

/**
 * Standard SelectInput component wrapping react-select with FinTrack styling.
 */
export function SelectInput<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  error,
  prefixIcon,
  containerClassName = "",
  selectClassName = "",
  size = "md",
  components: customComponents,
  placeholder = "Select...",
  instanceId,
  isClearable = true,
  styles: customStyles,
  ...props
}: SelectInputProps<Option, IsMulti, Group>) {
  const generatedId = useId();
  const isMounted = useIsMounted();

  const classNamesConfig = getSelectClassNames({
    error,
    prefixIcon,
    selectClassName,
    size,
  });

  const mergedStyles = getSelectStyles<Option, IsMulti, Group>(customStyles);

  const mergedComponents = {
    ...defaultSelectComponents,
    ...customComponents,
  };

  const isSm = size === "sm";
  const fontSize = isSm ? "text-xs" : "text-sm";

  return (
    <div
      className={`relative w-full cursor-pointer! ${fontSize} leading-normal ${containerClassName}`}
    >
      {prefixIcon && (
        <div
          className={`pointer-events-none absolute ${
            isSm ? "left-2.5" : "left-3.5"
          } top-1/2 -translate-y-1/2 z-10 flex items-center text-zinc-400 dark:text-zinc-500`}
        >
          {prefixIcon}
        </div>
      )}
      {isMounted ? (
        <Select<Option, IsMulti, Group>
          instanceId={instanceId || generatedId}
          unstyled
          classNames={classNamesConfig}
          styles={mergedStyles}
          components={mergedComponents}
          placeholder={placeholder}
          isClearable={isClearable}
          {...props}
        />
      ) : (
        <div
          className={`flex ${
            isSm ? "min-h-9 px-2.5 text-xs" : "min-h-10.5 px-3.5 text-sm"
          } w-full items-center rounded-xl border bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500 cursor-pointer! ${
            prefixIcon ? (isSm ? "pl-8" : "pl-10") : ""
          } ${
            error
              ? "border-red-500/80"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}

/**
 * CreatableSelectInput component for tag creation or new options.
 */
export function CreatableSelectInput<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  error,
  prefixIcon,
  containerClassName = "",
  selectClassName = "",
  size = "md",
  components: customComponents,
  placeholder = "Select or create...",
  instanceId,
  isClearable = true,
  styles: customStyles,
  ...props
}: CreatableSelectInputProps<Option, IsMulti, Group>) {
  const generatedId = useId();
  const isMounted = useIsMounted();

  const classNamesConfig = getSelectClassNames({
    error,
    prefixIcon,
    selectClassName,
    size,
  });

  const mergedStyles = getSelectStyles<Option, IsMulti, Group>(customStyles);

  const mergedComponents = {
    ...defaultSelectComponents,
    ...customComponents,
  };

  const isSm = size === "sm";
  const fontSize = isSm ? "text-xs" : "text-sm";

  return (
    <div
      className={`relative w-full cursor-pointer! ${fontSize} leading-normal ${containerClassName}`}
    >
      {prefixIcon && (
        <div
          className={`pointer-events-none absolute ${
            isSm ? "left-2.5" : "left-3.5"
          } top-1/2 -translate-y-1/2 z-10 flex items-center text-zinc-400 dark:text-zinc-500`}
        >
          {prefixIcon}
        </div>
      )}
      {isMounted ? (
        <CreatableSelect<Option, IsMulti, Group>
          instanceId={instanceId || generatedId}
          unstyled
          classNames={classNamesConfig}
          styles={mergedStyles}
          components={mergedComponents}
          placeholder={placeholder}
          isClearable={isClearable}
          {...props}
        />
      ) : (
        <div
          className={`flex ${
            isSm ? "min-h-9 px-2.5 text-xs" : "min-h-10.5 px-3.5 text-sm"
          } w-full items-center rounded-xl border bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500 cursor-pointer! ${
            prefixIcon ? (isSm ? "pl-8" : "pl-10") : ""
          } ${
            error
              ? "border-red-500/80"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}

/**
 * AsyncSelectInput component for remote searching / paginated data.
 */
export function AsyncSelectInput<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  error,
  prefixIcon,
  containerClassName = "",
  selectClassName = "",
  size = "md",
  components: customComponents,
  placeholder = "Search...",
  instanceId,
  isClearable = true,
  styles: customStyles,
  ...props
}: AsyncSelectInputProps<Option, IsMulti, Group>) {
  const generatedId = useId();
  const isMounted = useIsMounted();

  const classNamesConfig = getSelectClassNames({
    error,
    prefixIcon,
    selectClassName,
    size,
  });

  const mergedStyles = getSelectStyles<Option, IsMulti, Group>(customStyles);

  const mergedComponents = {
    ...defaultSelectComponents,
    ...customComponents,
  };

  const isSm = size === "sm";
  const fontSize = isSm ? "text-xs" : "text-sm";

  return (
    <div
      className={`relative w-full cursor-pointer! ${fontSize} leading-normal ${containerClassName}`}
    >
      {prefixIcon && (
        <div
          className={`pointer-events-none absolute ${
            isSm ? "left-2.5" : "left-3.5"
          } top-1/2 -translate-y-1/2 z-10 flex items-center text-zinc-400 dark:text-zinc-500`}
        >
          {prefixIcon}
        </div>
      )}
      {isMounted ? (
        <AsyncSelect<Option, IsMulti, Group>
          instanceId={instanceId || generatedId}
          unstyled
          classNames={classNamesConfig}
          styles={mergedStyles}
          components={mergedComponents}
          placeholder={placeholder}
          isClearable={isClearable}
          {...props}
        />
      ) : (
        <div
          className={`flex ${
            isSm ? "min-h-9 px-2.5 text-xs" : "min-h-10.5 px-3.5 text-sm"
          } w-full items-center rounded-xl border bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500 cursor-pointer! ${
            prefixIcon ? (isSm ? "pl-8" : "pl-10") : ""
          } ${
            error
              ? "border-red-500/80"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}

export default SelectInput;
