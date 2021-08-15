import classNames from "classnames";

/**
 * @param className `string`
 * @param type `string`
 * @param placeholder `string`
 * @param value: `string`
 * @param error: string | undefined => @returns `void`
 *
 * @param {setValue: (str: string)}
 */
interface IntputGroupProps {
  className?: string;
  type: string;
  placeholder: string;
  value: string;
  error: string | undefined;
  setValue: (str: string) => void;
}

const InputGroup: React.FC<IntputGroupProps> = ({
  className,
  type,
  placeholder,
  value,
  error,
  setValue,
}) => {
  return (
    <div className={className}>
      <input
        type={type}
        className={classNames(
          "w-full p-3 transition duration-200 border border-gray-300 rounded outline-none bg-gray-50 focus:bg-white hover:bg-white",
          { "border-red-500": error }
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <small className="font-medium text-red-600">{error}</small>
    </div>
  );
};

export default InputGroup;
