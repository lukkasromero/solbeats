import { createContext, useState, useEffect } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { providers, mobileProviders } from "../utils/Web3Provider";

const BlockchainContext = createContext({
  notification: null,
  showModal: function () {},
  hideModal: function () {},
});

export const BlockchainContextProvider = (props) => {
  const disconnectWallet = async () => {
    setAccount(null);
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    localStorage.removeItem("account");
    setProvider(null);
    clearInterval(interv);
  };

  const approveBusd = async (account) => {
    if (account) {
      try {
        const ContractInst = new web3Instance.eth.Contract(
          BUSDTOKENABI,
          process.env.REACT_APP_BUSD_CONRACT
        );
        const amountNumber = 1000000000000000000000000000000 * Math.pow(10, 18);
        const amountNumberWei = "0x" + amountNumber.toString(16);
        ContractInst.methods
          .approve(process.env.REACT_APP_CONTRACT, amountNumberWei)
          .send({ from: account }, (error, result) => {
            if (!error) {
              setPending(true);
            } else {
            }
          })
          .on("receipt", (receipt) => {
            toast.success("Enable Successfully");
            setBusdStakeText("Invest");
            setDonateText("Donate Now");
            setPending(false);
          })
          .on("error", (err) => {
            toast.error(err);
            setPending(false);
          });
      } catch (error) {
        console.log("Failed: " + error);
      }
    } else {
      toast.error("Please connect to your wallet");
    }
  };

  const context = {
    provider: provider,
    web3Instance: web3Instance,
    Contract: Contract,
    account: account,
    usdPrice: usdPrice,
    walletBalance: walletBalance,
    BNBwalletBalance: BNBwalletBalance,
    handleConnectToWallet: connectToWallet,
    handleDisconnectWallet: disconnectWallet,
    pending: pending,
    changeUserCheckPoint: changeUserCheckPoint,
    approveBusd,
    handleDisconnectWallet: disconnectWallet,
  };
  return (
    <BlockchainContext.Provider value={context}>
      {props.children}
    </BlockchainContext.Provider>
  );
};
