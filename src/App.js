import React, { Component } from 'react'
import RevenueShareContract from '../build/contracts/RevenueShare.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      accounts: null,
      account: null,
      balance: 0,
      balances: {},
      myContractInstance: null,
      sharers: null,
    }
    this.instantiateContract = this.instantiateContract.bind(this);
    this.refreshBalances = this.refreshBalances.bind(this);
    this.onChange = this.onChange.bind(this);
    this.send = this.send.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.shareRevenue = this.shareRevenue.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const RevenueShare = contract(RevenueShareContract)
    RevenueShare.setProvider(this.state.web3.currentProvider)

    RevenueShare.deployed().then((instance) => {
      this.setState({
        myContractInstance: instance,
        contractAddress: instance.address,
      });
          // Get accounts.
      this.state.web3.eth.getAccounts((error, accounts) => {
        this.setState({ 
          accounts: accounts,
          coinbaseAddress: accounts[0],
          addressA: accounts[1],
          addressB: accounts[2],
        });
        this.refreshBalances();
      })
    })
  }

  refreshBalances() {
    this.setState({
      balances: {
        contractBalance: this.state.web3.fromWei(this.state.web3.eth.getBalance(this.state.myContractInstance.address), 'ether').toFixed(5),
        coinbaseBalance: this.state.web3.fromWei(this.state.web3.eth.getBalance(this.state.web3.eth.coinbase), 'ether').toFixed(5),
        aBalance: this.state.web3.fromWei(this.state.web3.eth.getBalance(this.state.accounts[1]), 'ether').toFixed(5),
        bBalance: this.state.web3.fromWei(this.state.web3.eth.getBalance(this.state.accounts[2]), 'ether').toFixed(5),
      }
    })
  }

  setStatus(message) {
    this.setState({ statusText: message });
  }

  shareRevenue() {
    const amount = this.state.web3.toWei(parseFloat(this.state.amount), 'ether');
    this.state.myContractInstance.shareRevenue.sendTransaction(
    {
      from: this.state.web3.eth.coinbase,
      value: amount,
    })
    .catch((err) => {
      console.warn(err.message.split('at')[0]);
    })
    .then(() => {
      this.refreshBalances();
     })
  }

  send() {
    const amount = this.state.web3.toWei(parseFloat(this.state.amount), 'ether');
    this.setStatus('Initiating transaction, please wait...')

    this.state.myContractInstance.sendTransaction(
      {
        from: this.state.web3.eth.coinbase,
        value: amount,
      }, (error, res) => {
        if (error) {
          console.log(error);
          this.setStatus(error);
        } else {
          this.setStatus('Transaxtion Complete');
          this.refreshBalances();
        }
      }
    )
  }

  onChange(event) {
    this.setState({ amount: event.target.value});
  }


    //   RevenueShare.deployed().then((instance) => {
    //     myContractInstance = instance

    //     // Stores a given value, 5 by default.
    //     return myContractInstance.set(5, {from: accounts[0]})
    //   }).then((result) => {
    //     // Get the value from the contract to prove it worked.
    //     return myContractInstance.get.call(accounts[0])
    //   }).then((result) => {
    //     // Update state with the result.
    //     return this.setState({ storageValue: result.c[0] })
    //   })
    // })
    

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Revenue Share</a>
        </nav>
      <div className="container">
        <table>
          <tbody>
            <tr>
              <td></td>
              <td><h3>Address</h3></td>
              <td><h3>Balance</h3></td>
            </tr>

            <tr>
              <td>Contract</td>
              <td>{ this.state.contractAddress }</td>
              <td>{ this.state.balances.contractBalance } </td>
            </tr>

            <tr>
              <td>Coinbase</td>
              <td>{ this.state.coinbaseAddress } </td>
              <td> { this.state.balances.coinbaseBalance } </td>
            </tr>

            <tr>
              <td>Shareholder A</td>
              <td> { this.state.addressA } </td>
              <td> { this.state.balances.aBalance } </td>
            </tr>

            <tr>
              <td>Shareholder B</td>
              <td> { this.state.addressB } </td>
              <td> { this.state.balances.bBalance } </td>
            </tr>

          </tbody>
        </table>

        <h2>Pay Contract</h2>
        <h3>Pay to contract from coinbase account</h3>

        <input onChange={this.onChange} />
        <button onClick={this.send} > Send </button>
        <button onClick={this.shareRevenue} > Split Revenue </button>
        </div>
      </div>
    );
  }
}

export default App
