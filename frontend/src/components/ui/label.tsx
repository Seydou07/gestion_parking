import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-xs font-black uppercase tracking-widest leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500 block mb-2",
            className
        )}
        {...props}
    />
));
Label.displayName = "Label";

export { Label };
