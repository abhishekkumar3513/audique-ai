import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const currentValue = value !== undefined ? value : internalValue;

  const setValue = (val) => {
    setInternalValue(val);
    if (onValueChange) onValueChange(val);
  };

  const contextValue = useMemo(
    () => ({ value: currentValue, setValue }),
    [currentValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger must be used inside <Tabs>");
  }

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={`inline-flex items-center justify-center ${className || ''}`}
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsContent must be used inside <Tabs>");
  }

  if (ctx.value !== value) return null;

  return <div className={className}>{children}</div>;
}
