pragma solidity ^0.4.18;

contract RevenueShare {
  address public creator;
  mapping(uint => address) public shareholders;
  uint public numShareholders;
  address[] addresses = [0xa522838cbe895a9437af51717cbb560115ea2d13, 0x407ab17982fa9fc2dc4b0a3170848c5de4d8b6df];

  event Disburse(uint _amount, uint _numShareholders);

  function RevenueShare() payable {
    creator = msg.sender;
    numShareholders = addresses.length;

    for (uint i = 0; i < addresses.length; i++) {
      shareholders[i] = addresses[i];
    }
  }

  function() payable {
  }

  function shareRevenue() payable returns (bool success) {
    // uint amount = msg.value / numShareholders;

    // for ( uint i = 0; i < numShareholders; i++) {
    //   require(shareholders[i].send(amount));
    // }
    // Disburse(msg.value, numShareholders);
    return true;
  }

  function kill() {
    if (msg.sender == creator) 
      selfdestruct(creator);
  }

}