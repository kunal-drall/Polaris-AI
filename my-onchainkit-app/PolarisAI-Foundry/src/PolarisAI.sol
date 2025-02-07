// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function WETH() external pure returns (address);
}

contract PolarisAI is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Uniswap V2 Router address for Base Sepolia
    IUniswapV2Router public immutable uniswapRouter;
    
    // Default deadline duration for swap transactions (30 minutes)
    uint256 public constant DEADLINE_DURATION = 30 minutes;
    
    // Events
    event SwappedETHForTokens(
        address indexed user,
        uint256 ethAmount,
        address indexed token,
        uint256 tokenAmount
    );
    
    event SwappedTokensForETH(
        address indexed user,
        address indexed token,
        uint256 tokenAmount,
        uint256 ethAmount
    );
    
    constructor(address _uniswapRouter) {
        require(_uniswapRouter != address(0), "Invalid router address");
        uniswapRouter = IUniswapV2Router(_uniswapRouter);
    }
    
    /**
     * @dev Swaps ETH for tokens using Uniswap V2
     * @param amountOutMin Minimum amount of tokens expected from the swap
     * @param token Address of the token to receive
     */
    function swapETHForTokens(
        uint256 amountOutMin,
        address token
    ) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(token != address(0), "Invalid token address");
        
        // Create the token path for the swap
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = token;
        
        // Calculate deadline
        uint256 deadline = block.timestamp + DEADLINE_DURATION;
        
        // Execute the swap
        uint256[] memory amounts = uniswapRouter.swapExactETHForTokens{
            value: msg.value
        }(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit SwappedETHForTokens(
            msg.sender,
            msg.value,
            token,
            amounts[1]
        );
    }
    
    /**
     * @dev Swaps tokens for ETH using Uniswap V2
     * @param amountIn Amount of tokens to swap
     * @param amountOutMin Minimum amount of ETH expected from the swap
     * @param token Address of the token to swap
     */
    function swapTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address token
    ) external nonReentrant {
        require(amountIn > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token address");
        
        // Create the token path for the swap
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = uniswapRouter.WETH();
        
        // Transfer tokens from user to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Approve router to spend tokens
        IERC20(token).approve(address(uniswapRouter), amountIn);
        
        // Calculate deadline
        uint256 deadline = block.timestamp + DEADLINE_DURATION;
        
        // Execute the swap
        uint256[] memory amounts = uniswapRouter.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit SwappedTokensForETH(
            msg.sender,
            token,
            amountIn,
            amounts[1]
        );
    }
    
    /**
     * @dev Allows the owner to rescue any ERC20 tokens accidentally sent to the contract
     * @param token Address of the token to rescue
     * @param amount Amount of tokens to rescue
     */
    function rescueTokens(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).safeTransfer(owner(), amount);
    }
    
    /**
     * @dev Allows the owner to rescue any ETH accidentally sent to the contract
     */
    function rescueETH() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "ETH transfer failed");
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}