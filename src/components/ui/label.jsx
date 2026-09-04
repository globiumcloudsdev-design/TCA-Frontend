"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

function cleanLabelChildren(children) {
  if (children === null || children === undefined || typeof children === 'boolean' || typeof children === 'function') {
    return children;
  }

  if (typeof children === 'string') {
    if (/[\s*]*\*+[\s*]*$/.test(children)) {
      const clean = children.replace(/[\s*]*\*+[\s*]*$/, '').trim();
      return (
        <>
          {clean}
          <span className="ml-0.5 text-destructive font-semibold">*</span>
        </>
      );
    }
    return children;
  }

  const childArray = React.Children.toArray(children);
  let seenAsterisk = false;
  const processed = [];

  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];

    // Check if child is an asterisk node or string containing solely asterisk(s)
    const isAsteriskText = typeof child === 'string' && /^[\s*]+$/.test(child);
    const isAsteriskElement =
      React.isValidElement(child) &&
      (child.props?.children === '*' ||
        child.props?.children === ' *' ||
        (typeof child.props?.children === 'string' && /^[\s*]+$/.test(child.props.children)));

    if (isAsteriskText || isAsteriskElement) {
      if (seenAsterisk) {
        // Drop duplicate asterisk
        continue;
      }
      seenAsterisk = true;
      processed.push(
        <span key={`ast-${i}`} className="ml-0.5 text-destructive font-semibold">
          *
        </span>
      );
      continue;
    }

    // Check if child is a string ending with asterisk(s)
    if (typeof child === 'string' && /[\s*]*\*+[\s*]*$/.test(child)) {
      const clean = child.replace(/[\s*]*\*+[\s*]*$/, '').trim();
      if (clean) processed.push(clean);
      if (!seenAsterisk) {
        seenAsterisk = true;
        processed.push(
          <span key={`ast-${i}`} className="ml-0.5 text-destructive font-semibold">
            *
          </span>
        );
      }
      continue;
    }

    processed.push(child);
  }

  return processed;
}

const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}>
    {cleanLabelChildren(children)}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
