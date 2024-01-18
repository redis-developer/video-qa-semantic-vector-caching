export interface SettingsMenuProps {
  isOpen: boolean;
  onSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedOption: string;
}

function SettingsMenu({
  isOpen,
  onSelectionChange,
  selectedOption,
}: SettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 bg-white border rounded shadow p-4">
      <form>
        <label>
          <input
            type="radio"
            value="OpenAI"
            checked={selectedOption === 'OpenAI'}
            onChange={onSelectionChange}
          />
          OpenAI
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="Google"
            checked={selectedOption === 'Google'}
            onChange={onSelectionChange}
          />
          Google
        </label>
      </form>
    </div>
  );
}

export default SettingsMenu;
