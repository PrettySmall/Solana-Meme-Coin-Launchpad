import { useContext, useEffect, useState } from "react";
import TopBar from "../components/TopBar/TopBar";
import { AppContext } from "../App";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID, unpackAccount } from "@solana/spl-token";
import BigNumber from "bignumber.js";
import { ellipsisAddress } from "../utils/methods";
import axios from "axios";
import { toast } from "react-toastify";
import { FaBurn, FaDatabase, FaExclamationTriangle, FaRedo, FaRegCopy } from "react-icons/fa";
import ConfirmDialog from "../components/Dialogs/ConfirmDialog";

const Token2022ManagePage = () => {
  const {
    SERVER_URL,
    setLoadingPrompt,
    setOpenLoading,
    user,
    currentProject,
    notifyStatus,
    raydium,
    setNotifyStatus,
    sigData,
    signingData,
  } = useContext(AppContext);

  const { connected, publicKey, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const [copied, setCopied] = useState({});
  const [holders, setHolders] = useState([]);
  const [feeAuthorityTokenBalance, setFeeAuthorityTokenBalance] = useState("0");
  const [totalSupply, setTotalSupply] = useState("1000000000");
  const [decimals, setDecimals] = useState(9);
  const [burnAmount, setBurnAmount] = useState("0");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState("");
  const [confirmDialogMessage, setConfirmDialogMessage] = useState("");

  const disabled = !currentProject.token || currentProject.status !== "OPEN" || !user._id || user.role === "admin";

  useEffect(() => {
    if (connection) {
      getTransferFeeAccountsOfToken2022(connection, currentProject.token.address)
    }
  }, [currentProject.token, connection]);

  useEffect(() => {
    if (notifyStatus.tag === "BURN_COMPLETED") {
      if (notifyStatus.success) {
        toast.success("Succeed to burn tax token!");
        // get balance again
      }
      else {
        toast.warn(`Failed to burn tax token! ${notifyStatus.error ? notifyStatus.error : ""}`);
      }
      setOpenLoading(false);
      // setNotifyStatus({ success: true, tag: "NONE" });
    }
  }, [notifyStatus, currentProject._id]);

  const getTransferFeeAccountsOfToken2022 = async (connection, mint) => {
    setOpenLoading(true);
    setLoadingPrompt("Loading...");
    try {
      const tokenInfo = await getMint(connection, new PublicKey(mint), "confirmed", new PublicKey(TOKEN_2022_PROGRAM_ID))
      const allAccounts = await connection.getProgramAccounts(
        TOKEN_2022_PROGRAM_ID,
        {
          commitment: 'confirmed',
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: mint,
              },
            },
            {
              memcmp: {
                offset: 165,
                bytes: "3", // the number 2 as base58, which means AccountType::Account
              }
            },
          ],
        }
      )

      let accounts = []
      for (const accountInfo of allAccounts) {
        const account = unpackAccount(accountInfo.pubkey, accountInfo.account, TOKEN_2022_PROGRAM_ID);
        if (account.amount > 0n) {
          accounts.push({ address: account.owner.toBase58(), amount: new BigNumber(account.amount.toString() + 'e-' + tokenInfo.decimals.toString()).toString() })
        }

        if (account.owner.toBase58() == currentProject.token.authority) {
          setFeeAuthorityTokenBalance(new BigNumber(account.amount.toString() + 'e-' + tokenInfo.decimals.toString()).toString())
        }
      }

      for (let i = 0; i < accounts.length - 1; i++) {
        for (let j = i + 1; j < accounts.length; j++) {
          if (Number(accounts[i].amount) < Number(accounts[j].amount)) {
            let temp = { ...accounts[i] };
            accounts[i] = { ...accounts[j] };
            accounts[j] = { ...temp };
          }
        }
      }

      setHolders(accounts);
      setTotalSupply(new BigNumber(tokenInfo.supply.toString() + 'e-' + tokenInfo.decimals.toString()).toString())
      setDecimals(tokenInfo.decimals);
    } catch (error) {
      console.log('Error to get fee accounts', error);
      setHolders([])
    }
    setOpenLoading(false);
  }

  const copyToClipboard = async (key, text) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
      setCopied({
        ...copied,
        [key]: true,
      });
      setTimeout(() => setCopied({
        ...copied,
        [key]: false,
      }), 2000);
    }
    else
      console.error('Clipboard not supported');
  };

  const handleRefreshHolders = async () => {
    if (connection && currentProject?.token?.address) {
      getTransferFeeAccountsOfToken2022(connection, currentProject.token.address)
    }
  }

  const handleClickBurn = () => {
    if (burnAmount == "" || isNaN(Number(burnAmount))) {
      toast.warn("Invalid burn amount")
      return;
    }

    if (Number(burnAmount) <= 0 || Number(burnAmount) > Number(feeAuthorityTokenBalance)) {
      toast.warn("Burn amount is out of scope")
      return;
    }

    setShowConfirmDialog(true);
    setConfirmDialogTitle("Burn Tax");
    setConfirmDialogMessage(`Do you really want to burn ${burnAmount} token of tax collect wallet?`);
  }

  const handleBurnTaxToken = async () => {
    setShowConfirmDialog(false)
    setOpenLoading(true)
    setLoadingPrompt("Burning Tax Token...")
    try {
      const { data } = await axios.post(
        `${SERVER_URL}/api/v1/project/burn-tax-token`,
        {
          projectId: currentProject._id,
          amount: new BigNumber(burnAmount + 'e' + decimals.toString()).toString(),
          sigData,
          signingData
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (data.success) {
        await handleRefreshHolders();
      } else {
        toast.error(data.error)
      }
    } catch (err) {
      console.log(err)
      setOpenLoading(false)
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col max-[1800px]:items-start items-center overflow-auto">
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={confirmDialogTitle}
        message={confirmDialogMessage}
        onOK={handleBurnTaxToken}
        onCancel={() => setShowConfirmDialog(false)}
      />
      <div className="flex flex-col mx-6 my-3">
        <TopBar />
        <div className="flex gap-6 my-8 justify-center">
          <div className={`w-full flex flex-col gap-2 text-white`}>
            <div className="flex flex-col">
              <div className="flex items-start justify-between w-full h-auto">
                <div className="flex items-center font-sans text-xs font-medium text-white">
                  <div className="font-bold uppercase text-xl">Reward Reflection Management - </div>
                  {currentProject._id &&
                    <div className="text-gradient-blue-to-purple text-xl">{currentProject.name ? `${currentProject.name}` : "No project"}</div>
                  }
                  {currentProject?.token?.address &&
                    <>
                      <div className="mx-2 text-gray-normal opacity-30">/</div>
                      <div className="font-semibold text-gray-normal">{ellipsisAddress(currentProject?.token?.address)}</div>
                      {copied["token_address"] ?
                        (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>) :
                        <FaRegCopy className="w-3.5 h-3.5 ml-2 transition ease-in-out transform cursor-pointer active:scale-95 duration-90" onClick={() => copyToClipboard("token_address", currentProject?.token?.address)} />}
                      <a href={`https://solscan.io/account/${currentProject?.token?.address}`} target="_blank" rel="noreferrer">
                        <img className="w-3.5 h-3.5 object-contain ml-2" src="/assets/solscan.png" alt="solscan" />
                      </a>
                      <a href={`https://www.dextools.io/app/en/solana/pair-explorer/${currentProject?.token?.address}`} target="_blank" rel="noreferrer">
                        <img className="w-3.5 h-3.5 object-contain ml-2" src="/assets/img/dextool.png" alt="dextools" />
                      </a>
                      <a href={`https://dexscreener.com/solana/${currentProject?.token?.address}`} target="_blank" rel="noreferrer">
                        <img className="w-3.5 h-3.5 object-contain ml-2" src="/assets/img/dexscreener.png" alt="dexscreener" />
                      </a>
                    </>
                  }
                </div>
              </div>
              <div className="flex flex-row justify-between w-full gap-2 mt-3 mb-3 font-sans">
                <div className="w-full flex items-center justify-between gap-3 font-sans text-sm text-gray-normal">
                  <div>
                    TotalSupply: <span className="text-white">{totalSupply}</span>
                  </div>
                  <button
                    className={`text-xs font-medium text-center text-white uppercase px-6 py-2 rounded-lg flex justify-center items-center gap-2.5 bg-gradient-to-br from-[#4B65F1ED] to-[#FA03FF44] active:scale-95 transition duration-100 ease-in-out transform focus:outline-none disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
                    onClick={handleRefreshHolders}>
                    <FaRedo className="w-4 h-4 m-auto" /> Reload
                  </button>
                </div>
              </div>
              <p className="text-lg text-left">Holders:</p>
              <div className="w-full flex gap-10 overflow-visible font-sans">
                <div className="flex flex-col w-[50%] h-full text-white bg-transparent bg-clip-border">
                  <div className="relative border border-gray-highlight rounded-lg">
                    <div className={`h-[calc(100vh-235px)] overflow-y-auto`}>
                      {(!holders || holders.length === 0) &&
                        <div className="absolute flex items-center justify-center gap-2 my-3 text-base font-bold text-center uppercase -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-gray-border">
                          <FaExclamationTriangle className="text-sm opacity-50 text-green-normal" /> No Holders
                        </div>
                      }
                      <table className="min-w-[700px] w-full text-xs">
                        <thead className=" text-gray-normal">
                          <tr className="uppercase h-7 bg-[#1A1A37] sticky top-0 z-10">
                            <th className="w-8">
                              <p className="leading-none text-center">
                                #
                              </p>
                            </th>
                            <th className="">
                              <p className="leading-none text-center">
                                Address
                              </p>
                            </th>
                            <th className="">
                              <p className="leading-none text-left">
                                Token Balance
                              </p>
                            </th>
                            <th className="">
                              <p className="leading-none text-left">
                                %
                              </p>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-xs text-white">
                          {
                            holders &&
                            holders.map((item, index) => {
                              return (
                                <tr key={index}
                                  className={`${index % 2 === 1 && "bg-[#ffffff02]"} hover:bg-[#ffffff08] h-8`}
                                >
                                  <td className="">
                                    <p className="leading-none text-center text-gray-normal">
                                      {index + 1}
                                    </p>
                                  </td>
                                  <td className="">
                                    <div className="flex items-center justify-center gap-1 font-sans antialiased font-normal leading-normal text-gray-normal">
                                      <p className="bg-transparent border-none outline-none">
                                        {ellipsisAddress(item.address, 12)}
                                      </p>
                                      {
                                        copied["wallet_" + index] ?
                                          (<svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                          </svg>) :
                                          (<FaRegCopy className="w-3 h-3 transition ease-in-out transform cursor-pointer active:scale-95 duration-90" onClick={() => copyToClipboard("wallet_" + index, item.address)} />)
                                      }
                                    </div>
                                  </td>
                                  <td className="">
                                    <p className="flex items-center justify-start text-white">
                                      <FaDatabase className="mr-1 opacity-50 text-xxs text-gray-normal" />
                                      <span>
                                        {
                                          item.amount ?
                                            Number(item.amount?.split(".")[0] ?? "0").toLocaleString()
                                            : "0"
                                        }
                                      </span>
                                      <span className="font-normal text-gray-normal">.{
                                        item.amount ?
                                          item.amount?.split(".")[1]
                                          : "0000"
                                      }
                                      </span>
                                    </p>
                                  </td>
                                  <td className="text-center">
                                    <p className="flex items-center justify-start text-white">
                                      {item.amount ? (Number(item.amount) * 100 / Number(totalSupply)).toFixed(2) : 0}%
                                    </p>
                                  </td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-[50%] h-full ">
                  <div className="flex flex-col gap-4 w-full p-8 bg-[#00000033] border border-gray-highlight rounded-lg">
                    <div className="flex gap-3 items-center">
                      <p className="font-conthrax font-medium text-xl">Tax Collect Authority</p>
                      <p className="bg-transparent border-none outline-none text-sm">
                        {ellipsisAddress(currentProject.token.authority, 12)}
                      </p>
                      {
                        copied["authority"] ?
                          (<svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>) :
                          (<FaRegCopy className="w-3 h-3 transition ease-in-out transform cursor-pointer active:scale-95 duration-90" onClick={() => copyToClipboard("authority", currentProject.token.authority)} />)
                      }
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p>Token Balance:</p>
                      <p>{feeAuthorityTokenBalance} {currentProject.token.symbol ? currentProject.token.symbol : ""}</p>
                    </div>
                    <div className="items-center grow">
                      <div className="text-white text-left text-sm">
                        Burn Amount<span className="pl-1 text-white">*</span>
                      </div>
                      <div
                        className="flex rounded-lg outline outline-1 outline-gray-blue bg-light-black w-full h-10 mt-1 overflow-hidden"
                      >
                        <input
                          className="outline-none text-orange text-sm placeholder:text-gray-border px-2.5 bg-trnasparent w-full h-full"
                          placeholder="Enter token address"
                          value={burnAmount}
                          onChange={(e) => setBurnAmount(e.target.value)}
                        />
                        <button
                          className="w-[300px] h-full font-medium font-conthrax text-center text-white uppercase px-6 rounded-lg justify-center items-center gap-1.5 inline-flex bg-gradient-blue-to-purple active:brightness-75 transition duration-100 ease-in-out transform focus:outline-none"
                          onClick={handleClickBurn}>
                          <FaBurn className="p-1 w-6 h-6" />
                          Burn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Token2022ManagePage;
