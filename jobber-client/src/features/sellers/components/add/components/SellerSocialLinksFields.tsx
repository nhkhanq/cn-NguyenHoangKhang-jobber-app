import { ChangeEvent, FC, ReactElement } from 'react';
import { ISocialLinksProps } from 'src/features/sellers/interfaces/seller.interface';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';

const SellerSocialLinksFields: FC<ISocialLinksProps> = ({ socialFields, setSocialFields }): ReactElement => {
  const handleWalletAddressChange = (event: ChangeEvent): void => {
    if (setSocialFields && socialFields) {
      const target: HTMLInputElement = event.target as HTMLInputElement;
      // Only keep the first item as wallet address
      setSocialFields([target.value]);
    }
  };

  // Validate Ethereum address format
  const isValidEthereumAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const walletAddress = socialFields && socialFields[0] ? socialFields[0] : '';

  return (
    <>
      <div className="flex w-full flex-col px-6 pb-3 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="pb-4 text-xl font-bold">Crypto Wallet Address</h2>
          <div className="text-xs text-gray-500">💡 For receiving crypto payments</div>
        </div>

        <div className="mb-4">
          <TextInput
            className={`w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none ${
              walletAddress && !isValidEthereumAddress(walletAddress)
                ? 'border-red-400 focus:border-red-500'
                : 'border-grey focus:border-blue-500'
            }`}
            placeholder="Enter your Ethereum wallet address (0x...)"
            type="text"
            name="walletAddress"
            value={walletAddress}
            onChange={handleWalletAddressChange}
          />

          {/* Validation feedback */}
          {walletAddress && !isValidEthereumAddress(walletAddress) && (
            <p className="text-red-500 text-xs mt-1">⚠️ Please enter a valid Ethereum address (starts with 0x and 42 characters long)</p>
          )}

          {walletAddress && isValidEthereumAddress(walletAddress) && (
            <p className="text-green-600 text-xs mt-1">✅ Valid Ethereum address</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <h3 className="font-medium text-blue-800 mb-2">📝 How to get your wallet address:</h3>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>Open MetaMask browser extension</li>
            <li>Click on your account name at the top</li>
            <li>Click "Copy address to clipboard"</li>
            <li>Paste it in the field above</li>
          </ol>
          <p className="text-blue-600 mt-2 text-xs">💰 This address will receive crypto payments when buyers purchase your gigs</p>
        </div>
      </div>
    </>
  );
};

export default SellerSocialLinksFields;
