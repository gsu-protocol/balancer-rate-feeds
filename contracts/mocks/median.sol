// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.8.0;

contract LibNote {
    event LogNote(
        bytes4 indexed sig,
        address indexed usr,
        bytes32 indexed arg1,
        bytes32 indexed arg2,
        bytes data
    ) anonymous;

    modifier note() {
        _;
        assembly {
            // log an 'anonymous' event with a constant 6 words of calldata
            // and four indexed topics: selector, caller, arg1 and arg2
            let mark := msize() // end of memory ensures zero
            mstore(0x40, add(mark, 288)) // update free memory pointer
            mstore(mark, 0x20) // bytes type data offset
            mstore(add(mark, 0x20), 224) // bytes size (padded)
            calldatacopy(add(mark, 0x40), 0, 224) // bytes payload
            log4(
                mark,
                288, // calldata
                shl(224, shr(224, calldataload(0))), // msg.sig
                caller(), // msg.sender
                calldataload(4), // arg1
                calldataload(36) // arg2
            )
        }
    }
}

contract MedianMock is LibNote {
    // --- Auth ---
    mapping(address => uint) public wards;

    function rely(address usr) external note auth {
        wards[usr] = 1;
    }

    function deny(address usr) external note auth {
        wards[usr] = 0;
    }

    modifier auth() {
        require(wards[msg.sender] == 1, "Median/not-authorized");
        _;
    }

    uint128 val;
    uint32 public age;
    bytes32 public constant wat = "gsuusd"; // You want to change this every deploy
    uint256 public bar = 1;

    // Authorized oracles, set by an auth
    mapping(address => uint256) public orcl;

    // Whitelisted contracts, set by an auth
    mapping(address => uint256) public bud;

    // Mapping for at most 256 oracles
    mapping(uint8 => address) public slot;

    modifier toll() {
        require(bud[msg.sender] == 1, "Median/contract-not-whitelisted");
        _;
    }

    event LogMedianPrice(uint256 val, uint256 age);

    //Set type of Oracle
    constructor() {
        wards[msg.sender] = 1;
    }

    function read() external view toll returns (uint256) {
        require(val > 0, "Median/invalid-price-feed");
        return val;
    }

    function peek() external view toll returns (uint256, bool) {
        return (val, val > 0);
    }

    function recover(
        uint256 val_,
        uint256 age_,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        return
            ecrecover(
                keccak256(
                    abi.encodePacked(
                        "\x19Ethereum Signed Message:\n32",
                        keccak256(abi.encodePacked(val_, age_, wat))
                    )
                ),
                v,
                r,
                s
            );
    }

    function poke(uint256 val_) public {
        uint256 last = 0;

        last = val;
        val = uint128(val_);
        age = uint32(block.timestamp);

        emit LogMedianPrice(val, age);
    }

    function setBar(uint256 bar_) external note auth {
        require(bar_ > 0, "Median/quorum-is-zero");
        require(bar_ % 2 != 0, "Median/quorum-not-odd-number");
        bar = bar_;
    }

    function kiss(address a) external note auth {
        require(a != address(0), "Median/no-contract-0");
        bud[a] = 1;
    }

    function diss(address a) external note auth {
        bud[a] = 0;
    }

    function kiss(address[] calldata a) external note auth {
        for (uint i = 0; i < a.length; i++) {
            require(a[i] != address(0), "Median/no-contract-0");
            bud[a[i]] = 1;
        }
    }

    function diss(address[] calldata a) external note auth {
        for (uint i = 0; i < a.length; i++) {
            bud[a[i]] = 0;
        }
    }
}
