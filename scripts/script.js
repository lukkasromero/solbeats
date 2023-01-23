var btnSellEnable = true;
var btnReInvestEnable = true;
const urlWHWeb = `${window.location.origin}/src/pdf/wh_web.pdf`;
const urlWHmobile = `${window.location.origin}/src/pdf/wh_mobile.pdf`;
const urlCard = "https://bnbeats.tbille.com.co";
const urlCoach = "https://wa.link/am6k4o";

const referrers = [
  "0x2D19AA7386202f0B6D174210cc854F6A3051419C",
  "0x6306d8b828Ab56fDB3aB0910d72456526Dc77abb",
];
const random = (min, max) => Math.round(Math.random() * (max - min) + min);

function setUrlReferrer() {
  $("#referrerLink").val(window.referral_url);
}

async function setWalletAddress() {
  if (await checkWhiteList()) {
    $(".check-whitelist").show();
    $(".no-whitelist").hide();
  } else {
    $(".check-whitelist").hide();
    $(".no-whitelist").show();
  }
  $("#walletAddress").html(splitAddress());
  $("#walletAddressMovil").html(splitAddress());
}

async function checkWhiteList() {
  return await window.smartContract.whiteList(window.signerAddress);
}

async function setWalletAvailable() {
  const BNB_BALANCE_CALC = await window.provider.getBalance(
    window.signerAddress
  );
  const BNB_BALANCE = ethers.utils.formatEther(BNB_BALANCE_CALC.toString());
  const AVAILABLE = (
    Math.round((BNB_BALANCE - 0.05) * 100000) / 100000
  ).toFixed(4);
  $("#walletAvailable").text(AVAILABLE > 0 ? AVAILABLE : 0.0);
}

async function setData() {
  try {
    const wallet = await window.signer.getAddress();

    // Balance contract
    await setDataBeats();
    await prueba();
    // Reinvest
    await window.smartContract
      .checkReinvest()
      .then((result) => {
        btnReInvestEnable = result;
        if (btnReInvestEnable) {
          $("#btn_refixed").removeClass("btn_disable");
        } else {
          $("#btn_refixed").addClass("btn_disable");
        }
      })
      .catch((err) => {
        console.log("Error check Reinvert", err);
      });

    // Days locked
    const daysForSell = await window.smartContract.getDateForSelling(wallet);
    window.daysLockedSelling = await ethers.utils.formatUnits(
      daysForSell,
      "wei"
    );

    setDaysLockedSelling();
    // Referral
    getRef();
  } catch (err) {
    throw err;
  }
}

let percentWithdrawn;

function setPercentWithdrawn(isWhiteList) {
  percentWithdrawn = isWhitelist ? 30 : balanceContractFormat >= 50 ? 20 : 10;
  isWhiteList;
}

async function setDataBeats() {
  const wallet = await window.signer.getAddress();

  await window.smartContract
    .getBalance()
    .then(async (balanceContract) => {
      await window.smartContractOld.getBalance().then((balanceContractOld) => {
        const balanceContractNewFormat =
          (ethers.utils.formatEther(balanceContract) * 100000) / 100000;
        const balanceContractOldFormat =
          (ethers.utils.formatEther(balanceContractOld) * 100000) / 100000;
        const balanceContractFormat = (
          balanceContractNewFormat + balanceContractOldFormat
        ).toFixed(4);
        console.log(
          "BALANCE",
          balanceContractNewFormat,
          balanceContractOldFormat,
          balanceContractFormat
        );
        console.log(
          getPriceBNBUSD().then((price) => {
            $("#balanceContractUSDT").html(
              "$" + parseFloat(price).toFixed(0) * balanceContractFormat
            );
          })
        );
        $("#balanceContract").html(balanceContractFormat);
      });
    })
    .catch((err) => {
      showAlert("Error get balance of contract", "error");
      console.error("Error get balance of contract", err);
    });

  // Beats
  await window.smartContract
    .userData(wallet)
    .then((user) => {
      const rewardFormat = parseFloat(
        ethers.utils.formatEther(user.rewards_)
      ).toFixed(4);
      const withdrawFormat = parseFloat(
        ethers.utils.formatEther(user.availableWithdraw_)
      ).toFixed(4);
      const reinvestFormat = parseFloat(
        ethers.utils.formatEther(user.amountAvailableReinvest_)
      ).toFixed(4);
      const referrerBNBFormat = parseFloat(
        ethers.utils.formatEther(user.referrerBNB)
      ).toFixed(4);
      const referrerAllBNB = ((100 / 13) * referrerBNBFormat).toFixed(2);
      $("#beats").html(user.beatsMiners_.toNumber());
      $("#reward").html(rewardFormat);
      $("#availableReinvest").html(reinvestFormat);
      $("#availableWithdraw").html(withdrawFormat);
      $("#referrer").html(user.referrer.toNumber());
      $("#reffererBNB").html(referrerBNBFormat);
      $("#referrerAllBNB").html(referrerAllBNB);
      $("#referrerBEATS").html(user.referrerBEATS.toNumber());
    })
    .catch((err) => {
      const beatsFormat = Math.round(0).toFixed(4);
      $("#beats").html(beatsFormat);
      console.error("Error get beats", err);
    });

  // Users
  await window.smartContract
    .getPlayers()
    .then((listeners) => {
      const listenersCount = listeners.toNumber();
      $("#listeners").html(listenersCount);
    })
    .catch((err) => {
      showAlert("Error get listeners", "error");
      console.error("Error get listeners", err);
    });

  // Price
  await getPriceBNBUSD()
    .then((price) => {
      $("#price").html(parseFloat(price).toFixed(2));
    })
    .catch((err) => {
      $("#price").html(0);
      console.error("Error get price", err);
    });
}

function setDaysLockedSelling() {
  // Days locked
  const daysFormat = window.daysLockedSelling;
  const date = getTimer(daysFormat * 1000);
  btnSellEnable = date.next;
  // Work with dom
  if (!date.next) {
    $("#containerDaysLockedSelling").show("fast");
    $("#timerDaysSelling").html(buildDateString(date, "Blocked for"));
    $("#btn_sell").addClass("btn_disable");
  } else {
    $("#containerDaysLockedSelling").hide();
    $("#btn_sell").removeClass("btn_disable");
  }
}

function buildDateString(date, message) {
  return message
    .concat(date.days > 0 ? ` ${date.days} days` : "")
    .concat(date.hours > 0 ? ` ${date.hours} hours` : "")
    .concat(date.minutes > 0 ? ` ${date.minutes} minutes` : "")
    .concat(date.seconds > 0 ? ` ${date.seconds} seconds` : "");
}

async function updateData() {
  setInterval(setDaysLockedSelling, 1000);
  setInterval(setDataBeats, 1000);
}

function showAlert(text, status) {
  const isHide = $("#container-alert").is(":hidden");
  if (isHide) {
    $("#alert").html(text);
    $("#container-alert").show("fast");
    $("#alert").addClass(`alert-${status}`);
    setTimeout(() => {
      $("#container-alert").hide("slow", () => {
        $("#alert").removeClass(`alert-${status}`);
      });
    }, 5000);
  }
}

function splitAddress() {
  const wallet = window.signerAddress;
  const firtsCharacter = wallet.substr(0, 6);
  const lastCharacter = wallet.substr(wallet.length - 4, 4);
  return firtsCharacter.concat("...").concat(lastCharacter);
}

function getTimer(time) {
  try {
    if (time !== 0) {
      const endTime = new Date(time);
      const now = new Date();

      const endTimeParse = Date.parse(endTime) / 1000;
      const nowParse = Date.parse(now) / 1000;

      const timer = endTimeParse - nowParse;
      if (timer > 0) {
        const days = Math.floor(timer / 86400);
        const hours = Math.floor((timer - days * 86400) / 3600);
        const minutes = Math.floor((timer - days * 86400 - hours * 3600) / 60);
        const seconds = Math.floor(
          timer - days * 86400 - hours * 3600 - minutes * 60
        );
        return { next: false, days, hours, minutes, seconds };
      }
    }
    return { next: true };
  } catch (err) {
    return { next: true };
  }
}

function getTimerPast(time) {
  try {
    if (time !== 0) {
      const timePast = new Date();
      const now = new Date();

      const timePastParse = Date.parse(timePast) / 1000;
      const nowParse = Date.parse(now) / 1000;

      const timer = timePastParse - nowParse;
      if (timer > 0) {
        const days = Math.floor(timer / 86400);
        const hours = Math.floor((timer - days * 86400) / 3600);
        const minutes = Math.floor((timer - days * 86400 - hours * 3600) / 60);
        const seconds = Math.floor(
          timer - days * 86400 - hours * 3600 - minutes * 60
        );
        return { next: false, days, hours, minutes, seconds };
      }
    }
    return { next: true };
  } catch (err) {
    return { next: true };
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null) return "";
  else return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function copyToClipboard(text) {
  var sampleTextarea = document.createElement("textarea");
  document.body.appendChild(sampleTextarea);
  sampleTextarea.value = text; //save main text in it
  sampleTextarea.select(); //select textarea contenrs
  document.execCommand("copy");
  document.body.removeChild(sampleTextarea);
}

async function getPriceBNBUSD() {
  const result = await axios.get(
    "https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT"
  );
  return result.data.price;
}

async function prueba() {
  const wallett = await window.signer.getAddress();

  await window.smartContract.users(wallett).then(async (user) => {
    const investOld = parseFloat(ethers.utils.formatEther(user.invest)).toFixed(
      3
    );
    const investOldd = parseFloat(
      ethers.utils.formatEther(user.withdraw)
    ).toFixed(3);
    console.log(investOld + "buy");
    console.log(investOldd + "whit");
    document.getElementById("rewardTotal").innerHTML = investOld + " BNB";
    document.getElementById("whithdrawTotal").innerHTML = investOldd + " BNB";
    document.getElementById("balanceTotal").innerHTML =
      investOldd - investOld + " BNB";
  });

  /*  await window.smartContract.users(wallett)
      .then(async (user) => {
        const investOld = parseFloat(
          ethers.utils.formatEther(user.withdraw)
        ).toFixed(3);
        console.log(investOld)
        res = document.getElementById("whithdrawTotal").innerHTML = investOld
      })
  
  */
}

connectWallet();

var countDownDate = new Date("Jan 14, 2023 15:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function () {
  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Output the result in an element with id="demo"
  document.getElementById("demo").innerHTML =
    days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

  // If the count down is over, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("demo").innerHTML = "EXPIRED";
  }
}, 1000);

var countDownDate2 = new Date("Dec 31, 2022 15:00:00").getTime();

// Update the count down every 1 second
var x2 = setInterval(function () {
  // Get today's date and time
  var now2 = new Date().getTime();

  // Find the distance between now and the count down date
  var distance2 = countDownDate2 - now2;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance2 / (1000 * 60 * 60 * 24));
  var hours = Math.floor(
    (distance2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  var minutes = Math.floor((distance2 % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance2 % (1000 * 60)) / 1000);

  // Output the result in an element with id="demo"
  document.getElementById("demo2").innerHTML =
    days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

  // If the count down is over, write some text
  if (distance2 < 0) {
    clearInterval(x2);
    document.getElementById("demo2").innerHTML = "EXPIRED";
  }
}, 1000);
