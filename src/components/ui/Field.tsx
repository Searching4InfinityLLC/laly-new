// Shared by BookingDialog and the careers ApplicationForm — lifted out of the former verbatim.

// Underline-only field. The archived form frame (182:590) drew its inputs this way and it is the
// only input treatment in the file that belongs to the marketing side — boxed shadcn inputs would
// drag the login kit's whole language in with them. Label is a real <label>, above the control, not
// a placeholder: placeholder-as-label vanishes the moment someone types and is the single most
// common form accessibility failure.
export function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  error,
  onChange,
  onBlur,
  className = '',
  required,
  placeholder,
}: {
  id: string
  label: string
  type: string
  autoComplete: string
  className?: string
  required?: boolean
  placeholder?: string
  value: string
  error?: string
  onChange: (v: string) => void
  onBlur: () => void
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-fira text-[11px] uppercase tracking-[1px] text-[#867a72]"
      >
        {label}
        {/* optional fields say so; required ones stay unmarked, the norm on a short form */}
        {required === false && <span className="normal-case tracking-normal opacity-70"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required={required || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1.5 w-full border-b bg-transparent pb-1.5 font-display text-xl text-[#262626] caret-[#ff6d6a] outline-none transition-colors placeholder:text-[#867a72]/60 focus:border-[#ff6d6a] ${
          error ? 'border-[#151414]' : 'border-[#544D49]/45'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-sans text-sm text-[#151414]">
          {error}
        </p>
      )}
    </div>
  )
}
