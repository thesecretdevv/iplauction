export const SUPPORT_URL = 'https://onlychai.neocities.org/support.html?name=iplauction.fun&upi=naga.tum%40ptyes';

export default function ChaiSupport() {
  return (
    <a
      className="chai-support"
      href={SUPPORT_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Buy me a chai to help keep the server alive"
    >
      <span className="chai-support-icon" aria-hidden="true" />
      <span className="chai-support-note">
        <span>buy me a chai</span>
      </span>
    </a>
  );
}
