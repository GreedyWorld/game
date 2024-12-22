const ContractAddress = "0x956E482C3570f0d5D566F0E1dA166fCAa60D1F2e";
class BlockChain {
  BlockChain = null;
  chainConfig = null;
  chainNum = 133;
  constructor() {
    this.chainConfig = {
      rpcUrls: ["https://hashkeychain-testnet.alt.technology"],
      chainId: "0x85", //89
      chainName: "Hashkey Chain",
      nativeCurrency: {
        name: "HSK",
        symbol: "HSK",
        decimals: 18,
      },
      blockExplorerUrls: ["https://explorer.hsk.xyz"],
    };
    let win = window;

    if (typeof win.ethereum !== "undefined") {
      this.BlockChain = new Web3(win.ethereum);
    } else {
      this.BlockChain = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
    }
  }
  async getAccounts() {
    let accounts = await this.BlockChain.eth.requestAccounts();
    let chainId = await this.BlockChain.eth.getChainId();
    if (chainId !== this.chainNum) {
      let switchRes = await this.switchNetwork();
      if (switchRes) {
        return await this.getAccounts();
      }
    }
    return accounts[0];
  }
  fromUtf8(nonce_str) {
    return this.BlockChain.utils.fromUtf8(nonce_str);
  }
  jumpBitGet(dappUrl) {
    window.location.href = `https://bkcode.vip?action=dapp&url=${dappUrl}`;
  }
  jumpTokenPocket(dappUrl) {
    const a = document.createElement("a");
    let params = {
      url: dappUrl,
      chain: "ETH",
      source: "xxx",
    };
    a.href = `tpdapp://open?params=${encodeURIComponent(
      JSON.stringify(params)
    )}`;

    a.target = "_self";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  jumpMetaMask(dappUrl) {
    window.location.href = `https://metamask.app.link/dapp/${encodeURIComponent(
      dappUrl
    )}`;
  }
  jumpCoinBase(dappUrl) {
    window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(
      dappUrl
    )}`;
  }
  jumpOKXWallet(dappUrl) {
    const encodedUrl =
      "https://www.okx.com/download?deeplink=" +
      encodeURIComponent(
        "okx://wallet/dapp/url?dappUrl=" + encodeURIComponent(dappUrl)
      );
    window.location.href = encodedUrl;
  }
  getWalletName() {
    if (window.bitkeep && window.bitkeep.ethereum) {
      return "Bitget";
    }
    if (window.ethereum && window.ethereum.isMetaMask) {
      return "MetaMask";
    }
    if (window.okxwallet) {
      return "okxwallet";
    }
    if (window.trustwallet) {
      return "trustwallet";
    }
    if (window.ethereum && window.ethereum.isTokenPocket) {
      return "TokenPocket";
    }
    if (window.ethereum && window.ethereum.isImToken) {
      return "ImToken";
    }
    if (window.ethereum && window.ethereum.providers) {
      let fin = window.ethereum.providers.find(
        ({ isCoinbaseWallet }) => isCoinbaseWallet
      );
      if (fin) {
        return "CoinbaseWallet";
      }
    }
    return "";
  }
  toWei(num) {
    return this.BlockChain.utils.toWei(String(num));
  }
  toUSDT(num) {
    return num * 1000000;
  }
  toUSDC(num) {
    return num * 1000000;
  }
  /**
   * 发起转账
   */
  async sendTransaction(data, callback) {
    let params = {
      chain: this.chainConfig.chainId,
      ...data,
    };
    this.BlockChain.eth.sendTransaction(params, (err, res) => {
      callback(err, res);
    });
  }
  async contractTransfer(ABI, data, callback) {
    let price = await this.BlockChain.eth.getGasPrice();
    let contract = new this.BlockChain.eth.Contract(ABI, data.contractAddress, {
      from: data.from, // default from address
    });
    contract.methods
      .transfer(data.to, data.value)
      .send({ from: data.from }, function (error, res) {
        callback(error, res);
      });
  }
  /**
   *签名交易数据
   * @param {要签名的数据} nonce_str
   * @returns
   */
  async sign(nonce_str, address = null) {
    if (address == null) address = await this.getAccounts();
    let signStr = await this.BlockChain.eth.personal.sign(
      this.BlockChain.utils.fromUtf8(nonce_str),
      address,
      ""
    );
    return signStr;
  }
  /**
   *
   * @param {已签名的数据} nonce_str
   * @param {签名} sign_str
   * @returns
   */
  //解析签名
  async ecRecover(nonce_str, sign_str) {
    return await this.BlockChain.eth.personal.ecRecover(nonce_str, sign_str);
  }
  //切换网络
  async switchNetwork() {
    let win = window;
    try {
      await win.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: this.chainConfig.chainId }],
      });
      return true;
    } catch (switchError) {
      try {
        let config = this.chainConfig;
        await win.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              ...config,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error(addError);
        return false;
      }
    }
  }
}
