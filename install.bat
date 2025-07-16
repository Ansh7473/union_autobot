@echo off
ECHO Installing dependencies for union-auto-bot...

:: Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Node.js is not installed. Please install Node.js first.
    ECHO Visit https://nodejs.org/ to download and install Node.js.
    pause
    exit /b 1
)

:: Check if npm is installed
npm -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: npm is not installed. Please ensure npm is installed with Node.js.
    pause
    exit /b 1
)

:: Install dependencies
ECHO Installing dependencies...
npm install @cosmjs/cosmwasm-stargate@^0.32.4
npm install @cosmjs/encoding@^0.32.4
npm install @cosmjs/proto-signing@^0.32.4
npm install @cosmjs/stargate@^0.32.4
npm install @noble/secp256k1@^2.2.3
npm install axios@^1.9.0
npm install cli-table3@^0.6.5
npm install dotenv@^16.5.0
npm install ethers@^6.14.3
npm install inquirer@^8.2.6
npm install js-yaml@^4.1.0
npm install moment-timezone@^0.5.48
npm install node-fetch@^3.3.2
npm install viem@^2.30.6
npm install winston@^3.17.0

:: Check if installation was successful
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Failed to install some dependencies. Please check the error messages above.
    pause
    exit /b 1
)

ECHO All dependencies installed successfully!
pause
