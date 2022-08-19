// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = (connectedProvider) => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("./config/abiDaturians4Ukraine.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("./config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    Web3EthContract.setProvider(connectedProvider);
    let web3 = new Web3(connectedProvider); // inits web3 with the provider
    console.log('web3', web3);
    try {
      // get my address
      const accounts = await web3.eth.getAccounts();
      console.log('accounts', accounts);

      //get the network id
      const networkId = await web3.eth.net.getId();
      console.log('networkId', networkId);

      if (networkId == CONFIG.NETWORK.ID) {
        const SmartContractObj = new Web3EthContract(
          abi,
          CONFIG.CONTRACT_ADDRESS
        );
        console.log(SmartContractObj)
        dispatch(
          connectSuccess({
            account: accounts[0],
            smartContract: SmartContractObj,
            web3: web3,
          })
        );

        try {
          const { ethereum } = window;
          if (ethereum) {
            // Add listeners start
            ethereum.on("accountsChanged", (accounts) => {
              dispatch(updateAccount(accounts[0]));
            });
            ethereum.on("chainChanged", () => {
              window.location.reload();
            });
          }
        } catch (error) {
          console.log('most likely not using metamask', error);
        }
        // Add listeners end
      } else {
        console.log("Wrong network");
        alert("Wrong network, please switch to Polygon");
        dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong, please contact the team");
      dispatch(connectFailed("Something went wrong."));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};