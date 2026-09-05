// Robinhood Chain configuration
const ROBINHOOD_CHAIN = {
  chainId: '0x28c58', // 166744 in hex
  chainName: 'Robinhood Chain',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc.robinhood.com'],
  blockExplorerUrls: ['https://explorer.robinhood.com']
};

class WalletManager {
  constructor() {
    this.account = null;
    this.provider = null;
    this.init();
  }

  init() {
    const connectButtons = document.querySelectorAll('#connect-wallet');
    connectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleConnect();
      });
    });

    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            this.account = accounts[0];
            this.updateUI();
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.account = accounts[0];
          this.updateUI();
        } else {
          this.account = null;
          this.updateUI();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }

  async handleConnect() {
    if (!window.ethereum) {
      this.showToast('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.account = accounts[0];

      // Check if on Robinhood Chain
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (chainId !== ROBINHOOD_CHAIN.chainId) {
        await this.switchToRobinhoodChain();
      }

      this.updateUI();
      this.showToast('Wallet connected successfully');
    } catch (error) {
      console.error('Connection error:', error);
      if (error.code === 4001) {
        this.showToast('Connection rejected');
      } else {
        this.showToast('Failed to connect wallet');
      }
    }
  }

  async switchToRobinhoodChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ROBINHOOD_CHAIN.chainId }],
      });
    } catch (switchError) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ROBINHOOD_CHAIN],
          });
        } catch (addError) {
          throw new Error('Failed to add Robinhood Chain');
        }
      } else {
        throw switchError;
      }
    }
  }

  updateUI() {
    const connectButtons = document.querySelectorAll('#connect-wallet');

    connectButtons.forEach(button => {
      if (this.account) {
        const shortAddress = this.account.slice(0, 6) + '...' + this.account.slice(-4);
        button.textContent = shortAddress;
        button.classList.add('connected');
      } else {
        button.textContent = 'Connect Wallet';
        button.classList.remove('connected');
      }
    });
  }

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Contract Address Manager
class ContractManager {
  constructor() {
    this.contractAddress = null;
    this.init();
  }

  init() {
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyAddress());
    }

    // Check for stored contract address
    this.loadContractAddress();
  }

  loadContractAddress() {
    // Load from localStorage if exists
    const stored = localStorage.getItem('minnow_contract_address');
    if (stored) {
      this.updateContractAddress(stored);
    }
  }

  updateContractAddress(address) {
    if (!address || address.trim() === '') return;

    this.contractAddress = address.trim();
    localStorage.setItem('minnow_contract_address', this.contractAddress);

    const addressElement = document.getElementById('contract-address');
    const copyBtn = document.getElementById('copy-btn');

    if (addressElement) {
      addressElement.innerHTML = `<span>${this.contractAddress}</span>`;
    }

    if (copyBtn) {
      copyBtn.style.display = 'block';
    }
  }

  copyAddress() {
    if (!this.contractAddress) return;

    navigator.clipboard.writeText(this.contractAddress).then(() => {
      this.showToast('Contract address copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
      this.showToast('Failed to copy address');
    });
  }

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Make it globally accessible for easy updates via console
window.updateContractAddress = function(address) {
  if (window.contractManager) {
    window.contractManager.updateContractAddress(address);
    console.log('Contract address updated:', address);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WalletManager();
    window.contractManager = new ContractManager();
  });
} else {
  new WalletManager();
  window.contractManager = new ContractManager();
}
