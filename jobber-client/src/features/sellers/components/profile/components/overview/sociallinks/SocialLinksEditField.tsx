import { cloneDeep } from 'lodash';
import { ChangeEvent, FC, ReactElement, useContext, useState } from 'react';
import { SellerContext } from 'src/features/sellers/context/SellerContext';
import { ISocialEditLinksProps } from 'src/features/sellers/interfaces/seller.interface';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';

const SocialLinksEditField: FC<ISocialEditLinksProps> = ({
  type,
  selectedLink,
  setShowSocialLinksAddForm,
  setShowSocialLinksEditForm
}): ReactElement => {
  const [walletAddress, setWalletAddress] = useState<string>(selectedLink ? `${selectedLink}` : '');
  const { sellerProfile, setSellerProfile } = useContext(SellerContext);

  // Validate Ethereum address format
  const isValidEthereumAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const onHandleUpdate = (): void => {
    if (!isValidEthereumAddress(walletAddress)) {
      return; // Don't save invalid addresses
    }

    // Always store wallet address as the first (and only) item in socialLinks array
    const updatedSocialLinks = [walletAddress];

    if (setSellerProfile) {
      setSellerProfile({ ...sellerProfile, socialLinks: updatedSocialLinks });

      if (type === 'add' && setShowSocialLinksAddForm) {
        setShowSocialLinksAddForm(false);
      } else if (type === 'edit' && setShowSocialLinksEditForm) {
        setShowSocialLinksEditForm(false);
      }
    }
  };

  const onCancelUpdate = (): void => {
    if (type === 'add' && setShowSocialLinksAddForm) {
      setShowSocialLinksAddForm(false);
    } else if (type === 'edit' && setShowSocialLinksEditForm) {
      setShowSocialLinksEditForm(false);
    }
  };

  const isValidAddress = walletAddress ? isValidEthereumAddress(walletAddress) : true;

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 px-3">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Ethereum Wallet Address</label>
        <TextInput
          className={`w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none ${
            !isValidAddress ? 'border-red-400 focus:border-red-500' : 'border-grey focus:border-blue-500'
          }`}
          placeholder="Enter your Ethereum wallet address (0x...)"
          type="text"
          name="walletAddress"
          value={walletAddress}
          onChange={(event: ChangeEvent) => {
            setWalletAddress((event.target as HTMLInputElement).value);
          }}
        />

        {/* Validation feedback */}
        {walletAddress && !isValidAddress && (
          <p className="text-red-500 text-xs mt-1">⚠️ Please enter a valid Ethereum address (starts with 0x and 42 characters long)</p>
        )}

        {walletAddress && isValidAddress && <p className="text-green-600 text-xs mt-1">✅ Valid Ethereum address</p>}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm">
          <h3 className="font-medium text-blue-800 mb-2">📝 How to get your wallet address:</h3>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside text-xs">
            <li>Open MetaMask browser extension</li>
            <li>Click on your account name at the top</li>
            <li>Click "Copy address to clipboard"</li>
            <li>Paste it in the field above</li>
          </ol>
        </div>
      </div>

      <div className="z-20 my-4 mt-10 flex cursor-pointer justify-center md:z-0 md:mt-0">
        <Button
          disabled={!walletAddress || !isValidAddress}
          className={`md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white
          hover:bg-sky-400 focus:outline-none md:py-2 ${
            !walletAddress || !isValidAddress ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
          }`}
          label={`${type === 'add' ? 'Add Wallet' : 'Update Wallet'}`}
          onClick={onHandleUpdate}
        />
        &nbsp;&nbsp;
        <Button
          className="md:text-md rounded bg-gray-300 px-6 py-1 text-center text-sm font-bold hover:bg-gray-200 focus:outline-none md:py-2"
          label="Cancel"
          onClick={onCancelUpdate}
        />
      </div>
    </div>
  );
};

export default SocialLinksEditField;
