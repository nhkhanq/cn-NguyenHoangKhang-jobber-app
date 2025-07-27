import { FC, ReactElement, useContext, useState } from 'react';
import { FaPencilAlt, FaWallet, FaCopy } from 'react-icons/fa';
import { SellerContext } from 'src/features/sellers/context/SellerContext';
import { showSuccessToast } from 'src/shared/utils/utils.service';

import SocialLinksEditField from './SocialLinksEditField';

const SocialLinks: FC = (): ReactElement => {
  const [showWalletEditForm, setShowWalletEditForm] = useState<boolean>(false);
  const { sellerProfile, showEditIcons } = useContext(SellerContext);

  // Get wallet address from first social link
  const walletAddress = sellerProfile.socialLinks && sellerProfile.socialLinks.length > 0 ? sellerProfile.socialLinks[0] : '';

  // Validate Ethereum address format
  const isValidEthereumAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  // Copy wallet address to clipboard
  const copyToClipboard = async (address: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(address);
      showSuccessToast('Wallet address copied to clipboard!');
    } catch (error) {
      showSuccessToast('Failed to copy address');
    }
  };

  return (
    <div className="border-grey border bg-white mt-6">
      <div className="mb-1 flex justify-between border-b">
        <h4 className="flex py-2.5 pl-3.5 text-sm font-bold text-[#161c2d] md:text-base">
          <FaWallet className="mr-2 mt-1" />
          CRYPTO WALLET
        </h4>
        {showEditIcons && (
          <span
            onClick={() => setShowWalletEditForm(!showWalletEditForm)}
            className="flex cursor-pointer items-center pr-3.5 text-[#00698c] text-sm md:text-base"
          >
            {walletAddress ? 'Edit' : 'Add Wallet'}
          </span>
        )}
      </div>

      <ul className="mb-0 list-none pt-1.5">
        {showWalletEditForm && (
          <li className="flex justify-between">
            <SocialLinksEditField
              type={walletAddress ? 'edit' : 'add'}
              selectedLink={walletAddress}
              setShowSocialLinksAddForm={setShowWalletEditForm}
              setShowSocialLinksEditForm={setShowWalletEditForm}
            />
          </li>
        )}

        {!showWalletEditForm && walletAddress && (
          <li className="flex justify-between mb-2">
            <div className="col-span-3 ml-4 flex pb-3 text-sm md:text-base items-center">
              {isValidEthereumAddress(walletAddress) ? (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Copy full address"
                  >
                    <FaCopy size="12" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-600 text-xs">Invalid wallet address</span>
                </div>
              )}
            </div>

            {showEditIcons && (
              <div className="mr-4">
                <FaPencilAlt
                  onClick={() => setShowWalletEditForm(true)}
                  size="12"
                  className="ml-1 mt-1.5 cursor-pointer lg:ml-2.5 lg:mt-2"
                />
              </div>
            )}
          </li>
        )}

        {!walletAddress && !showWalletEditForm && (
          <li className="flex justify-between mb-2 ml-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <span>No wallet address set</span>
              {showEditIcons && (
                <span onClick={() => setShowWalletEditForm(true)} className="text-blue-500 cursor-pointer text-xs">
                  (Add wallet to receive crypto payments)
                </span>
              )}
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default SocialLinks;
