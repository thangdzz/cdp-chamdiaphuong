"use client";

export default function ConfirmActionButton({ action, message, children, className }) {
  return (
    <button
      type="submit"
      formAction={action}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
