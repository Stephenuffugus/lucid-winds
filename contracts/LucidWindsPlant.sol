// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LucidWindsPlant
 * @notice ERC-721 NFT contract for Lucid Winds procedural plant art on Polygon.
 *
 * SECURITY MODEL:
 * - Players earn plants for free by playing games (30 hashes = 1 plant)
 * - Minting requires a server signature proving the plant was legitimately earned
 * - The server signer address can be rotated but CANNOT mint tokens directly
 * - No admin mint function exists — the owner cannot create tokens out of thin air
 * - 5% royalty via ERC-2981 (voluntary on OpenSea)
 *
 * METADATA:
 * - Each token stores its 64-char plant hash on-chain
 * - tokenURI returns a base64 JSON data URI with trait attributes
 * - SVG art is generated client-side from the hash (too large for on-chain storage)
 * - The hash is the canonical identifier — anyone can regenerate the art deterministically
 */
contract LucidWindsPlant is ERC721, ERC2981, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using Strings for uint256;

    // ── State ──────────────────────────────────────────────────────────
    address public signer;          // Server address that signs mint vouchers
    uint256 private _nextTokenId;   // Auto-incrementing token counter

    // plantHash => tokenId (prevents double-minting the same plant)
    mapping(bytes32 => uint256) public hashToToken;
    // tokenId => plantHash (for metadata lookup)
    mapping(uint256 => bytes32) public tokenToHash;
    // Nonce per address (prevents signature replay)
    mapping(address => uint256) public nonces;

    // ── Trait struct for on-chain metadata ──────────────────────────────
    struct PlantMeta {
        string name;
        string terraGrade;  // Common, Uncommon, Rare, Epic, Legendary, Mythic, Cosmic
        string season;      // Spring, Summer, Autumn, Winter
        uint16 eaScore;
        string companion;
        string mutation;
        bool isChimera;
        uint8 generation;
    }

    // tokenId => metadata (set at mint time, immutable after)
    mapping(uint256 => PlantMeta) public plantMeta;

    // ── Events ─────────────────────────────────────────────────────────
    event PlantMinted(
        address indexed owner,
        uint256 indexed tokenId,
        bytes32 indexed plantHash
    );
    event SignerUpdated(address oldSigner, address newSigner);

    // ── Constructor ────────────────────────────────────────────────────
    constructor(
        address _signer,
        address _royaltyReceiver,
        uint96 _royaltyBps       // 500 = 5%
    ) ERC721("Lucid Winds Plant", "LWP") Ownable(msg.sender) {
        require(_signer != address(0), "Zero signer");
        signer = _signer;
        _setDefaultRoyalty(_royaltyReceiver, _royaltyBps);
        _nextTokenId = 1; // Token IDs start at 1
    }

    // ── Mint ───────────────────────────────────────────────────────────
    /**
     * @notice Mint a plant NFT with a server-signed voucher.
     * @param plantHash  The 32-byte SHA-256 hash that defines this plant
     * @param meta       On-chain metadata (name, grade, season, EA, etc.)
     * @param signature  Server signature over (minter, plantHash, nonce, chainId)
     */
    function mint(
        bytes32 plantHash,
        PlantMeta calldata meta,
        bytes calldata signature
    ) external {
        require(hashToToken[plantHash] == 0, "Already minted");
        require(plantHash != bytes32(0), "Empty hash");

        // Verify server signature
        uint256 nonce = nonces[msg.sender];
        bytes32 digest = keccak256(
            abi.encodePacked(msg.sender, plantHash, nonce, block.chainid)
        ).toEthSignedMessageHash();
        require(digest.recover(signature) == signer, "Bad signature");

        // Increment nonce (prevents replay)
        nonces[msg.sender] = nonce + 1;

        // Mint
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        // Store on-chain data
        hashToToken[plantHash] = tokenId;
        tokenToHash[tokenId] = plantHash;
        plantMeta[tokenId] = meta;

        emit PlantMinted(msg.sender, tokenId, plantHash);
    }

    // ── Metadata ───────────────────────────────────────────────────────
    /**
     * @notice Returns a base64-encoded JSON data URI with plant attributes.
     *         OpenSea and other marketplaces parse this automatically.
     *         SVG art is NOT stored on-chain — render from the hash client-side.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        bytes32 ph = tokenToHash[tokenId];
        PlantMeta memory m = plantMeta[tokenId];

        // Build attributes array
        string memory attrs = string(abi.encodePacked(
            '[{"trait_type":"Terra Grade","value":"', m.terraGrade, '"},',
            '{"trait_type":"Season","value":"', m.season, '"},',
            '{"display_type":"number","trait_type":"EA Score","value":', uint256(m.eaScore).toString(), '},',
            '{"trait_type":"Companion","value":"', m.companion, '"},',
            '{"trait_type":"Mutation","value":"', m.mutation, '"},',
            '{"trait_type":"Chimera","value":"', m.isChimera ? "Yes" : "No", '"},',
            '{"display_type":"number","trait_type":"Generation","value":', uint256(m.generation).toString(), '}]'
        ));

        // Build JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"', m.name, '",',
            '"description":"A one-of-one procedural plant from Lucid Winds. Hash: ', _bytes32ToHex(ph), '",',
            '"external_url":"https://lucidwinds.com/plant/', _bytes32ToHex(ph), '",',
            '"attributes":', attrs, '}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    // ── Admin (limited) ────────────────────────────────────────────────
    /**
     * @notice Rotate the signer address. Does NOT grant minting power.
     *         Only the contract owner can call this.
     */
    function setSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Zero signer");
        emit SignerUpdated(signer, newSigner);
        signer = newSigner;
    }

    /**
     * @notice Update default royalty. Owner can adjust percentage but
     *         cannot set above 10% (1000 bps) as a safety cap.
     */
    function setRoyalty(address receiver, uint96 bps) external onlyOwner {
        require(bps <= 1000, "Max 10%");
        _setDefaultRoyalty(receiver, bps);
    }

    // ── View helpers ───────────────────────────────────────────────────
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function getPlantHash(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return _bytes32ToHex(tokenToHash[tokenId]);
    }

    // ── Interface support ──────────────────────────────────────────────
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ── Internal ───────────────────────────────────────────────────────
    function _bytes32ToHex(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i * 2]     = alphabet[uint8(data[i] >> 4)];
            str[i * 2 + 1] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
