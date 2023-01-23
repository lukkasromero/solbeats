$("#wallet").click(() => {
  connectWallet();
});

$("#btn_contact").click(() => {
  window.open("https://t.me/#", "_blank");
});

try {
  window.ethereum.on("chainChanged", async (_chain) => {
    await connectAccess();
    if (validNetworkChain()) {
      await connect();
      showAlert(`The network has changed successfully`, "success");
    }
  });

  window.ethereum.on("accountsChanged", async () => {
    if (validNetworkChain()) {
      await connect();
      showAlert(`Account changed to ${splitAddress()}`, "success");
    }
  });
} catch (error) {
  console.error("wallet not installed", error);
}

$("#item_chains").click(() => {
  showAlert("Comming soon", "success");
});

function getRef() {
  var _ref = getParameterByName("ref");
  if (_ref == "") {
    if (
      localStorage.getItem("referral") == null ||
      localStorage.getItem("referral") == referrers[0] ||
      localStorage.getItem("referral") == referrers[1]
    ) {
      localStorage.setItem(
        "referral",
        "0x703666E7c9031AeffE8bb5F34d175835B2420A29"
      );
    }
  } else if (_ref == "0x0a61D672DB25cAc6bb653442A8360F6774DaD057") {
    localStorage.setItem(
      "referral",
      "0x4326B1a04Bb726924A537E25acEF7eE1c53627A1"
    );
  } else {
    localStorage.setItem("referral", _ref);
  }
}

$("#copy-image")
  .unbind("click")
  .on("click", function () {
    copyToClipboard(window.referral_url);
    showAlert("Copy url referral completed!", "success");
  });

$("#btn_refixed").unbind("click").on("click", reInvest);
$("#merge_contract").unbind("click").on("click", mergeContract);
$("#btn_buy").unbind("click").on("click", buyBeats);
$("#btn_sell").unbind("click").on("click", sellBeats);
$("#btn_sell_old").unbind("click").on("click", sellBeatsOld);
$("#add_white_list").unbind("click").on("click", addWhiteList);
$("#remove_white_list").unbind("click").on("click", removeWhiteList);
$("#btn_buy_coach").unbind("click").on("click", buyWhiteList);
$("#btn_card")
  .unbind("click")
  .on("click", () => window.open(urlCard, "_blank"));

$("#item_whitepaper")
  .unbind("click")
  .on("click", () => {
    const widthScreen = document.getElementsByTagName("html")[0].clientWidth;
    if (widthScreen > 635) {
      $("#pdf_container").attr("src", urlWHWeb);
      $("#pdf_viewer").show("slow");
    } else {
      window.open(urlWHmobile, "_blank");
    }
  });

$("#btn_close_viewer_pdf").click(() => {
  $("#pdf_viewer").hide("fast");
});
