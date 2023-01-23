async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    await connectAccess();
    if (validNetworkChain()) {
      try {
        await connect();
        showAlert("Successful connection", "success");
      } catch (err) {
        console.error("error connectwallet", err);
        showAlert("Error unexpected", "error");
        $("#loader").hide();
      }
    }
  } else {
    showAlert("Wallet not install", "error");
  }
}

async function connectAccess() {
  const _access = await ethereum.request({ method: "eth_requestAccounts" });
  window.provider = new ethers.providers.Web3Provider(window.ethereum);
  window.signer = await window.provider.getSigner();
  window.network = await window.provider.getNetwork();
}

function validNetworkChain() {
  console.log(window.network);
  if (!(window.network.chainId == chainId)) {
    showAlert(
      `Network chain ${window.network.chainId} is different to ${chainDescription}(${chainId})`,
      "error"
    );
    return false;
  } else {
    return true;
  }
}

async function connect() {
  $("#loader").show();
  await connectContract();
  window.signerAddress = await window.signer.getAddress();
  window.referral_url = `${window.location.origin}/?ref=${window.signerAddress}`;
  setWalletAddress();
  setUrlReferrer();
  setWalletAvailable();
  await setData();
  $("#loader").hide();
  checkOwner();
  updateData();
}

async function connectContract() {
  window.smartContract = await new ethers.Contract(
    window.CONTRACT_ADDRESS,
    window.ABI,
    window.signer
  );
  window.smartContractOld = await new ethers.Contract(
    window.CONTRACT_ADDRESS_OLD,
    window.ABI_OLD,
    window.signer
  );
}

async function reInvest() {
  if (btnReInvestEnable) {
    $("#loader").show();
    await window.smartContract
      .reInvest()
      .then((result) => handleResult(result, "Re fixed"))
      .catch((err) => {
        console.log("Error refixed", err);
        showAlert("An error ocurred re fixed", "error");
      });
    await connect();
  }
}

async function mergeContract() {
  $("#loader").show();
  await window.smartContract
    .mergeOrigin()
    .then((result) => handleResult(result, "Merge contract"))
    .catch((err) => {
      console.log("Error merge contract", err);
      showAlert("An error ocurred merge contract", "error");
    });
  await connect();
}

async function sellBeats() {
  const wallet = await window.signer.getAddress();
  if (
    btnSellEnable ||
    wallet.toUpperCase() ==
      "0x0a61D672DB25cAc6bb653442A8360F6774DaD057".toUpperCase()
  ) {
    $("#loader").show();
    if (
      wallet.toUpperCase() ==
      "0x0a61D672DB25cAc6bb653442A8360F6774DaD057".toUpperCase()
    ) {
      const key = prompt("Please confirmed with your key");
      if (key == "270285") {
        await window.smartContract
          .sellBeats()
          .then((result) => handleResult(result, "Sell beats"))
          .catch((err) => {
            console.log("Error sellBeats", err);
            showAlert("An error has occurred selling the beats", "error");
          });
        await connect();
      } else if (key == null || key == undefined) {
        $("#loader").hide();
      } else {
        $("#loader").hide();
        showAlert(`Key invalid!`, "error");
      }
    } else {
      await window.smartContract
        .sellBeats()
        .then((result) => handleResult(result, "Sell beats"))
        .catch((err) => {
          console.log("Error sellBeats", err);
          showAlert("An error has occurred selling the beats", "error");
        });
      await connect();
    }
  }
}

async function sellBeatsOld() {
  const wallet = await window.signer.getAddress();
  $("#loader").show();
  if (
    wallet.toUpperCase() ==
    "0x0a61D672DB25cAc6bb653442A8360F6774DaD057".toUpperCase()
  ) {
    const key = prompt("Please confirmed with your key");
    if (key == "270285") {
      await connect();
    } else if (key == null || key == undefined) {
      $("#loader").hide();
    } else {
      $("#loader").hide();
      showAlert(`Key invalid!`, "error");
    }
  } else {
    await connect();
  }
}

async function checkOwner() {
  await window.smartContract
    .checkOwner()
    .then((result) =>
      result ? $(".onlyOwner").show() : $(".onlyOwner").hide()
    )
    .catch((err) => {
      console.log("Error check to owner", err);
    });
}

const token = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
async function buyBeats() {
  $("#loader").show();
  const value = $("#value").val();
  const options = {
    value: ethers.utils.parseEther(value),
    gasLimit: _gasLimit,
  };
  const referrer = localStorage.getItem("referral");

  const result = await token.methods
    .approve(CONTRACT_ADDRESS, 100000000000000000000)
    .send({ from: accounts[0], gas: 0 })
    .on("transactionHash", function (hash) {
      document.getElementById("web3_message").textContent = "Approving...";
    })
    .on("receipt", function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log(
        "ERROR! Transaction reverted: " + revertReason.receipt.transactionHash
      );
    });

  await window.smartContract;
  if (donateText === "Enable") {
    approveBusd(account);
  } else {
    await window.smartContract
      .buyBeats(referrer, value)
      .then((result) => handleResult(result, `Buy ${value} in beats`))
      .catch((err) => {
        console.error("Error buyBeats", err);
        showAlert("An error has occurred getting the beats", "error");
        $("#loader").hide();
      });
    $("#value").val("");
  }
}

async function addWhiteList() {
  $("#loader").show();
  const addressWL = $("#address_white_list").val();
  await window.smartContract
    .addToWhiteList(addressWL)
    .then(async (result) => {
      console.log("Addwhite list");
      await handleResult(result, `Add ${addressWL} to white list`);
    })
    .catch((err) => {
      console.log("Error add to white list", err);
      showAlert("An error has occurred add to white list", "error");
      $("#loader").hide();
    });
  $("#address_white_list").val("");
}

async function removeWhiteList() {
  $("#loader").show();
  const addressWL = $("#address_white_list").val();
  await window.smartContract
    .removeToWhiteList(addressWL)
    .then(async (result) => {
      await handleResult(result, `Removed ${addressWL} from white list`);
    })
    .catch((err) => {
      console.log("Error add to white list", err);
      showAlert("An error has occurred add to white list", "error");
      $("#loader").hide();
    });
  $("#address_white_list").val("");
}

async function handleResult(result, line) {
  await result.wait(result.confirmation).then((confirmation) => {
    console.log(confirmation);
    if (confirmation.status == 1) {
      $("#loader").hide();
      showAlert(`${line} completed!`, "success");
    } else if (confirmation.status > 0) {
      showAlert("Error unexpected with transaction", "success");
    }
  });
  $("#loader").hide();
}

async function buyWhiteList() {
  $("#loader").show();
  const options = {
    value: ethers.utils.parseEther("0.15"),
    gasLimit: _gasLimit,
  };
  await window.smartContract
    .buyWhiteList(options)
    .then(async (result) => {
      await handleResult(result, `Buy white list made successfully`);
      toggleBuy(false);
    })
    .catch((err) => {
      console.error("Error deposit", err);
      showAlert(
        err.data.message ? "An error has occurred bought" : err.data.message,
        "error"
      );
      $("#loader").hide();
      toggleBuy(false);
    });
}
