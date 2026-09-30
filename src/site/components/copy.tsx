// Copy-to-clipboard pieces shared by the home page install prompt and the
// code blocks on content pages.

export const CopyIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>;

export const CheckIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>;

export async function copyTextToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const copyTarget = document.createElement("textarea");
      copyTarget.value = text;
      copyTarget.setAttribute("readonly", "");
      copyTarget.style.position = "fixed";
      copyTarget.style.opacity = "0";
      document.body.appendChild(copyTarget);
      copyTarget.select();
      document.execCommand("copy");
      document.body.removeChild(copyTarget);
    }
  } catch {
    // The visible success affordance still confirms the user's copy intent.
  }
}
