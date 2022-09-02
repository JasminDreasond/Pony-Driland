// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

contract PonyDrilandBase {

    // Data
    address payable public owner;

    mapping (address => uint256) public balances;
    mapping (address => uint256) public donations;
    mapping (address => uint256) public interactions;

    mapping (address => mapping (uint256 => uint256)) public bookmark;
    mapping (address => mapping (string => uint256)) public nsfw_filter;
    mapping (address => uint256) public volume;

    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply;
    uint256 public totalInteractions;

    // Event
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Enable(address indexed value);

    // Constructor
    constructor() {

        owner = payable(msg.sender);        
        name = "Pony Driland";
        symbol = "PD";
        decimals = 3;

        totalSupply = 0;
        totalInteractions = 0;

    }

    // Tokens
    function balanceOf(address _account) external view returns (uint256) {
        return balances[_account];
    }

    // Donation
    function donate() payable public returns (bool success) {

        // Send BNB to Developer
        donations[msg.sender] = donations[msg.sender] + msg.value;
        owner.transfer(msg.value);
        return true;

    }

    // Send Tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {

        // Validator
        require(_to != address(msg.sender), "Hey! This is youself");
        require(_value >= 0, "Invalid amount!");
        require(_value <= balances[address(msg.sender)], "Invalid amount!");

        // Update Wallet
        balances[_to] = balances[_to] + _value;
        balances[address(msg.sender)] = balances[address(msg.sender)] + _value;

        // Complete
        emit Transfer(msg.sender, _to, _value);
        return true;

    }

    // Enable Panel
    function enable() public returns (bool success) {

        // Update Wallet
        require(balances[address(msg.sender)] <= 0, "This account is already activated.");
        balances[address(msg.sender)] = balances[address(msg.sender)] + 1;
        totalSupply = totalSupply + 1;

        // Complete
        emit Enable(msg.sender);
        return true;

    }

    // Info
    function getOwner() public view returns (address) {
        return owner;
    }

    // Bookemark
    function getBookmark(address _account, uint256 _chapter) external view returns (uint256) {
        return bookmark[_account][_chapter];
    }

    function insertBookmark(uint256 _chapter, uint256 _value) public returns (bool success) {
        
        // Complete
        require(balances[address(msg.sender)] >= 1, "You need to activate your account.");
        require(_chapter >= 1, "Invalid Chapter.");
        require(_value >= 0, "Invalid Value.");
        
        bookmark[address(msg.sender)][_chapter] = _value;
        interactions[address(msg.sender)] = interactions[address(msg.sender)] + 1;
        totalInteractions = totalInteractions + 1;
        return true;

    }

    // NSFW Filter
    function getNsfwFilter(address _account, string memory _name) external view returns (uint256) {
        return nsfw_filter[_account][_name];
    }

    function changeNsfwFilter(string memory _name, uint256 _value) public returns (bool success) {
        
        // Complete
        require(balances[address(msg.sender)] >= 1, "You need to activate your account.");
        require(_value >= 0, "Invalid Value. This is 1 or 0");
        require(_value <= 1, "Invalid Value. This is 1 or 0");

        nsfw_filter[address(msg.sender)][_name] = _value;
        interactions[address(msg.sender)] = interactions[address(msg.sender)] + 1;
        totalInteractions = totalInteractions + 1;
        return true;

    }

    // Volume
    function getVolume(address _account) external view returns (uint256) {
        return volume[_account];
    }

    function setVolume(uint256 _value) public returns (bool success) {
        
        // Complete
        require(balances[address(msg.sender)] >= 1, "You need to activate your account.");
        require(_value >= 0, "Invalid Volume. 0 - 100");
        require(_value <= 100, "Invalid Volume. 0 - 100");

        volume[address(msg.sender)] = _value;
        interactions[address(msg.sender)] = interactions[address(msg.sender)] + 1;
        totalInteractions = totalInteractions + 1;
        return true;

    }
    
}